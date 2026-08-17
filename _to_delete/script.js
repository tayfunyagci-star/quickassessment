// Scale Teknoloji — ortak site davranışları
// Not: Site tek temalıdır (Hizmet Kataloğu paleti). Tema geçiş kodu kaldırılmıştır.

document.addEventListener('DOMContentLoaded', function () {

  // Eski karanlık tema tercihini temizle (geriye dönük)
  try { window.localStorage.removeItem('scaleTeknolojiTema'); } catch (e) {}

  // Mobil menü aç/kapat
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Kaydırınca içeriği kademeli göster (reduced-motion kullanıcıları için devre dışı)
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (!prefersReduced && 'IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Çerez onay çubuğu
  var cookieBar = document.querySelector('.cookie-bar');
  if (cookieBar) {
    var CONSENT_KEY = 'scaleTeknolojiCerezTercihi';
    var mevcutTercih;
    try { mevcutTercih = window.localStorage.getItem(CONSENT_KEY); } catch (e) { mevcutTercih = null; }

    if (!mevcutTercih) {
      window.setTimeout(function () { cookieBar.classList.add('show'); }, 500);
    }

    cookieBar.querySelectorAll('[data-cerez-tercih]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try { window.localStorage.setItem(CONSENT_KEY, btn.getAttribute('data-cerez-tercih')); } catch (e) {}
        cookieBar.classList.remove('show');
      });
    });
  }
});
