import * as THREE from "./vendor/three/three.module.js";

export function createWorldView(canvas, { terrain, images, spriteSizes }) {
  const context = canvas.getContext("webgl2", { alpha: false, antialias: true });
  if (!context) throw new Error("Pelinäkymä tarvitsee WebGL 2 -tuen.");
  const renderer = new THREE.WebGLRenderer({ canvas, context });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x242d1c);

  const textures = new Map();
  for (const [name, image] of images) {
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    textures.set(name, texture);
  }

  const outdoors = new THREE.Scene();
  const indoors = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, .1, 20);
  camera.position.z = 10;
  const plane = new THREE.PlaneGeometry(1, 1);
  const terrainMaterials = new Map();
  const groundTop = terrain[0].y;
  for (const [index, { x, y, width, height, image }] of terrain.entries()) {
    if (!terrainMaterials.has(image)) {
      const texture = new THREE.CanvasTexture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      terrainMaterials.set(image, new THREE.MeshBasicMaterial({
        map: texture, transparent: true, depthTest: false, depthWrite: false,
      }));
    }
    const tile = new THREE.Mesh(plane, terrainMaterials.get(image));
    tile.position.set(x + width / 2, -y - height / 2, 0);
    tile.scale.set(width, height, 1);
    tile.renderOrder = index - terrain.length;
    outdoors.add(tile);
  }

  const lighting = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      night: { value: 0 },
      player: { value: new THREE.Vector2() },
      direction: { value: new THREE.Vector2() },
      torch: { value: false },
      handFlame: { value: false },
      campfire: { value: new THREE.Vector4() },
      groundTorch: { value: new THREE.Vector4() },
    },
    vertexShader: `
      varying vec2 groundPosition;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        groundPosition = vec2(world.x, -world.y);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float night;
      uniform vec2 player;
      uniform vec2 direction;
      uniform bool torch;
      uniform bool handFlame;
      uniform vec4 campfire;
      uniform vec4 groundTorch;
      varying vec2 groundPosition;
      float lightAt(vec4 source) {
        if (source.w <= 0.0) return 0.0;
        return source.w * (1.0 - smoothstep(6.0, source.z, distance(groundPosition, source.xy)));
      }
      void main() {
        vec2 offset = groundPosition - player;
        float distanceToPlayer = length(offset);
        float radius = handFlame ? 132.0 : (torch ? 94.0 : 67.0);
        float halo = (1.0 - smoothstep(4.0, radius, distanceToPlayer)) * (handFlame ? 0.87 : 0.68);
        float beam = 0.0;
        if (torch) {
          float alignment = dot(offset, direction) / max(distanceToPlayer, 0.01);
          beam = smoothstep(0.86, 0.94, alignment) * (1.0 - smoothstep(62.0, 300.0, distanceToPlayer));
        }
        float firelight = max(lightAt(campfire), lightAt(groundTorch));
        gl_FragColor = vec4(0.018, 0.032, 0.061, night * 0.96 * (1.0 - max(max(halo, beam), firelight)));
      }
    `,
  });
  const shade = new THREE.Mesh(plane, lighting);
  shade.renderOrder = 1;
  outdoors.add(shade);

  const shadowGeometry = new THREE.CircleGeometry(1, 24);
  const playerRing = new THREE.RingGeometry(.87, 1, 32);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x12160d, transparent: true, opacity: .4, depthWrite: false, depthTest: false,
  });
  const playerRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xeacc86, transparent: true, opacity: .85, depthWrite: false, depthTest: false,
  });

  function addSprite(asset) {
    const map = textures.get(asset + ".webp");
    const size = spriteSizes[asset];
    const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
      map, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    }));
    const isPlayer = asset === "hiker";
    const centered = asset === "car" || asset === "boat";
    const shadow = new THREE.Mesh(isPlayer ? playerRing : shadowGeometry, isPlayer ? playerRingMaterial : shadowMaterial);
    const spriteWidth = size * map.image.width / map.image.height;
    shadow.renderOrder = 2;
    shadow.scale.set(isPlayer ? 16 : spriteWidth * (centered ? .45 : .32), size * (centered ? .38 : .105), 1);
    outdoors.add(shadow, mesh);
    return { mesh, shadow, width: spriteWidth, height: size, centered };
  }

  function positionSprite(sprite, x, y, { facing = 1, step = 0, brightness = 1, visible = true, angle = 0 } = {}) {
    const { mesh, shadow } = sprite;
    mesh.visible = shadow.visible = visible;
    if (!visible) return;
    mesh.position.set(x, -y + (sprite.centered ? 0 : sprite.height * .48) + step, 0);
    mesh.scale.set(facing * sprite.width, sprite.height, 1);
    mesh.rotation.z = shadow.rotation.z = -angle;
    mesh.renderOrder = 10 + y - groundTop;
    mesh.material.color.setScalar(brightness);
    shadow.position.set(x, -y + 1, 0);
  }

  function removeSprite({ mesh, shadow }) {
    outdoors.remove(mesh, shadow);
    mesh.material.dispose();
  }

  function resize(pixelWidth, pixelHeight, viewWidth, viewHeight) {
    camera.right = viewWidth;
    camera.bottom = -viewHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(pixelWidth, pixelHeight, false);
  }

  function draw(view, player, { dark, torch, shelterImage, handFlame, fire, groundTorch }) {
    if (shelterImage) {
      indoors.background = textures.get(shelterImage);
      renderer.render(indoors, camera);
      return;
    }
    camera.position.set(view.x, -view.y, 10);
    shade.visible = dark > 0;
    shade.position.set(view.x + view.width / 2, -view.y - view.height / 2, 0);
    shade.scale.set(view.width, view.height, 1);
    lighting.uniforms.night.value = dark;
    lighting.uniforms.player.value.set(player.x, player.y);
    lighting.uniforms.direction.value.set(Math.cos(player.angle), Math.sin(player.angle));
    lighting.uniforms.torch.value = torch;
    lighting.uniforms.handFlame.value = Boolean(handFlame);
    if (fire) lighting.uniforms.campfire.value.set(fire.x, fire.y, fire.radius, fire.glow);
    else lighting.uniforms.campfire.value.w = 0;
    if (groundTorch) lighting.uniforms.groundTorch.value.set(groundTorch.x, groundTorch.y, groundTorch.radius, groundTorch.glow);
    else lighting.uniforms.groundTorch.value.w = 0;
    renderer.render(outdoors, camera);
  }

  return { addSprite, removeSprite, positionSprite, resize, draw };
}
