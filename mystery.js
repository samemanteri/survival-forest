"use strict";

const bunker = {
  id: "bunker", label: "Metsäbunkkeri", icon: "bunker", action: "Mene bunkkeriin",
  x: 1530, y: 135, labelY: 156, base: { x: 1548, y: 121 },
  footprint: [[1478, 101], [1524, 63], [1585, 74], [1608, 98], [1572, 118], [1497, 119]],
  asset: "bunker", image: "bunker-interior.webp", search: "Poimi kulkukortti",
  loot: { keycard: true }, notice: ["Löysit kulkukortin", "Sillä aukeaa kartalle merkitty armeijan mökki.", "keycard"],
};

const armyCabin = {
  id: "army-cabin", label: "Armeijan mökki", icon: "lock", action: "Kokeile ovea",
  x: 2570, y: 1115, labelY: 1137, base: { x: 2590, y: 1102 },
  footprint: [[2523, 1037], [2601, 1007], [2651, 1041], [2638, 1083], [2601, 1101], [2530, 1087]],
  asset: "army-cabin", image: "army-cabin-interior.webp", search: "Katso tallenne",
};

const forestHatch = {
  id: "forest-hatch", kind: "tunnel", label: "Metsäluukku", icon: "hatch",
  x: 7490, y: 1835, labelY: 1844, base: { x: 7490, y: 1829 }, local: true,
  footprint: [[7459, 1813], [7485, 1799], [7523, 1808], [7511, 1824], [7485, 1830]],
  asset: "hatch-closed",
};

const bunkerHint = "Etsi betonista ovea Vartijankankaan pohjoislaidalla.";
const recordingDialog = document.getElementById("recording-dialog");
const cabinRecording = document.getElementById("cabin-recording");
let bunkerMapMarker;
let armyCabinMapMarker;
let hatchMapMarker;

function registerMysteryMapMarkers() {
  bunkerMapMarker = registerMapMarker(bunker);
  armyCabinMapMarker = registerMapMarker(armyCabin);
  hatchMapMarker = registerMapMarker(forestHatch);
}

function discoverBunker() {
  if (state.bunkerFound) return;
  state.bunkerFound = true;
  notice("Metsäbunkkeri löytyi", "Etsi sisältä kulkukorttia.", "bunker");
}

function renderMystery() {
  const { shelter, bunkerFound, pack, cabinVisited, recordingSeen, tunnelOpen, tunnelTrip } = state;
  bunkerMapMarker.hidden = !bunkerFound;
  hatchMapMarker.hidden = !tunnelOpen;
  const hatch = byId("bunker-hatch");
  hatch.hidden = shelter?.id !== bunker.id || Boolean(tunnelTrip);
  hatch.classList.toggle("is-open", tunnelOpen);
  setText("bunker-hatch-label", tunnelOpen ? "Kulje tunnelista" : "Avaa luukku");
  byId("tunnel-passage").hidden = !tunnelTrip;
  if (tunnelTrip) setText("tunnel-destination", tunnelTrip.toForest ? "Tuuliharjulle" : "Takaisin bunkkeriin");
  const markerIcon = armyCabinMapMarker.querySelector("use");
  const href = pack.keycard ? "#i-door" : "#i-lock";
  if (markerIcon.getAttribute("href") !== href) markerIcon.setAttribute("href", href);
  byId("keycard-slot").hidden = !pack.keycard;
  const tasks = [bunkerFound, pack.keycard, cabinVisited, recordingSeen];
  const next = tasks.indexOf(false);
  ["bunker", "keycard", "army-cabin", "recording"].forEach((id, index) => {
    const task = byId("task-" + id);
    task.classList.toggle("done", tasks[index]);
    task.classList.toggle("current", index === next);
  });
  const hint = {
    0: bunkerHint,
    1: "Tutki pöytä bunkkerin sisällä.",
    2: "Armeijan mökki on merkitty Itämetsään. Avaa kartta M:llä.",
    3: "Nauhurin tallenne odottaa mökissä.",
  };
  const taskHint = hint[next] ?? "Tallenne katsottu. Voit palata mökkiin katsomaan sen uudelleen.";
  setText("mystery-hint", shelter?.id === bunker.id && pack.keycard
    ? (tunnelOpen ? "Avoin luukku vie Tuuliharjulle." : "Lattiassa on metsän toiselle puolelle johtava luukku.")
    : taskHint);
}

function useBunkerHatch() {
  if (state.shelter?.id !== bunker.id || state.tunnelTrip) return;
  if (!state.tunnelOpen) {
    state.tunnelOpen = true;
    stopRest();
    notice("Luukku aukesi", "Tunneli johtaa Tuuliharjulle. Valitse Kulje tunnelista.", "hatch");
    playSound(175);
    return;
  }
  beginTunnelTrip(true);
}

function useForestHatch() {
  if (!state.tunnelOpen) return notice("Metsäluukku on lukossa", "Luukun voi avata bunkkerin puolelta.", "lock");
  beginTunnelTrip(false);
}

function beginTunnelTrip(toForest) {
  if (state.tunnelTrip) return;
  keys.clear();
  driveTouches.clear();
  stopRest();
  state.waypoints = [];
  state.targetPoint = null;
  state.pointer = null;
  state.fishing = null;
  state.tunnelTrip = { toForest, remaining: 1.15 };
  playSound(130);
}

function stepTunnel(dt) {
  const trip = state.tunnelTrip;
  if (!trip) return false;
  trip.remaining -= dt;
  if (trip.remaining > 0) return true;
  state.tunnelTrip = null;
  if (trip.toForest) {
    state.shelter = null;
    Object.assign(state.player, { x: forestHatch.x, y: forestHatch.y + 18, angle: Math.PI / 2 });
    notice("Saavuit Tuuliharjulle", "Metsäluukusta pääset takaisin bunkkeriin.", "hatch");
  } else {
    Object.assign(state.player, { x: bunker.x, y: bunker.y + 8, angle: -Math.PI / 2 });
    usePoint(points.find((point) => point.id === bunker.id));
    notice("Palasit bunkkeriin", "Luukku pysyy auki kumpaankin suuntaan.", "hatch");
  }
  playSound(250);
  return true;
}

function renderForestHatch(visible, dark) {
  const { x, y } = forestHatch.base;
  const brightness = 1 - dark * .77;
  view.positionSprite(forestHatch.sprite, x, y, { visible: visible && !state.tunnelOpen, brightness });
  view.positionSprite(forestHatch.openSprite, x, y, { visible: visible && state.tunnelOpen, brightness });
}

function openCabinRecording() {
  if (recordingDialog.open || state.shelter?.id !== armyCabin.id || !state.pack.keycard) return;
  keys.clear();
  driveTouches.clear();
  stopRest();
  cabinRecording.muted = !soundOn;
  if (cabinRecording.error || cabinRecording.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) cabinRecording.load();
  cabinRecording.currentTime = 0;
  setText("recording-status", "");
  recordingDialog.showModal();
  cabinRecording.play().catch(() => {
    if (recordingDialog.open && !cabinRecording.error) setText("recording-status", "Käynnistä tallenne videon toistopainikkeella.");
  });
}

function bindCabinRecording() {
  cabinRecording.addEventListener("ended", () => {
    if (!recordingDialog.open || state.shelter?.id !== armyCabin.id) return;
    state.recordingSeen = true;
    setText("recording-status", "Tallenne katsottu.");
  });
  cabinRecording.addEventListener("playing", () => setText("recording-status", ""));
  const showError = () => setText("recording-status", "Tallenne ei latautunut. Palaa mökkiin ja yritä uudelleen.");
  cabinRecording.addEventListener("error", showError);
  byId("recording-fallback-source").addEventListener("error", showError);
  recordingDialog.addEventListener("cancel", () => cabinRecording.pause());
  recordingDialog.querySelector("form").addEventListener("submit", () => cabinRecording.pause());
  recordingDialog.addEventListener("close", () => {
    cabinRecording.pause();
    if (state.recordingSeen) notice("Tallenne katsottu", "Voit katsoa sen uudelleen mökissä.", "recording");
  });
}
