// Tema başlatıcı — <head> içinde, gövde çizilmeden önce çalışır ki tema
// tercihi olan kullanıcı sayfa yüklenirken yanlış temayı görüp "yanıp sönme"
// yaşamasın. CSP satır içi betiğe izin vermediği için ayrı dosyadır.
//
// Varsayılan tema koyudur; tercih tarayıcıda localStorage ile saklanır
// (sunucuya gönderilmez — tema kurum verisi değil, cihaz tercihi).
(function () {
  "use strict";
  var tema = "dark";
  try {
    var kayitli = localStorage.getItem("arayuz-tema");
    if (kayitli === "light" || kayitli === "dark") {
      tema = kayitli;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      tema = "light";
    }
  } catch (e) { /* localStorage kapalıysa koyu temayla devam */ }
  document.documentElement.setAttribute("data-theme", tema);
})();
