"use strict";

// The four collections use different preparation methods. The last value in each
// material entry is its food bonus or, for cloth, the duration bonus in game minutes.
const fieldFamilies = {
  fruit: {
    asset: "field-fruit", icon: "berries", renew: 480, meter: "thirst",
    materials: [
      ["puolukka", "Puolukka", "puolukkaa", "Puolukka", "Metsä", 5],
      ["lakka", "Lakka", "lakkaa", "Lakka", "Lumialue", 6],
      ["karpalo", "Karpalo", "karpaloa", "Karpalo", "Taiga", 8],
      ["vadelma", "Vadelma", "vadelmaa", "Vadelma", "Metsä", 7],
      ["variksenmarja", "Variksenmarja", "variksenmarjaa", "Variksenmarja", "Lumialue", 4],
      ["mango", "Mango", "mangoa", "Mango", "Viidakko", 12],
      ["guava", "Guava", "guavaa", "Guava", "Viidakko", 10],
      ["taateli", "Taateli", "taatelia", "Taateli", "Aavikko", 3],
      ["viikuna", "Viikuna", "viikunaa", "Viikuna", "Savanni", 9],
      ["tamarindi", "Tamarindi", "tamarindia", "Tamarindi", "Savanni", 11],
    ],
    recipes: [
      ["sose", 1, {}, { hunger: 14 }], ["mehu", 1, { water: 1 }, { thirst: 29 }],
      ["hilloke", 2, { honey: 1 }, { hunger: 33 }, "oven"], ["rulla", 2, {}, { hunger: 27, energy: 9 }, "dry-rack"],
      ["kiisseli", 1, { sap: 1, water: 1 }, { thirst: 24, hunger: 21 }, "oven"],
      ["kompotti", 2, { water: 1 }, { hunger: 29, thirst: 16 }, "oven"],
      ["eväspala", 1, { nuts: 1 }, { hunger: 24, energy: 13 }], ["mehutiiviste", 3, {}, { thirst: 40 }, "oven"],
      ["kuivaviipaleet", 1, {}, { hunger: 17, energy: 7 }, "dry-rack"], ["jälkiruoka", 2, { honey: 1, nuts: 1 }, { hunger: 45, energy: 17 }],
    ],
  },
  grain: {
    asset: "field-grain", icon: "pack", renew: 600, meter: "hunger",
    materials: [
      ["kaura", "Kaura", "kauraa", "Kaura", "Metsä", 8], ["ohra", "Ohra", "ohraa", "Ohra", "Metsä", 9],
      ["ruis", "Ruis", "ruista", "Ruis", "Taiga", 12], ["tattari", "Tattari", "tattaria", "Tattari", "Taiga", 10],
      ["hirssi", "Hirssi", "hirssiä", "Hirssi", "Savanni", 6], ["durra", "Durra", "durraa", "Durra", "Savanni", 11],
      ["riisi", "Riisi", "riisiä", "Riisi", "Viidakko", 7], ["maissi", "Maissi", "maissia", "Maissi", "Savanni", 13],
      ["kvinoa", "Kvinoa", "kvinoaa", "Kvinoa", "Aavikko", 5], ["speltti", "Speltti", "spelttiä", "Speltti", "Lumialue", 14],
    ],
    recipes: [
      ["rouhe", 1, {}, { hunger: 12 }], ["mysli", 1, { nuts: 1 }, { hunger: 22, energy: 10 }],
      ["puuro", 1, { water: 1 }, { hunger: 32, thirst: 9 }, "oven"],
      ["rieska", 2, { water: 1 }, { hunger: 38 }, "oven"], ["keksi", 1, { honey: 1 }, { energy: 19, hunger: 13 }, "oven"],
      ["näkkileipä", 2, {}, { hunger: 29, energy: 7 }, "dry-rack"], ["velli", 1, { water: 2 }, { hunger: 20, thirst: 24 }, "oven"],
      ["patukka", 2, { honey: 1 }, { energy: 29, hunger: 18 }], ["pallero", 1, { berries: 1 }, { energy: 12, hunger: 19 }],
      ["pilahvi", 2, { water: 1, mushrooms: 1 }, { hunger: 49, energy: 12 }, "oven"],
    ],
  },
  herb: {
    asset: "field-herbs", icon: "leaf", renew: 360, meter: "energy",
    materials: [
      ["minttu", "Minttu", "minttua", "Minttu", "Metsä", 8], ["sitruunamelissa", "Sitruunamelissa", "sitruunamelissaa", "Sitruunamelissa", "Metsä", 6],
      ["tilli", "Tilli", "tilliä", "Tilli", "Taiga", 4], ["ruohosipuli", "Ruohosipuli", "ruohosipulia", "Ruohosipuli", "Taiga", 5],
      ["basilika", "Basilika", "basilikaa", "Basilika", "Viidakko", 7], ["inkivaari", "Inkivääri", "inkivääriä", "Inkivääri", "Viidakko", 12],
      ["sitruunaruoho", "Sitruunaruoho", "sitruunaruohoa", "Sitruunaruoho", "Viidakko", 10],
      ["timjami", "Timjami", "timjamia", "Timjami", "Savanni", 9], ["rosmariini", "Rosmariini", "rosmariinia", "Rosmariini", "Aavikko", 11],
      ["kumina", "Kumina", "kuminaa", "Kumina", "Lumialue", 3],
    ],
    recipes: [
      ["maustevesi", 1, { water: 1 }, { thirst: 27 }], ["dippi", 1, { nuts: 1 }, { hunger: 20, energy: 6 }],
      ["liemijauhe", 2, {}, { energy: 10, hunger: 7 }, "dry-rack"], ["maustepala", 1, { berries: 1 }, { energy: 13, hunger: 12 }],
      ["retkikeitto", 2, { mushrooms: 1, water: 1 }, { hunger: 31, thirst: 18 }, "oven"],
      ["hapanjuoma", 2, { sap: 1 }, { thirst: 31 }], ["pähkinätahna", 1, { nuts: 2 }, { hunger: 32 }],
      ["maustekala", 1, { fish: 1 }, { hunger: 44, energy: 7 }, "oven"],
      ["hunajasiirappi", 2, { honey: 1 }, { energy: 27 }, "oven"], ["eväsrouhe", 2, { nuts: 1 }, { hunger: 20, energy: 14 }, "dry-rack"],
    ],
  },
  cloth: {
    asset: "field-cloth", icon: "wool", renew: 1440,
    materials: [
      ["pellava", "Pellava", "pellavaa", "Pellava", "Metsä", 20], ["puuvilla", "Puuvilla", "puuvillaa", "Puuvilla", "Savanni", 10],
      ["sarkakangas", "Sarka", "sarkaa", "Sarka", "Taiga", 45], ["huopa", "Huopa", "huopaa", "Huopa", "Lumialue", 55],
      ["hamppu", "Hamppukangas", "hamppukangasta", "Hamppu", "Metsä", 30], ["juutti", "Juutti", "juuttia", "Juutti", "Viidakko", 15],
      ["silkki", "Silkki", "silkkiä", "Silkki", "Viidakko", 25], ["purjekangas", "Purjekangas", "purjekangasta", "Purjekangas", "Aavikko", 50],
      ["fleece", "Fleece", "fleeceä", "Fleece", "Lumialue", 35], ["flanelli", "Flanelli", "flanellia", "Flanelli", "Taiga", 40],
    ],
    // Each temporary item improves one existing survival mechanic.
    recipes: [
      ["säärystimet", 1, {}, "walkSpeed", 8, "Lisää kävelyvauhtia."],
      ["tukivyö", 1, { wool: 1 }, "sprintSaving", 1.5, "Vähentää juoksun rasitusta."],
      ["lamppuhihna", 2, { wood: 1 }, "torchRange", 60, "Pidentää taskulampun valokeilaa."],
      ["pullotasku", 2, { wood: 1 }, "capacity", 2, "Kaivolla täytettyyn pulloon mahtuu enemmän vettä."],
      ["nuotiokinnas", 2, { wool: 1 }, "fireTime", 12, "Uusi nuotio palaa pidempään."],
      ["askelsuojat", 2, {}, "stealth", 14, "Pedot havaitsevat sinut lähempää."],
      ["makuualusta", 3, { wool: 1 }, "restBonus", 2, "Lepo palauttaa jaksamista nopeammin."],
      ["pullokääre", 1, {}, "drinkBonus", 6, "Juominen palauttaa enemmän nesteytystä."],
      ["eväskääre", 1, { wood: 1 }, "mealEnergy", 5, "Valmistetut ruoat palauttavat lisää jaksamista."],
      ["sidepussi", 2, { bandage: 1 }, "bandageHealing", 7, "Siteet palauttavat enemmän terveyttä."],
    ],
  },
};

const fieldMaterials = [];
const fieldRecipes = [];
for (const [familyId, family] of Object.entries(fieldFamilies)) {
  for (const [id, name, amount, prefix, biome, bonus] of family.materials) {
    const material = { id, name, amount, biome, family, sites: [], recipes: [] };
    fieldMaterials.push(material);
    for (const [index, [suffix, quantity, extras, effect, stationOrStrength, text]] of family.recipes.entries()) {
      const hyphen = prefix.at(-1) === suffix[0] && "aeiouyäö".includes(suffix[0]) ? "-" : "";
      const recipe = { id: "field-" + id + "-" + index, name: prefix + hyphen + suffix, cost: { [id]: quantity, ...extras }, expedition: true };
      if (familyId === "cloth") {
        recipe.group = "gear";
        recipe.duration = 90 + bonus;
        recipe.buff = { stat: effect, strength: stationOrStrength };
        recipe.description = text + " Kesto " + recipe.duration + " peliminuuttia.";
      } else {
        recipe.group = "food";
        recipe.station = stationOrStrength;
        recipe.restore = { ...effect, [family.meter]: (effect[family.meter] ?? 0) + bonus };
      }
      material.recipes.push(recipe);
      fieldRecipes.push(recipe);
    }
  }
}

const fieldSpotNames = ["Ketunmutka", "Kuunkivi", "Kaksosharju", "Kaikupolku", "Tuulenportti", "Lintukallio", "Varjoporras", "Aamurinne", "Tähtilaakso", "Iltareuna"];

function placeFieldSites(existing) {
  const columns = WIDTH / REGION_WIDTH;
  for (const [index, material] of fieldMaterials.entries()) {
    const regions = backcountry.flatMap((region, i) => terrainBiomes[region.biome].label === material.biome ? [i] : []);
    const roll = expeditionRandom(753931 + index * 15671);
    for (const [slot, name] of fieldSpotNames.entries()) {
      const first = index === 0 && slot === 0;
      const regionIndex = first ? backcountry.indexOf(backcountryRegion(PLAYER_SPAWN.x, PLAYER_SPAWN.y)) : regions[(index + slot) % regions.length];
      const left = WORLD_LEFT + (regionIndex % columns) * REGION_WIDTH;
      const top = WORLD_TOP + Math.floor(regionIndex / columns) * REGION_HEIGHT;
      let location;
      for (let attempt = 0; attempt < 2000 && !location; attempt++) {
        const nearby = first && attempt < 600;
        const x = Math.round(nearby ? PLAYER_SPAWN.x + roll() * 160 - 80 : left + 90 + roll() * (REGION_WIDTH - 180));
        const y = Math.round(nearby ? PLAYER_SPAWN.y + roll() * 160 - 80 : top + 90 + roll() * (REGION_HEIGHT - 180));
        if (terrainBiomes[biomeAt(x, y)].label !== material.biome || !traversable(x, y, false)) continue;
        if (!traversable(x + 14, y, false) || !traversable(x - 14, y, false) || !traversable(x, y + 18, false)) continue;
        if (nearby && (distance(PLAYER_SPAWN, { x, y }) < 28 || !clearPath(PLAYER_SPAWN, { x, y }))) continue;
        if (existing.some(p => Math.abs(p.x - x) < 45 && Math.abs(p.y - y) < 40) || expeditionSitesNear(x, y, 65).length) continue;
        location = { x, y };
      }
      if (!location) throw new Error("Keruupaikkaa ei voitu sijoittaa: " + material.name);
      const { x, y } = location;
      const site = {
        id: "field-site-" + material.id + "-" + slot, regionIndex, x, y,
        label: material.name + " · " + name, labelY: y + 16, base: { x, y: y - 2 },
        kind: "expedition", local: true, asset: material.family.asset, icon: material.family.icon,
        action: "Kerää " + material.amount, loot: { [material.id]: 2 + slot % 4 }, renew: material.family.renew,
      };
      material.sites.push(site);
      indexExpeditionSite(site);
    }
  }
}

const fieldTasks = [
  { id: "first", title: "Kerää ensimmäinen näyte", target: 1, reward: { water: 2 } },
  { id: "survey", title: "Kartoita neljä keruupaikkaa", target: 4, reward: { wood: 3, stone: 2 } },
  { id: "craft", title: "Valmista kolme eri reseptiä", target: 3, reward: { honey: 3, nuts: 3 } },
  { id: "supply", title: "Toimita tuvalle", target: 2, reward: { bandage: 2, fish: 3 } },
];

function populateFieldSelect(select) {
  for (const biome of new Set(fieldMaterials.map(m => m.biome))) {
    const group = document.createElement("optgroup");
    group.label = biome;
    for (const material of fieldMaterials.filter(m => m.biome === biome)) group.append(new Option(material.name, material.id));
    select.append(group);
  }
}

function selectedMaterial(selectId) {
  return fieldMaterials.find(material => material.id === byId(selectId).value);
}

function fieldTaskProgress(task, material) {
  if (task.id === "craft") return material.recipes.filter(r => state.expedition.recipes.has(r.id)).length;
  if (task.id === "supply") return state.crafted.get(material.recipes[1].id) ?? 0;
  return material.sites.filter(s => state.expedition.sites.has(s.id)).length;
}

function atFieldShelter() {
  return Boolean(state.shelter) || shelters.some(point => canUse(point));
}

function claimFieldTask(task, material) {
  const key = material.id + "-" + task.id;
  const claimed = state.expedition.fieldClaims;
  if (claimed.has(key) || fieldTaskProgress(task, material) < task.target) return;
  if (task.id === "supply") {
    if (!atFieldShelter()) return;
    const product = material.recipes[1].id;
    state.crafted.set(product, state.crafted.get(product) - task.target);
  }
  claimed.add(key);
  for (const [item, quantity] of Object.entries(task.reward)) state.pack[item] += quantity;
  playSound(540);
  renderFieldTasks();
}

function renderFieldTasks() {
  const material = selectedMaterial("field-material");
  const claims = state.expedition.fieldClaims;
  setText("field-task-count", claims.size + " / " + fieldMaterials.length * fieldTasks.length);
  const unexplored = material.sites.filter(site => !state.expedition.sites.has(site.id));
  setText("field-material-stock", material.biome + " · Repussa " + state.pack[material.id] + " " + material.amount
    + " · Löydetty " + (material.sites.length - unexplored.length) + " / " + material.sites.length + " keruupaikkaa");
  const next = unexplored.sort((a, b) => distance(a, state.player) - distance(b, state.player))[0];
  const mark = byId("field-mark");
  mark.disabled = !next;
  mark.onclick = next ? () => {
    setMapTarget(next);
    expeditionDialog.close();
    openWorldMap();
  } : null;
  const list = byId("field-tasks");
  list.replaceChildren();
  for (const task of fieldTasks) {
    const claimed = claims.has(material.id + "-" + task.id);
    const progress = Math.min(task.target, fieldTaskProgress(task, material));
    const supply = task.id === "supply";
    const row = document.createElement("article");
    row.className = "expedition-entry";
    const body = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = task.title + (supply ? " " + task.target + " × " + material.recipes[1].name.toLocaleLowerCase("fi") : "");
    const copy = document.createElement("p");
    copy.textContent = (claimed ? "Valmis" : progress + " / " + task.target) + " · Palkinto " + formatIngredients(task.reward);
    body.append(title, copy);
    const button = craftingButton(claimed ? "Lunastettu" : supply ? "Toimita" : "Lunasta", () => claimFieldTask(task, material),
      claimed || progress < task.target || (supply && !atFieldShelter()));
    row.append(body, button);
    list.append(row);
  }
}
