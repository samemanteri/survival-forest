"use strict";

const construction = [
  ["pot", "Pata", "Täyttää juomapullon aina uudelleen.", { wood: 1, stone: 1 }, "craft-pot", "Täytä juomapullo"],
  ["bed", "Sänky", "Nuku aamuun. Keritse lammas saadaksesi villaa peittoon.", { wood: 3, wool: 2 }, "craft-bed", "Nuku sängyssä"],
  ["lean-to", "Laavu", "Lepää suojassa eläimiltä ja nuku aamuun.", { wood: 5, stone: 1 }, "craft-lean-to", "Lepää laavussa"],
  ["cistern", "Vesisäiliö", "Täyttää vähintään viisi annosta vettä.", { wood: 3, stone: 3 }, "craft-cistern", "Täytä vesisäiliöstä"],
  ["fire-ring", "Nuotiopaikka", "Sytytä nuotio yhdellä halolla. Kivikehä jää maastoon.", { stone: 3 }, "craft-wall", "Sytytä nuotiopaikka"],
  ["oven", "Kiviuuni", "Avaa lämpimien ruokien reseptit uunin vieressä.", { stone: 4, wood: 1 }, "craft-oven", "Käytä kiviuunia"],
  ["bench", "Työpöytä", "Avaa kehittyneet retkivarusteet työpöydän vieressä.", { wood: 4, stone: 2 }, "craft-bench", "Käytä työpöytää"],
  ["chest", "Tarvikearkku", "Säilytä marjoja, sieniä ja kalaa maastossa.", { wood: 3, stone: 1 }, "craft-chest", "Käytä tarvikearkkua"],
  ["wood-rack", "Halkoteline", "Jätä halot telineeseen ja nouda ne myöhemmin.", { wood: 2, stone: 1 }, "craft-rack", "Käytä halkotelinettä"],
  ["signpost", "Reittiviitta", "Lisää maamerkin erämaakartalle.", { wood: 2 }, "craft-sign", "Merkitse reittiviitta kohteeksi"],
  ["seat", "Lepopenkki", "Palauttaa jaksamista. Lepää uudelleen tunnin päästä.", { wood: 2, stone: 1 }, "craft-seat", "Istu lepopenkille"],
  ["aid-post", "Ensiapupiste", "Palauttaa terveyttä kerran pelipäivässä.", { wood: 2, stone: 1, bandage: 1 }, "craft-aid", "Hoida haavat"],
  ["wall", "Kivivalli", "Estää kulun. Voit purkaa vallin vierestä.", { stone: 4 }, "craft-wall", "Pura kivivalli"],
  ["berry-bed", "Marjapenkki", "Kasvattaa kaksi annosta marjoja kymmenessä pelitunnissa.", { wood: 2, stone: 1, berries: 1 }, "berries", "Kerää marjapenkin sato"],
  ["dry-rack", "Kuivausteline", "Avaa kuivakalan reseptin telineen vieressä.", { wood: 3, stone: 1 }, "craft-rack", "Käytä kuivaustelinettä"],
].map(([id, name, description, cost, asset, action]) => ({ id, name, description, cost, asset, action, group: "build" }));

const cooking = [
  ["berry-snack", "Marjaeväs", { berries: 1 }, { hunger: 32, thirst: 7 }],
  ["mushroom-pack", "Sieninyytti", { mushrooms: 1, water: 1 }, { hunger: 39, energy: 12 }],
  ["fish-snack", "Kalaeväs", { fish: 1 }, { hunger: 48, energy: 6 }],
  ["fish-soup", "Kalakeitto", { fish: 1, water: 1 }, { hunger: 55, thirst: 27 }, "oven"],
  ["mushroom-soup", "Sienikeitto", { mushrooms: 2, water: 1 }, { hunger: 57, thirst: 31 }, "oven"],
  ["berry-drink", "Marjajuoma", { berries: 1, water: 1 }, { hunger: 17, thirst: 45 }],
  ["roast-fish", "Paahdettu kala", { fish: 2, wood: 1 }, { hunger: 74, energy: 15 }, "oven"],
  ["dried-fish", "Kuivakala", { fish: 2 }, { hunger: 65, energy: 19 }, "dry-rack"],
  ["berry-mash", "Marjasose", { berries: 2 }, { hunger: 46, thirst: 19 }, "oven"],
  ["mushroom-stew", "Sienimuhennos", { mushrooms: 2, berries: 1 }, { hunger: 65, energy: 22 }, "oven"],
  ["trail-meal", "Retkiateria", { fish: 1, mushrooms: 1, water: 1 }, { hunger: 82, energy: 28, thirst: 18 }, "oven"],
  ["forest-tea", "Metsätee", { berries: 1, water: 1 }, { thirst: 43, energy: 27 }, "oven"],
].map(([id, name, cost, restore, station]) => ({ id, name, cost, restore, station, group: "food" }));

const equipment = [
  ["water-pouch", "Juomapussi", "Pullon kapasiteetti kasvaa yhdellä annoksella.", { bandage: 1, wood: 1 }, { capacity: 1 }],
  ["water-skin", "Juomaleili", "Pullon kapasiteetti kasvaa kahdella annoksella.", { bandage: 2, stone: 1 }, { capacity: 2 }, "bench"],
  ["walking-shoes", "Retkikengät", "Kävelyvauhti kasvaa.", { wood: 2, bandage: 1 }, { walkSpeed: 13 }, "bench"],
  ["sprint-belt", "Juoksuvyö", "Juokseminen kuluttaa vähemmän jaksamista.", { bandage: 2, wood: 1 }, { sprintSaving: 2 }, "bench"],
  ["quiet-soles", "Pehmeät pohjalliset", "Pedot huomaavat sinut vasta lähempää.", { bandage: 2, wood: 2 }, { stealth: 20 }, "bench"],
  ["battery-pack", "Varaparisto", "Palauttaa taskulampun akusta 55 prosenttiyksikköä.", { stone: 3, wood: 1 }, null, "bench", { battery: 55 }],
  ["dressing", "Suojaside", "Palauttaa terveyttä 65 prosenttiyksikköä.", { bandage: 1, water: 1 }, null, null, { health: 65 }],
  ["splint", "Tukiside", "Palauttaa terveyttä ja jaksamista.", { bandage: 1, wood: 1 }, null, null, { health: 44, energy: 20 }],
  ["cup", "Puinen muki", "Juomisesta saa enemmän nesteytystä.", { wood: 2 }, { drinkBonus: 8 }],
  ["blanket", "Lepopeite", "Jaksaminen palautuu levätessä nopeammin.", { bandage: 2, wood: 1 }, { restBonus: 3 }],
  ["grate", "Nuotioritilä", "Tavallinen nuotio palaa 18 sekuntia pidempään.", { stone: 3, wood: 1 }, { fireTime: 18 }, "bench"],
  ["fire-kit", "Tulentekosarja", "Tavalliseen nuotioon kuluu yksi halko vähemmän.", { stone: 3, wood: 1 }, { fireSaving: 1 }, "bench"],
  ["lunch-kit", "Retkiastiasto", "Valmistetut eväät palauttavat myös jaksamista.", { wood: 2, stone: 2 }, { mealEnergy: 10 }],
].map(([id, name, description, cost, bonus, station, restore]) => ({ id, name, description, cost, bonus, station, restore, group: "gear" }));

const recipeGroups = { build: construction, food: cooking, gear: equipment, trail: expeditionRecipes };
const ingredientNames = {
  wood: "puuta", stone: "kiveä", wool: "villaa", water: "vettä", bandage: "sidettä", berries: "marjoja", mushrooms: "sieniä", fish: "kalaa",
  ...Object.fromEntries(Object.entries(expeditionIngredients).map(([item, material]) => [item, material.amount])),
};
const meterNames = { hunger: "kylläisyyttä", thirst: "nesteytystä", energy: "jaksamista", health: "terveyttä" };
const stationNames = { oven: "Kiviuuni", bench: "Työpöytä", "dry-rack": "Kuivausteline" };
const craftingDialog = document.getElementById("craft-dialog");
let recipeGroup = "build";

function gearBonus(stat) {
  return state?.gearBonus?.[stat] ?? 0;
}

function onFootOutdoors() {
  return !state.shelter && !state.onTower && !state.car.driving && !state.boat.aboard;
}

function refillWater(amount = 3) {
  state.pack.water = Math.max(state.pack.water, amount + gearBonus("capacity"));
  notice("Juomapullo täynnä", "Juo repusta painamalla 3.", "drop");
  playSound(390);
}

function formatIngredients(cost) {
  return Object.entries(cost).map(([item, amount]) => amount + " " + ingredientNames[item]).join(" · ");
}

function recipeIssue(recipe) {
  if (recipe.bonus && state.gear.has(recipe.id)) return "Varuste käytössä";
  if (recipe.group === "build" && !onFootOutdoors()) return "Palaa ensin maastoon";
  if (recipe.station && !state.builds.some((point) => point.recipe.id === recipe.station && canUse(point))) {
    return "Tarvitset lähellesi työpisteen " + stationNames[recipe.station].toLowerCase();
  }
  if (Object.entries(recipe.cost).some(([item, amount]) => state.pack[item] < amount)) return "Tarvikkeita puuttuu";
  return "";
}

function craftingLocation() {
  const { player } = state;
  for (const turn of [0, -.8, .8, -1.6, 1.6, Math.PI]) {
    const angle = player.angle + turn;
    const x = Math.round(player.x + Math.cos(angle) * 90);
    const y = Math.round(player.y + Math.sin(angle) * 90);
    const area = [[x - 27, y - 35], [x + 27, y - 35], [x + 27, y - 12], [x - 27, y - 12]];
    const site = { x, y };
    if (!traversable(x, y) || !traversable(x, y + 10) || !clearPath(player, site)) continue;
    if (area.some(([px, py]) => !traversable(px, py))) continue;
    if ([...points, ...expeditionSitesNear(x, y, 65)].some((point) => available(point) && distance(point, site) < 65)) continue;
    if (state.animals.some((animal) => distance(animal, site) < 66)) continue;
    return { ...site, area };
  }
  return null;
}

function craftRecipe(recipe) {
  const issue = recipeIssue(recipe);
  if (issue) return setText("craft-feedback", issue + ".");
  const site = recipe.group === "build" ? craftingLocation() : null;
  if (recipe.group === "build" && !site) return setText("craft-feedback", "Tarvitset avarampaa maastoa. Siirry hieman ja yritä uudelleen.");
  for (const [item, amount] of Object.entries(recipe.cost)) state.pack[item] -= amount;
  state.started = true;
  if (site) {
    const { x, y, area } = site;
    const point = {
      id: "built-" + state.nextBuild++, recipe, x, y, label: recipe.name, action: recipe.action,
      kind: "construction", icon: recipe.id === "pot" || recipe.id === "cistern" ? "drop" : "craft",
      local: true, asset: recipe.asset, base: { x, y: y - 12 }, labelY: y + 13, footprint: area,
      stored: {}, readyAt: recipe.id === "berry-bed" ? state.minutes + 600 : 0,
    };
    state.builds.push(point);
    points.push(point);
    state.waypoints = [];
    state.targetPoint = null;
    state.pointer = null;
    registerMarker(point);
    if (recipe.id === "signpost") point.mapButton = registerMapMarker(point);
    craftingDialog.close();
    notice(recipe.name + " on valmis", recipe.action + " painamalla E kohteen vieressä.", point.icon);
  } else if (recipe.bonus) {
    state.gear.add(recipe.id);
    for (const [stat, amount] of Object.entries(recipe.bonus)) state.gearBonus[stat] = gearBonus(stat) + amount;
  } else {
    state.crafted.set(recipe.id, (state.crafted.get(recipe.id) ?? 0) + 1);
    if (recipe.expedition) state.expedition.recipes.add(recipe.id);
  }
  playSound(500);
  if (craftingDialog.open) renderCrafting(recipe.name + " on valmis.");
}

function useCrafted(recipe) {
  if (!state.crafted.get(recipe.id)) return;
  const effects = { ...recipe.restore };
  if (recipe.group === "food" && gearBonus("mealEnergy")) effects.energy = (effects.energy ?? 0) + gearBonus("mealEnergy");
  const canRestore = Object.keys(effects).some((meter) => meter === "battery"
    ? state.pack.torch && state.pack.battery < 100
    : state.meters[meter] < 100);
  if (!canRestore) return setText("craft-feedback", recipe.id === "battery-pack" ? "Tarvitset taskulampun, jonka akku ei ole täynnä." : "Voit säästää tämän myöhemmäksi.");
  for (const [meter, amount] of Object.entries(effects)) {
    const target = meter === "battery" ? state.pack : state.meters;
    target[meter] = Math.min(100, target[meter] + amount);
  }
  state.crafted.set(recipe.id, state.crafted.get(recipe.id) - 1);
  playSound(460);
  renderCrafting("Käytit esinettä " + recipe.name.toLowerCase() + ".");
}

function useStorage(point, items) {
  const withdrawing = items.some((item) => point.stored[item]);
  if (!withdrawing && items.every((item) => !state.pack[item])) return notice("Varasto on tyhjä", "Kerää ensin tarvikkeita reppuun.", "pack");
  for (const item of items) {
    if (withdrawing) {
      state.pack[item] += point.stored[item] ?? 0;
      point.stored[item] = 0;
    } else {
      point.stored[item] = state.pack[item];
      state.pack[item] = 0;
    }
  }
  notice(withdrawing ? "Noudit tarvikkeet" : "Jätit tarvikkeet varastoon",
    withdrawing ? "Tarvikkeet ovat repussa." : "Käytä varastoa uudelleen noutaaksesi ne.", "pack");
}

function dismantleBuild(point) {
  const index = state.builds.indexOf(point);
  if (index < 0) return;
  state.builds.splice(index, 1);
  points.splice(points.indexOf(point), 1);
  point.button.remove();
  point.mapButton?.remove();
  view.removeSprite(point.sprite);
  if (state.mapTarget === point) setMapTarget(null);
}

const constructionActions = {
  pot: () => refillWater(),
  cistern: () => refillWater(5),
  bed: (point) => toggleRest(point),
  "lean-to": (point) => toggleRest(point),
  oven: () => openCrafting("food"),
  bench: () => openCrafting("gear"),
  "dry-rack": () => openCrafting("food"),
  chest: (point) => useStorage(point, ["berries", "mushrooms", "fish"]),
  "wood-rack": (point) => useStorage(point, ["wood"]),
  signpost: (point) => {
    setMapTarget(point);
    notice("Reittiviitta merkitty", "Nuoli auttaa palaamaan tähän kohtaan.", "map");
  },
  wall: (point) => {
    dismantleBuild(point);
    notice("Kivivalli purettu", "Kulku on jälleen vapaa.", "craft");
  },
  "fire-ring": (point) => {
    if (state.campfire) return notice("Nuotio palaa jo", "Odota sen sammumista.", "campfire");
    if (!state.pack.wood) return notice("Tarvitset puuta", "Nuotiopaikan sytytykseen kuluu yksi halko.", "campfire");
    state.pack.wood--;
    igniteCampfire(point.base);
  },
  seat: (point) => {
    if (state.minutes < point.readyAt) return notice("Lepohetki on vielä tuore", "Voit käyttää penkkiä uudelleen tunnin kuluttua viime levosta.", "bed");
    state.meters.energy = Math.min(100, state.meters.energy + 35);
    point.readyAt = state.minutes + 60;
    notice("Levät penkillä hetken", "Jaksaminen palautui.", "bed");
  },
  "aid-post": (point) => {
    if (state.minutes < point.readyAt) return notice("Ensiapupiste on käytetty", "Tarvikkeet ovat taas valmiina seuraavana päivänä.", "bandage");
    if (state.meters.health >= 100) return notice("Terveytesi on täynnä", "Voit käyttää ensiapupistettä myöhemmin.", "bandage");
    state.meters.health = Math.min(100, state.meters.health + 45);
    point.readyAt = (Math.floor(state.minutes / 1440) + 1) * 1440;
    notice("Hoidit haavat", "Ensiapupiste palautti terveyttä.", "bandage");
  },
  "berry-bed": (point) => {
    if (state.minutes < point.readyAt) return notice("Marjat kasvavat", "Sato valmistuu " + Math.ceil((point.readyAt - state.minutes) / 60) + " pelitunnissa.", "berries");
    state.pack.berries += 2;
    point.readyAt = state.minutes + 600;
    notice("Poimit kypsät marjat", "Uusi sato kasvaa kymmenessä pelitunnissa.", "berries");
  },
};

function openCrafting(group = recipeGroup) {
  if (dialog.open || mapDialog.open || state.meters.health <= 0) return;
  recipeGroup = group;
  keys.clear();
  driveTouches.clear();
  renderCrafting();
  if (!craftingDialog.open) craftingDialog.showModal();
}

function craftingButton(label, action, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "game-button";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", action);
  return button;
}

function renderCrafting(message = "") {
  const grid = document.getElementById("craft-recipes");
  const fragment = document.createDocumentFragment();
  setText("craft-feedback", message);
  const trail = recipeGroup === "trail";
  byId("trail-filters").hidden = !trail;
  const term = trail ? byId("trail-search").value.trim().toLocaleLowerCase("fi") : "";
  const onlyReady = trail && byId("trail-ready").checked;
  setText("craft-supplies", formatIngredients(Object.fromEntries(Object.keys(ingredientNames).map((item) => [item, state.pack[item]]))));
  for (const tab of document.querySelectorAll("[data-recipes]")) {
    tab.setAttribute("aria-pressed", String(tab.dataset.recipes === recipeGroup));
  }
  for (const recipe of recipeGroups[recipeGroup]) {
    const issue = recipeIssue(recipe);
    const count = state.crafted.get(recipe.id) ?? 0;
    if ((onlyReady && issue && !count) || (term && !recipe.name.toLocaleLowerCase("fi").includes(term))) continue;
    const card = document.createElement("article");
    card.className = "recipe";
    const heading = document.createElement("h3");
    heading.textContent = recipe.name;
    if (recipe.asset) {
      const picture = document.createElement("img");
      picture.src = "assets/" + recipe.asset + ".webp";
      picture.alt = "";
      picture.addEventListener("error", () => picture.remove(), { once: true });
      card.append(picture);
    }
    const desc = document.createElement("p");
    desc.textContent = recipe.description ?? Object.entries(recipe.restore).map(([meter, amount]) => "+" + amount + " " + meterNames[meter]).join(" · ");
    desc.className = "recipe-effect";
    const cost = document.createElement("p");
    cost.textContent = formatIngredients(recipe.cost);
    cost.className = "recipe-cost";
    const actions = document.createElement("div");
    actions.className = "recipe-actions";
    const verb = recipe.group === "build" ? "Rakenna" : "Tee";
    const action = craftingButton(verb, () => craftRecipe(recipe), Boolean(issue));
    action.setAttribute("aria-label", verb + " " + recipe.name);
    actions.append(action);
    if (count) {
      const use = craftingButton("Käytä (" + count + ")", () => useCrafted(recipe));
      use.setAttribute("aria-label", "Käytä " + recipe.name + ", " + count + " kpl");
      actions.append(use);
    }
    card.append(heading, desc, cost, actions);
    if (issue) {
      const note = document.createElement("p");
      note.className = "recipe-issue";
      note.textContent = issue;
      card.append(note);
    }
    fragment.append(card);
  }
  if (!fragment.childElementCount) {
    const empty = document.createElement("p");
    empty.textContent = "Ei hakua vastaavia reseptejä.";
    fragment.append(empty);
  }
  grid.replaceChildren(fragment);
}
