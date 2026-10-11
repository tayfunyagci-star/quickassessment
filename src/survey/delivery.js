/* =====================================================================
   TESLİM — İLETİŞİM BİLGİSİ, ŞİFRELEME VE İNDİRME (çevrimdışı)
   ---------------------------------------------------------------------
   Anket tamamlandığında:
     1) Katılımcıdan kurumsal e-posta + telefon alınır ve aydınlatma
        metni onayı istenir.
     2) Cevaplar cihazda AES-256-GCM ile şifrelenir ve dosya indirilir.
     3) Açma şifresi yalnızca ekranda gösterilir; katılımcı dosyayı
        e-postayla, şifreyi farklı bir kanaldan (telefon/SMS) iletir.
   Bu dosya hiçbir ağ isteği yapmaz (CSP: connect-src 'none').
   ===================================================================== */

var TESLIM_ALICI = (SURVEY.meta && SURVEY.meta.contactEmail) || "webrequest@scaleteknoloji.com";
var gonderimMesgul = false;

function dgEl(id){ return document.getElementById(id); }

function dgAdim(ad){
  ["doneContact", "doneFinal"].forEach(function (k) {
    var el = dgEl(k); if (el) el.classList.toggle("hidden", k !== ad);
  });
  window.scrollTo(0, 0);
}

function dgHata(id, mesaj){
  var el = dgEl(id);
  if (!el) return;
  el.textContent = mesaj || "";
  el.classList.toggle("hidden", !mesaj);
}

function dgMesgul(btnId, mesgul, etiket){
  var b = dgEl(btnId);
  if (!b) return;
  b.disabled = mesgul;
  if (mesgul) { b.dataset.eski = b.textContent; b.textContent = etiket || "Şifreleniyor…"; }
  else if (b.dataset.eski) { b.textContent = b.dataset.eski; }
}

function gecerliEposta(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function gecerliTelefon(v){ return (v.replace(/\D/g, "").length >= 10); }

/* ---------- iletişim bilgileri ---------- */
function iletisimOku(){
  return {
    email: (dgEl("cEmail").value || "").trim().toLowerCase(),
    telefon: (dgEl("cPhone").value || "").trim(),
    onay: !!dgEl("cConsent").checked
  };
}

function iletisimDogrula(k, onayZorunlu){
  if (!gecerliEposta(k.email)) return "Geçerli bir e-posta adresi girin.";
  if (!gecerliTelefon(k.telefon)) return "Geçerli bir telefon numarası girin (en az 10 hane).";
  if (onayZorunlu && !k.onay) return "Devam edebilmek için aydınlatma metnini onaylamanız gerekir.";
  return "";
}

/* ---------- şifreleme + indirme ---------- */
async function paketHazirla(){
  state.contact = {
    email: (dgEl("cEmail").value || "").trim().toLowerCase(),
    telefon: (dgEl("cPhone").value || "").trim(),
    onay: !!dgEl("cConsent").checked,
    onayZamani: new Date().toISOString()
  };
  currentPassword = generateSubmissionPassword();
  lastEnvelope = await encryptJsonPayload(buildSubmission(), currentPassword);
  return lastEnvelope;
}

function paketDosyaAdi(){
  return "Siber_Olgunluk_Cevaplari_" + slugForFilename(state.orgName) + "_" +
         new Date().toISOString().slice(0, 10) + ".json";
}

function paketIndir(){
  if (!lastEnvelope) return;
  var blob = new Blob([JSON.stringify(lastEnvelope)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = paketDosyaAdi();
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

/* ---------- son ekran ---------- */
function sonEkran(){
  dgEl("clientPasswordOut").textContent = currentPassword || "--------";
  var not = dgEl("deliveryNote");
  not.className = "delivery-note";
  not.innerHTML = "İndirilen şifreli dosyayı <b>" + esc(TESLIM_ALICI) + "</b> adresine e-posta ile gönderin, " +
    "yukarıdaki şifreyi ise <b>farklı bir kanaldan</b> (telefon veya SMS) iletin.";
  dgAdim("doneFinal");
}

/* Başlangıç kartındaki süre notu, anket havuzundan hesaplanan gerçek süreyi yazar. */
function sureNotu(){
  var sure = dgEl("statTime"), not = dgEl("startNote");
  if (sure && not && sure.textContent && sure.textContent !== "—") {
    not.textContent = "Ortalama " + sure.textContent + " sürer. İlerlemeniz cihazınızda saklanır; " +
      "istediğiniz zaman ara verip kaldığınız yerden devam edebilirsiniz.";
  }
}

function sifreKopyala(){
  if (!currentPassword) return;
  var btn = dgEl("btnCopyPassword"), lbl = dgEl("copyBtnLabel");
  var bitti = function () {
    btn.classList.add("copied"); lbl.textContent = "Kopyalandı";
    setTimeout(function () { btn.classList.remove("copied"); lbl.textContent = "Kopyala"; }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(currentPassword).then(bitti).catch(bitti);
  else bitti();
}

/* ---------- olaylar ---------- */
function iletisimBagla(){
  var alici = dgEl("deliveryEmailOut");
  if (alici) alici.textContent = TESLIM_ALICI;
  dgEl("btnEncrypt").addEventListener("click", async function () {
    if (gonderimMesgul) return;
    var k = iletisimOku();
    var h = iletisimDogrula(k, true);
    if (h) { dgHata("contactErr", h); return; }
    dgHata("contactErr", "");
    gonderimMesgul = true; dgMesgul("btnEncrypt", true, "Şifreleniyor…");
    try {
      await paketHazirla();
      paketIndir();
      sonEkran();
    } catch (e) {
      dgHata("contactErr", "Dosya şifrelenemedi: " + e.message);
    } finally {
      gonderimMesgul = false; dgMesgul("btnEncrypt", false);
    }
  });
  dgEl("btnRedownload").addEventListener("click", paketIndir);
  dgEl("btnClientRestart").addEventListener("click", function () {
    clearProgress(); resetState(""); lastEnvelope = null; currentPassword = null;
    showScreen("landing");
  });
  dgEl("btnCopyPassword").addEventListener("click", sifreKopyala);
  sureNotu();
}

/* Anket bittiğinde çağrılır (survey motorundaki finishAssessment). */
function finishAssessmentSite(){
  clearProgress();
  lastEnvelope = null; currentPassword = null;
  showScreen("clientDone");
  dgHata("contactErr", "");
  dgAdim("doneContact");
  if (!cryptoKullanilabilir()) {
    dgHata("contactErr", "Tarayıcınız güvenli şifreleme (Web Crypto) arayüzünü kullanıma açmadı. " +
      "Lütfen güncel bir Chrome, Edge, Firefox veya Safari sürümüyle açın.");
    dgEl("btnEncrypt").disabled = true;
  }
}

function cryptoKullanilabilir(){
  return !!(window.crypto && window.crypto.subtle && window.crypto.subtle.encrypt);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iletisimBagla);
else iletisimBagla();
