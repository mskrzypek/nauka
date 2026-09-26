#!/usr/bin/env node
// Dodaje (lub podmienia) mini-apkę HTML w katalogu apps/ i wpis w apps.json.
//
//   node scripts/add-app.mjs --file ~/Downloads/x.html --kids wiktor --subject biologia \
//        [--title "…"] [--emoji 🧬] [--desc "…"] [--slug nazwa] [--date 2026-09-25] [--replace]
//
// Tytuł i emoji są domyślnie brane z <title> i favicony pliku.
// --replace podmienia plik istniejącej apki o tym samym slugu (poprawki), zachowując datę dodania.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "apps.json");

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith("--")) die(`Nieznany argument: ${a}`);
  const key = a.slice(2);
  if (key === "replace") args.replace = true;
  else args[key] = argv[++i];
}

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

if (!args.file) die("Brak --file");
if (!args.kids) die("Brak --kids (np. wiktor albo wiktor,igor)");
if (!args.subject) die("Brak --subject");

const src = path.resolve(args.file.replace(/^~(?=\/)/, process.env.HOME));
if (!fs.existsSync(src)) die(`Nie ma pliku ${src}`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const kidIds = manifest.kids.map((k) => k.id);
const subjectIds = manifest.subjects.map((s) => s.id);

const kids = args.kids.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
for (const k of kids) if (!kidIds.includes(k)) die(`Nieznane dziecko "${k}". Dostępne: ${kidIds.join(", ")}`);
const subject = args.subject.trim().toLowerCase();
if (!subjectIds.includes(subject))
  die(`Nieznany przedmiot "${subject}". Dostępne: ${subjectIds.join(", ")} (nowy dopisz do "subjects" w apps.json)`);

let html = fs.readFileSync(src, "utf8");

const titleTag = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
const title = args.title || titleTag || path.basename(src, ".html");
const faviconEmoji = (html.match(/<link[^>]+rel=["']icon["'][^\n]*?<text[^>]*>([^<]+)<\/text>/i) || [])[1]?.trim();
const emoji = args.emoji || faviconEmoji || manifest.subjects.find((s) => s.id === subject).emoji;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
const slug = args.slug ? slugify(args.slug) : slugify(title.split(/\s+[–—-]\s+/)[0]) || "apka";
const date = args.date || new Date().toISOString().slice(0, 10);

// Apka nie ma być indeksowana przez wyszukiwarki.
if (!/<meta[^>]+name=["']robots["']/i.test(html)) {
  html = /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, (m) => `${m}\n<meta name="robots" content="noindex, nofollow">`)
    : `<meta name="robots" content="noindex, nofollow">\n${html}`;
}

// Przycisk powrotu do listy w trybie ikonki (PWA) – patrz nav.js.
const NAV = `<script src="../nav.js" defer></script>`;
if (!html.includes(NAV)) html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${NAV}\n</body>`) : `${html}\n${NAV}\n`;

const existing = manifest.apps.find((a) => a.id === slug);
if (existing && !args.replace)
  die(`Apka "${slug}" już istnieje. Użyj --replace (poprawka) albo --slug inna-nazwa (nowa apka).`);

const file = `apps/${slug}.html`;
fs.mkdirSync(path.join(root, "apps"), { recursive: true });
fs.writeFileSync(path.join(root, file), html);

const entry = {
  id: slug,
  file,
  title,
  emoji,
  subject,
  kids,
  added: existing?.added || date,
  ...(existing ? { updated: date } : {}),
  ...(args.desc || existing?.desc ? { desc: args.desc || existing.desc } : {}),
};
if (existing) manifest.apps[manifest.apps.indexOf(existing)] = entry;
else manifest.apps.push(entry);

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`✔ ${existing ? "Podmieniono" : "Dodano"}: ${emoji} ${title}`);
console.log(`  plik: ${file}  |  dla: ${kids.join(", ")}  |  przedmiot: ${subject}`);
