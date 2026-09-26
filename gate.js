// Blokada Rozrywki: gra jest zasłonięta, dopóki dziecko nie uzbiera dziś progu aktywnej nauki (learn.js).
// Wstrzykiwana przez scripts/add-app.mjs do apek z przedmiotu „rozrywka”. Próg: apps.json → kids[].unlockMinutes (domyślnie 5).
(function () {
  var kid = (new URLSearchParams(location.search).get("dla") || "").replace(/[^a-z0-9-]/gi, "").toLowerCase();
  var need = 5 * 60, box = null;
  var today = function () { return new Date().toLocaleDateString("sv"); };
  function learned() {
    try { var r = JSON.parse(localStorage.getItem("nauka-czas-v1:" + kid)) || {}; return r.d === today() ? r.s || 0 : 0; }
    catch (e) { return 0; }
  }
  var locked = function () { return !kid || learned() < need; };

  // Gdy zablokowane, klawiatura nie może sterować grą pod zasłoną.
  addEventListener("keydown", function (e) { if (box) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);

  function render() {
    if (!locked()) { if (box) { box.remove(); box = null; } return; }
    var s = learned(), min = Math.floor(s / 60), left = Math.max(1, Math.ceil((need - s) / 60)), p = Math.min(100, Math.round(100 * s / need));
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("role", "dialog");
      box.style.cssText = "position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:24px;" +
        "background:rgba(10,14,30,.94);color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;touch-action:none";
      ["pointerdown", "pointerup", "touchstart", "touchmove", "click"].forEach(function (ev) {
        box.addEventListener(ev, function (e) { if (!e.target.closest("a")) { e.stopPropagation(); e.preventDefault(); } }, { passive: false });
      });
      document.body.appendChild(box);
    }
    box.innerHTML = !kid
      ? '<div style="max-width:340px"><div style="font-size:64px">🔒</div><h2 style="margin:8px 0">Otwórz grę ze swojej listy</h2>' +
        '<a href="../" style="display:inline-block;margin-top:14px;background:#3DDC97;color:#10261C;font-weight:800;font-size:19px;padding:14px 22px;border-radius:14px;text-decoration:none">🎒 Do listy</a></div>'
      : '<div style="max-width:340px"><div style="font-size:64px;line-height:1">🔒</div>' +
        '<h2 style="margin:12px 0 6px;font-size:26px">Najpierw nauka, potem zabawa!</h2>' +
        '<p style="margin:0 0 14px;opacity:.85;font-size:17px;line-height:1.4">Poucz się jeszcze <b>' + left + ' min</b> w dowolnej apce do nauki, a gry odblokują się do końca dnia.</p>' +
        '<div style="height:12px;background:rgba(255,255,255,.15);border-radius:8px;overflow:hidden"><div style="height:100%;width:' + p + '%;background:#3DDC97"></div></div>' +
        '<p style="margin:8px 0 18px;opacity:.75;font-size:15px">Dzisiaj: ' + min + ' z ' + Math.round(need / 60) + ' min</p>' +
        '<a href="../#/' + kid + '" style="display:inline-block;background:#3DDC97;color:#10261C;font-weight:800;font-size:19px;padding:14px 22px;border-radius:14px;text-decoration:none">📚 Idę się uczyć</a></div>';
  }

  render();
  fetch("../apps.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (j) {
    var k = (j.kids || []).filter(function (x) { return x.id === kid; })[0];
    if (k && k.unlockMinutes) { need = k.unlockMinutes * 60; render(); }
  }).catch(function () {});
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
  addEventListener("pageshow", render);
})();
