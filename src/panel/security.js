/* =====================================================================
   GÜVENLİK — iki adımlı doğrulama (TOTP) ve oturum
   ---------------------------------------------------------------------
   Kurulum/kapatma bu dosyanın kasası değiştirilmiş yeni bir kopyasını
   indirir (GATE.selfCopy); şifreli panel içeriği aynen kalır.
   Oturum 30 dakika işlem yapılmazsa kendiliğinden kapanır.
   ===================================================================== */
const TFA_ISSUER = "Scale Analiz Paneli", TFA_ACCOUNT = "Danışman";
const IDLE_MS = 30 * 60 * 1000;
let tfaPendingFile = null;   /* bu oturumda indirilen yeni kopyanın durumu: "on" | "off" */
let tfaDraftSecret = null;

function selfFileName(){ return "Siber_Olgunluk_Analiz_Paneli.html"; }
function groupSecret(s){ return s.replace(/(.{4})/g, "$1 ").trim(); }
function downloadHtml(html, name){
  const blob = new Blob([html], { type:"text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function renderTfaBanner(){
  const b = document.getElementById("tfaBanner");
  let html = "";
  if(tfaPendingFile === "on") html = "<b>İki adımlı doğrulama etkinleştirildi.</b> Yeni panel dosyası indirildi. Açık olan bu kopya hâlâ yalnızca parolayla açılıyor — eski dosyayı silip indirilen dosyayı kullanın.";
  else if(tfaPendingFile === "off") html = "<b>İki adımlı doğrulama kapatıldı.</b> İki adımlı doğrulama içermeyen yeni dosya indirildi; eski dosyayı yenisiyle değiştirin.";
  else if(!TOTP_VAULT) html = "<b>İki adımlı doğrulama kurulu değil.</b> Panel yalnızca parolayla korunuyor. Aşağıdan kurabilirsiniz.";
  b.innerHTML = html; b.classList.toggle("hidden", !html);
}

function renderSecurity(mode){
  renderTfaBanner();
  const holder = document.getElementById("tfaHolder");
  const on = !!TOTP_VAULT && tfaPendingFile !== "off";
  if(mode === "enroll" || (!on && !mode)){
    tfaDraftSecret = tfaDraftSecret || QA_TOTP.randomSecret(20);
    const uri = QA_TOTP.buildOtpauth({ issuer:TFA_ISSUER, account:TFA_ACCOUNT, secret:tfaDraftSecret });
    let qrSvg = "";
    try{ const qr = qrcode(0, "M"); qr.addData(uri); qr.make(); qrSvg = qr.createSvgTag({ cellSize:4, margin:2, scalable:true }); }catch(e){ qrSvg = ""; }
    holder.innerHTML =
      '<div class="tfa-panel"><h3>İki adımlı doğrulama kurulumu</h3>' +
      '<ol class="tfa-steps">' +
        '<li>Kimlik Doğrulayıcı uygulamasında <b>Hesap Ekle</b> deyip aşağıdaki <b>otpauth bağlantısını</b> yapıştırın (veya anahtarı elle girin). Telefon uygulaması kullanıyorsanız QR kodu okutun.</li>' +
        '<li>Uygulamada görünen 6 haneli kodu ve panel parolanızı girin.</li>' +
        '<li><b>Doğrula ve Etkinleştir</b> deyin; iki adımlı doğrulama içeren yeni panel dosyası iner. Eski dosyayı silip yenisini kullanın.</li>' +
      '</ol><div class="tfa-grid"><div class="tfa-qr">' + qrSvg + '</div><div>' +
        '<label>Gizli anahtar (Base32)</label><div class="tfa-secret mono" id="tfaSecret">' + esc(groupSecret(tfaDraftSecret)) + '</div>' +
        '<label>otpauth bağlantısı</label><div class="tfa-uri mono" id="tfaUri">' + esc(uri) + '</div>' +
        '<div class="tfa-actions"><button class="btn btn-ghost" id="btnTfaCopyUri" type="button">Bağlantıyı Kopyala</button>' +
        '<button class="btn btn-ghost" id="btnTfaNewSecret" type="button">Yeni Anahtar Üret</button></div>' +
        '<div class="field-row"><div class="field"><label for="tfaPw">Panel parolası</label><input type="password" id="tfaPw" autocomplete="current-password"></div>' +
        '<div class="field"><label for="tfaCode">Doğrulama kodu</label><input type="text" id="tfaCode" inputmode="numeric" maxlength="7" autocomplete="one-time-code" class="mono"></div></div>' +
        '<div class="gate-err" id="tfaErr"></div>' +
        '<div class="tfa-actions"><button class="btn btn-primary" id="btnTfaEnable" type="button">Doğrula ve Etkinleştir</button>' +
        (on ? '<button class="btn btn-ghost" id="btnTfaCancel" type="button">Vazgeç</button>' : '') + '</div>' +
      '</div></div></div>';
    document.getElementById("btnTfaCopyUri").onclick = () => navigator.clipboard && navigator.clipboard.writeText(uri)
      .then(() => { document.getElementById("btnTfaCopyUri").textContent = "Kopyalandı"; }).catch(() => {});
    document.getElementById("btnTfaNewSecret").onclick = () => { tfaDraftSecret = QA_TOTP.randomSecret(20); renderSecurity("enroll"); };
    const cancel = document.getElementById("btnTfaCancel");
    if(cancel) cancel.onclick = () => { tfaDraftSecret = null; renderSecurity("manage"); };
    document.getElementById("btnTfaEnable").onclick = async () => {
      const err = document.getElementById("tfaErr"), btn = document.getElementById("btnTfaEnable");
      const pw = document.getElementById("tfaPw").value, code = document.getElementById("tfaCode").value;
      err.textContent = ""; btn.disabled = true;
      try{
        if(await GATE.openPayload(pw) == null){ err.textContent = "Panel parolası hatalı."; return; }
        const step = await QA_TOTP.verify(tfaDraftSecret, code, { window:1 });
        if(step == null){ err.textContent = "Kod doğrulanamadı. Uygulamadaki güncel kodu girin; cihaz saatinin doğru olduğundan emin olun."; return; }
        const vault = { v:1, issuer:TFA_ISSUER, account:TFA_ACCOUNT, algorithm:"SHA1", digits:6, period:30,
                        enrolledAt:new Date().toISOString(), box: await QA_TOTP.sealText(tfaDraftSecret, pw) };
        downloadHtml(GATE.selfCopy(vault), selfFileName());
        GATE.markStep(step);
        tfaPendingFile = "on"; tfaDraftSecret = null;
        document.getElementById("tfaHolder").innerHTML = "";
        renderTfaBanner();
      }catch(e){ err.textContent = "Dosya üretilemedi: " + e.message; }
      finally{ btn.disabled = false; }
    };
    return;
  }
  if(!on){ holder.innerHTML = ""; return; }
  /* etkin: anahtarı yenile / kapat */
  holder.innerHTML =
    '<div class="tfa-panel"><h3>İki adımlı doğrulama <span class="tfa-status on">Etkin</span></h3>' +
    '<p class="sub">Hesap: ' + esc(TOTP_VAULT.issuer) + ' · ' + esc(TOTP_VAULT.account) + ' — kurulum ' +
      esc(new Date(TOTP_VAULT.enrolledAt).toLocaleString("tr-TR")) + '. Anahtarı yenilemek veya kapatmak için parolanızı ve güncel kodu girin.</p>' +
    '<div class="field-row"><div class="field"><label for="tfaPw">Panel parolası</label><input type="password" id="tfaPw" autocomplete="current-password"></div>' +
    '<div class="field"><label for="tfaCode">Güncel doğrulama kodu</label><input type="text" id="tfaCode" inputmode="numeric" maxlength="7" class="mono"></div></div>' +
    '<div class="gate-err" id="tfaErr"></div>' +
    '<div class="tfa-actions"><button class="btn btn-ghost" id="btnTfaRotate" type="button">Anahtarı Yenile</button>' +
    '<button class="btn btn-ghost danger" id="btnTfaDisable" type="button">Devre Dışı Bırak</button></div></div>';
  const check = async () => {
    const err = document.getElementById("tfaErr");
    const r = await GATE.verify(document.getElementById("tfaPw").value, document.getElementById("tfaCode").value, TOTP_VAULT);
    if(!r.ok){ err.textContent = r.msg; return false; }
    GATE.markStep(r.step); return true;
  };
  document.getElementById("btnTfaRotate").onclick = async () => { if(await check()){ tfaDraftSecret = QA_TOTP.randomSecret(20); renderSecurity("enroll"); } };
  document.getElementById("btnTfaDisable").onclick = async () => {
    if(!await check()) return;
    if(!confirm("İki adımlı doğrulama kapatılacak ve panel yalnızca parolayla korunacak. Emin misiniz?")) return;
    downloadHtml(GATE.selfCopy(null), selfFileName());
    tfaPendingFile = "off"; document.getElementById("tfaHolder").innerHTML = ""; renderTfaBanner();
  };
}

/* İşlemsiz kalan oturum kapanır (bellekteki çözülmüş veriler silinir). */
(function(){
  let last = Date.now();
  ["mousemove","keydown","click","scroll","touchstart"].forEach(ev => document.addEventListener(ev, () => { last = Date.now(); }, { passive:true }));
  setInterval(() => { if(Date.now() - last > IDLE_MS) location.reload(); }, 30 * 1000);
})();
