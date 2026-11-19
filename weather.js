"use strict";

const weatherStages = [
  { until: 72, name: "Pouta", icon: "sun", fog: 0, rain: 0 },
  { until: 210, name: "Sumu", icon: "fog", fog: .68, rain: 0 },
  { until: 336, name: "Sade", icon: "rain", fog: .12, rain: .72 },
  { until: 450, name: "Ukkonen", icon: "thunder", fog: .17, rain: 1 },
  { until: 570, name: "Pouta", icon: "sun", fog: 0, rain: 0 },
];

const frostWeather = { name: "Pakkanen", icon: "snow" };
const snowfall = { name: "Lumisade", icon: "snow", snow: .65, fog: .1 };
const desertWeather = { name: "Kuivaa", icon: "sun" };

const weatherCanvas = document.getElementById("weather-canvas");
const weatherContext = weatherCanvas.getContext("2d");
const reducedWeatherMotion = matchMedia("(prefers-reduced-motion: reduce)");
const rainStreaks = Array.from({ length: 160 }, (_, index) => ({
  x: (index * .61803398875) % 1,
  y: (index * .41421356237) % 1,
  speed: 520 + index % 7 * 54,
  length: 12 + index % 9 * 2.4,
}));
const weatherSize = { width: 0, height: 0, ratio: 1 };

function weatherAt(minutes, biome) {
  if (biome === "desert") return desertWeather;
  const period = weatherStages.at(-1).until;
  const offset = Math.max(0, minutes) % period;
  const stage = weatherStages.find((stage) => offset < stage.until);
  if (biome === "snow") {
    if (stage.rain) return snowfall;
    if (!stage.fog) return frostWeather;
  }
  return stage;
}

function resizeWeather(width, height) {
  weatherSize.width = width;
  weatherSize.height = height;
  weatherSize.ratio = Math.min(devicePixelRatio || 1, 1.4);
  weatherCanvas.width = Math.round(width * weatherSize.ratio);
  weatherCanvas.height = Math.round(height * weatherSize.ratio);
  weatherContext?.setTransform(weatherSize.ratio, 0, 0, weatherSize.ratio, 0, 0);
}

function drawWeather(weather, dark, elapsed, view, focus, indoor) {
  const ctx = weatherContext;
  weatherCanvas.hidden = indoor || !ctx || (!weather.fog && !weather.rain && !weather.snow);
  if (weatherCanvas.hidden) return;
  const { width, height } = weatherSize;
  ctx.clearRect(0, 0, width, height);
  if (weather.fog) {
    const mist = ctx.createLinearGradient(0, 0, 0, height);
    const density = weather.fog * (1 - dark * .47);
    const tint = dark > .58 ? "118, 139, 161" : "185, 198, 190";
    mist.addColorStop(0, "rgba(" + tint + ", " + density * .90 + ")");
    mist.addColorStop(.65, "rgba(" + tint + ", " + density * .74 + ")");
    mist.addColorStop(1, "rgba(" + tint + ", " + density * .52 + ")");
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, width, height);
    const x = (focus.x - view.x) * view.scale;
    const y = (focus.y - view.y) * view.scale;
    const radius = Math.max(86, 194 * view.scale);
    const nearby = ctx.createRadialGradient(x, y, radius * .22, x, y, radius);
    nearby.addColorStop(0, "rgba(0, 0, 0, .84)");
    nearby.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = nearby;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalCompositeOperation = "source-over";
  }
  if (weather.snow) {
    const time = reducedWeatherMotion.matches ? 0 : elapsed;
    const count = Math.min(rainStreaks.length, Math.round((width / 7 + 12) * weather.snow));
    ctx.fillStyle = "rgba(235, 247, 255, .67)";
    ctx.beginPath();
    for (let index = 0; index < count; index++) {
      const flake = rainStreaks[index];
      const radius = 1 + index % 4 * .35;
      const x = (flake.x * (width + 20) + time * 21) % (width + 20) - 10;
      const y = (flake.y * (height + 20) + time * flake.speed * .1) % (height + 20) - 10;
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  if (weather.rain) {
    const moving = !reducedWeatherMotion.matches;
    const time = moving ? elapsed : 0;
    ctx.strokeStyle = dark > .58 ? "rgba(156, 180, 202, .27)" : "rgba(207, 225, 225, .36)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const count = Math.min(rainStreaks.length, Math.round((width / 6 + 15) * weather.rain * (moving ? 1 : .55)));
    for (let index = 0; index < count; index++) {
      const drop = rainStreaks[index];
      const x = (drop.x * (width + 38) + time * 120) % (width + 38) - 19;
      const y = (drop.y * (height + 36) + time * drop.speed) % (height + 36) - 18;
      ctx.moveTo(x, y);
      ctx.lineTo(x + drop.length * .24, y + drop.length);
    }
    ctx.stroke();
    if (moving && weather.icon === "thunder") {
      const age = (elapsed + .4) % 7.4;
      const opacity = Math.sin(Math.PI * Math.min(1, age / .58)) * .15;
      if (opacity > .001) {
        ctx.fillStyle = "rgba(203, 222, 244, " + opacity + ")";
        ctx.fillRect(0, 0, width, height);
      }
    }
  }
}
