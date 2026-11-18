"use strict";

const expeditionIngredients = {
  herbs: { label: "Yrtit", amount: "yrttejä" },
  nuts: { label: "Pähkinät", amount: "pähkinöitä" },
  sap: { label: "Mahla", amount: "mahlaa" },
  honey: { label: "Hunaja", amount: "hunajaa" },
};

const siteTypes = [
  { label: "Yrttimätäs", asset: "trail-herbs", icon: "leaf", loot: { herbs: 3 }, renew: 420 },
  { label: "Pähkinälehto", asset: "trail-nuts", icon: "leaf", loot: { nuts: 3 }, renew: 540 },
  { label: "Mahlakeräin", asset: "trail-sap", icon: "drop", loot: { sap: 3 }, renew: 360 },
  { label: "Hunajakätkö", asset: "trail-honey", icon: "pack", loot: { honey: 3 } },
  { label: "Mustikkamätäs", asset: "berries", icon: "berries", loot: { berries: 3 }, renew: 480 },
  { label: "Sienikehä", asset: "mushrooms", icon: "mushrooms", loot: { mushrooms: 3 }, renew: 480 },
  { label: "Halkopino", asset: "wood", icon: "wood", loot: { wood: 3 } },
  { label: "Kiviesiintymä", asset: "stone", icon: "stone", loot: { stone: 3 } },
  { label: "Retkikätkö", asset: "trail-cache", icon: "pack", action: "Avaa retkikätkö", supplies: true },
  { label: "Ensiapukätkö", asset: "craft-aid", icon: "bandage", action: "Avaa ensiapukätkö", loot: { bandage: 2 } },
  { label: "Lähde", asset: "trail-spring", icon: "drop", action: "Täytä juomapullo", effect: "spring", description: "Lähteellä voi täyttää juomapullon aina uudelleen." },
  { label: "Eräkatos", asset: "craft-lean-to", icon: "house", action: "Lepää eräkatoksessa", effect: "shelter", description: "Levätessä olet suojassa eläimiltä.", solid: true },
  { label: "Lepokivi", asset: "trail-seat", icon: "bed", action: "Istu lepokivelle", effect: "rest", description: "Palauttaa jaksamista kerran pelitunnissa." },
  { label: "Reittiviitta", asset: "craft-sign", icon: "map", action: "Merkitse reittiviitta", effect: "sign", description: "Voit merkitä viitan kartalle ja palata sen luo." },
  { label: "Eläinten jälkiä", asset: "trail-tracks", icon: "pin", action: "Tutki jälkiä", effect: "tracks" },
  { label: "Kenttämuistio", asset: "trail-journal", icon: "journal", action: "Lue kenttämuistio", effect: "log" },
];

const supplyTypes = [
  { wood: 2, stone: 1, water: 1 },
  { berries: 2, honey: 1, water: 1 },
  { fish: 1, nuts: 2, bandage: 1 },
  { wood: 2, wool: 1, herbs: 1 },
  { sap: 2, nuts: 1, berries: 1 },
];

const fieldNotes = [
  "Reittiviitoista on apua, kun iltasumu peittää harjanteet.",
  "Kuulin pöllön hämärässä. Päivänvalossa siitä ei näkynyt jälkeäkään.",
  "Vanhan polun varressa on lähde. Täytin pullon ennen lähtöä.",
  "Sateen jälkeen ylimmät kivet jäävät kuiviksi. Siellä on hyvä levähtää.",
  "Jätin eräkatoksen vapaaksi seuraavalle kulkijalle.",
  "Mahlakeräin täyttyy uudelleen. Etsin sillä välin syötävää polun toiselta puolelta.",
];

const expeditionSpecies = [
  { id: "squirrel", name: "Orava", trace: "oravan", roam: 64, speed: 138, detection: 85, skittish: true },
  { id: "badger", name: "Mäyrä", trace: "mäyrän", roam: 106, speed: 76, detection: 57, skittish: true, evening: true },
  { id: "capercaillie", name: "Metso", trace: "metson", roam: 110, speed: 153, detection: 94, skittish: true },
  { id: "owl", name: "Pöllö", trace: "pöllön", roam: 69, speed: 115, detection: 65, skittish: true, evening: true },
  { id: "hedgehog", name: "Siili", trace: "siilin", roam: 47, speed: 58, detection: 0, evening: true },
  { id: "raccoon-dog", name: "Supikoira", trace: "supikoiran", roam: 134, speed: 104, detection: 70, skittish: true },
];

const trailFlavors = [
  ["mustikka", "Mustikka", { berries: 1 }, { hunger: 9, thirst: 8 }],
  ["mahla", "Mahla", { sap: 1 }, { thirst: 19, energy: 8 }],
  ["hunaja", "Hunaja", { honey: 1 }, { hunger: 7, energy: 18 }],
  ["pahkina", "Pähkinä", { nuts: 1 }, { hunger: 16, energy: 13 }],
  ["yrtti", "Yrtti", { herbs: 1 }, { thirst: 8, energy: 10 }],
  ["sieni", "Sieni", { mushrooms: 1 }, { hunger: 18, energy: 5 }],
  ["kala", "Kala", { fish: 1 }, { hunger: 25, energy: 6 }],
  ["marjapahkina", "Marjapähkinä", { berries: 1, nuts: 1 }, { hunger: 24, thirst: 3, energy: 12 }],
  ["yrttisieni", "Yrttisieni", { herbs: 1, mushrooms: 1 }, { hunger: 21, thirst: 10, energy: 9 }],
  ["hunajamahl", "Hunajamahla", { honey: 1, sap: 1 }, { hunger: 4, thirst: 18, energy: 21 }],
];

const trailMethods = [
  ["eväs", { hunger: 10, energy: 2 }],
  ["nyytti", { hunger: 19, energy: 9 }, { herbs: 1 }, "oven"],
  ["liemi", { hunger: 5, thirst: 24 }, { water: 1 }, "oven"],
  ["pata", { hunger: 25, thirst: 16, energy: 7 }, { water: 1, wood: 1 }, "oven"],
  ["tahna", { hunger: 15, energy: 11 }, { nuts: 1 }],
  ["kuivaseos", { hunger: 21, energy: 16 }, { nuts: 1 }, "dry-rack"],
  ["juoma", { thirst: 29, energy: 5 }, { water: 1 }],
  ["hauduke", { thirst: 39, energy: 8 }, { water: 1, herbs: 1 }, "oven"],
  ["pannupala", { hunger: 29, energy: 12 }, { wood: 1 }, "oven"],
  ["retkiannos", { hunger: 42, thirst: 14, energy: 16 }, { nuts: 1, water: 1 }, "oven"],
];

const expeditionRecipes = trailFlavors.flatMap(([id, name, cost, restore]) =>
  trailMethods.map(([method, addedRestore, extraCost, station], index) => {
    const ingredients = { ...cost };
    const effects = { ...restore };
    for (const [item, quantity] of Object.entries(extraCost ?? {})) ingredients[item] = (ingredients[item] ?? 0) + quantity;
    for (const [meter, quantity] of Object.entries(addedRestore)) effects[meter] = (effects[meter] ?? 0) + quantity;
    return { id: "trail-" + id + "-" + index, name: name + method, cost: ingredients, restore: effects, station, group: "food", expedition: true };
  })
);

const SITES_PER_REGION = siteTypes.length * 3;
const ANIMALS_PER_REGION = expeditionSpecies.length * 2;
const EXPEDITION_CELL = 400;
const expeditionSites = [];
const expeditionAnimals = [];
const expeditionCells = new Map();
const expeditionSolids = new Map();
const activeExpeditionSites = new Set();
const emptySites = [];
const expeditionDialog = document.getElementById("expedition-dialog");

function expeditionJournal() {
  return { sites: new Set(), wildlife: new Set(), recipes: new Set(), ready: new Map() };
}

function expeditionRandom(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

function expeditionCellKey(x, y) {
  return x + "," + y;
}

function addToExpeditionCell(index, key, value) {
  if (!index.has(key)) index.set(key, []);
  index.get(key).push(value);
}

function expeditionSitesIn(left, top, right, bottom) {
  const result = [];
  for (let row = Math.floor(top / EXPEDITION_CELL); row <= Math.floor(bottom / EXPEDITION_CELL); row++) {
    for (let column = Math.floor(left / EXPEDITION_CELL); column <= Math.floor(right / EXPEDITION_CELL); column++) {
      const sites = expeditionCells.get(expeditionCellKey(column, row)) ?? emptySites;
      for (const site of sites) {
        if (site.x >= left && site.x <= right && site.y >= top && site.y <= bottom) result.push(site);
      }
    }
  }
  return result;
}

function expeditionSitesNear(x, y, radius) {
  return expeditionSitesIn(x - radius, y - radius, x + radius, y + radius);
}

function expeditionBlocks(x, y) {
  if (expeditionSolids.size === 0) return false;
  const solids = expeditionSolids.get(expeditionCellKey(Math.floor(x / EXPEDITION_CELL), Math.floor(y / EXPEDITION_CELL)));
  return solids?.some(({ left, right, top, bottom }) => x > left && x < right && y > top && y < bottom) ?? false;
}

function indexExpeditionSite(site) {
  expeditionSites.push(site);
  addToExpeditionCell(expeditionCells, expeditionCellKey(Math.floor(site.x / EXPEDITION_CELL), Math.floor(site.y / EXPEDITION_CELL)), site);
  if (!site.solid) return;
  const boundary = { left: site.x - 39, right: site.x + 39, top: site.y - 47, bottom: site.y - 14 };
  for (let y = Math.floor(boundary.top / EXPEDITION_CELL); y <= Math.floor(boundary.bottom / EXPEDITION_CELL); y++) {
    for (let x = Math.floor(boundary.left / EXPEDITION_CELL); x <= Math.floor(boundary.right / EXPEDITION_CELL); x++) {
      addToExpeditionCell(expeditionSolids, expeditionCellKey(x, y), boundary);
    }
  }
}

function makeExpeditionWorld() {
  const existing = points.filter((point) => point.kind !== "sheep" && Number.isFinite(point.x) && Number.isFinite(point.y));
  const columns = WIDTH / REGION_WIDTH;
  for (let regionIndex = 0; regionIndex < backcountry.length; regionIndex++) {
    const originX = WORLD_LEFT + regionIndex % columns * REGION_WIDTH;
    const originY = WORLD_TOP + Math.floor(regionIndex / columns) * REGION_HEIGHT;
    const roll = expeditionRandom(19169 + regionIndex * 13631);
    const inside = (x, y) => x > originX + 40 && y > originY + 40
      && x < originX + REGION_WIDTH - 40 && y < originY + REGION_HEIGHT - 40;
    const validSite = (x, y, solid) => {
      if (!inside(x, y) || !traversable(x, y, true) || !traversable(x, y + 32, true)) return false;
      if (!traversable(x + 22, y, true) || !traversable(x - 22, y, true)) return false;
      if (solid && x >= CORE.x && x <= CORE.x + CORE.width && y >= CORE.y && y <= CORE.y + CORE.height) return false;
      if (solid && ![-39, 0, 39].every((offset) => traversable(x + offset, y - 45, true))) return false;
      if (existing.some((point) => Math.abs(point.x - x) < 76 && Math.abs(point.y - y) < 74)) return false;
      return expeditionSitesNear(x, y, 118).length === 0;
    };
    for (let slot = 0; slot < SITES_PER_REGION; slot++) {
      const variant = Math.floor(slot / siteTypes.length);
      const type = siteTypes[(slot * 5 + (regionIndex === 7 ? 0 : regionIndex)) % siteTypes.length];
      const cellWidth = REGION_WIDTH / 8;
      const cellHeight = REGION_HEIGHT / 6;
      let position;
      for (let attempt = 0; attempt < 310 && !position; attempt++) {
        const scatter = attempt >= 30;
        const early = regionIndex === 7 && slot === 0 && attempt === 0;
        const x = early ? 521 : Math.round(originX + (scatter ? roll() * REGION_WIDTH : (slot % 8 + .14 + roll() * .72) * cellWidth));
        const y = early ? 405 : Math.round(originY + (scatter ? roll() * REGION_HEIGHT : (Math.floor(slot / 8) + .14 + roll() * .72) * cellHeight));
        if (validSite(x, y, type.solid)) position = { x, y };
      }
      if (!position) throw new Error("Löytöpaikkaa ei voitu sijoittaa alueelle " + backcountry[regionIndex].name);
      const { x, y } = position;
      const loot = type.supplies ? supplyTypes[(slot + regionIndex + variant * 2) % supplyTypes.length] : type.loot;
      indexExpeditionSite({
        ...type, loot, x, y, labelY: y + 14, regionIndex, kind: "expedition", local: true,
        id: "expedition-site-" + regionIndex + "-" + slot,
        action: type.action ?? "Kerää " + Object.keys(loot).map((item) => ingredientNames[item]).join(" ja "),
        base: { x, y: y - (type.solid ? 15 : 3) },
        species: expeditionSpecies[(regionIndex + slot + variant) % expeditionSpecies.length],
        note: fieldNotes[(regionIndex * 2 + slot + variant) % fieldNotes.length],
      });
    }
    for (let index = 0; index < ANIMALS_PER_REGION; index++) {
      let position;
      for (let attempt = 0; attempt < 160 && !position; attempt++) {
        const first = regionIndex === 7 && index === 0 && attempt === 0;
        const x = first ? 610 : Math.round(originX + 140 + roll() * (REGION_WIDTH - 280));
        const y = first ? 472 : Math.round(originY + 140 + roll() * (REGION_HEIGHT - 280));
        if (!traversable(x, y, true) || expeditionAnimals.some((animal) => Math.abs(animal.x - x) < 230 && Math.abs(animal.y - y) < 190)) continue;
        position = { x, y };
      }
      if (!position) throw new Error("Eläintä ei voitu sijoittaa alueelle " + backcountry[regionIndex].name);
      const species = expeditionSpecies[index % expeditionSpecies.length];
      expeditionAnimals.push({
        ...species, ...position, damage: 0, regionIndex,
        observationId: "expedition-animal-" + regionIndex + "-" + index,
      });
    }
  }
  animalTypes.push(...expeditionAnimals);
}

function expeditionPointsOnScreen() {
  const pad = 155;
  const nearby = expeditionSitesIn(camera.x - pad, camera.y - pad, camera.x + camera.width + pad, camera.y + camera.height + pad);
  const visible = new Set(nearby);
  for (const site of activeExpeditionSites) {
    if (visible.has(site)) continue;
    site.button.remove();
    view.removeSprite(site.sprite);
    delete site.button;
    delete site.sprite;
    activeExpeditionSites.delete(site);
  }
  for (const site of nearby) {
    if (activeExpeditionSites.has(site)) continue;
    registerMarker(site);
    activeExpeditionSites.add(site);
  }
  return nearby;
}

function expeditionSiteAvailable(site) {
  return !site.loot || Boolean(site.renew) || !state.expedition.sites.has(site.id);
}

function expeditionSiteDescription(site) {
  if (site.effect === "tracks") {
    const timing = site.species.evening ? "Eläin liikkuu hämärässä ja yöllä." : "Lähesty rauhallisesti ja tarkkaile metsän reunaa.";
    return "Maastossa näkyy " + site.species.trace + " jälkiä. " + timing;
  }
  if (site.effect === "log") return site.note;
  if (site.description) return site.description;
  return "Löytöpaikan antimet ovat " + formatIngredients(site.loot) + "."
    + (site.renew ? " Paikka täydentyy " + site.renew / 60 + " pelitunnissa." : "");
}

function useExpeditionSite(site) {
  const journal = state.expedition;
  journal.sites.add(site.id);
  if (site.loot) {
    const remaining = (journal.ready.get(site.id) ?? 0) - state.minutes;
    if (remaining > 0) return notice("Antimet kasvavat takaisin", "Paikka täydentyy " + Math.ceil(remaining / 60) + " pelitunnissa.", site.icon);
    for (const [item, quantity] of Object.entries(site.loot)) state.pack[item] += quantity;
    if (site.renew) journal.ready.set(site.id, state.minutes + site.renew);
    notice("Keräsit tarvikkeita", formatIngredients(site.loot), site.icon);
    playSound(540);
    return;
  }
  switch (site.effect) {
    case "spring":
      refillWater();
      break;
    case "shelter":
      toggleRest(site);
      break;
    case "rest":
      if ((journal.ready.get(site.id) ?? 0) > state.minutes) {
        notice("Lepokivi käytetty", "Voit levätä sillä uudelleen tunnin päästä viime levosta.", site.icon);
      } else {
        state.meters.energy = Math.min(100, state.meters.energy + 30);
        journal.ready.set(site.id, state.minutes + 60);
        notice("Lepohetki", "Jaksamisesi palautui.", site.icon);
      }
      break;
    case "sign":
      setMapTarget(site);
      notice("Reittiviitta merkitty", "Voit palata viitalle kartan nuolen avulla.", site.icon);
      break;
    default:
      notice(site.label, expeditionSiteDescription(site), site.icon);
  }
}

function expeditionAnimalAwake(animal) {
  if (!animal.evening) return true;
  const time = hour();
  return time >= 19 || time < 7;
}

function observeExpeditionAnimal(animal, gap, exposed) {
  if (!exposed || gap > 122 || state.expedition.wildlife.has(animal.observationId) || !clearPath(state.player, animal)) return;
  state.expedition.wildlife.add(animal.observationId);
  if (!state.message || state.message.until <= state.elapsed) notice("Eläinhavainto", animal.name + " kirjattiin löytöpäiväkirjaan.", "journal");
}

function renderExpeditionStock() {
  for (const [item, material] of Object.entries(expeditionIngredients)) {
    const count = state.pack[item];
    const label = byId("trail-count-" + item);
    label.hidden = !count;
    if (count && label.textContent !== material.label + " " + count) label.textContent = material.label + " " + count;
  }
  byId("expedition-stock").hidden = !Object.keys(expeditionIngredients).some((item) => state.pack[item]);
}

function bindExpedition() {
  const regionSelect = byId("expedition-region");
  for (const [index, region] of backcountry.entries()) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = region.name;
    regionSelect.append(option);
  }
  regionSelect.addEventListener("change", renderExpeditionJournal);
  byId("open-expedition").addEventListener("click", openExpedition);
}

function openExpedition() {
  if (expeditionDialog.open || dialog.open || mapDialog.open || craftingDialog.open || recordingDialog.open || state.tunnelTrip) return;
  keys.clear();
  driveTouches.clear();
  byId("expedition-region").value = String(backcountry.indexOf(backcountryRegion(state.player.x, state.player.y)));
  renderExpeditionJournal();
  expeditionDialog.showModal();
}

function renderExpeditionJournal() {
  const log = state.expedition;
  const regionIndex = Number(byId("expedition-region").value);
  const sites = expeditionSites.filter((point) => point.regionIndex === regionIndex && log.sites.has(point.id));
  const observed = expeditionAnimals.filter((animal) => animal.regionIndex === regionIndex && log.wildlife.has(animal.observationId));
  setText("expedition-sites-count", log.sites.size + " / " + expeditionSites.length);
  setText("expedition-wildlife-count", log.wildlife.size + " / " + expeditionAnimals.length);
  setText("expedition-recipes-count", log.recipes.size + " / " + expeditionRecipes.length);
  setText("expedition-local", sites.length + " / " + SITES_PER_REGION + " löytöpaikkaa · " + observed.length + " / " + ANIMALS_PER_REGION + " eläinhavaintoa");

  const sightings = new Map();
  for (const animal of observed) sightings.set(animal.name, (sightings.get(animal.name) ?? 0) + 1);
  setText("expedition-sightings", [...sightings].map(([name, count]) => name + " × " + count).join(" · "));
  const findings = byId("expedition-findings");
  findings.replaceChildren();
  if (!sites.length) {
    const empty = document.createElement("p");
    empty.textContent = "Löydöt ilmestyvät tänne, kun käytät maastossa näkyviä kohteita. Eläinhavainto kirjautuu, kun pääset eläimen lähelle.";
    findings.append(empty);
    return;
  }
  for (const site of sites) {
    const row = document.createElement("article");
    row.className = "expedition-entry";
    const details = document.createElement("div");
    const label = document.createElement("h3");
    const copy = document.createElement("p");
    label.textContent = site.label;
    copy.textContent = expeditionSiteDescription(site);
    details.append(label, copy);
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "game-button";
    marker.textContent = "Merkitse";
    marker.setAttribute("aria-label", "Merkitse kohteeksi " + site.label);
    marker.addEventListener("click", () => {
      setMapTarget(site);
      expeditionDialog.close();
      openWorldMap();
    });
    row.append(details, marker);
    findings.append(row);
  }
}
