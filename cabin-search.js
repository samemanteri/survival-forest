"use strict";

const cabinProps = {
  blanket: { name: "Peitettä", asset: "cabin-blanket" },
  crate: { name: "Laatikkoa", asset: "cabin-crate" },
  satchel: { name: "Kangaskassia", asset: "cabin-satchel" },
};

const cabinLayouts = {
  "cabin.webp": [["blanket", 29, 71, "bandages"], ["satchel", 58, 75, "trail-food"], ["crate", 79, 71]],
  "shed-interior.webp": [["crate", 39, 70, "materials"], ["satchel", 66, 73, "bandages"]],
  "ranger-interior.webp": [["crate", 32, 72, "materials"], ["blanket", 55, 75, "trail-food"], ["satchel", 78, 68]],
  "sauna-interior.webp": [["blanket", 63, 73, "water"], ["satchel", 39, 71]],
  "lodge-interior.webp": [["blanket", 32, 70, "trail-food"], ["satchel", 60, 73, "water"], ["crate", 79, 70]],
  "fishing-hut-interior.webp": [["satchel", 33, 73, "bandages"], ["crate", 60, 75, "fish"], ["blanket", 81, 74]],
  "forest-aid-interior.webp": [["satchel", 31, 73, "bandages"], ["crate", 53, 77, "water"], ["blanket", 76, 71]],
  "army-cabin-interior.webp": [["satchel", 30, 69, "bandages"], ["crate", 58, 76, "water"], ["blanket", 79, 74]],
};

const cabinFinds = {
  bandages: { name: "Kaksi sidettä", asset: "craft-aid", icon: "bandage", supplies: { bandage: 2 } },
  water: { name: "Kaksi annosta vettä", asset: "trail-sap", icon: "drop", supplies: { water: 2 } },
  "trail-food": { name: "Retkieväät", asset: "trail-nuts", icon: "pack", supplies: { nuts: 2, berries: 2 } },
  fish: { name: "Kalaeväät", asset: "trail-cache", icon: "fish", supplies: { fish: 2 } },
  materials: { name: "Rakennustarvikkeet", asset: "wood", icon: "wood", supplies: { wood: 2, stone: 2 } },
  "cabin-boots": {
    name: "Vaelluskengät", asset: "cabin-boots", icon: "pack",
    bonus: { walkSpeed: 10, sprintSaving: 2 }, description: "Kävelet nopeammin ja juoksu kuluttaa vähemmän jaksamista.",
  },
  "cabin-medkit": {
    name: "Ensiapulaukku", asset: "cabin-medkit", icon: "bandage", supplies: { bandage: 2 },
    bonus: { bandageHealing: 15 }, description: "Side palauttaa nyt 50 terveyttä.",
  },
  "cabin-lamp": {
    name: "Tehotaskulamppu", asset: "cabin-lamp", icon: "torch", supplies: { torch: true, battery: 100 },
    bonus: { torchRange: 135, torchEfficiency: .54 }, description: "Valokeila kantaa kauemmas ja akku kestää pidempään. Sytytä F:llä.",
  },
};

const cabinRareFinds = {
  ranger: "cabin-boots",
  "east-aid": "cabin-medkit",
  "army-cabin": "cabin-lamp",
};

const cabinSearchLayer = document.getElementById("cabin-search");
const cabinGearLabels = document.getElementById("cabin-gear");
const cabinPositions = { left: 12, right: 88, top: 46, bottom: 82 };
let shownCabin = null;

// Touch actions finish on pointerup. A synthesized click could hit a newly uncovered find.
cabinSearchLayer.addEventListener("touchend", (event) => event.preventDefault(), { passive: false });

function cabinObjectPosition(button, x, y) {
  button.style.left = x + "%";
  button.style.top = y + "%";
}

function cabinSpaceFree(objects, x, y) {
  return objects.every((object) => Math.abs(object.x - x) >= 10 || Math.abs(object.y - y) >= 12);
}

function cabinObjectButton(label, asset, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  button.title = label;
  const image = document.createElement("img");
  image.src = "assets/" + asset + ".webp";
  image.alt = "";
  image.draggable = false;
  button.append(image);
  return button;
}

function touchReleasedOn(button, event) {
  return event.isPrimary && event.pointerType === "touch"
    && button.contains(document.elementFromPoint(event.clientX, event.clientY));
}

function bindCabinDrag(button, object, objects, updateFinds) {
  let drag;
  let moved = false;

  function place(x, y) {
    object.x = clamp(x, cabinPositions.left, cabinPositions.right);
    object.y = clamp(y, cabinPositions.top, cabinPositions.bottom);
    cabinObjectPosition(button, object.x, object.y);
    updateFinds();
  }

  function moveAside() {
    const otherObjects = objects.filter((entry) => entry !== object);
    const alternatives = [object.originX + 17, object.originX - 17, object.originX + 34, object.originX - 34];
    const x = alternatives.find((candidate) => candidate >= cabinPositions.left && candidate <= cabinPositions.right
      && Math.abs(object.x - candidate) >= 10 && cabinSpaceFree(otherObjects, candidate, object.originY));
    if (x !== undefined) place(x, object.originY);
    else place(object.x, object.originY >= 64 ? cabinPositions.top : cabinPositions.bottom);
  }

  button.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    moved = false;
    const bounds = cabinSearchLayer.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: object.x, originY: object.y, bounds };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointermove", (event) => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    moved = true;
    button.classList.add("dragging");
    place(drag.originX + dx / drag.bounds.width * 100, drag.originY + dy / drag.bounds.height * 100);
  });
  button.addEventListener("pointerup", (event) => {
    if (drag?.id !== event.pointerId || moved || !touchReleasedOn(button, event)) return;
    moved = true;
    moveAside();
  });
  button.addEventListener("lostpointercapture", () => {
    drag = null;
    button.classList.remove("dragging");
  });
  button.addEventListener("click", (event) => {
    if (!moved || (!event.detail && !event.pointerType)) moveAside();
  });
}

function takeCabinFind(object) {
  if (object.taken) return;
  object.taken = true;
  const find = cabinFinds[object.find];
  for (const [item, amount] of Object.entries(find.supplies ?? {})) {
    state.pack[item] = typeof amount === "number" ? state.pack[item] + amount : amount;
  }
  state.pack.battery = Math.min(100, state.pack.battery);
  if (find.bonus) {
    equipGear(object.find, find.bonus);
    renderCabinGear();
  }
  notice(find.name, find.description ?? "Löytö on nyt repussa.", find.icon);
  playSound(find.bonus ? 780 : 610);
}

function renderCabinSearch(shelter) {
  const visible = shelter && cabinLayouts[shelter.image] ? shelter : null;
  if (shownCabin === visible) return;
  shownCabin = visible;
  cabinSearchLayer.replaceChildren();
  cabinSearchLayer.hidden = !visible;
  scene.classList.toggle("searchable-cabin", Boolean(visible));
  if (!visible) return;

  if (!state.cabinSearches.has(shelter.id)) {
    const special = cabinRareFinds[shelter.id];
    const objects = cabinLayouts[shelter.image].map(([prop, x, y, find], index) => ({
      prop, x, y, originX: x, originY: y, find: index === 0 && special ? special : find, taken: false,
    }));
    state.cabinSearches.set(shelter.id, objects);
  }
  const objects = state.cabinSearches.get(shelter.id);
  const finds = [];
  function updateFinds() {
    for (const { object, button } of finds) {
      button.hidden = object.taken || !cabinSpaceFree(objects, object.originX, object.originY);
    }
  }
  for (const object of objects) {
    if (object.find && !object.taken) {
      const find = cabinFinds[object.find];
      const button = cabinObjectButton("Ota " + find.name.toLocaleLowerCase("fi"), find.asset, "cabin-find");
      cabinObjectPosition(button, object.originX, object.originY);
      const collect = () => {
        if (button.hidden || state.shelter !== shelter) return;
        takeCabinFind(object);
        updateFinds();
      };
      button.addEventListener("click", collect);
      button.addEventListener("pointerup", (event) => {
        if (touchReleasedOn(button, event)) collect();
      });
      finds.push({ object, button });
      cabinSearchLayer.append(button);
    }
    const prop = cabinProps[object.prop];
    const button = cabinObjectButton("Siirrä " + prop.name.toLocaleLowerCase("fi"), prop.asset, "cabin-prop");
    cabinObjectPosition(button, object.x, object.y);
    bindCabinDrag(button, object, objects, updateFinds);
    cabinSearchLayer.append(button);
  }
  updateFinds();
}

function renderCabinGear() {
  cabinGearLabels.replaceChildren();
  for (const id of Object.values(cabinRareFinds)) {
    if (!state.gear.has(id)) continue;
    const label = document.createElement("span");
    label.textContent = cabinFinds[id].name;
    label.title = cabinFinds[id].description;
    cabinGearLabels.append(label);
  }
  cabinGearLabels.hidden = !cabinGearLabels.childElementCount;
}
