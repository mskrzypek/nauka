// Licznik aktywnego czasu nauki – z niego wynika, czy Rozrywka jest odblokowana (patrz gate.js).
// Wstrzykiwany przez scripts/add-app.mjs do każdej apki spoza przedmiotu „rozrywka”.
// Liczy się sekunda, gdy apka jest na ekranie, a dziecko coś kliknęło/przewinęło w ciągu ostatnich 30 s.
// Zapis: localStorage["nauka-czas-v1:<dziecko>"] = { d: "RRRR-MM-DD", s: sekundy dziś, apps: {slug: s}, hist: {data: s} }
(function () {
  var IDLE = 30000, last = Date.now(), prev = Date.now(), need = 5 * 60;
  var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var kid = function () { return (new URLSearchParams(location.search).get("dla") || "").replace(/[^a-z0-9-]/gi, "").toLowerCase(); };
  var today = function () { return new Date().toLocaleDateString("sv"); };
  var key = function (k) { return "nauka-czas-v1:" + k; };
  function read(k) { try { return JSON.parse(localStorage.getItem(key(k))) || {}; } catch (e) { return {}; } }

  ["pointerdown", "keydown", "input", "scroll", "touchmove", "wheel"].forEach(function (ev) {
    addEventListener(ev, function () { last = Date.now(); }, { passive: true, capture: true });
  });

  // Próg odblokowania dziecka z apps.json (kids[].unlockMinutes), domyślnie 5 min.
  fetch("../apps.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) {
    var k = (j.kids || []).filter(function (x) { return x.id === kid(); })[0];
    if (k && k.unlockMinutes) need = k.unlockMinutes * 60;
  }).catch(function () {});

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translateX(-50%);z-index:2147483646;" +
      "background:#1C7F54;color:#fff;font:700 17px system-ui,-apple-system,sans-serif;padding:12px 18px;border-radius:14px;" +
      "box-shadow:0 6px 20px rgba(0,0,0,.25);text-align:center;max-width:90vw";
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 4500);
  }

  setInterval(function () {
    var now = Date.now(), dt = Math.min(2000, now - prev); prev = now;
    var k = kid();
    if (!k || document.hidden || now - last > IDLE) return;
    var r = read(k), d = today();
    if (r.d !== d) {
      r.hist = r.hist || {};
      if (r.d && r.s) r.hist[r.d] = Math.round(r.s);
      var days = Object.keys(r.hist).sort(); while (days.length > 30) delete r.hist[days.shift()];
      r.d = d; r.s = 0; r.apps = {}; r.told = false;
    }
    r.s = (r.s || 0) + dt / 1000;
    r.apps = r.apps || {}; r.apps[slug] = (r.apps[slug] || 0) + dt / 1000;
    if (!r.told && r.s >= need) { r.told = true; toast("🎮 Brawo! Rozrywka odblokowana na dziś."); }
    try { localStorage.setItem(key(k), JSON.stringify(r)); } catch (e) {}
  }, 1000);
})();
