"use strict";

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 670;
const START_TIME = 17 * 60 + 40;
const DAWN = 6 * 60;
const MINUTES_PER_SECOND = 6;
const USE_RANGE = 47;
const FISHING_WAIT = 3;
const FIRE_RADIUS = 145;
const FIRE_DURATION = 42;
const FIRE_COST = { wood: 2, stone: 1 };
const PLACED_FLAME_RADIUS = 145;
const WOOL_PER_SHEEP = 2;
const WOOL_GROWTH_MINUTES = 6 * 60;
const CAR_CONTACTS = [[-38, -18], [-38, 0], [-38, 18], [0, -18], [0, 0], [0, 18], [38, -18], [38, 0], [38, 18]];
const BOAT_CONTACTS = [[-38, -11], [-38, 11], [0, -14], [0, 0], [0, 14], [38, -11], [38, 11]];

const byId = (id) => document.getElementById(id);
const scene = byId("scene");
const world = byId("world");
const interior = byId("interior");
const dialog = byId("dialog");
const mapDialog = byId("map-dialog");
const mapStage = byId("map-stage");
const fishingOverlay = byId("fishing-overlay");
const camera = { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT, scale: 1 };
const keys = new Set();
const driveTouches = new Map();
const moves = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};

for (const [index, district] of backcountry.entries()) {
  const [x, y] = district.hut;
  const red = index % 3 === 2;
  district.shelter = {
    id: "backcountry-hut-" + index, label: district.label, x, y,
    action: "Mene suojaan", labelY: y + 24,
    base: { x: x + 27, y: y - 9 }, asset: red ? "red-shelter" : "wilderness-hut",
    footprint: [[x - 32, y - 67], [x + 47, y - 82], [x + 87, y - 58], [x + 79, y - 31], [x + 24, y - 14], [x - 29, y - 21]],
    image: red ? "ranger-interior.webp" : "cabin.webp", search: "Tutki kaappi",
    loot: red ? { bandage: 2, wood: 2 } : { berries: 2, water: 2, battery: 33 },
    notice: red ? ["Löysit siteitä ja halkoja", "Tarvikkeet ovat repussa.", "bandage"] : ["Löysit retkitarvikkeita", "Sait ruokaa, vettä ja taskulampun paristoja.", "pack"],
  };
  const side = index % 2 === 0 ? -1 : 1;
  district.well = {
    id: "backcountry-well-" + index, x: x + side * 220, y: y + 30,
    kind: "water", label: "Kaivo", icon: "drop", action: "Täytä juomapullo",
    asset: "well", base: { x: x + side * 220, y: y + 10 }, labelY: y + 35,
  };
}

const buildingTypes = {
  fishing: {
    asset: "fishing-hut", image: "fishing-hut-interior.webp", icon: "fish", search: "Avaa eväslaatikko",
    loot: { fish: 2, water: 1 }, notice: ["Löysit eväitä", "Eväslaatikossa oli kalaa ja vettä.", "fish"],
  },
  rest: {
    asset: "rest-lodge", image: "lodge-interior.webp", icon: "house", search: "Tutki tarvikehylly",
    loot: { wood: 2, water: 2 }, notice: ["Löysit retkitarvikkeita", "Hyllyllä oli halkoja ja vettä.", "pack"],
  },
  aid: {
    asset: "forest-aid", image: "forest-aid-interior.webp", icon: "bandage", search: "Avaa ensiapukaappi",
    loot: { bandage: 3, water: 1 }, notice: ["Löysit ensiaputarvikkeita", "Kaapissa oli siteitä ja vettä.", "bandage"],
  },
};

const extraShelters = [
  ["fisher-hut", "Kalastajan maja", 430, 330, "fishing"],
  ["trail-lodge", "Polun taukotupa", 1000, 345, "rest"],
  ["shore-hut", "Rantavartijan maja", -265, 1340, "fishing"],
  ["east-aid", "Itämetsän ensiapuasema", 2115, 1035, "aid"],
  ["ridge-aid", "Hallanharjun ensiaputupa", -4510, -2210, "aid"],
  ["grove-lodge", "Länsilehdon taukotupa", -2825, 2450, "rest"],
  ["juniper-lodge", "Katajaharjun taukotupa", 4790, -690, "rest"],
  ["bog-hut", "Suonvartijan maja", 6850, -650, "fishing"],
  ["heather-aid", "Kanervakankaan ensiaputupa", 2540, 4980, "aid"],
  ["moor-lodge", "Pitkänevan taukotupa", 6275, 3790, "rest"],
].map(([id, label, x, y, type]) => ({
  ...buildingTypes[type], id, label, x, y, action: "Mene suojaan", labelY: y + 22,
  base: { x: x + 20, y: y - 10 },
  footprint: [[x - 47, y - 69], [x + 31, y - 108], [x + 85, y - 68], [x + 71, y - 39], [x + 23, y - 16], [x - 45, y - 25]],
}));

const shelters = [
  {
    id: "cabin", label: "Metsämökki", action: "Mene mökkiin",
    x: 605, y: 293, labelX: 620, labelY: 322,
    footprint: [[543, 198], [605, 153], [737, 123], [818, 208], [807, 254], [633, 285], [556, 254]],
    image: "cabin.webp", search: "Tutki pöytä", loot: { torch: true },
    notice: ["Taskulamppu löytyi", "Sytytä tai sammuta painamalla F.", "torch"],
  },
  {
    id: "shed", label: "Varastovaja", action: "Mene vajaan",
    x: 816, y: 599, labelY: 627,
    footprint: [[757, 487], [841, 436], [928, 475], [913, 538], [858, 586], [776, 564]],
    image: "shed-interior.webp", search: "Tutki hylly", loot: { bandage: 2 },
    notice: ["Löysit kaksi sidettä", "Hoida haavat repusta painamalla 4.", "bandage"],
  },
  {
    id: "ranger", label: "Metsänvartijan tupa", action: "Mene tupaan",
    x: 1456, y: 369, labelX: 1475, labelY: 398,
    footprint: [[1400, 270], [1530, 195], [1605, 236], [1590, 318], [1486, 360], [1413, 334]],
    image: "ranger-interior.webp", search: "Tutki työpöytä", loot: { bandage: 2, water: 1 },
    notice: ["Löysit ensiaputarvikkeita ja vettä", "Voit käyttää niitä repusta.", "bandage"],
  },
  {
    id: "sauna", label: "Savusauna", action: "Mene saunaan",
    x: 493, y: 1013, labelX: 488, labelY: 1047,
    footprint: [[297, 902], [408, 840], [491, 855], [569, 904], [551, 979], [480, 1005], [320, 968]],
    image: "sauna-interior.webp", search: "Tutki lauteet", loot: { water: 2 },
    notice: ["Löysit juomavettä", "Juo repusta painamalla 3.", "drop"],
  },
  {
    id: "woodshed", label: "Puuvaja", action: "Mene puuvajaan",
    x: 1068, y: 797, labelX: 1125, labelY: 818,
    footprint: [[1004, 699], [1202, 649], [1214, 722], [1191, 762], [1047, 784], [1008, 759]],
    image: "shed-interior.webp", search: "Tutki laatikko", loot: { berries: 2, wood: 3, axe: true },
    notice: ["Löysit kirveen, halkoja ja mustikoita", "Kirveellä voi pilkkoa kaatuneita runkoja.", "axe"],
  },
  {
    id: "lodge", label: "Erämaja", action: "Mene erämajaan",
    x: 1542, y: 1046, labelX: 1569, labelY: 1081,
    footprint: [[1411, 916], [1516, 848], [1693, 839], [1784, 904], [1757, 996], [1630, 1035], [1517, 1030], [1426, 992]],
    image: "lodge-interior.webp", search: "Tutki ruokakaappi", loot: { berries: 3, water: 2 },
    notice: ["Löysit eväitä ja vettä", "Voit käyttää niitä repusta.", "berries"],
  },
  ...backcountry.map(({ shelter }) => shelter),
  ...extraShelters,
  bunker, armyCabin,
];

const lake = { id: "lake", x: 366, y: 420, label: "Metsälampi", icon: "drop", kind: "water", action: "Täytä juomapullo", labelX: 284, labelY: 425 };
const fishingSpot = {
  id: "fishing-spot", x: 337, y: 613, label: "Kalasta", icon: "fish", kind: "fishing", action: "Heitä onki",
  labelX: 279, labelY: 598, castX: 220, castY: 578,
};
const boatLanding = {
  id: "boat-landing", kind: "boat", x: 391, y: 443, label: "Soutuvene", icon: "boat", action: "Nouse veneeseen",
  labelX: 237, labelY: 477, launch: { x: 329, y: 446, angle: Math.PI / 2 },
  approach: { x: 285, y: 446 },
};
const chickenPen = {
  id: "chicken-pen", kind: "landmark", x: 678, y: 652, label: "Kana-aitaus", icon: "hen",
  base: { x: 678, y: 631 }, asset: "chicken-pen",
  footprint: [[620, 599], [701, 573], [747, 609], [677, 632], [637, 620]],
};
const sheepMeadow = { id: "sheep-meadow", kind: "landmark", x: 599, y: 696, label: "Lammaslaidun", icon: "wool" };
const gate = {
  id: "forest-gate", kind: "gate", x: 1010, y: 557, label: "Metsäportti", icon: "gate",
  base: { x: 1010, y: 518 }, north: { x: 1010, y: 479 }, asset: "gate-frame",
  barrier: [[971, 496], [1050, 496], [1050, 518], [971, 518]],
  wings: [
    [[917, 498], [971, 492], [971, 520], [917, 515]],
    [[1050, 492], [1103, 498], [1103, 515], [1050, 520]],
  ],
};
const tower = {
  id: "watchtower", kind: "tower", x: 1412, y: 615, label: "Vartiotorni", icon: "tower", action: "Kiipeä torniin",
  base: { x: 1412, y: 596 }, asset: "watchtower",
  footprint: [[1371, 554], [1426, 546], [1460, 576], [1421, 598], [1382, 584]],
};
const garage = {
  id: "garage", kind: "garage", x: 2342, y: 651, label: "Autotalli", icon: "garage", action: "Mene talliin",
  image: "garage-interior.webp", driveway: { x: 2342, y: 725, angle: Math.PI / 2 },
  footprint: [[2251, 536], [2489, 426], [2638, 512], [2634, 583], [2567, 609], [2498, 588], [2397, 641], [2269, 614]],
};
const parkedCar = { id: "parked-car", kind: "car", x: garage.driveway.x, y: garage.driveway.y, label: "Auto", icon: "car", action: "Mene autoon" };
const placedTorch = { id: "placed-torch", kind: "placed-torch", label: "Poimi soihtu", action: "Poimi soihtu", icon: "flame", asset: "hand-torch", local: true };
const landmarks = [chickenPen, gate, tower, sheepMeadow];
const henPositions = [[-18, -21], [20, -28], [38, -36]];
const gatherables = {
  berries: { label: "Mustikoita", action: "Poimi mustikoita", amount: 2, notice: ["Mustikoita kerätty", "Syö repusta painamalla 2."] },
  wood: { label: "Polttopuita", action: "Kerää polttopuut", amount: 2, notice: ["Keräsit kaksi halkoa", "Käytä halkoja nuotioon."] },
  stone: { label: "Kiviä", action: "Kerää kivi", amount: 1, notice: ["Keräsit kiven", "Tarvitset kiven nuotiota varten."] },
  mushrooms: { label: "Ruokasieniä", action: "Poimi sienet", amount: 2, notice: ["Sieniä kerätty", "Syö repusta painamalla 5."] },
  log: { label: "Kaatunut runko", action: "Pilko runko", amount: 3, item: "wood", asset: "fallen-log", notice: ["Pilkoit kolme halkoa", "Puuta voi käyttää nuotioon tai soihtuun."] },
};

const materialSpots = {
  wood: [[585, 558], [932, 781], [1285, 278], [562, 1118], [1739, 1120]],
  stone: [[440, 586], [734, 356], [985, 941], [1345, 650], [1760, 502]],
  mushrooms: [[652, 485], [350, 842], [1247, 491], [1830, 870], [1140, 1154]],
  log: [[1165, 861], [628, 991], [2110, 841], [2860, 790]],
};

function backcountrySupplies() {
  const supplies = [];
  for (let row = 0; row < HEIGHT / TILE_HEIGHT; row++) {
    for (let column = 0; column < WIDTH / TILE_WIDTH; column++) {
      const variation = terrainVariation(column, row);
      const left = WORLD_LEFT + column * TILE_WIDTH;
      const top = WORLD_TOP + row * TILE_HEIGHT;
      const dropTypes = ["berries", "wood", "stone", variation % 3 === 0 ? "log" : "mushrooms"];
      for (const [index, kind] of dropTypes.entries()) {
        const x = left + 220 + (index % 2) * 720 + (variation * (index + 3) % 215);
        const y = top + 150 + Math.floor(index / 2) * 510 + (variation * (index + 5) % 190);
        if (x > CORE.x - 100 && x < CORE.x + CORE.width + 100 && y > -100 && y < CORE.height + 100) continue;
        if (hitsTree(x, y)) continue;
        if (extraShelters.some((shelter) => Math.hypot(shelter.x - x, shelter.y - y) < 145)) continue;
        if (backcountry.some(({ shelter, well }) => Math.hypot(shelter.x - x, shelter.y - y) < 130 || Math.hypot(well.x - x, well.y - y) < 70)) continue;
        supplies.push({
          ...gatherables[kind], id: "wild-" + column + "-" + row + "-" + kind,
          x, y, labelY: y + 22, kind, icon: kind === "log" ? "axe" : kind, local: true,
        });
      }
    }
  }
  return supplies;
}

const points = [
  ...shelters.map((shelter) => ({ ...shelter, kind: "shelter", icon: shelter.icon ?? "house" })),
  lake,
  fishingSpot,
  boatLanding,
  ...landmarks,
  garage,
  parkedCar,
  forestHatch,
  placedTorch,
  ...backcountry.map(({ well }) => well),
  ...[
    { id: "berry-west", x: 443, y: 467, labelX: 396, labelY: 491 },
    { id: "berry-east", x: 962, y: 595, labelY: 626, local: true },
    { id: "berry-south", x: 677, y: 947, labelY: 978, local: true },
    { id: "berry-ridge", x: 1595, y: 594, labelY: 626, local: true },
  ].map((point) => ({ ...gatherables.berries, kind: "berries", icon: "berries", ...point })),
  ...Object.entries(materialSpots).flatMap(([kind, spots]) => spots.map(([x, y], index) => ({
    ...gatherables[kind], id: kind + "-" + index, x, y, labelY: y + 20, kind, icon: kind === "log" ? "axe" : kind, local: index > 0 || kind === "mushrooms",
  }))),
  ...backcountrySupplies(),
];

const animalTypes = [
  { id: "wolf", name: "Susi", x: 893, y: 423, roam: 86, speed: 100, detection: 145, damage: 17 },
  { id: "bear", name: "Karhu", x: 1107, y: 291, roam: 68, speed: 85, detection: 92, damage: 28 },
  { id: "moose", name: "Hirvi", x: 658, y: 439, roam: 90, speed: 128, detection: 105, damage: 0 },
  { id: "wolf", name: "Susi", x: 1413, y: 730, roam: 115, speed: 100, detection: 145, damage: 17 },
];

const sheep = { id: "sheep", name: "Lammas", roam: 39, speed: 30, detection: 0, damage: 0 };
const fox = { id: "fox", name: "Kettu", roam: 112, speed: 142, detection: 100, damage: 0, skittish: true };
const hare = { id: "hare", name: "Jänis", roam: 81, speed: 164, detection: 104, damage: 0, skittish: true };
const roeDeer = { id: "roe-deer", name: "Metsäkauris", roam: 145, speed: 152, detection: 130, damage: 0, skittish: true };

const [wolf, bear, moose] = animalTypes;
for (const [index, { hut: [x, y], biome }] of backcountry.entries()) {
  const direction = index % 2 === 0 ? 1 : -1;
  animalTypes.push({ ...moose, x: x + direction * 580, y: y + 390, roam: 155 });
  animalTypes.push({ ...(biome === "ridge" || index % 3 === 0 ? wolf : bear), x: x - direction * 640, y: y - 450, roam: 145 });
  animalTypes.push({ ...[hare, fox, roeDeer][index % 3], x: x + direction * 465, y: y - 280 });
  animalTypes.push({ ...[roeDeer, hare, fox][index % 3], x: x - direction * 585, y: y + 400 });
}
for (const [x, y] of [[500, 557], [590, 665], [705, 712], [630, 745], [1860, 926], [1940, 925], [2020, 905]]) {
  animalTypes.push({ ...sheep, x, y });
}
animalTypes.push({ ...hare, x: 392, y: 704 }, { ...fox, x: 1435, y: 510 }, { ...roeDeer, x: 1600, y: 710 });

for (const [animalIndex, animal] of animalTypes.entries()) {
  if (animal.id !== "sheep") continue;
  points.push({
    id: "shear-" + animalIndex, kind: "sheep", icon: "wool", animalIndex,
    label: "Keritse lammas", action: "Keritse lammas", local: true,
    get x() { return state.animals[animalIndex].x; },
    get y() { return state.animals[animalIndex].y; },
    get labelY() { return this.y + 17; },
  });
}

const shore = [
  [0, 245], [73, 254], [148, 281], [234, 323], [306, 365], [352, 414],
  [387, 480], [365, 568], [314, 626], [243, 679], [135, 724], [0, 764],
  [-28, 844], [-112, 924], [-201, 994], [-284, 1051], [-386, 1092],
  [-483, 1121], [-576, 1143], [-669, 1165], [-757, 1154], [-853, 1118],
  [-942, 1066], [-1005, 1022], [-1033, 922], [-1040, 825], [-1053, 751],
  [-1060, 695], [-1049, 643], [-1060, 566], [-1044, 493], [-1059, 419],
  [-1064, 358], [-1035, 302], [-978, 252], [-903, 212], [-817, 183],
  [-732, 185], [-668, 186], [-588, 203], [-507, 219], [-438, 244],
  [-364, 266], [-271, 291], [-193, 305], [-115, 283], [-54, 264],
];
const eastBoulders = [
  [[2800, 582], [2848, 545], [2914, 557], [2939, 599], [2907, 632], [2836, 618]],
  [[2538, 843], [2590, 812], [2660, 814], [2704, 844], [2691, 889], [2636, 899], [2573, 879]],
  [[2799, 1022], [2858, 985], [2929, 991], [2965, 1032], [2933, 1060], [2848, 1062]],
];
const obstacles = [...shelters.map(({ footprint }) => footprint), chickenPen.footprint, tower.footprint, garage.footprint,
  forestHatch.footprint, ...gate.wings, ...eastBoulders];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function icon(name) {
  return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
}

function position(element, x, y) {
  element.style.left = (x - camera.x) * camera.scale + "px";
  element.style.top = (y - camera.y) * camera.scale + "px";
}

function positionOnMap(element, { x, y }) {
  element.style.left = (x - WORLD_LEFT) / WIDTH * 100 + "%";
  element.style.top = (y - WORLD_TOP) / HEIGHT * 100 + "%";
}

function createWorldMap() {
  view.drawOverview(byId("map-overview"));
  for (const { name } of backcountry) {
    const label = document.createElement("span");
    label.className = "map-region";
    label.textContent = name;
    byId("map-regions").append(label);
  }
  for (const point of [shelters[0], tower, garage, sheepMeadow, ...backcountry.map(({ shelter }) => shelter), ...extraShelters]) registerMapMarker(point);
  registerMysteryMapMarkers();
}

function registerMapMarker(point) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = point === shelters[0] ? "map-landmark core-landmark" : "map-landmark";
  marker.title = point.label;
  marker.setAttribute("aria-label", point.label);
  marker.innerHTML = icon(point.icon ?? "house");
  positionOnMap(marker, point);
  marker.addEventListener("click", () => setMapTarget(point));
  byId("map-landmarks").append(marker);
  return marker;
}

function setMapTarget(target) {
  state.mapTarget = target;
  if (mapDialog.open) renderMap();
}

function renderMap() {
  const { player, mapTarget } = state;
  positionOnMap(byId("map-position"), player);
  byId("map-route-pin").hidden = byId("clear-map-pin").hidden = !mapTarget;
  if (mapTarget) positionOnMap(byId("map-route-pin"), mapTarget);
  setText("map-instructions", mapTarget ? "Reittimerkki: " + (mapTarget.label ?? region(mapTarget)) : "Aseta reittimerkki valitsemalla kartalta kohde.");
}

function openWorldMap() {
  if (mapDialog.open || dialog.open || state.tunnelTrip) return;
  keys.clear();
  driveTouches.clear();
  renderMap();
  mapDialog.showModal();
}

function renderMapDirection(player, target) {
  const button = byId("map-direction");
  button.hidden = !target;
  if (!target) return;
  const gap = distance(player, target);
  const angle = Math.atan2(target.y - player.y, target.x - player.x) + Math.PI / 2;
  const name = target.label ?? region(target);
  const label = "Poista reittimerkki: " + name;
  if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
  byId("map-arrow").style.transform = "rotate(" + angle + "rad)";
  setText("map-direction-text", gap <= USE_RANGE ? "Perillä" : name);
}

const loading = byId("game-loading");
const destination = document.createElement("span");
destination.className = "destination";

let view;
let playerSprite;
let animalSprites;
let campfireSprite;
let gatePanelSprite;
let henSprites;
let carSprite;
let flameSprite;
let boatSprite;
let state;
let dialogMode = "";
let soundOn = false;
let audioContext;
let windGain;

function createMarkers() {
  world.append(destination);
  for (const point of points) registerMarker(point);
}

function registerMarker(point) {
  if (point.asset || gatherables[point.kind]) point.sprite = view.addSprite(point.asset ?? point.kind);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-marker" + (point.kind === "shelter" || point === garage ? "" : " resource");
  if (point.kind === "water" || point.kind === "fishing") button.classList.add(point.kind + "-marker");
  button.innerHTML = icon(point.icon) + "<span>" + point.label + "</span>";
  button.addEventListener("click", () => goToPoint(point));
  world.append(button);
  point.button = button;
}

function reset() {
  while (state?.builds.length) dismantleBuild(state.builds.at(-1));
  state = {
    started: false,
    elapsed: 0,
    minutes: START_TIME,
    player: { x: 510, y: 491, angle: -Math.PI / 2, facing: 1 },
    meters: { health: 100, hunger: 74, thirst: 68, energy: 90 },
    pack: { berries: 0, water: 1, bandage: 0, mushrooms: 0, fish: 0, wood: 0, stone: 0, wool: 0,
      herbs: 0, nuts: 0, sap: 0, honey: 0, torch: false, battery: 100, light: false, axe: false, flame: false, flameOn: false, keycard: false },
    animals: animalTypes.map((type, index) => {
      const home = animalHome(type.x, type.y);
      return { ...type, ...home, home, ...animalSprites[index], angle: index * 2.5, facing: 1, chase: false, moving: false, regrowAt: 0 };
    }),
    waypoints: [],
    targetPoint: null,
    pointer: null,
    mapTarget: null,
    shelter: null,
    foundShelter: false,
    bunkerFound: false,
    tunnelOpen: false,
    tunnelTrip: null,
    cabinVisited: false,
    recordingSeen: false,
    collected: new Set(),
    expedition: expeditionJournal(),
    resting: false,
    campRest: null,
    builds: [],
    crafted: new Map(),
    gear: new Set(),
    gearBonus: {},
    nextBuild: 1,
    campfire: null,
    flamePlaced: false,
    fishing: null,
    gateOpen: false,
    gateLift: 0,
    onTower: false,
    car: { ...garage.driveway, speed: 0, inGarage: true, driving: false },
    boat: { ...boatLanding.launch, aboard: false, course: [], docking: false },
    wakeAt: 0,
    survived: false,
    exhausted: false,
    touchSprint: false,
    hitUntil: 0,
    message: null,
    moving: false,
  };
  keys.clear();
  driveTouches.clear();
  byId("touch-run").setAttribute("aria-pressed", "false");
  resizeView();
  render();
}

function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[i];
    const [bx, by] = polygon[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

function traversable(x, y, gateOpen = state?.gateOpen) {
  return x >= WORLD_LEFT + 20 && x <= WORLD_RIGHT - 20 && y >= WORLD_TOP + 20 && y <= WORLD_BOTTOM - 20
    && !hitsTree(x, y)
    && !(x >= CORE.x && x <= 390 && y >= 180 && y <= 1170 && insidePolygon(x, y, shore))
    && !obstacles.some((footprint) => insidePolygon(x, y, footprint))
    && !expeditionBlocks(x, y)
    && !state?.builds?.some((point) => insidePolygon(x, y, point.footprint))
    && (gateOpen || !insidePolygon(x, y, gate.barrier));
}

function animalHome(x, y) {
  if (traversable(x, y, true)) return { x, y };
  for (const distance of [35, 70, 105, 140, 200]) {
    for (let direction = 0; direction < 8; direction++) {
      const angle = direction * Math.PI / 4;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      if (traversable(px, py, true)) return { x: px, y: py };
    }
  }
  return { x, y };
}

function lineFits(from, to, fits) {
  const steps = Math.ceil(distance(from, to) / 8);
  for (let step = 1; step <= steps; step++) {
    if (!fits(from.x + (to.x - from.x) * step / steps, from.y + (to.y - from.y) * step / steps)) return false;
  }
  return true;
}

function clearPath(from, to) {
  return !treeBlocksPath(from, to) && lineFits(from, to, traversable);
}

function clearWaterPath(from, to) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  return lineFits(from, to, (x, y) => canFloatAt(x, y, angle));
}

const spacing = 28;

function navigationGrid(left, right, top, bottom, fits) {
  const columns = Math.floor((right - left) / spacing);
  const rows = Math.floor((bottom - top) / spacing);
  const nodes = Array.from({ length: columns * rows }, (_, index) => {
    const x = left + (index % columns + .5) * spacing;
    const y = top + (Math.floor(index / columns) + .5) * spacing;
    return fits(x, y) ? { x, y, index } : null;
  });
  return { nodes, columns };
}

const shoreX = shore.map(([x]) => x);
const boatGrid = navigationGrid(Math.min(...shoreX), Math.max(...shoreX), CORE.y, CORE.height, (x, y) => canFloatAt(x, y, 0) && canFloatAt(x, y, Math.PI / 2));

function closestNode(point, nodes, connects) {
  let best = null;
  let bestDistance = Infinity;
  for (const node of nodes) {
    if (!node) continue;
    const gap = distance(point, node);
    if (gap < bestDistance && connects(node)) {
      best = node;
      bestDistance = gap;
    }
  }
  return best;
}

function pathTo(from, to, grid, clear = clearPath) {
  if (clear(from, to)) return [to];
  const margin = 1200;
  const { nodes, columns } = grid ?? navigationGrid(
    Math.max(WORLD_LEFT, Math.min(from.x, to.x) - margin),
    Math.min(WORLD_RIGHT, Math.max(from.x, to.x) + margin),
    Math.max(WORLD_TOP, Math.min(from.y, to.y) - margin),
    Math.min(WORLD_BOTTOM, Math.max(from.y, to.y) + margin),
    (x, y) => traversable(x, y, true),
  );
  const start = closestNode(from, nodes, (node) => clear(from, node));
  const end = closestNode(to, nodes, (node) => clear(node, to));
  if (!start || !end) return [];
  const queue = [start];
  const previous = new Map([[start.index, null]]);
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (node === end) {
      const path = [to];
      for (let current = end; current; current = previous.get(current.index)) path.push(current);
      return path.reverse();
    }
    const column = node.index % columns;
    const neighborIds = [node.index - columns, node.index + columns];
    if (column > 0) neighborIds.push(node.index - 1);
    if (column + 1 < columns) neighborIds.push(node.index + 1);
    for (const id of neighborIds) {
      const neighbor = nodes[id];
      if (!neighbor || previous.has(id) || !clear(node, neighbor)) continue;
      previous.set(id, node);
      queue.push(neighbor);
    }
  }
  return [];
}

function travel(point, targetPoint = null) {
  state.started = true;
  state.waypoints = pathTo(state.player, point);
  if (state.waypoints.length) {
    state.fishing = null;
    if (state.campRest) stopRest();
  }
  state.targetPoint = state.waypoints.length ? targetPoint : null;
  state.pointer = state.waypoints.length ? point : null;
}

function goToPoint(point) {
  if (state.shelter || state.onTower || state.tunnelTrip || dialog.open || !available(point)) return;
  if (state.boat.aboard) {
    if (point === boatLanding) {
      if (nearLanding()) leaveBoat();
      else rowTo(boatLanding.approach, true);
    }
    return;
  }
  if (state.car.driving) {
    if (point === garage) {
      if (nearGarage()) leaveCar();
      else notice("Autotalli", "Aja tallin eteen pysäköidäksesi.", "garage");
    }
    return;
  }
  if (point.kind === "landmark") {
    travel(point);
  } else if (canUse(point)) {
    usePoint(point);
  } else {
    travel(approach(point), point);
  }
}

function available(point) {
  if (point === parkedCar) return !state.car.inGarage && !state.car.driving;
  if (point === placedTorch) return state.flamePlaced;
  if (point.kind === "sheep") return hasWool(state.animals[point.animalIndex]);
  if (point.kind === "expedition") return expeditionSiteAvailable(point);
  return !gatherables[point.kind] || !state.collected.has(point.id);
}

function hasWool(animal) {
  return state.minutes >= animal.regrowAt;
}

function approach(point) {
  return point === gate && state.player.y < gate.base.y - 11 ? gate.north : point;
}

function canUse(point) {
  const target = approach(point);
  return distance(state.player, target) <= USE_RANGE && clearPath(state.player, target);
}

function nearestPoint() {
  return [...points, ...expeditionSitesNear(state.player.x, state.player.y, USE_RANGE)]
    .filter((point) => point.kind !== "landmark" && available(point) && canUse(point))
    .sort((a, b) => distance(state.player, approach(a)) - distance(state.player, approach(b)))[0];
}

function notice(title, copy, iconName = "check", style = "") {
  state.message = { title, copy, iconName, style, until: state.elapsed + 4.2 };
}

function toggleGate() {
  const occupied = state.gateOpen && [state.player, ...state.animals].some(({ x, y }) => insidePolygon(x, y, gate.barrier));
  if (occupied) return notice("Portin kohdalla on este", "Sulje portti, kun kulkuaukko on vapaa.", "gate");
  state.gateOpen = !state.gateOpen;
  notice(state.gateOpen ? "Metsäportti on auki" : "Metsäportti on kiinni", state.gateOpen ? "Voit kulkea portin läpi." : "Avaa portti kulkeaksesi läpi.", "gate");
  playSound(state.gateOpen ? 240 : 170);
}

function setTower(climbed) {
  state.onTower = climbed;
  state.message = null;
  if (climbed) for (const animal of state.animals) animal.chase = false;
  resizeView();
  playSound(climbed ? 250 : 180);
}

function enterCar() {
  const { car, player } = state;
  if (car.inGarage) Object.assign(car, garage.driveway);
  car.inGarage = false;
  car.driving = true;
  state.shelter = null;
  state.resting = false;
  state.message = null;
  state.pack.flameOn = false;
  Object.assign(player, { x: car.x, y: car.y, angle: car.angle });
  for (const animal of state.animals) animal.chase = false;
  playSound(160);
}

function nearGarage() {
  return distance(state.car, garage.driveway) <= 69;
}

function leaveCar() {
  const { car, player } = state;
  if (Math.abs(car.speed) > 12) return notice("Pysäytä auto ensin", "Jarruta ennen kuin poistut autosta.", "car");
  car.speed = 0;
  car.driving = false;
  driveTouches.clear();
  keys.clear();
  state.message = null;
  if (nearGarage()) {
    car.inGarage = true;
    state.shelter = garage;
  } else {
    const x = Math.sin(car.angle) * 36;
    const y = -Math.cos(car.angle) * 36;
    const exit = [{ x: car.x + x, y: car.y + y }, { x: car.x - x, y: car.y - y }].find((point) => clearPath(car, point)) ?? car;
    Object.assign(player, { x: exit.x, y: exit.y });
  }
  playSound(190);
}

function enterBoat() {
  const { boat, player, pack } = state;
  boat.aboard = true;
  pack.flameOn = false;
  Object.assign(player, { x: boat.x, y: boat.y, angle: boat.angle });
  for (const animal of state.animals) animal.chase = false;
  state.message = null;
  playSound(260);
}

function nearLanding() {
  return distance(state.boat, boatLanding.launch) <= 54;
}

function stopRowing() {
  state.boat.course = [];
  state.boat.docking = false;
  state.pointer = null;
}

function rowTo(point, docking = false) {
  const course = pathTo(state.boat, point, boatGrid, clearWaterPath);
  if (!course.length) {
    stopRowing();
    return notice("Vene tarvitsee syvempää vettä", "Napauta kohtaa kauempana rannasta.", "boat");
  }
  state.boat.course = course;
  state.boat.docking = docking;
  state.pointer = point;
  state.fishing = null;
  state.message = null;
}

function leaveBoat() {
  stopRowing();
  Object.assign(state.boat, boatLanding.launch, { aboard: false });
  Object.assign(state.player, { x: boatLanding.x, y: boatLanding.y });
  state.fishing = null;
  state.message = null;
  driveTouches.clear();
  keys.clear();
  playSound(210);
}

function startFishing(point) {
  state.started = true;
  state.fishing = { point, readyAt: state.elapsed + FISHING_WAIT };
  state.player.facing = -1;
  state.message = null;
  playSound(290);
}

function fishFromBoat() {
  if (state.fishing) return;
  stopRowing();
  const { x, y } = state.boat;
  const offsets = [[-58, 7], [58, 7], [0, -51], [0, 51]];
  const [dx, dy] = offsets.find(([dx, dy]) => insidePolygon(x + dx, y + dy, shore)) ?? [0, 0];
  startFishing({ castX: x + dx, castY: y + dy });
}

function usePoint(point) {
  if (!point || !available(point) || state.fishing?.point === point) return;
  state.started = true;
  state.waypoints = [];
  state.targetPoint = null;
  state.pointer = null;
  state.fishing = null;
  if (state.campRest && state.campRest !== point) stopRest();
  if (point === gate) return toggleGate();
  if (point === tower) return setTower(true);
  if (point === parkedCar) return enterCar();
  if (point === boatLanding) return enterBoat();
  if (point === forestHatch) return useForestHatch();
  if (point.kind === "expedition") return useExpeditionSite(point);
  if (point.kind === "sheep") {
    state.animals[point.animalIndex].regrowAt = state.minutes + WOOL_GROWTH_MINUTES;
    state.pack.wool += WOOL_PER_SHEEP;
    notice("Keritsit lampaan", "Sait kaksi villaa sänkyä varten. Villa kasvaa takaisin kuudessa pelitunnissa.", "wool");
    playSound(510);
    return;
  }
  if (point.kind === "construction") return constructionActions[point.recipe.id](point);
  if (point === placedTorch) {
    state.flamePlaced = false;
    state.pack.flame = true;
    state.pack.flameOn = true;
    notice("Poimit soihdun", "Voit asettaa sen uudelleen painamalla G.", "flame");
    return;
  }
  if (point.kind === "fishing") return startFishing(point);
  if (point.kind === "shelter" || point === garage) {
    if (point.id === armyCabin.id && !state.pack.keycard) {
      return notice("Armeijan mökki on lukossa", "Tarvitset metsäbunkkerin kulkukortin.", "lock");
    }
    state.shelter = point;
    state.pack.flameOn = false;
    state.foundShelter = true;
    for (const animal of state.animals) animal.chase = false;
    state.message = null;
    if (point.id === bunker.id) discoverBunker();
    if (point.id === armyCabin.id) {
      const firstVisit = !state.cabinVisited;
      state.cabinVisited = true;
      if (firstVisit) notice("Ovi aukesi kulkukortilla", "Pöydällä on vanha nauhuri. Katso sen tallenne.", "keycard");
    }
    playSound(200);
  }
  if (gatherables[point.kind]) {
    if (point.kind === "log" && !state.pack.axe) return notice("Tarvitset kirveen", "Etsi kirves puuvajasta.", "axe");
    state.collected.add(point.id);
    state.pack[point.item ?? point.kind] += point.amount;
    notice(...point.notice, point.icon);
    playSound(560);
  }
  if (point.kind === "water") refillWater();
}

function campfireWoodCost() {
  return FIRE_COST.wood - gearBonus("fireSaving");
}

function hasFireMaterials(pack) {
  return pack.wood >= campfireWoodCost() && pack.stone >= FIRE_COST.stone;
}

function buildCampfire() {
  if (dialog.open || craftingDialog.open || state.meters.health <= 0) return;
  if (state.shelter || state.onTower || state.car.driving || state.boat.aboard) return notice("Nuotio tehdään maastossa", "Palaa ensin metsään.", "campfire");
  if (state.campfire) return notice("Nuotio palaa jo", "Voit tehdä uuden sen sammuttua.", "campfire");
  if (!hasFireMaterials(state.pack)) {
    return notice("Tarvitset lisää tarvikkeita", "Nuotioon kuluu " + campfireWoodCost() + " puuta ja " + FIRE_COST.stone + " kivi.", "campfire");
  }

  const { player, pack } = state;
  const ahead = { x: player.x + Math.cos(player.angle) * 30, y: player.y + Math.sin(player.angle) * 30 };
  pack.wood -= campfireWoodCost();
  pack.stone -= FIRE_COST.stone;
  igniteCampfire(clearPath(player, ahead) ? ahead : player);
}

function igniteCampfire({ x, y }) {
  state.campfire = { x, y, until: state.elapsed + FIRE_DURATION + gearBonus("fireTime") };
  state.started = true;
  notice("Nuotio sytytetty", "Se valaisee ja auttaa palauttamaan jaksamista.", "campfire");
  playSound(480);
}

function nearCampfire() {
  return !state.shelter && !state.onTower && !state.car.driving && !state.boat.aboard && state.campfire && distance(state.player, state.campfire) < FIRE_RADIUS;
}

function searchShelter() {
  const shelter = state.shelter;
  if (shelter?.id === armyCabin.id) return openCabinRecording();
  if (shelter === garage) {
    if (state.car.inGarage) enterCar();
    return;
  }
  if (!shelter || state.collected.has(shelter.id)) return;
  state.collected.add(shelter.id);
  for (const [item, amount] of Object.entries(shelter.loot)) {
    state.pack[item] = typeof amount === "number" ? state.pack[item] + amount : amount;
  }
  state.pack.battery = Math.min(100, state.pack.battery);
  notice(...shelter.notice);
  playSound(660);
}

function leaveShelter() {
  if (!state.shelter || state.tunnelTrip) return;
  const { x, y } = state.shelter;
  state.player.x = x;
  state.player.y = y + 8;
  state.shelter = null;
  state.resting = false;
  playSound(180);
}

function interact() {
  if (dialog.open || recordingDialog.open || state.tunnelTrip) return;
  if (state.campRest) return stopRest();
  if (state.car.driving) return leaveCar();
  if (state.boat.aboard) return nearLanding() ? leaveBoat() : fishFromBoat();
  if (state.onTower) return setTower(false);
  if (!state.shelter) {
    const point = nearestPoint();
    if (point) usePoint(point);
    return;
  }
  if (state.shelter.id === bunker.id && state.pack.keycard) return useBunkerHatch();
  if ((state.shelter === garage && !state.car.inGarage) || state.collected.has(state.shelter.id)) leaveShelter();
  else searchShelter();
}

function stopRest() {
  state.resting = false;
  state.campRest = null;
}

function toggleRest(camp = null) {
  if (state.resting) return stopRest();
  state.resting = true;
  state.campRest = camp;
  state.wakeAt = (Math.floor((state.minutes - DAWN) / 1440) + 1) * 1440 + DAWN;
  state.message = null;
}

function useAxe() {
  if (!state.pack.axe) return notice("Kirves puuttuu", "Etsi kirves puuvajasta.", "axe");
  if (!state.shelter && !state.onTower && !state.car.driving && !state.boat.aboard) {
    const log = points.find((point) => point.kind === "log" && available(point) && canUse(point));
    if (log) return usePoint(log);
  }
  notice("Kirves on mukana", "Voit pilkkoa kaatuneita runkoja niiden lähellä.", "axe");
}

function useFlame() {
  const { pack } = state;
  if (state.shelter || state.onTower || state.car.driving || state.boat.aboard) return notice("Soihtua käytetään maastossa", "Palaa ensin maastoon.", "flame");
  if (state.flamePlaced) return notice("Soihtu on maassa", "Poimi soihtu sen vieressä painamalla E.", "flame");
  if (!pack.flame) {
    if (!pack.wood) return notice("Tarvitset puuta", "Soihdun tekemiseen kuluu yksi puu.", "flame");
    pack.wood--;
    pack.flame = true;
    pack.flameOn = true;
    state.started = true;
    return notice("Teit soihdun", "Aseta soihtu maahan painamalla G.", "flame");
  }
  pack.flameOn = !pack.flameOn;
  state.started = true;
  notice(pack.flameOn ? "Soihtu sytytetty" : "Soihtu sammutettu", "Käytä soihtua painamalla 8.", "flame");
}

function placeFlame() {
  if (dialog.open || mapDialog.open || state.meters.health <= 0) return;
  if (state.shelter || state.onTower || state.car.driving || state.boat.aboard) return notice("Soihtu asetetaan maastoon", "Palaa ensin maastoon.", "flame");
  if (state.flamePlaced) {
    if (canUse(placedTorch)) return usePoint(placedTorch);
    return notice("Soihtu on maassa", "Palaa soihdun luo poimimaan se.", "flame");
  }
  const { pack, player } = state;
  if (!pack.flame) return notice("Tee ensin soihtu", "Paina 8 tai valitse soihtu repusta. Tarvitset yhden puun.", "flame");
  const ahead = { x: player.x + Math.cos(player.angle) * 34, y: player.y + Math.sin(player.angle) * 34 };
  const { x, y } = clearPath(player, ahead) ? ahead : player;
  Object.assign(placedTorch, { x, y, labelY: y + 20 });
  pack.flame = false;
  pack.flameOn = false;
  state.flamePlaced = true;
  state.started = true;
  notice("Soihtu valaisee maastoa", "Poimi se halutessasi painamalla E.", "flame");
}

function useItem(item) {
  if (dialog.open || state.meters.health <= 0) return;
  if (item === "axe") return useAxe();
  if (item === "flame") return useFlame();
  const { pack, meters } = state;
  if (item === "torch") {
    if (!pack.torch) return notice("Taskulamppu puuttuu", "Etsi tarvikkeita metsämökistä.", "torch");
    if (pack.battery <= 0) return notice("Akku on tyhjä", "Hakeudu suojaan, kun näkyvyys heikkenee.", "torch");
    pack.light = !pack.light;
    notice(pack.light ? "Taskulamppu päällä" : "Taskulamppu pois päältä", "Akku " + Math.ceil(pack.battery) + "%", "torch");
    playSound(pack.light ? 520 : 280);
    return;
  }
  const items = {
    berries: { meter: "hunger", restore: 25, title: "Söit mustikoita", empty: "Etsi metsästä mustikkapensas.", icon: "berries" },
    mushrooms: { meter: "hunger", restore: 20, title: "Söit ruokasieniä", empty: "Etsi metsästä ruokasieniä.", icon: "mushrooms" },
    fish: { meter: "hunger", restore: 35, title: "Söit ahvenen", empty: "Kalasta metsälammella.", icon: "fish" },
    water: { meter: "thirst", restore: 29 + gearBonus("drinkBonus"), title: "Joit vettä", empty: "Täytä juomapullo padasta, kaivosta tai lammelta.", icon: "drop" },
    bandage: { meter: "health", restore: 35, title: "Sidoit haavat", empty: "Etsi ensiaputarvikkeita vajasta.", icon: "bandage" },
  };
  const info = items[item];
  if (!pack[item]) return notice("Repussa ei ole tarviketta", info.empty, info.icon);
  if (meters[info.meter] >= 100) return notice("Mittari on täynnä", "Voit säästää tarvikkeen myöhemmäksi.", info.icon);
  pack[item]--;
  meters[info.meter] = Math.min(100, meters[info.meter] + info.restore);
  notice(info.title, "Repussa jäljellä " + pack[item] + ".", info.icon);
  playSound(460);
}

function hour() {
  return state.minutes % 1440 / 60;
}

function darkness() {
  const time = hour();
  if (time >= 20.5) return clamp((time - 20.5) / 1.5, 0, 1);
  if (time < 5) return 1;
  return clamp((6 - time), 0, 1);
}

function driveInput(action, ...keyCodes) {
  return Number(keyCodes.some((code) => keys.has(code)) || Array.from(driveTouches.values()).includes(action));
}

function footprintFits(x, y, angle, contacts, fits) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return contacts.every(([dx, dy]) => fits(x + dx * cos - dy * sin, y + dx * sin + dy * cos));
}

function canDriveAt(x, y, angle) {
  return footprintFits(x, y, angle, CAR_CONTACTS, traversable);
}

function canFloatAt(x, y, angle) {
  return footprintFits(x, y, angle, BOAT_CONTACTS, (px, py) => px >= WORLD_LEFT + 17 && insidePolygon(px, py, shore));
}

function stepCar(dt) {
  const { car, player } = state;
  const throttle = driveInput("forward", "KeyW", "ArrowUp") - driveInput("reverse", "KeyS", "ArrowDown");
  const steer = driveInput("right", "KeyD", "ArrowRight") - driveInput("left", "KeyA", "ArrowLeft");
  const braking = driveInput("brake", "Space");
  if (braking || !throttle) {
    const friction = braking ? 690 : 155;
    car.speed = Math.sign(car.speed) * Math.max(0, Math.abs(car.speed) - friction * dt);
  } else {
    car.speed = clamp(car.speed + throttle * dt * 315, -130, 322);
  }
  if (!car.speed) return;

  const travel = car.speed * dt;
  const turn = steer * dt * 2.25 * clamp(car.speed / 93, -1, 1);
  const steps = Math.max(1, Math.ceil(Math.abs(travel) / 6));
  for (let i = 0; i < steps; i++) {
    const angle = car.angle + turn / steps;
    const x = car.x + Math.cos(angle) * travel / steps;
    const y = car.y + Math.sin(angle) * travel / steps;
    if (!canDriveAt(x, y, angle)) {
      car.speed = 0;
      break;
    }
    Object.assign(car, { x, y, angle });
  }
  state.moving = player.x !== car.x || player.y !== car.y;
  Object.assign(player, { x: car.x, y: car.y, angle: car.angle });
}

function stepBoat(dt) {
  const { boat, player } = state;
  let dx = driveInput("right", "KeyD", "ArrowRight") - driveInput("left", "KeyA", "ArrowLeft");
  let dy = driveInput("reverse", "KeyS", "ArrowDown") - driveInput("forward", "KeyW", "ArrowUp");
  if ((dx || dy) && boat.course.length) stopRowing();
  const waypoint = boat.course[0];
  if (waypoint) {
    dx = waypoint.x - boat.x;
    dy = waypoint.y - boat.y;
    if (Math.hypot(dx, dy) < .5) {
      boat.course.shift();
      if (!boat.course.length) {
        if (boat.docking && nearLanding()) leaveBoat();
        else stopRowing();
      }
      return;
    }
  }
  const length = Math.hypot(dx, dy);
  if (!length || !dt) return;
  state.fishing = null;
  const direction = Math.atan2(dy, dx);
  if (canFloatAt(boat.x, boat.y, direction)) boat.angle = direction;
  const step = (waypoint ? Math.min(length, 124 * dt) : 124 * dt) / length;
  const x = boat.x + dx * step;
  const y = boat.y + dy * step;
  if (canFloatAt(x, y, boat.angle)) {
    boat.x = x;
    boat.y = y;
  } else {
    if (canFloatAt(x, boat.y, boat.angle)) boat.x = x;
    if (canFloatAt(boat.x, y, boat.angle)) boat.y = y;
  }
  state.moving = player.x !== boat.x || player.y !== boat.y;
  Object.assign(player, { x: boat.x, y: boat.y, angle: boat.angle });
  if (waypoint && !state.moving) {
    stopRowing();
    notice("Vene pysähtyi matalikkoon", "Valitse kohta kauempana rannasta.", "boat");
  }
}

function stepPlayer(dt) {
  let dx = 0;
  let dy = 0;
  for (const key of keys) {
    if (!moves[key]) continue;
    dx += moves[key][0];
    dy += moves[key][1];
  }
  const { player, meters } = state;
  if (dx || dy) {
    if (state.campRest) stopRest();
    state.started = true;
    state.fishing = null;
    state.waypoints = [];
    state.targetPoint = null;
    state.pointer = null;
  } else if (state.waypoints.length) {
    const waypoint = state.waypoints[0];
    dx = waypoint.x - player.x;
    dy = waypoint.y - player.y;
    if (Math.hypot(dx, dy) < .01) {
      state.waypoints.shift();
      if (!state.waypoints.length) {
        const target = state.targetPoint;
        state.pointer = null;
        state.targetPoint = null;
        if (target && canUse(target)) usePoint(target);
      }
      return;
    }
  }
  const length = Math.hypot(dx, dy);
  state.moving = length > 0;
  if (!state.moving) return;
  const wantsSprint = state.touchSprint || keys.has("ShiftLeft") || keys.has("ShiftRight");
  if (!wantsSprint || meters.energy > 20) state.exhausted = false;
  const sprinting = wantsSprint && !state.exhausted && meters.energy > 1;
  if (wantsSprint && meters.energy <= 1) state.exhausted = true;
  const speed = sprinting ? 173 : 108 + gearBonus("walkSpeed");
  const step = Math.min(length, dt * speed);
  const scale = state.waypoints.length ? step / length : dt * speed / length;
  const nextX = player.x + dx * scale;
  const nextY = player.y + dy * scale;
  player.angle = Math.atan2(dy, dx);
  if (Math.abs(dx) > .05) player.facing = dx < 0 ? -1 : 1;
  const prevX = player.x;
  const prevY = player.y;
  if (state.waypoints.length && traversable(nextX, nextY)) {
    player.x = nextX;
    player.y = nextY;
  } else {
    if (traversable(nextX, player.y)) player.x = nextX;
    if (traversable(player.x, nextY)) player.y = nextY;
  }
  state.moving = player.x !== prevX || player.y !== prevY;
  if (sprinting && state.moving) meters.energy = Math.max(0, meters.energy - (9 - gearBonus("sprintSaving")) * dt);
}

function stepAnimals(dt) {
  const { player } = state;
  const dark = darkness();
  const exposed = onFootOutdoors() && state.campRest?.recipe?.id !== "lean-to" && state.campRest?.effect !== "shelter";
  for (const [index, animal] of state.animals.entries()) {
    const prevX = animal.x;
    const prevY = animal.y;
    const gap = distance(animal, player);
    if (animal.observationId) {
      if (gap > 1050 || !expeditionAnimalAwake(animal)) {
        animal.moving = false;
        continue;
      }
      observeExpeditionAnimal(animal, gap, exposed);
    }
    if (animal.id === "sheep" && exposed && (gap < 112 || state.targetPoint?.animalIndex === index)) {
      animal.moving = false;
      continue;
    }
    const range = animal.detection + (animal.id === "wolf" ? dark * 59 : 0) - (animal.damage ? gearBonus("stealth") : 0);
    animal.chase = exposed && animal.damage > 0 && gap < range + (animal.chase ? 56 : 0);
    const flee = exposed && (animal.id === "moose" || animal.skittish) && gap < range;
    let target;
    if (animal.chase) {
      target = player;
    } else if (flee) {
      target = { x: animal.x + animal.x - player.x, y: animal.y + animal.y - player.y };
    } else {
      animal.angle += dt * .38;
      target = { x: animal.home.x + Math.cos(animal.angle) * animal.roam, y: animal.home.y + Math.sin(animal.angle) * animal.roam * .62 };
    }
    const dx = target.x - animal.x;
    const dy = target.y - animal.y;
    const length = Math.hypot(dx, dy);
    if (length > 1) {
      const step = Math.min(length, dt * (animal.chase || flee ? animal.speed : 28));
      const nextX = animal.x + dx / length * step;
      const nextY = animal.y + dy / length * step;
      if (traversable(nextX, animal.y)) animal.x = nextX;
      if (traversable(animal.x, nextY)) animal.y = nextY;
      if (Math.abs(dx) > 2) animal.facing = dx > 0 ? -1 : 1;
    }
    animal.moving = animal.x !== prevX || animal.y !== prevY;
    if (animal.chase && gap < 23 && state.hitUntil <= state.elapsed) {
      if (state.campRest) stopRest();
      state.meters.health = Math.max(0, state.meters.health - animal.damage);
      state.hitUntil = state.elapsed + 1.8;
      playSound(95);
    }
  }
}

function tick(dt) {
  state.moving = false;
  if (stepTunnel(dt)) return;
  if (state.car.driving) stepCar(dt);
  else if (state.boat.aboard) stepBoat(dt);
  else if (!state.shelter && !state.onTower) stepPlayer(dt);
  if (!state.started) return;
  if (!state.bunkerFound && onFootOutdoors() && distance(state.player, bunker) < 145) discoverBunker();
  const { meters, pack } = state;
  state.elapsed += dt;
  state.gateLift = clamp(state.gateLift + dt * (state.gateOpen ? 4 : -4), 0, 1);
  if (state.fishing && state.elapsed >= state.fishing.readyAt) {
    state.fishing = null;
    state.pack.fish++;
    notice("Sait ahvenen", "Syö saalis repusta painamalla 6.", "fish");
    playSound(620);
  }
  if (state.campfire?.until <= state.elapsed) state.campfire = null;
  state.minutes += dt * MINUTES_PER_SECOND * (state.resting ? 7 : 1);
  const walking = state.moving && !state.car.driving;
  meters.hunger = Math.max(0, meters.hunger - dt * (walking ? .31 : .19));
  meters.thirst = Math.max(0, meters.thirst - dt * (walking ? .53 : .27));
  const recovery = state.resting ? 7 + gearBonus("restBonus") : state.shelter ? 7 : walking ? .25 : nearCampfire() ? 5 : 2.4;
  meters.energy = Math.min(100, meters.energy + dt * recovery);
  if (meters.hunger === 0 || meters.thirst === 0) meters.health = Math.max(0, meters.health - 2.6 * dt);
  if (state.resting && meters.hunger > 20 && meters.thirst > 20) meters.health = Math.min(100, meters.health + dt * 1.6);
  if (pack.light && !state.shelter && !state.car.driving) {
    pack.battery = Math.max(0, pack.battery - dt * 1.16);
    if (!pack.battery) {
      pack.light = false;
      notice("Taskulampun akku loppui", "Palaa suojaan.", "torch", "night");
    }
  }
  stepAnimals(dt);
  if (meters.health <= 0) {
    showDialog("lost");
  } else if (!state.survived && state.minutes >= 1440 + DAWN) {
    state.survived = true;
    stopRest();
    showDialog("won");
    playSound(740);
  } else if (state.resting && state.minutes >= state.wakeAt) {
    stopRest();
  }
}

function describeSituation() {
  const message = state.message?.until > state.elapsed ? state.message : null;
  const threats = state.animals.filter((animal) => animal.chase);
  if (threats.length) {
    const threat = threats.reduce((nearest, animal) => distance(animal, state.player) < distance(nearest, state.player) ? animal : nearest);
    return { title: threat.name + " lähestyy!", copy: "Juokse suojaan tai väistä kauemmas.", iconName: "alert", style: "danger" };
  }
  if (state.fishing) return { title: "Odotat tärppiä", copy: "Pysy paikallasi, kunnes kala tarttuu onkeen.", iconName: "fish" };
  if (message) return message;
  if (state.campRest) return { title: "Lepäät", copy: "Aika kuluu nopeammin. Herää painamalla E.", iconName: "bed" };
  if (state.car.driving) return { title: "Ajat autoa", copy: "Pysähdy ennen kuin poistut autosta.", iconName: "car" };
  if (state.boat.aboard) return { title: "Olet veneessä", copy: "Napauta vettä tai souda näppäimillä.", iconName: "boat" };
  if (state.onTower) return { title: "Olet vartiotornissa", copy: "Täältä näet kauemmas metsään.", iconName: "tower" };
  if (state.shelter) {
    return { title: state.resting ? "Lepäät suojassa" : "Olet suojassa", copy: state.resting ? "Aika kuluu nopeammin." : "Eläimet jäävät ulos. Voit levätä täällä.", iconName: "house", style: "" };
  }
  if (nearCampfire()) {
    return { title: "Nuotio palaa", copy: "Jaksaminen palautuu nopeammin, kun pysähdyt.", iconName: "campfire", style: "" };
  }
  const dark = darkness();
  if (dark > .35) {
    const copy = state.pack.flameOn ? "Soihtu valaisee polkua." : state.pack.torch ? "Taskulamppu auttaa näkemään polun." : "Kulje varovasti ja etsi valoa.";
    return { title: dark > .96 ? "Pilkkopimeää" : "Metsä pimenee", copy, iconName: "moon", style: "night" };
  }
  if (hour() >= 16) {
    return { title: "Ilta lähestyy", copy: state.foundShelter ? "Palaa suojaan ennen pimeää." : "Etsi suoja ennen pimeää.", iconName: "sunset", style: "" };
  }
  return { title: "Päivä valkenee", copy: "Täydennä varastoja ennen seuraavaa yötä.", iconName: "sun", style: "" };
}

function setText(id, value) {
  const element = byId(id);
  if (element.textContent !== value) element.textContent = value;
}

function setIcon(id, name) {
  const element = byId(id);
  const href = "#i-" + name;
  if (element.getAttribute("href") !== href) element.setAttribute("href", href);
}

function resizeView() {
  const width = scene.clientWidth;
  const height = scene.clientHeight;
  if (!width || !height) return;
  camera.scale = Math.max(width / VIEW_WIDTH, height / VIEW_HEIGHT) * (state?.onTower ? .69 : 1);
  camera.width = width / camera.scale;
  camera.height = height / camera.scale;
  view.resize(width, height, camera.width, camera.height);
  resizeWeather(width, height);
}

function region({ x, y }) {
  if (x < CORE.x || x >= CORE.x + CORE.width || y < CORE.y || y >= CORE.y + CORE.height) return backcountryRegion(x, y).name;
  if (x < 0) return "Korpijärvi";
  if (x >= 2000) return "Itämetsä";
  if (y > 800) return x < 950 ? "Saunapolku" : "Erämaankangas";
  return x < 1020 ? "Metsälampi" : "Vartijankangas";
}

function renderFishing() {
  const { fishing, player, elapsed } = state;
  fishingOverlay.toggleAttribute("hidden", !fishing);
  if (!fishing) return;

  const { castX, castY } = fishing.point;
  const x = (castX - camera.x) * camera.scale;
  const y = (castY - camera.y) * camera.scale + Math.sin(elapsed * 7);
  const line = fishingOverlay.querySelector("line");
  line.setAttribute("x1", (player.x - 13 - camera.x) * camera.scale);
  line.setAttribute("y1", (player.y - (state.boat.aboard ? 8 : 32) - camera.y) * camera.scale);
  line.setAttribute("x2", x);
  line.setAttribute("y2", y);
  fishingOverlay.querySelector("g").setAttribute("transform", "translate(" + x + " " + y + ")");
}

function renderWorld(dark) {
  const { player, animals, pack, elapsed, moving, campfire, onTower, car, boat } = state;
  const focus = onTower ? tower.base : player;
  camera.x = clamp(focus.x - camera.width / 2, WORLD_LEFT, WORLD_RIGHT - camera.width);
  camera.y = clamp(focus.y - camera.height * .68, WORLD_TOP, WORLD_BOTTOM - camera.height);
  const inView = (x, y, padding = 0) => x >= camera.x - padding && x <= camera.x + camera.width + padding
    && y >= camera.y - padding && y <= camera.y + camera.height + padding;

  view.positionSprite(playerSprite, player.x, player.y, {
    facing: player.facing,
    step: moving ? Math.abs(Math.sin(elapsed * 13)) * 3 : 0,
    brightness: 1 - dark * .42,
    visible: !onTower && !car.driving && !boat.aboard,
  });
  view.positionSprite(carSprite, car.x, car.y, { angle: car.angle, brightness: 1 - dark * .53, visible: !car.inGarage });
  view.positionSprite(boatSprite, boat.x, boat.y, { angle: boat.angle, step: Math.sin(elapsed * 3) * 1.2, brightness: 1 - dark * .6 });
  view.positionSprite(flameSprite, player.x + player.facing * 17, player.y - 15, { visible: pack.flameOn && !onTower });
  for (const animal of animals) {
    const visible = inView(animal.x, animal.y, 110) && (!animal.observationId || expeditionAnimalAwake(animal));
    const shorn = animal.shornSprite && !hasWool(animal);
    const appearance = {
      facing: animal.facing,
      step: animal.moving ? Math.abs(Math.sin(elapsed * 12 + animal.home.x)) * (animal.id === "hare" ? 6 : 3) : 0,
      brightness: 1 - dark * (animal.chase ? .44 : .68),
    };
    view.positionSprite(animal.sprite, animal.x, animal.y, { ...appearance, visible: visible && !shorn });
    if (animal.shornSprite) {
      view.positionSprite(animal.shornSprite, animal.x, animal.y, { ...appearance, visible: visible && shorn });
    }
  }
  const vehicleTarget = car.driving ? garage : boat.aboard ? boatLanding : null;
  for (const point of [...points, ...expeditionPointsOnScreen()]) {
    if (point === placedTorch && !state.flamePlaced) {
      point.button.hidden = true;
      view.positionSprite(point.sprite, 0, 0, { visible: false });
      continue;
    }
    const landingMarker = boat.aboard && point === boatLanding;
    const x = landingMarker ? boatLanding.x + 28 : point.labelX ?? point.x;
    const y = landingMarker ? boatLanding.y + 10 : point.labelY ?? point.y;
    const onScreen = inView(x, y);
    const canGather = available(point);
    const undiscovered = point.id === bunker.id && !state.bunkerFound;
    point.button.hidden = onTower || (vehicleTarget && point !== vehicleTarget) || (!onScreen && !landingMarker) || !canGather || undiscovered || state.fishing?.point === point || (point.local && distance(player, point) > 105);
    if (landingMarker) {
      const markerX = clamp(x, camera.x + 83 / camera.scale, camera.x + camera.width - 83 / camera.scale);
      const markerY = clamp(y, camera.y + 94 / camera.scale, camera.y + camera.height - 118 / camera.scale);
      position(point.button, markerX, markerY);
      const label = point.button.querySelector("span");
      const title = x > camera.x + camera.width ? "Rantautumispaikka →" : "Rantautumispaikka";
      if (label.textContent !== title) label.textContent = title;
    } else if (!point.button.hidden) position(point.button, x, y);
    if (point === forestHatch) {
      renderForestHatch(inView(point.base.x, point.base.y, 80), dark);
    } else if (point.base) {
      const depleted = point.kind === "expedition" && (!canGather || (state.expedition.ready.get(point.id) ?? 0) > state.minutes);
      view.positionSprite(point.sprite, point.base.x, point.base.y, { brightness: (depleted ? .58 : 1) * (1 - dark * .85), visible: inView(point.base.x, point.base.y, 195) });
    } else if (point.sprite) {
      view.positionSprite(point.sprite, point.x - (point.kind === "berries" ? 13 : 0), point.y - 1, {
        brightness: point === placedTorch ? 1 : (canGather ? 1 : .58) * (1 - dark * .92),
        visible: inView(point.x, point.y, 55) && (canGather || point.kind === "berries"),
      });
    }
  }
  view.positionSprite(gatePanelSprite, gate.base.x, gate.base.y - 1, { step: state.gateLift * 48, brightness: 1 - dark * .85 });
  for (const [index, [x, y]] of henPositions.entries()) {
    const angle = elapsed * (1.1 + index * .12) + index * 2;
    view.positionSprite(henSprites[index], chickenPen.base.x + x + Math.sin(angle) * 10, chickenPen.base.y + y + Math.cos(angle) * 5, {
      facing: Math.cos(angle) > 0 ? -1 : 1,
      step: Math.abs(Math.sin(elapsed * 12 + index)) * 1.5,
      brightness: (1 - index * .1) * (1 - dark * .65),
    });
  }
  const flicker = .91 + Math.sin(elapsed * 18) * .07;
  const fire = campfire ? { x: campfire.x, y: campfire.y, radius: FIRE_RADIUS, glow: flicker } : null;
  const groundTorch = state.flamePlaced ? { x: placedTorch.x, y: placedTorch.y, radius: PLACED_FLAME_RADIUS, glow: flicker } : null;
  view.positionSprite(campfireSprite, fire?.x ?? 0, fire?.y ?? 0, { brightness: flicker, visible: Boolean(fire) });
  renderFishing();
  destination.hidden = !state.pointer;
  if (state.pointer) position(destination, state.pointer.x, state.pointer.y);
  view.draw(camera, player, { dark, torch: car.driving || pack.light, handFlame: pack.flameOn, fire, groundTorch });
}

function renderVehicleControls(car, boat) {
  const vehicle = boat.aboard ? "boat" : car.driving ? "car" : "";
  const controls = byId("drive-controls");
  byId("control-strip").classList.toggle("driving", Boolean(vehicle));
  controls.hidden = !vehicle;
  if (controls.dataset.mode !== vehicle) {
    controls.dataset.mode = vehicle;
    controls.setAttribute("aria-label", boat.aboard ? "Soutuohjaimet" : "Ajo-ohjaimet");
    byId("drive-brake-key").hidden = boat.aboard;
    byId("drive-brake").hidden = boat.aboard;
    setText("drive-action", boat.aboard ? "Souda" : "Aja");
    for (const button of controls.querySelectorAll("[data-boat-label]")) {
      button.setAttribute("aria-label", boat.aboard ? button.dataset.boatLabel : button.dataset.carLabel);
    }
    boatLanding.button.querySelector("span").textContent = boat.aboard ? "Rantautumispaikka" : boatLanding.label;
  }
  if (vehicle) setText("car-speed", boat.aboard ? "Soutuvene" : Math.round(Math.abs(car.speed) * .18) + " km/h");
}

function render() {
  const { player, meters, pack, shelter, onTower, car, boat } = state;
  parkedCar.x = car.x;
  parkedCar.y = car.y;
  parkedCar.labelY = car.y - 46;
  const hours = Math.floor(hour());
  const minutes = Math.floor(state.minutes % 60);
  setText("clock-day", "Päivä " + (1 + Math.floor(state.minutes / 1440)));
  setText("clock-time", String(hours).padStart(2, "0") + "." + String(minutes).padStart(2, "0"));
  const dark = darkness();
  const weather = weatherAt(state.minutes - START_TIME);
  const night = dark > .35;
  setIcon("clock-icon", night ? "moon" : "sun");
  byId("clock-icon").closest(".clock").classList.toggle("is-night", night);
  byId("weather-badge").hidden = Boolean(shelter);
  setText("weather-name", weather.name);
  setIcon("weather-icon", weather.icon === "sun" && night ? "moon" : weather.icon);

  interior.hidden = !shelter || Boolean(state.tunnelTrip);
  scene.classList.toggle("in-vehicle", car.driving || boat.aboard);
  interior.classList.toggle("inside-garage", shelter === garage);
  interior.classList.toggle("inside-bunker", shelter?.id === bunker.id);
  interior.classList.toggle("inside-army-cabin", shelter?.id === armyCabin.id);
  byId("garage-car").hidden = shelter !== garage || !car.inGarage;
  world.hidden = Boolean(shelter || state.tunnelTrip);
  renderMapDirection(player, state.mapTarget);
  setText("area-title", onTower ? tower.label : shelter?.label ?? "Korpimetsä");
  setText("location", shelter ? "Suojassa" : region(onTower ? tower.base : player));
  setIcon("location-icon", shelter ? shelter.icon : onTower ? "tower" : car.driving ? "car" : boat.aboard ? "boat" : "pin");
  if (shelter) {
    const inGarage = shelter === garage;
    const searchIcon = shelter.id === armyCabin.id ? "recording" : shelter.id === bunker.id ? "keycard" : "pack";
    byId("search-shelter").hidden = inGarage ? !car.inGarage : state.collected.has(shelter.id);
    setIcon("search-icon", inGarage ? "car" : searchIcon);
    setText("search-label", inGarage ? "Mene autoon" : shelter.search);
    setText("rest-label", state.resting ? "Herää" : "Lepää");
  }

  const situation = describeSituation();
  setText("status-title", situation.title);
  setText("status-copy", situation.copy);
  setIcon("status-icon", situation.iconName);
  byId("field-status").classList.toggle("danger", situation.style === "danger");
  byId("field-status").classList.toggle("night", situation.style === "night");
  byId("hit-flash").classList.toggle("active", state.hitUntil - state.elapsed > 1.55);
  const nearby = shelter || onTower || car.driving || boat.aboard || state.fishing ? null : nearestPoint();
  byId("interact").hidden = !state.campRest && !nearby && !onTower && !car.driving && (!boat.aboard || Boolean(state.fishing));
  if (state.campRest) setText("interact-label", "Herää");
  else if (car.driving) setText("interact-label", nearGarage() ? "Pysäköi talliin" : "Nouse autosta");
  else if (boat.aboard) setText("interact-label", nearLanding() ? "Rantaudu" : "Kalasta veneestä");
  else if (onTower) setText("interact-label", "Laskeudu tornista");
  else if (nearby?.id === armyCabin.id && pack.keycard) setText("interact-label", "Avaa kulkukortilla");
  else if (nearby === forestHatch) setText("interact-label", state.tunnelOpen ? "Palaa bunkkeriin" : "Tutki metsäluukkua");
  else if (nearby) setText("interact-label", nearby === gate ? (state.gateOpen ? "Sulje portti" : "Avaa portti") : nearby.action);

  renderVehicleControls(car, boat);

  if (shelter) view.draw(camera, player, { shelterImage: shelter.image });
  else renderWorld(dark);
  drawWeather(weather, dark, state.elapsed, camera, onTower ? tower.base : player, Boolean(shelter));

  for (const [name, value] of Object.entries(meters)) {
    const level = Math.round(value);
    setText(name + "-value", level + "%");
    const bar = byId(name + "-bar");
    bar.style.setProperty("--level", level + "%");
    bar.parentElement.setAttribute("aria-valuenow", level);
  }
  renderInventory(pack);
  renderExpeditionStock();
  renderMystery();
  const tasks = [state.foundShelter, pack.torch, state.survived];
  const firstOpen = tasks.indexOf(false);
  ["shelter", "torch", "dawn"].forEach((task, index) => {
    const element = byId("task-" + task);
    element.classList.toggle("done", tasks[index]);
    element.classList.toggle("current", index === firstOpen);
  });
}

function renderInventory(pack) {
  const slots = { torch: "Taskulamppu", berries: "Marjat", water: "Vesi", bandage: "Side", mushrooms: "Ruokasienet", fish: "Kala", wood: "Puu", stone: "Kivi", wool: "Villa" };
  for (const [item, name] of Object.entries(slots)) {
    const slot = byId("slot-" + item);
    const showCount = pack[item] || item === "wood" || item === "stone" || item === "wool";
    const count = item === "torch" ? (pack.torch ? Math.ceil(pack.battery) + "%" : "") : (showCount ? String(pack[item]) : "");
    setText(item + "-count", count);
    slot.classList.toggle("unavailable", !pack[item]);
    const description = item === "torch" ? (pack.torch ? "akku " + count : "ei vielä löydetty") : pack[item] + " kpl";
    slot.setAttribute("aria-label", name + ", " + description);
  }
  byId("slot-torch").classList.toggle("lit", pack.light);
  byId("slot-torch").setAttribute("aria-pressed", String(pack.light));
  const axeButton = byId("slot-axe");
  axeButton.classList.toggle("unavailable", !pack.axe);
  axeButton.setAttribute("aria-label", pack.axe ? "Kirves, käytä" : "Kirves, ei vielä löydetty");
  const flameButton = byId("slot-flame");
  flameButton.classList.toggle("unavailable", state.flamePlaced || (!pack.flame && !pack.wood));
  flameButton.classList.toggle("lit", pack.flameOn);
  flameButton.setAttribute("aria-pressed", String(pack.flameOn));
  flameButton.setAttribute("aria-label", state.flamePlaced ? "Soihtu maassa" : "Soihtu");
  byId("place-flame").hidden = !pack.flame && !state.flamePlaced;
  setText("place-flame-label", state.flamePlaced ? "Poimi soihtu" : "Aseta soihtu");
  const fireButton = byId("build-fire");
  setText("fire-recipe", campfireWoodCost() + " puuta ja 1 kivi");
  fireButton.classList.toggle("unavailable", !hasFireMaterials(pack) && !state.campfire);
  fireButton.classList.toggle("lit", Boolean(state.campfire));
}

const dialogs = {
  help: { title: "Pelin ohjeet", copy: "Selviä aamunkoittoon. Etsi metsämökistä taskulamppu ja poikkea muihin rakennuksiin hakemaan tarvikkeita tai lepäämään. Täytä juomapullo lammella.", iconName: "help", main: "Takaisin peliin" },
  pause: { title: "Peli tauolla", copy: "Peliaika jatkuu, kun palaat metsään.", iconName: "pause", main: "Jatka peliä" },
  won: { title: "Selvisit yöstä!", copy: "Aurinko nousee Korpimetsään. Voit jatkaa selviytymistä ja tutkia metsää päivänvalossa.", iconName: "sun", main: "Jatka metsässä" },
  lost: { title: "Matkasi päättyi", copy: "Voimat loppuivat Korpimetsässä. Voit yrittää selviytyä uudelleen.", iconName: "moon", main: "Yritä uudelleen" },
};

function showDialog(mode) {
  if (dialog.open) return;
  const info = dialogs[mode];
  dialogMode = mode;
  keys.clear();
  driveTouches.clear();
  setText("dialog-title", info.title);
  setText("dialog-copy", info.copy);
  setText("dialog-main", info.main);
  setIcon("dialog-icon", info.iconName);
  byId("help-detail").hidden = mode !== "help";
  byId("dialog-restart").hidden = mode === "lost" || mode === "help";
  byId("dialog-close").hidden = mode === "lost";
  byId("dialog-main").value = mode === "lost" ? "restart" : "continue";
  dialog.showModal();
  byId("dialog-main").focus();
}

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "restart") reset();
  dialog.returnValue = "";
});
dialog.addEventListener("cancel", (event) => {
  if (dialogMode === "lost") event.preventDefault();
});

function playSound(frequency) {
  if (!soundOn || !audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .8, now + .15);
  gain.gain.setValueAtTime(.06, now);
  gain.gain.exponentialRampToValueAtTime(.001, now + .19);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + .20);
}

function toggleSound() {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext = new Audio();
    const sampleRate = audioContext.sampleRate;
    const noise = audioContext.createBuffer(1, sampleRate * 3, sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = audioContext.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 360;
    windGain = audioContext.createGain();
    windGain.gain.value = 0;
    source.connect(filter).connect(windGain).connect(audioContext.destination);
    source.start();
  }
  soundOn = !soundOn;
  audioContext.resume().catch(() => {});
  windGain.gain.setTargetAtTime(soundOn ? .075 : 0, audioContext.currentTime, .08);
  setIcon("sound-icon", soundOn ? "volume" : "muted");
  byId("sound").setAttribute("aria-pressed", String(soundOn));
  playSound(420);
}

function bindControls() {
  scene.addEventListener("click", (event) => {
    if (event.target.closest("button") || state.shelter || state.onTower || state.car.driving || state.tunnelTrip || dialog.open) return;
    const rect = world.getBoundingClientRect();
    const x = camera.x + (event.clientX - rect.left) / camera.scale;
    const y = camera.y + (event.clientY - rect.top) / camera.scale;
    if (state.boat.aboard) return rowTo({ x, y });
    const resource = points.find((point) => gatherables[point.kind] && available(point) && Math.hypot(x - point.x, y - point.y + 12) < 23);
    const woolSource = points.find((point) => point.kind === "sheep" && available(point) && Math.hypot(x - point.x, y - point.y + 21) < 31);
    const expeditionSite = expeditionSitesNear(x, y + 16, 39).find((point) =>
      available(point) && Math.hypot(x - point.x, y - point.y + 16) < 29);
    if (available(parkedCar) && distance({ x, y }, parkedCar) < 32) goToPoint(parkedCar);
    else if (distance({ x, y }, state.boat) < 33) goToPoint(boatLanding);
    else if (resource) goToPoint(resource);
    else if (woolSource) goToPoint(woolSource);
    else if (expeditionSite) goToPoint(expeditionSite);
    else if (traversable(x, y)) travel({ x, y });
    else if (insidePolygon(x, y, shore)) goToPoint(lake);
    else if (insidePolygon(x, y, gate.barrier)) goToPoint(gate);
    else {
      const building = points.find((point) => point.footprint && insidePolygon(x, y, point.footprint));
      if (building) goToPoint(building);
    }
  });
  byId("interact").addEventListener("click", interact);
  byId("search-shelter").addEventListener("click", searchShelter);
  byId("bunker-hatch").addEventListener("click", useBunkerHatch);
  byId("leave").addEventListener("click", leaveShelter);
  byId("rest").addEventListener("click", () => { if (state.shelter) toggleRest(); });
  byId("help").addEventListener("click", () => showDialog("help"));
  byId("open-map").addEventListener("click", openWorldMap);
  byId("clear-map-pin").addEventListener("click", () => setMapTarget(null));
  byId("map-direction").addEventListener("click", () => setMapTarget(null));
  mapStage.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    const rect = mapStage.getBoundingClientRect();
    setMapTarget({
      x: WORLD_LEFT + WIDTH * clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: WORLD_TOP + HEIGHT * clamp((event.clientY - rect.top) / rect.height, 0, 1),
    });
  });
  byId("pause").addEventListener("click", () => showDialog("pause"));
  byId("sound").addEventListener("click", toggleSound);
  byId("build-fire").addEventListener("click", buildCampfire);
  byId("place-flame").addEventListener("click", placeFlame);
  byId("open-crafting").addEventListener("click", () => openCrafting());
  for (const tab of document.querySelectorAll("[data-recipes]")) tab.addEventListener("click", () => openCrafting(tab.dataset.recipes));
  byId("trail-search").addEventListener("input", () => renderCrafting());
  byId("trail-ready").addEventListener("change", () => renderCrafting());
  byId("touch-run").addEventListener("click", () => {
    state.touchSprint = !state.touchSprint;
    byId("touch-run").setAttribute("aria-pressed", String(state.touchSprint));
  });
  for (const button of document.querySelectorAll("[data-drive]")) {
    button.addEventListener("pointerdown", (event) => {
      if ((!state.car.driving && !state.boat.aboard) || dialog.open || event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      driveTouches.set(event.pointerId, button.dataset.drive);
      button.setAttribute("aria-pressed", "true");
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      button.addEventListener(type, (event) => {
        driveTouches.delete(event.pointerId);
        button.setAttribute("aria-pressed", String(driveInput(button.dataset.drive) > 0));
      });
    }
  }

  const itemKeys = { KeyF: "torch", Digit1: "torch", Digit2: "berries", Digit3: "water", Digit4: "bandage", Digit5: "mushrooms", Digit6: "fish", Digit7: "axe", Digit8: "flame" };
  for (const item of new Set(Object.values(itemKeys))) byId("slot-" + item).addEventListener("click", () => useItem(item));

  window.addEventListener("keydown", (event) => {
    if (dialog.open || recordingDialog.open || state.tunnelTrip || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches?.("input, select, textarea")) return;
    if (event.code === "KeyJ" && !event.repeat) {
      if (expeditionDialog.open) expeditionDialog.close();
      else openExpedition();
      return;
    }
    if (expeditionDialog.open) return;
    if (event.code === "KeyB" && !event.repeat && !mapDialog.open) {
      if (craftingDialog.open) craftingDialog.close();
      else openCrafting();
      return;
    }
    if (craftingDialog.open) return;
    if (event.code === "KeyM" && !event.repeat) {
      if (mapDialog.open) mapDialog.close();
      else openWorldMap();
      return;
    }
    if (mapDialog.open) return;
    const brake = event.code === "Space" && state.car.driving;
    if (moves[event.code] || event.code.startsWith("Shift") || brake) {
      if (moves[event.code] || brake) event.preventDefault();
      keys.add(event.code);
    }
    if (event.repeat) return;
    if (event.code === "Escape") {
      event.preventDefault();
      showDialog("pause");
    }
    if (event.code === "KeyE") interact();
    if (event.code === "KeyC") buildCampfire();
    if (event.code === "KeyG") placeFlame();
    if (itemKeys[event.code]) useItem(itemKeys[event.code]);
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", () => {
    keys.clear();
    driveTouches.clear();
  });
}

async function startGame() {
  makeExpeditionWorld();
  view = await loadWorldView(byId("game-canvas"), [...shelters, garage].map(({ image }) => image));
  playerSprite = view.addSprite("hiker");
  animalSprites = animalTypes.map(({ id }) => ({
    sprite: view.addSprite(id), shornSprite: id === "sheep" ? view.addSprite("sheep-shorn") : null,
  }));
  campfireSprite = view.addSprite("campfire");
  gatePanelSprite = view.addSprite("gate-panel");
  henSprites = henPositions.map(() => view.addSprite("hen"));
  carSprite = view.addSprite("car");
  flameSprite = view.addSprite("hand-torch");
  boatSprite = view.addSprite("boat");
  createMarkers();
  forestHatch.openSprite = view.addSprite("hatch-open");
  createWorldMap();
  reset();
  new ResizeObserver(resizeView).observe(scene);
  bindControls();
  bindExpedition();
  bindCabinRecording();
  byId("open-map").disabled = false;
  byId("open-crafting").disabled = false;
  byId("open-expedition").disabled = false;
  loading.hidden = true;
  lastFrame = performance.now();
  requestAnimationFrame(frame);
}

let lastFrame;
function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  if (!dialog.open && !mapDialog.open && !craftingDialog.open && !recordingDialog.open && !expeditionDialog.open && !document.hidden) tick(dt);
  render();
  requestAnimationFrame(frame);
}
startGame().catch((error) => {
  loading.textContent = error.message || "Peli ei käynnistynyt. Lataa sivu uudelleen.";
  console.error(error);
});
