# Apki do nauki (strona-matka)

Statyczna strona na GitHub Pages z listą mini-apek HTML dla dzieci (Wiktor, Igor, Zoja), z podziałem na przedmioty.

- `index.html` – strona-matka (wybór dziecka → lista apek wg przedmiotów). Czyta `apps.json`, nie wymaga budowania.
- `apps.json` – dzieci (`kids`), przedmioty (`subjects`), apki (`apps`). Jedyne źródło prawdy dla listy.
- `apps/<slug>.html` – same apki, każda w jednym samodzielnym pliku HTML.
- `scripts/add-app.mjs` – dodaje/podmienia apkę: kopiuje plik, wstawia `noindex`, dopisuje wpis do `apps.json`.

## Dodanie apki

```bash
node scripts/add-app.mjs --file /ścieżka/apka.html --kids wiktor --subject biologia --desc "Krótki opis"
```

- `--kids` – jedno lub kilka id po przecinku (`wiktor,igor`).
- Tytuł i emoji brane są z `<title>` i favicony-emoji; nadpisz `--title` / `--emoji`.
- Poprawka istniejącej apki: ten sam plik/slug + `--replace` (zachowuje datę dodania, dziecko widzi „NOWE”).
- Nowy przedmiot lub dziecko: dopisz do `subjects` / `kids` w `apps.json`.

Potem commit i push na `main` – GitHub Pages publikuje w ~1 minutę.

## Zasady dla apek

- Jeden plik HTML, bez zewnętrznych plików lokalnych (dozwolone CDN i Google Fonts).
- Strona-matka otwiera apkę z `?dla=<id dziecka>` (np. `apps/x.html?dla=zoja`). Apka dla kilkorga dzieci powinna z tego brać imię i klucz `localStorage` (np. `nazwa-v1:zoja`), żeby postępy się nie mieszały; bez parametru – krótki wybór „Kto ćwiczy?” spośród dzieci, dla których jest apka. Apka dla jednego dziecka może mieć imię wpisane na sztywno – nie pytaj o imię.
- Po polsku, działa na telefonie (viewport, duże przyciski), bez danych osobowych poza imieniem dziecka.
