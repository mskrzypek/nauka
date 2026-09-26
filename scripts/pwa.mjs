#!/usr/bin/env node
// Generuje pliki PWA na podstawie apps.json: manifest ogólny + manifest każdego dziecka oraz ikonki.
// Uruchom po dodaniu dziecka lub zmianie jego koloru:  node scripts/pwa.mjs
// Ikonki renderuje headless Chrome z szablonu tools/icon.html, skaluje ImageMagick (magick).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { kids } = JSON.parse(fs.readFileSync(path.join(root, "apps.json"), "utf8"));

const chrome = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Brak Chrome/Chromium/Edge do renderowania ikonek");

const iconsDir = path.join(root, "icons");
fs.mkdirSync(iconsDir, { recursive: true });
const template = pathToFileURL(path.join(root, "tools", "icon.html")).href;

function renderIcons(slug, query) {
  const big = path.join(iconsDir, `${slug}-512.png`);
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=512,512", "--virtual-time-budget=4000", `--screenshot=${big}`, `${template}${query}`,
  ], { stdio: "ignore" });
  for (const size of [192, 180]) {
    execFileSync("magick", [big, "-resize", `${size}x${size}`, "-strip", path.join(iconsDir, `${slug}-${size}.png`)]);
  }
  execFileSync("magick", [big, "-strip", big]);
}

function manifest(file, { name, short, start, id, color, icon }) {
  const data = {
    id,
    name,
    short_name: short,
    lang: "pl",
    start_url: start,
    scope: "./",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F9FC",
    theme_color: color,
    icons: [
      { src: `icons/${icon}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `icons/${icon}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `icons/${icon}-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + "\n");
}

renderIcons("nauka", "");
manifest("manifest.webmanifest", { name: "Apki do nauki", short: "Nauka", start: "./", id: "./", color: "#2A4D9B", icon: "nauka" });
console.log("✔ ogólna: manifest.webmanifest, icons/nauka-*.png");

for (const k of kids) {
  renderIcons(k.id, `?name=${encodeURIComponent(k.name)}&color=${encodeURIComponent(k.color)}`);
  manifest(`manifest-${k.id}.webmanifest`, {
    name: `Nauka – ${k.name}`,
    short: "Nauka",
    start: `./?dla=${k.id}`,
    id: `./?dla=${k.id}`,
    color: k.color,
    icon: k.id,
  });
  console.log(`✔ ${k.name}: manifest-${k.id}.webmanifest, icons/${k.id}-*.png`);
}
