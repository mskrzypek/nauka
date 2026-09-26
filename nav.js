// Przycisk powrotu do listy apek. Wstrzykiwany do każdej apki przez scripts/add-app.mjs.
// Widoczny tylko w trybie ikonki na ekranie początkowym (PWA), bo tam nie ma paska przeglądarki
// ani przycisku „wstecz”. Podgląd w zwykłej przeglądarce: dopisz &nav=1 do adresu.
(function () {
  var q = new URLSearchParams(location.search);
  var standalone = navigator.standalone === true ||
    (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  if (!standalone && q.get("nav") !== "1") return;

  var kid = (q.get("dla") || "").replace(/[^a-z0-9-]/gi, "");
  var a = document.createElement("a");
  a.href = "../" + (kid ? "#/" + kid : "");
  a.setAttribute("aria-label", "Wróć do listy apek");
  a.textContent = "🎒";
  a.style.cssText = [
    "position:fixed", "z-index:2147483647",
    "left:max(10px, env(safe-area-inset-left))", "bottom:max(10px, env(safe-area-inset-bottom))",
    "width:46px", "height:46px", "border-radius:50%", "display:grid", "place-items:center",
    "font-size:24px", "line-height:1", "text-decoration:none",
    "background:rgba(255,255,255,.88)", "border:1px solid rgba(0,0,0,.12)",
    "box-shadow:0 2px 10px rgba(0,0,0,.18)",
    "-webkit-backdrop-filter:blur(6px)", "backdrop-filter:blur(6px)",
    "-webkit-tap-highlight-color:transparent"
  ].join(";");
  (document.body ? Promise.resolve() : new Promise(function (r) { document.addEventListener("DOMContentLoaded", r); }))
    .then(function () { document.body.appendChild(a); });
})();
