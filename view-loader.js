"use strict";

const spriteSizes = {
  hiker: 65, wolf: 68, bear: 85, moose: 93, berries: 35, wood: 28, stone: 26, mushrooms: 31, campfire: 44,
  sheep: 49, "sheep-shorn": 44, fox: 36, hare: 25, "roe-deer": 66,
  "chicken-pen": 107, hen: 22, "gate-frame": 89, "gate-panel": 30, watchtower: 182,
  car: 45, boat: 29, "fallen-log": 30, "hand-torch": 32,
  "wilderness-hut": 128, "red-shelter": 113, well: 64,
  "fishing-hut": 130, "rest-lodge": 130, "forest-aid": 132,
  bunker: 86, "army-cabin": 132,
  "hatch-closed": 45, "hatch-open": 60,
  squirrel: 26, badger: 37, capercaillie: 45, owl: 39, hedgehog: 24, "raccoon-dog": 41,
  "trail-herbs": 31, "trail-nuts": 21, "trail-sap": 34, "trail-honey": 29, "trail-cache": 45,
  "trail-spring": 55, "trail-tracks": 26, "trail-journal": 25, "trail-seat": 39,
  "craft-pot": 45, "craft-bed": 45, "craft-lean-to": 77, "craft-cistern": 54,
  "craft-oven": 65, "craft-bench": 49, "craft-chest": 39, "craft-rack": 52,
  "craft-sign": 61, "craft-seat": 37, "craft-aid": 35, "craft-wall": 40,
};

const artworkFallbacks = {
  "sheep.webp": "moose.webp", "sheep-shorn.webp": "sheep.webp", "fox.webp": "wolf.webp",
  "hare.webp": "hen.webp", "roe-deer.webp": "moose.webp",
  "fishing-hut.webp": "wilderness-hut.webp", "rest-lodge.webp": "red-shelter.webp", "forest-aid.webp": "red-shelter.webp",
  "fishing-hut-interior.webp": "cabin.webp", "forest-aid-interior.webp": "ranger-interior.webp",
  "bunker.webp": "shed.webp", "army-cabin.webp": "wilderness-hut.webp",
  "bunker-interior.webp": "shed-interior.webp", "army-cabin-interior.webp": "ranger-interior.webp",
  "hatch-closed.webp": "stone.webp", "hatch-open.webp": "stone.webp",
  "squirrel.webp": "hare.webp", "badger.webp": "bear.webp", "capercaillie.webp": "hen.webp",
  "owl.webp": "hen.webp", "hedgehog.webp": "hare.webp", "raccoon-dog.webp": "fox.webp",
  "trail-herbs.webp": "berries.webp", "trail-nuts.webp": "berries.webp", "trail-sap.webp": "well.webp",
  "trail-honey.webp": "berries.webp", "trail-cache.webp": "wood.webp", "trail-spring.webp": "well.webp",
  "trail-tracks.webp": "stone.webp", "trail-journal.webp": "wood.webp", "trail-seat.webp": "stone.webp",
  "craft-pot.webp": "well.webp", "craft-cistern.webp": "well.webp", "craft-bed.webp": "wood.webp",
  "craft-lean-to.webp": "shed.webp", "craft-oven.webp": "stone.webp", "craft-bench.webp": "wood.webp",
  "craft-chest.webp": "wood.webp", "craft-rack.webp": "wood.webp", "craft-sign.webp": "fallen-log.webp",
  "craft-seat.webp": "wood.webp", "craft-aid.webp": "stone.webp", "craft-wall.webp": "stone.webp",
};

async function loadWorldView(canvas, interiors, onProgress) {
  const terrainFiles = [...CORE_TERRAIN, ...Object.values(terrainBiomes)].map(({ file }) => file);
  const files = new Set([...terrainFiles, ...Object.keys(spriteSizes).map((asset) => asset + ".webp"), ...interiors, ...Object.values(artworkFallbacks)]);
  files.add("animal-gaits.webp");
  files.add("hiker-gaits.webp");
  let completed = 0;
  const images = new Map(await Promise.all(Array.from(files, async (file) => {
    try {
      return await loadWorldImage(file);
    } catch (error) {
      if (!artworkFallbacks[file]) throw error;
      return [file, null];
    } finally {
      onProgress(++completed, files.size);
    }
  })));
  for (const [file, fallback] of Object.entries(artworkFallbacks)) {
    if (!images.get(file)) images.set(file, images.get(fallback));
  }
  const terrain = makeTerrain(images);
  for (const file of terrainFiles) images.delete(file);
  const artwork = { terrain, images, spriteSizes };
  const drawOverview = (target) => drawTerrainOverview(target, terrain);

  if (location.protocol !== "file:") {
    try {
      const { createWorldView } = await withLoadTimeout(import("./world-view.js?v=10"), 4000, "Three.js:n lataus viivästyi.");
      const surface = canvas.cloneNode(false);
      const view = createWorldView(surface, artwork);
      canvas.replaceWith(surface);
      return { ...view, drawOverview };
    } catch (error) {
      console.warn("Peli käynnistyy yhteensopivassa näkymässä.", error);
    }
  }
  return { ...createCanvasView(canvas, artwork), drawOverview };
}

function makeTerrain(images) {
  const tiles = [];
  const textures = new Map();
  const columns = WIDTH / TILE_WIDTH;
  const rows = HEIGHT / TILE_HEIGHT;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const { x, y, biome, variant } = outlyingTile(column, row);
      const fadeLeft = column > 0;
      const fadeTop = row > 0;
      const key = [biome, variant, fadeLeft, fadeTop].join("-");
      if (!textures.has(key)) {
        textures.set(key, paintTile(images.get(terrainBiomes[biome].file), variant, fadeLeft, fadeTop));
      }
      tiles.push({ x, y, width: TILE_WIDTH + TILE_BLEND, height: TILE_HEIGHT + TILE_BLEND, image: textures.get(key) });
    }
  }
  const core = paintCore(images);
  tiles.push({ ...CORE, image: core });
  return tiles;
}

function fadeEdge(ctx, width, height, x, y, dx, dy) {
  const fade = ctx.createLinearGradient(x, y, x + dx, y + dy);
  fade.addColorStop(0, "#0000");
  fade.addColorStop(1, "#000");
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}

function paintTile(image, variant, fadeLeft, fadeTop) {
  const tile = document.createElement("canvas");
  tile.width = 936;
  tile.height = Math.round(tile.width * (TILE_HEIGHT + TILE_BLEND) / (TILE_WIDTH + TILE_BLEND));
  const ctx = tile.getContext("2d");
  const { size, left, top, flip } = terrainCrop(variant);
  ctx.save();
  if (flip) {
    ctx.translate(tile.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(image, image.naturalWidth * left, image.naturalHeight * top,
    image.naturalWidth * size, image.naturalHeight * size, 0, 0, tile.width, tile.height);
  ctx.restore();
  const blend = TILE_BLEND * tile.width / (TILE_WIDTH + TILE_BLEND);
  if (fadeLeft) fadeEdge(ctx, tile.width, tile.height, 0, 0, blend, 0);
  if (fadeTop) fadeEdge(ctx, tile.width, tile.height, 0, 0, 0, blend);
  return tile;
}

function paintCore(images) {
  const { width, height } = CORE;
  const terrain = document.createElement("canvas");
  terrain.width = Math.min(width, 3840);
  terrain.height = Math.round(height * terrain.width / width);
  const ctx = terrain.getContext("2d");
  ctx.scale(terrain.width / width, terrain.height / height);
  for (const piece of CORE_TERRAIN) {
    const image = images.get(piece.file);
    const x = piece.x - CORE.x;
    if (piece.overlap) drawTerrainExtension(ctx, image, x, piece.width, height, piece.overlap, piece.fadeRight);
    else ctx.drawImage(image, x, 0, piece.width, height);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const horizontalBlend = CORE_BLEND * terrain.width / width;
  const verticalBlend = CORE_BLEND * terrain.height / height;
  fadeEdge(ctx, terrain.width, terrain.height, 0, 0, horizontalBlend, 0);
  fadeEdge(ctx, terrain.width, terrain.height, terrain.width, 0, -horizontalBlend, 0);
  fadeEdge(ctx, terrain.width, terrain.height, 0, 0, 0, verticalBlend);
  fadeEdge(ctx, terrain.width, terrain.height, 0, terrain.height, 0, -verticalBlend);
  return terrain;
}

function drawTerrainOverview(canvas, terrain) {
  canvas.width = 1440;
  canvas.height = Math.round(canvas.width * HEIGHT / WIDTH);
  const ctx = canvas.getContext("2d");
  const scale = canvas.width / WIDTH;
  ctx.setTransform(scale, 0, 0, scale, -WORLD_LEFT * scale, -WORLD_TOP * scale);
  for (const { x, y, width, height, image } of terrain) ctx.drawImage(image, x, y, width, height);
}

function drawTerrainExtension(ctx, image, x, width, height, overlap, fadeRight) {
  const extension = document.createElement("canvas");
  extension.width = width;
  extension.height = height;
  const tile = extension.getContext("2d");
  tile.drawImage(image, 0, 0, width, height);
  const seam = tile.createLinearGradient(fadeRight ? width : 0, 0, fadeRight ? width - overlap : overlap, 0);
  seam.addColorStop(0, "#0000");
  seam.addColorStop(1, "#000");
  tile.globalCompositeOperation = "destination-in";
  tile.fillStyle = seam;
  tile.fillRect(0, 0, width, height);
  ctx.drawImage(extension, x, 0);
}

async function withLoadTimeout(promise, delay, message) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error(message)), delay); }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

async function loadWorldImage(file) {
  const image = new Image();
  const loaded = new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("Pelin kuvaa ei voitu avata: " + file + "."));
  });
  image.src = "./assets/" + file;
  await loaded;
  return [file, image];
}

function createCanvasView(canvas, { terrain, images, spriteSizes }) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Selain ei pystynyt avaamaan pelinäkymää.");
  const lightCanvas = document.createElement("canvas");
  const light = lightCanvas.getContext("2d");
  const sprites = [];

  function addSprite(asset) {
    const art = gaitArtwork(asset);
    const image = images.get(art?.file ?? asset + ".webp");
    const height = spriteSizes[asset];
    const sprite = { image, art, width: height * image.naturalWidth / image.naturalHeight, height, player: asset === "hiker", centered: asset === "car" || asset === "boat" };
    sprites.push(sprite);
    return sprite;
  }

  function positionSprite(sprite, x, y, { facing = 1, step = 0, brightness = 1, visible = true, angle = 0, frame = 0, rowOffset = 0, widthScale = 1 } = {}) {
    Object.assign(sprite, { x, y, facing, step, brightness, visible, angle, frame, rowOffset, widthScale });
  }

  function removeSprite(sprite) {
    const index = sprites.indexOf(sprite);
    if (index >= 0) sprites.splice(index, 1);
  }

  function resize(pixelWidth, pixelHeight) {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = lightCanvas.width = Math.round(pixelWidth * ratio);
    canvas.height = lightCanvas.height = Math.round(pixelHeight * ratio);
  }

  function draw(view, player, { dark, torch, torchRange = 300, shelterImage, handFlame, fire, groundTorch }) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (shelterImage) {
      ctx.drawImage(images.get(shelterImage), 0, 0, canvas.width, canvas.height);
      return;
    }

    const scaleX = canvas.width / view.width;
    const scaleY = canvas.height / view.height;
    const left = -view.x * scaleX;
    const top = -view.y * scaleY;
    ctx.setTransform(scaleX, 0, 0, scaleY, left, top);
    for (const { x, y, width, height, image } of terrain) {
      if (x + width <= view.x || x >= view.x + view.width || y + height <= view.y || y >= view.y + view.height) continue;
      ctx.drawImage(image, x, y, width, height);
    }

    if (dark > 0) {
      light.setTransform(scaleX, 0, 0, scaleY, left, top);
      light.clearRect(view.x, view.y, view.width, view.height);
      light.fillStyle = "rgba(5, 8, 16, " + dark * .96 + ")";
      light.fillRect(view.x, view.y, view.width, view.height);
      light.globalCompositeOperation = "destination-out";
      const radius = handFlame ? 132 : torch ? 94 : 67;
      const halo = light.createRadialGradient(player.x, player.y, 4, player.x, player.y, radius);
      halo.addColorStop(0, handFlame ? "#000e" : "#000b");
      halo.addColorStop(1, "#0000");
      light.fillStyle = halo;
      light.fillRect(player.x - radius, player.y - radius, radius * 2, radius * 2);
      if (torch) {
        const beam = light.createRadialGradient(player.x, player.y, 62, player.x, player.y, torchRange);
        beam.addColorStop(0, "#000");
        beam.addColorStop(1, "#0000");
        light.fillStyle = beam;
        light.beginPath();
        light.moveTo(player.x, player.y);
        light.arc(player.x, player.y, torchRange, player.angle - .5, player.angle + .5);
        light.fill();
      }
      for (const source of [fire, groundTorch]) {
        if (!source) continue;
        const { x, y, radius, glow } = source;
        const gradient = light.createRadialGradient(x, y, 6, x, y, radius);
        gradient.addColorStop(0, "rgba(0, 0, 0, " + glow + ")");
        gradient.addColorStop(1, "#0000");
        light.fillStyle = gradient;
        light.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      light.globalCompositeOperation = "source-over";
      ctx.drawImage(lightCanvas, view.x, view.y, view.width, view.height);
    }

    for (const sprite of sprites.sort((a, b) => a.y - b.y)) {
      if (!sprite.visible) continue;
      ctx.save();
      if (sprite.player) {
        ctx.beginPath();
        ctx.ellipse(sprite.x, sprite.y, 16, 6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#eacc86";
        ctx.stroke();
      }
      ctx.translate(sprite.x, sprite.y - sprite.step);
      ctx.rotate(sprite.angle);
      ctx.scale(sprite.facing * sprite.widthScale, 1);
      ctx.filter = "brightness(" + Math.pow(sprite.brightness, .45) + ")";
      if (sprite.art) {
        const { width, height, footY, figureHeight } = gaitCell;
        const scale = sprite.height / figureHeight;
        ctx.drawImage(sprite.image, sprite.frame * width, (sprite.art.row + sprite.rowOffset) * height, width, height,
          -width * scale / 2, -footY * scale, width * scale, height * scale);
      } else {
        ctx.drawImage(sprite.image, -sprite.width / 2, -sprite.height * (sprite.centered ? .5 : .98), sprite.width, sprite.height);
      }
      ctx.restore();
    }
  }

  return { addSprite, removeSprite, positionSprite, resize, draw };
}
