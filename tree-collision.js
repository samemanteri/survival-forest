"use strict";

// Each entry is the trunk base in the original painting (percentages),
// its ground radius and, for unusually tall trees, the crown height.
const treeFootprints = {
  center: [
    [2.8, 17.3, 25], [6.7, 16, 20], [12.6, 15.3, 15], [15.3, 15.8, 20], [18.4, 17.8, 24],
    [22.7, 17.2, 23], [25.1, 15.3, 20], [28.1, 11.5, 21], [42.7, 11.5, 16], [44, 13.7, 19],
    [49, 19.2, 20], [53.6, 13.6, 18], [55, 15.2, 17], [57.6, 23.3, 22], [62.7, 18.1, 24],
    [66.4, 14, 25], [70.4, 11.8, 21], [77.6, 10.8, 18], [82.3, 13.6, 21], [84.6, 15.6, 20],
    [87.4, 12.2, 20], [91, 17.6, 27], [96.7, 24, 19],
    [8.9, 24, 14], [34.5, 39.1, 23, 173], [43.9, 27.5, 17], [53.9, 35.4, 19], [57.7, 34.6, 18],
    [64.8, 45.4, 15], [66.3, 49.7, 21], [81.7, 46.1, 19], [86.8, 36.4, 25],
    [96.2, 46.3, 19], [99, 45.6, 16], [98.3, 60.8, 24], [87.1, 59.8, 16],
    [1.7, 49.7, 22], [4.4, 61.8, 22], [2.3, 68.5, 20], [23.9, 57, 17], [26, 50.9, 20],
    [37.8, 57.3, 20], [39.1, 61.5, 18], [51.1, 71.9, 19], [53.2, 75.4, 18], [64.3, 61.7, 18],
    [5.2, 92.5, 22], [12.1, 89.4, 21], [19, 84.8, 17], [31.4, 95.2, 26], [36.2, 99, 20],
    [40.1, 99.1, 18], [53, 87, 17], [54.9, 86.4, 17], [90.5, 95.6, 21], [94.8, 99, 24],
  ],
  west: [
    [4, 14.9, 18], [5.6, 11.5, 18], [10.1, 11.9, 17], [16.1, 8, 18], [28.3, 9.8, 20],
    [34, 11.3, 18], [35.6, 11.6, 17], [44.3, 9.6, 20], [47.4, 9.1, 17], [53, 12.9, 18],
    [63.2, 14.1, 20], [65.5, 11.8, 18], [72.8, 17.4, 20], [74.2, 15.8, 20],
    [78.5, 11.7, 17], [84.7, 14.2, 17], [89.8, 15.8, 19], [95.1, 17.8, 18],
    [3.8, 36.3, 22], [2.3, 47.7, 17], [6.3, 79.9, 20], [5.2, 96.1, 17],
    [12.3, 93.6, 22], [43.3, 98.2, 22], [60.9, 96.8, 20], [69.6, 87.2, 17],
    [76.8, 94.2, 23], [79.4, 89.1, 23], [94.1, 90.5, 19], [95.8, 90.9, 17],
    [96.7, 72.8, 23], [99.2, 67.2, 20],
  ],
  east: [
    [3.1, 13, 20], [7.1, 14.7, 21], [13.4, 17, 19], [18.4, 22.3, 16], [21.9, 21.1, 16], [23.9, 22.8, 17],
    [32.1, 12.9, 21], [36.1, 29.9, 27], [40.1, 9.8, 16], [41.5, 8.5, 17], [48.4, 12.5, 20],
    [51.6, 21.2, 22], [43.6, 32.8, 18], [47.7, 31.9, 18], [58.2, 21.5, 19], [61.4, 13.1, 18],
    [65, 9.8, 21], [73.9, 14.5, 17], [79, 12.8, 17], [82.6, 12.6, 17], [91.3, 18, 26], [97.8, 21.7, 20],
    [73.3, 38.1, 23], [78.4, 36.8, 23], [87.9, 41.4, 17], [89.6, 40.8, 17], [99, 69, 20],
    [69.4, 56.5, 25], [76.4, 60.4, 18], [58.5, 61.1, 16], [5.9, 36, 24], [1, 34.8, 20],
    [12.7, 44.6, 25], [20.5, 48.6, 18], [3, 64, 25], [10.6, 76.8, 22], [18.4, 69, 17], [22.8, 69.9, 19],
    [17, 89.4, 18], [19.3, 89.1, 18], [27.3, 86.5, 25], [10.4, 96.6, 24], [28.3, 97.1, 19],
    [55.9, 84.2, 17], [61.5, 98.6, 18], [63.7, 96.5, 18], [68.9, 93.4, 23],
    [79.2, 97.1, 18], [87.2, 87, 23], [93.6, 81.4, 17], [95.5, 82.6, 17],
  ],
  spruce: [
    [6.4, 6.2, 18], [7.7, 30.7, 24], [12.5, 27.8, 21], [18, 26, 22], [26.3, 15.3, 18],
    [31.1, 13.4, 25], [37.5, 9.9, 24], [45.4, 25, 24], [46.5, 35.8, 23], [53.1, 29.6, 27],
    [60, 34.3, 21], [65.5, 21.1, 23], [69.4, 16.5, 20], [78.6, 18.4, 20], [88.3, 26.9, 22],
    [96.8, 31.3, 26], [3.7, 48.3, 20], [7.1, 53.4, 20], [1.8, 68.6, 18], [4.8, 82, 19],
    [8.3, 78.9, 22], [14.7, 95.1, 22], [8, 97.1, 19], [23.6, 66.9, 18], [27.6, 61.1, 17],
    [31.3, 64.2, 23], [33.8, 85.7, 23], [37.1, 78.2, 26], [42.9, 88.2, 21], [48.4, 77.6, 20],
    [51.3, 91.3, 20], [60.6, 97, 23], [67.9, 47, 18], [72.4, 48.8, 25], [77.7, 52.9, 21],
    [83.1, 80.7, 23], [86.9, 88.2, 23], [94.4, 48.2, 18], [92.4, 85.7, 23], [94.7, 96.8, 23],
  ],
  birch: [
    [16, 14.3, 18], [31.8, 12.5, 16], [34.4, 12.5, 16], [36.4, 14.7, 16], [44.8, 19.9, 17],
    [47.1, 19.9, 18], [50.9, 18, 17], [55.9, 15.5, 20], [72.2, 22.3, 16], [74.6, 24, 18],
    [76.4, 23.4, 18], [79.1, 20.6, 15], [94.5, 24.6, 19], [96.6, 18.4, 17], [4, 31.6, 17],
    [13.7, 40.8, 17], [15, 40.1, 17], [25.3, 40.3, 20], [5.6, 45.9, 19], [57.8, 45, 16],
    [60.9, 47.5, 18], [62.7, 46.5, 17], [68.3, 42.1, 18], [69.4, 43.8, 17], [94.7, 48.5, 20],
    [96.8, 59.3, 17], [98, 61.6, 17], [7, 77.3, 16], [12.8, 74.4, 17], [14.2, 75.3, 17],
    [24.2, 73.5, 22], [32.6, 86.9, 17], [34, 86.4, 17], [38.5, 87.9, 16],
    [26.6, 98.8, 17], [28, 98.4, 17], [82.3, 69.2, 17], [84.7, 70.8, 17], [88.5, 74.4, 18],
    [90.8, 70.7, 17], [92.5, 82.9, 17], [94.1, 82, 17], [80.3, 95.7, 19],
  ],
  ridge: [
    [43, 20.5, 15], [44.4, 17.5, 20], [52.2, 17.5, 21], [57.5, 20.7, 21],
    [84.8, 20, 22], [96.9, 27.7, 18], [76.8, 44.7, 21], [82.1, 46.2, 23], [87.1, 45.9, 16],
    [5.1, 68.9, 23], [8, 67.4, 17], [11.9, 71.7, 20], [35.7, 63.7, 23], [43.9, 62.1, 18],
    [79.1, 84.3, 18], [85, 87.5, 22], [91.3, 81.4, 20], [96.5, 81.4, 23],
  ],
  bog: [
    [12.7, 34, 18], [17.2, 33.6, 23, 308], [28.4, 33.2, 18], [61.9, 13.4, 15], [86.6, 13.6, 16],
    [82.7, 39.7, 19, 183], [93, 42.1, 17], [4.4, 61.1, 16], [27.1, 60.2, 15], [81.3, 73.2, 23, 222],
  ],
  snow: [
    [6.7, 14.8, 14, 113], [50.6, 12.2, 13, 139], [73.9, 20.4, 17, 192], [87.8, 34.5, 12, 98],
    [92.7, 34.2, 13, 149], [31.3, 44.2, 15, 152], [11.6, 56.2, 12, 93], [78.3, 61.6, 10, 77],
    [86.8, 63.6, 16, 190], [25, 80.6, 16, 155], [93.6, 92.5, 12, 106],
  ],
  jungle: [
    [23.7, 24, 19, 300], [65.3, 32.2, 26, 345], [90.4, 43.4, 19, 330],
    [8.1, 65.2, 25, 430], [31.6, 87.2, 20, 300], [73.9, 91.6, 26, 450],
  ],
  savanna: [
    [27, 19.6, 22, 185], [86.7, 28.8, 23, 207], [20.4, 55, 24, 218], [81.3, 72.4, 24, 219],
  ],
};

const crownProportions = {
  center: [1.36, 6.3],
  west: [1.24, 5.4],
  east: [1.36, 6.2],
  spruce: [1.39, 6.1],
  birch: [1.61, 7.8],
  ridge: [1.27, 4.8],
  bog: [1.2, 4.1],
  snow: [1.65, 5.5],
  jungle: [3.1, 7.8],
  savanna: [3.8, 5.3],
};

function treeShape(x, y, radius, biome, height) {
  const [widthScale, heightScale] = crownProportions[biome];
  const crownHeight = height ?? radius * heightScale;
  return {
    x, y, radius,
    crown: { x, y: y - crownHeight * .51, rx: radius * widthScale, ry: crownHeight * .49 },
  };
}

function edgeOpacity(distance, fade) {
  return Math.max(0, Math.min(1, distance / fade));
}

function coreOpacity(x, y) {
  return edgeOpacity(Math.min(x - CORE.x, CORE.x + CORE.width - x), CORE_BLEND)
    * edgeOpacity(Math.min(y - CORE.y, CORE.y + CORE.height - y), CORE_BLEND);
}

function corePieceOpacity(piece, x) {
  const left = x - piece.x;
  const right = piece.width - left;
  if (left < 0 || right < 0) return 0;
  return piece.overlap ? edgeOpacity(piece.fadeRight ? right : left, piece.overlap) : 1;
}

function tileOpacity(tile, x, y) {
  const left = x - tile.x;
  const top = y - tile.y;
  if (left < 0 || left > tile.width || top < 0 || top > tile.height) return 0;
  return (tile.column ? edgeOpacity(left, TILE_BLEND) : 1) * (tile.row ? edgeOpacity(top, TILE_BLEND) : 1);
}

function placeTreeTrunks() {
  const trunks = [];
  const tiles = [];
  for (let row = 0; row < HEIGHT / TILE_HEIGHT; row++) {
    for (let column = 0; column < WIDTH / TILE_WIDTH; column++) {
      tiles.push({ ...outlyingTile(column, row), column, row, width: TILE_WIDTH + TILE_BLEND, height: TILE_HEIGHT + TILE_BLEND });
    }
  }

  // Choose the dominant painting where two textures overlap.
  for (const [index, tile] of tiles.entries()) {
    const { size, left, top, flip } = terrainCrop(tile.variant);
    const overlapping = tiles.slice(index + 1).filter((other) => other.x < tile.x + tile.width
      && other.x + other.width > tile.x && other.y < tile.y + tile.height);
    for (const [imageX, imageY, radius, height] of treeFootprints[tile.biome] ?? []) {
      const u = (imageX / 100 - left) / size;
      const v = (imageY / 100 - top) / size;
      const x = tile.x + (flip ? 1 - u : u) * tile.width;
      const y = tile.y + v * tile.height;
      if (tileOpacity(tile, x, y) < .5 || coreOpacity(x, y) >= .5) continue;
      if (overlapping.some((other) => tileOpacity(other, x, y) >= .5)) continue;
      if (x < WORLD_RIGHT && y < WORLD_BOTTOM) trunks.push(treeShape(x, y, radius, tile.biome, height));
    }
  }

  for (const [index, piece] of CORE_TERRAIN.entries()) {
    for (const [imageX, imageY, radius, height] of treeFootprints[piece.id]) {
      const x = piece.x + imageX / 100 * piece.width;
      const y = CORE.y + imageY / 100 * CORE.height;
      if (coreOpacity(x, y) * corePieceOpacity(piece, x) < .5) continue;
      if (CORE_TERRAIN.slice(index + 1).some((other) => corePieceOpacity(other, x) >= .5)) continue;
      trunks.push(treeShape(x, y, radius, piece.id, height));
    }
  }
  return trunks;
}

const TREE_CELL_SIZE = 128;
const treeTrunks = placeTreeTrunks();
const treeCells = new Map();

for (const shape of treeTrunks.flatMap(({ x, y, radius, crown }) => [{ x, y, rx: radius, ry: radius }, crown])) {
  const left = Math.floor((shape.x - shape.rx) / TREE_CELL_SIZE);
  const right = Math.floor((shape.x + shape.rx) / TREE_CELL_SIZE);
  const top = Math.floor((shape.y - shape.ry) / TREE_CELL_SIZE);
  const bottom = Math.floor((shape.y + shape.ry) / TREE_CELL_SIZE);
  for (let row = top; row <= bottom; row++) {
    for (let column = left; column <= right; column++) {
      const key = column + "," + row;
      if (!treeCells.has(key)) treeCells.set(key, []);
      treeCells.get(key).push(shape);
    }
  }
}

function hitsTree(x, y) {
  const cell = treeCells.get(Math.floor(x / TREE_CELL_SIZE) + "," + Math.floor(y / TREE_CELL_SIZE));
  return cell?.some(({ x: tx, y: ty, rx, ry }) => ((x - tx) / rx) ** 2 + ((y - ty) / ry) ** 2 < 1) ?? false;
}

function treeBlocksPath(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (!dx && !dy) return hitsTree(from.x, from.y);
  const left = Math.floor(Math.min(from.x, to.x) / TREE_CELL_SIZE);
  const right = Math.floor(Math.max(from.x, to.x) / TREE_CELL_SIZE);
  const top = Math.floor(Math.min(from.y, to.y) / TREE_CELL_SIZE);
  const bottom = Math.floor(Math.max(from.y, to.y) / TREE_CELL_SIZE);
  for (let row = top; row <= bottom; row++) {
    for (let column = left; column <= right; column++) {
      const cell = treeCells.get(column + "," + row);
      if (!cell) continue;
      for (const { x, y, rx, ry } of cell) {
        const px = (from.x - x) / rx;
        const py = (from.y - y) / ry;
        const vx = dx / rx;
        const vy = dy / ry;
        const t = Math.max(0, Math.min(1, -(px * vx + py * vy) / (vx ** 2 + vy ** 2)));
        if ((px + t * vx) ** 2 + (py + t * vy) ** 2 < 1) return true;
      }
    }
  }
  return false;
}
