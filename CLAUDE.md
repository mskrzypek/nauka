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
- Nowy przedmiot lub dziecko: dopisz do `subjects` / `kids` w `apps.json`. Po dodaniu dziecka (lub zmianie koloru) uruchom `node scripts/pwa.mjs` – wygeneruje jego manifest i ikonki.

Potem commit i push na `main` – GitHub Pages publikuje w ~1 minutę.

## Słówka z niemieckiego (Wiktor)

- `apps/niemiecki.html` czyta słówka z `apps/niemiecki-slowka.json` (tego pliku nie kopiuje `add-app.mjs` – edytuj go bezpośrednio w repo).
- Nowa lekcja = nowy obiekt **na końcu** `lessons` (`id`, `title`, `words`). Ostatnia lekcja jest pokazywana jako „Na najbliższą lekcję”, starsze wracają w powtórkach (odstępy 1–2–4–7–14–30 dni).
- Nie zmieniaj `id` lekcji ani `pl`/`de` istniejących słówek – po nich zapisany jest postęp. Rzeczowniki z rodzajnikiem (`die Blumen`), `note` np. „l.mn.”, `alt` – inne poprawne odpowiedzi, `type: "zdanie"` – bez wielkości liter i interpunkcji.

## Słówka z angielskiego

- `apps/angielski.html` to ta sama apka co niemiecka, ale czyta `apps/angielski-<dziecko>.json` (dziecko z `?dla=`; teraz jest tylko `angielski-igor.json`). Zasady dopisywania lekcji i pól są w `_opis` pliku; odpowiedź jest w polu `en`.
- Słówka dla kolejnego dziecka: nowy plik `angielski-<dziecko>.json` i dopisanie dziecka do `kids` apki w `apps.json`.

## Państwa świata

- `apps/panstwa.html` czyta kraje z `apps/panstwa.json` (edytuj bezpośrednio w repo). Kontury, mapy i sąsiedzi są liczeni z mapy `world-atlas` (CDN), flagi z `flag-icons` (CDN) – dla nowego kraju wystarczy wpis w JSON z poprawnym kodem `iso` (alfa-2).
- Stan: komplet 193 państw ONZ + Watykan + Kosowo, Tajwan i Palestyna z dopiskiem `status` (197).
- Pola i zasady opisuje `_opis` w pliku. Ciekawostka (`fact`) nie może zawierać nazwy kraju. Sąsiadów przez terytoria zamorskie wyklucz w `noNeighbors`.

## PWA (ikonka na ekranie iPhone'a)

- `manifest.webmanifest` + `icons/nauka-*.png` – ogólne; `manifest-<dziecko>.webmanifest` + `icons/<dziecko>-*.png` – per dziecko (start `./?dla=<dziecko>`, etykieta „Nauka”). Generuje je `scripts/pwa.mjs` z szablonu `tools/icon.html` (headless Chrome + ImageMagick).
- `index.html` podmienia manifest i `apple-touch-icon` na dziecięce na stronie `#/<dziecko>`, więc „Dodaj do ekranu początkowego” z tej strony daje ikonkę dziecka.
- `nav.js` – przycisk 🎒 powrotu do listy (lewy dolny róg), widoczny tylko w trybie ikonki; `add-app.mjs` wstawia go do każdej apki. Podgląd w przeglądarce: `&nav=1`.

## Rozrywka zablokowana do czasu nauki

- `learn.js` – w każdej apce do nauki liczy **aktywny** czas (apka na ekranie + klik/przewinięcie w ciągu 30 s) do `localStorage["nauka-czas-v1:<dziecko>"]`; pokazuje komunikat po przekroczeniu progu.
- `gate.js` – w każdej apce z przedmiotu `rozrywka` zasłania grę, dopóki dziecko nie uzbiera dziś progu; próg: `kids[].unlockMinutes` w `apps.json` (teraz 5 min). Odblokowanie trwa do końca dnia.
- `index.html` pokazuje „Dzisiaj nauki: X min” i kłódkę z paskiem postępu w sekcji Rozrywka.
- `add-app.mjs` sam wstawia `learn.js` albo `gate.js` zależnie od `--subject` – nie dodawaj ich ręcznie.
- Postęp jest na urządzeniu (osobno w ikonce PWA i w Safari) – to blokada dla dzieci, nie zabezpieczenie.

## Zasady dla apek

- Jeden plik HTML, bez zewnętrznych plików lokalnych (dozwolone CDN i Google Fonts).
- Strona-matka otwiera apkę z `?dla=<id dziecka>` (np. `apps/x.html?dla=zoja`). Apka dla kilkorga dzieci powinna z tego brać imię i klucz `localStorage` (np. `nazwa-v1:zoja`), żeby postępy się nie mieszały; bez parametru – krótki wybór „Kto ćwiczy?” spośród dzieci, dla których jest apka. Apka dla jednego dziecka może mieć imię wpisane na sztywno – nie pytaj o imię.
- Po polsku, działa na telefonie od 375 px szerokości (viewport, duże przyciski, bez poziomego scrolla); nie kładź ważnych przycisków w lewym dolnym rogu (tam jest 🎒), bez danych osobowych poza imieniem dziecka.
