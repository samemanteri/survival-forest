"use strict";

const CORE = { x: -1120, y: 0, width: 4220, height: 1340 };
const CORE_BLEND = 92;
const CORE_TERRAIN = [
  { id: "center", file: "forest-expanded.webp", x: 0, width: 2000 },
  { id: "west", file: "forest-west.webp", x: CORE.x, width: 1240, overlap: 120, fadeRight: true },
  { id: "east", file: "forest-east.webp", x: 1850, width: 1250, overlap: 150, fadeRight: false },
];
const TILE_WIDTH = 1440;
const TILE_HEIGHT = 1000;
const TILE_BLEND = 180;
const REGION_WIDTH = TILE_WIDTH * 2;
const REGION_HEIGHT = TILE_HEIGHT * 3;
const WORLD_LEFT = -5440;
const WORLD_TOP = -3000;
const WORLD_RIGHT = WORLD_LEFT + REGION_WIDTH * 5;
const WORLD_BOTTOM = WORLD_TOP + REGION_HEIGHT * 3;
const WIDTH = WORLD_RIGHT - WORLD_LEFT;
const HEIGHT = WORLD_BOTTOM - WORLD_TOP;

const terrainBiomes = {
  spruce: { label: "Taiga", file: "expanse-spruce.webp", secondary: "birch" },
  birch: { label: "Metsä", file: "expanse-birch.webp", secondary: "spruce" },
  ridge: { label: "Metsä", file: "expanse-ridge.webp", secondary: "birch" },
  bog: { label: "Metsä", file: "expanse-bog.webp", secondary: "ridge" },
  snow: { label: "Lumialue", file: "expanse-snow.webp" },
  jungle: { label: "Viidakko", file: "expanse-jungle.webp" },
  savanna: { label: "Savanni", file: "expanse-savanna.webp", thirst: 1.25 },
  desert: { label: "Aavikko", file: "expanse-desert.webp", thirst: 1.65 },
};

const backcountry = [
  { name: "Hallanharju", biome: "snow", hut: [-4140, -1720], label: "Hallanharjun tupa" },
  { name: "Kuurakuusikko", biome: "spruce", hut: [-1380, -1410], label: "Kuurakuusikon kämppä" },
  { name: "Pohjoiskangas", biome: "birch", hut: [1660, -1490], label: "Pohjoiskankaan tupa" },
  { name: "Katajaharju", biome: "ridge", hut: [4510, -1630], label: "Katajaharjun maja" },
  { name: "Hillasuo", biome: "bog", hut: [7310, -1360], label: "Hillamaja" },
  { name: "Länsilehto", biome: "birch", hut: [-4040, 1240], label: "Länsilehdon kämppä" },
  { name: "Järvikangas", biome: "spruce", hut: [-1530, 1520], label: "Järvikankaan tupa" },
  { name: "Metsäniitty", biome: "ridge", hut: [1670, 2210], label: "Niittymaja" },
  { name: "Idän korpi", biome: "spruce", hut: [4630, 1260], label: "Korven kämppä" },
  { name: "Tuuliharju", biome: "savanna", hut: [7420, 1510], label: "Tuuliharjun tupa" },
  { name: "Saniaislaakso", biome: "jungle", hut: [-4010, 4610], label: "Saniaismaja" },
  { name: "Ruskarinne", biome: "birch", hut: [-1130, 4320], label: "Ruskarinteen tupa" },
  { name: "Kanervakangas", biome: "ridge", hut: [1740, 4580], label: "Kanervakämppä" },
  { name: "Kulta-aro", biome: "savanna", hut: [4540, 4370], label: "Kulta-aron tupa" },
  { name: "Hiekkaselkä", biome: "desert", hut: [7330, 4550], label: "Hiekkaselän maja" },
];

function insideCore(x, y) {
  return x >= CORE.x && x < CORE.x + CORE.width && y >= CORE.y && y < CORE.y + CORE.height;
}

function backcountryRegion(x, y) {
  const column = Math.max(0, Math.min(4, Math.floor((x - WORLD_LEFT) / REGION_WIDTH)));
  const row = Math.max(0, Math.min(2, Math.floor((y - WORLD_TOP) / REGION_HEIGHT)));
  return backcountry[row * 5 + column];
}

function biomeAt(x, y) {
  return insideCore(x, y) ? "birch" : backcountryRegion(x, y).biome;
}

function terrainVariation(column, row) {
  return ((Math.imul(column + 37, 73856093) ^ Math.imul(row + 61, 19349663)) >>> 0) % 997;
}

function outlyingTile(column, row) {
  const x = WORLD_LEFT + column * TILE_WIDTH;
  const y = WORLD_TOP + row * TILE_HEIGHT;
  const { biome } = backcountryRegion(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
  const variation = terrainVariation(column, row);
  const secondary = terrainBiomes[biome].secondary;
  return { x, y, biome: variation % 5 === 0 && secondary ? secondary : biome, variant: (column + row + 2 * variation) % 4 };
}

function terrainCrop(variant) {
  return {
    size: .87,
    left: .13 * (variant < 2 ? .1 : .9),
    top: .13 * (variant % 2 ? .9 : .1),
    flip: variant % 2 !== 0,
  };
}
