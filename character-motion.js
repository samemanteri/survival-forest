"use strict";

// Both atlases use the same cell and ground line. Animal rows follow the artwork in animal-gaits.webp.
const gaitCell = { width: 152, height: 128, figureHeight: 96, footY: 110, steps: 12 };
const animalRows = [
  "wolf", "bear", "moose", "sheep", "sheep-shorn", "fox", "hare", "roe-deer",
  "hen", "squirrel", "badger", "capercaillie", "owl", "hedgehog", "raccoon-dog",
];
const strideLengths = {
  hiker: 68, wolf: 39, bear: 35, moose: 58, sheep: 28, fox: 26, hare: 29, "roe-deer": 46,
  hen: 11, squirrel: 22, badger: 19, capercaillie: 27, owl: 18, hedgehog: 12, "raccoon-dog": 24,
};

function gaitArtwork(asset) {
  if (asset === "hiker") return { file: "hiker-gaits.webp", row: 0 };
  const row = animalRows.indexOf(asset);
  return row < 0 ? null : { file: "animal-gaits.webp", row };
}

function createGait(asset, phase = 0) {
  const hiker = asset === "hiker";
  return { hiker, stride: strideLengths[asset], phase: phase % 1, speed: 0, vx: 0, vy: 0,
    facing: hiker ? 1 : -1, turn: hiker ? 1 : -1, directionRow: 2, running: false };
}

function advanceGait(gait, dx, dy, dt) {
  if (dt <= 0) return;
  const distance = Math.hypot(dx, dy);
  const speed = distance / dt;
  const blend = 1 - Math.exp(-dt * 18);
  gait.speed += (speed - gait.speed) * blend;
  gait.vx += (dx / dt - gait.vx) * blend;
  gait.vy += (dy / dt - gait.vy) * blend;
  if (distance > 0) {
    // Limit cadence at a gallop: faster animals cover more ground with each stride.
    const stride = Math.max(gait.stride * (gait.hiker && speed > 140 ? 1.22 : 1), speed / 3.5);
    gait.phase = (gait.phase + distance / stride) % 1;
    if (Math.abs(gait.vx) > Math.max(1, Math.abs(gait.vy) * .14)) gait.facing = Math.sign(gait.vx);
    if (gait.hiker) {
      const slope = Math.abs(gait.vy) / Math.max(1, Math.abs(gait.vx));
      if (slope < .38) gait.directionRow = 0;
      if (slope > .55) gait.directionRow = gait.vy > 0 ? 1 : 2;
      gait.running = gait.speed > (gait.running ? 132 : 145);
    }
  }
  gait.turn += (gait.facing - gait.turn) * blend;
}

function gaitPose(gait) {
  const idle = gait.speed < 2;
  return {
    frame: idle ? 0 : 1 + Math.floor(gait.phase * gaitCell.steps),
    rowOffset: gait.hiker ? gait.directionRow + (!idle && gait.running ? 3 : 0) : 0,
    facing: (gait.turn < 0 ? -1 : 1) * (gait.hiker ? 1 : -1),
    widthScale: .83 + .17 * Math.abs(gait.turn),
  };
}
