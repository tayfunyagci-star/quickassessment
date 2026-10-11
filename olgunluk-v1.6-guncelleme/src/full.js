(function(){
"use strict";
/* =========================================================
   DAHİLİ MODÜL — yalnızca danışmanlık tarafında kalır.
   Yönetici paneli, cevap dosyası içe aktarma, puanlama, sonuç
   ekranı, Word rapor ve müşteri modülü üretimi burada yer alır.
   Müşteri modülü üretilirken bu blok (data-full) tamamen çıkarılır.
========================================================= */
const C = window.QA_CORE;
const { S, esc, uid, clone, DIM_KEYS, DIM_LABELS, OUT_OF_SCOPE } = C;

const ADMIN_HASH = "__ADMIN_HASH__"; // SHA-256("qa-admin|" + parola)
const LS_QUESTIONS = "qa_questions_v1";
const LS_ISSUED = "qa_issued_sets_v1";

const REG_FW_KEYS = ["7545","BIGR","KVKK","ISO27001"];
const REG_LABELS = { "7545":"7545 Sayılı Siber Güvenlik Kanunu", "BIGR":"BİGR (Bilgi ve İletişim Güvenliği Rehberi)", "KVKK":"KVKK", "ISO27001":"ISO/IEC 27001" };
const REG_LABELS_SHORT = { "7545":"7545", "BIGR":"BİGR", "KVKK":"KVKK", "ISO27001":"ISO 27001" };
const BAND_LABELS = { 1:"Geliştirilmesi Gereken", 2:"Başlangıç Seviyesi", 3:"Yeterli Seviye", 4:"İyi Seviye", 5:"Örnek Seviye" };
const TARGET_LEVEL = 3;
const IMPACT_WEIGHT = { "Çok Yüksek Etki":4, "Yüksek Etki":3, "Orta Etki":2, "Düşük Etki":1 };
const IMPACT_LEVELS = ["Düşük Etki","Orta Etki","Yüksek Etki","Çok Yüksek Etki"];
const UCT_DOMAINS = [
  "Varlık ve Yapılandırma Yönetimi","Kimlik ve Erişim Yönetimi","Ağ ve İletişim Güvenliği",
  "Veri ve Kriptografi Güvenliği","Tehdit ve Zafiyet Yönetimi","Olay Müdahale, İzleme ve Süreklilik",
  "Uygulama ve Sistem Güvenliği","Fiziksel Güvenlik","Yönetişim, Risk ve Uyumluluk",
  "İnsan Kaynakları Güvenliği","Tedarikçi ve Üçüncü Taraf Güvenliği",
];

/* ---------------- Soru bankası (yönetici düzenlemeleri) ---------------- */
function loadQuestions(){
  try{ const raw = localStorage.getItem(LS_QUESTIONS); if(raw) return C.normalizeQuestions(JSON.parse(raw)); }catch(e){}
  return clone(C.DEFAULT_QUESTIONS);
}
function saveQuestions(){
  try{ localStorage.setItem(LS_QUESTIONS, JSON.stringify(S.questions)); }catch(e){}
  C.renderDomainCloud(); C.updateLandingMeta();
}
/* Gönderilen müşteri modüllerinin tam soru setleri (mevzuat eşlemesi dahil) — sonradan
   soru bankası değişse bile, dönen cevap dosyası doğru setle analiz edilebilsin diye. */
function loadIssuedSets(){ try{ return JSON.parse(localStorage.getItem(LS_ISSUED) || "{}"); }catch(e){ return {}; } }
function saveIssuedSet(hash, questions){
  const all = loadIssuedSets();
  all[hash] = { date: new Date().toISOString(), count: questions.length, questions: clone(questions) };
  const keys = Object.keys(all).sort((a,b)=> (all[b].date||"").localeCompare(all[a].date||""));
  keys.slice(25).forEach(k => delete all[k]);
  try{ localStorage.setItem(LS_ISSUED, JSON.stringify(all)); }catch(e){}
}

/* ---------------- Yönetici oturumu (parola + TOTP) ---------------- */
/* İki adımlı doğrulama kasası: TOTP gizli anahtarı yönetici parolasıyla (PBKDF2 → AES-256-GCM)
   şifrelenmiş olarak bu dosyaya gömülür. null ise iki adımlı doğrulama kurulmamıştır. */
const TOTP_VAULT = null;/*@END_TOTP*/
const TFA_ISSUER = "Olgunluk Değerlendirme", TFA_ACCOUNT = "Yönetici";
const LS_LOCK = "qa_admin_lock_v1", LS_TOTP_LAST = "qa_totp_last_step_v1";
const MAX_FAILS = 5, LOCK_MS = 5 * 60 * 1000;
let adminAuthed = false;
let tfaPendingFile = null; // bu oturumda indirilen yeni dosyanın durumu ("on" | "off")

function lockState(){ try{ return JSON.parse(localStorage.getItem(LS_LOCK) || '{"fails":0,"until":0}'); }catch(e){ return { fails:0, until:0 }; } }
function setLockState(st){ try{ localStorage.setItem(LS_LOCK, JSON.stringify(st)); }catch(e){} }
function registerFail(msg){
  const st = lockState(); st.fails = (st.fails || 0) + 1;
  if(st.fails >= MAX_FAILS){ st.until = Date.now() + LOCK_MS; st.fails = 0; msg = "Çok fazla hatalı deneme. Giriş 5 dakika kilitlendi."; }
  setLockState(st);
  document.getElementById("gateErr").textContent = msg;
}
function lastStep(){ try{ return parseInt(localStorage.getItem(LS_TOTP_LAST) || "0", 10) || 0; }catch(e){ return 0; } }
function markStep(step){ try{ localStorage.setItem(LS_TOTP_LAST, String(step)); }catch(e){} }

/* Parola + kod doğrulaması; başarılıysa { secret, step } döner */
async function verifyPasswordAndCode(password, code, vault){
  const h = await C.sha256Hex("qa-admin|" + password);
  if(h !== ADMIN_HASH) return { ok:false, msg:"Parola veya doğrulama kodu hatalı." };
  if(!vault) return { ok:true };
  let secret;
  try{ secret = await QA_TOTP.openText(vault.box, password); }catch(e){ return { ok:false, msg:"Parola veya doğrulama kodu hatalı." }; }
  const step = await QA_TOTP.verify(secret, code, { window:1 });
  if(step == null) return { ok:false, msg:"Parola veya doğrulama kodu hatalı." };
  if(step <= lastStep()) return { ok:false, msg:"Bu kod zaten kullanıldı. Bir sonraki kodu bekleyin." };
  return { ok:true, secret, step };
}

async function tryAdminLogin(){
  const err = document.getElementById("gateErr");
  const st = lockState();
  if(st.until && Date.now() < st.until){
    err.textContent = `Giriş kilitli. ${Math.ceil((st.until - Date.now())/60000)} dakika sonra tekrar deneyin.`; return;
  }
  const pInp = document.getElementById("adminPassInput"), oInp = document.getElementById("adminOtpInput");
  const r = await verifyPasswordAndCode(pInp.value, oInp.value, TOTP_VAULT);
  pInp.value = ""; oInp.value = "";
  if(!r.ok){ registerFail(r.msg); return; }
  if(r.step != null) markStep(r.step);
  setLockState({ fails:0, until:0 });
  adminAuthed = true; err.textContent = "";
  const after = pendingAfterLogin; pendingAfterLogin = null;
  showAdmin();
  if(after === "export") exportClientModule();
}
let pendingAfterLogin = null;
function openAdmin(){
  if(adminAuthed){ showAdmin(); return; }
  document.getElementById("gateErr").textContent = "";
  document.getElementById("adminOtpInput").classList.toggle("hidden", !TOTP_VAULT);
  document.getElementById("gateHint").textContent = TOTP_VAULT
    ? "Parolanızı ve Kimlik Doğrulayıcı uygulamasındaki 6 haneli kodu girin."
    : "Bu alan yalnızca içerik yönetimi içindir.";
  C.showScreen("adminGate");
  setTimeout(()=> document.getElementById("adminPassInput").focus(), 50);
}
function showAdmin(){
  if(!adminAuthed){ openAdmin(); return; }
  C.showScreen("admin");
  renderAdmin2faBanner();
  renderAdminList();
}
function renderAdmin2faBanner(){
  const b = document.getElementById("admin2faBanner");
  let html = "";
  if(tfaPendingFile === "on") html = `<b>İki adımlı doğrulama etkinleştirildi.</b> Yeni uygulama dosyası indirildi. Bu açık kopya hâlâ yalnızca parolayla açılıyor — eski dosyayı silip indirilen dosyayı kullanın.`;
  else if(tfaPendingFile === "off") html = `<b>İki adımlı doğrulama kapatıldı.</b> İki adımlı doğrulama içermeyen yeni dosya indirildi; eski dosyayı yenisiyle değiştirin.`;
  else if(!TOTP_VAULT) html = `<b>İki adımlı doğrulama kurulu değil.</b> Yönetici girişi yalnızca parolayla korunuyor. "İki Adımlı Doğrulama" düğmesiyle kurabilirsiniz.`;
  b.innerHTML = html; b.classList.toggle("hidden", !html);
}

/* Uygulamanın, kasası değiştirilmiş bir kopyasını üretir */
function buildSelfCopy(vault){
  const src = window.__QA_PRISTINE;
  if(!src) throw new Error("kaynak belge bulunamadı");
  const re = /const TOTP_VAULT = [\s\S]*?;\/\*@END_TOTP\*\//;
  if(!re.test(src)) throw new Error("kasa alanı bulunamadı");
  const json = vault ? JSON.stringify(vault).replace(/</g, "\\u003c") : "null";
  return src.replace(re, () => `const TOTP_VAULT = ${json};/*@END_TOTP*/`);
}
function selfFileName(){ return `Hizli_Olgunluk_Degerlendirmesi_v${C.APP_VERSION}.html`; }

let tfaDraftSecret = null;
function groupSecret(s){ return s.replace(/(.{4})/g, "$1 ").trim(); }
function renderTfaPanel(mode){
  const holder = document.getElementById("adminFormHolder");
  const on = !!TOTP_VAULT && tfaPendingFile !== "off";
  if(mode === "enroll" || (!on && !mode)){
    tfaDraftSecret = tfaDraftSecret || QA_TOTP.randomSecret(20);
    const uri = QA_TOTP.buildOtpauth({ issuer:TFA_ISSUER, account:TFA_ACCOUNT, secret:tfaDraftSecret });
    let qrSvg = "";
    try{ const qr = qrcode(0, "M"); qr.addData(uri); qr.make(); qrSvg = qr.createSvgTag({ cellSize:4, margin:2, scalable:true }); }catch(e){ qrSvg = ""; }
    holder.innerHTML = `
      <div class="tfa-panel">
        <h3>İki Adımlı Doğrulama Kurulumu</h3>
        <div class="tfa-sub">Kurulumdan sonra yönetici girişi için parolaya ek olarak her 30 saniyede bir değişen 6 haneli kod istenir.</div>
        <ol class="tfa-steps">
          <li>Kimlik Doğrulayıcı uygulamasında <b>Hesap Ekle</b> → aşağıdaki <b>otpauth bağlantısını</b> yapıştırın (veya anahtarı elle girin). Telefon uygulaması kullanıyorsanız QR kodu okutun.</li>
          <li>Uygulamada görünen 6 haneli kodu ve yönetici parolanızı aşağıya girin.</li>
          <li><b>Doğrula ve Etkinleştir</b> deyin; iki adımlı doğrulama gömülü yeni uygulama dosyası iner. Eski dosyayı silip yenisini kullanın.</li>
        </ol>
        <div class="tfa-grid">
          <div class="tfa-qr">${qrSvg}</div>
          <div>
            <div class="form-row" style="margin-bottom:6px;"><label>Gizli anahtar (Base32)</label></div>
            <div class="tfa-secret" id="tfaSecret">${esc(groupSecret(tfaDraftSecret))}</div>
            <div class="form-row" style="margin-bottom:6px;"><label>otpauth bağlantısı</label></div>
            <div class="tfa-uri" id="tfaUri">${esc(uri)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
              <button class="btn-sm" id="btnTfaCopyUri">Bağlantıyı Kopyala</button>
              <button class="btn-sm" id="btnTfaNewSecret">Yeni Anahtar Üret</button>
            </div>
            <div class="form-grid-2">
              <div class="form-row"><label>Yönetici parolası</label><input type="password" id="tfaPw" autocomplete="current-password" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--raised);color:var(--text);"></div>
              <div class="form-row"><label>Doğrulama kodu</label><input type="text" id="tfaCode" inputmode="numeric" maxlength="7" autocomplete="one-time-code" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--raised);color:var(--text);font-family:var(--font-mono);letter-spacing:.2em;"></div>
            </div>
            <div class="gate-err" id="tfaErr" style="text-align:left;"></div>
            <div style="display:flex;gap:10px;">
              <button class="btn-sm primary" id="btnTfaEnable">Doğrula ve Etkinleştir</button>
              <button class="btn-sm" id="btnTfaCancel">Kapat</button>
            </div>
          </div>
        </div>
      </div>`;
    document.getElementById("btnTfaCopyUri").onclick = ()=> navigator.clipboard && navigator.clipboard.writeText(uri).then(()=>{ document.getElementById("btnTfaCopyUri").textContent = "Kopyalandı"; });
    document.getElementById("btnTfaNewSecret").onclick = ()=>{ tfaDraftSecret = QA_TOTP.randomSecret(20); renderTfaPanel("enroll"); };
    document.getElementById("btnTfaCancel").onclick = ()=>{ holder.innerHTML = ""; tfaDraftSecret = null; };
    document.getElementById("btnTfaEnable").onclick = async ()=>{
      const err = document.getElementById("tfaErr");
      const pw = document.getElementById("tfaPw").value, code = document.getElementById("tfaCode").value;
      if(await C.sha256Hex("qa-admin|" + pw) !== ADMIN_HASH){ err.textContent = "Yönetici parolası hatalı."; return; }
      const step = await QA_TOTP.verify(tfaDraftSecret, code, { window:1 });
      if(step == null){ err.textContent = "Kod doğrulanamadı. Uygulamadaki güncel kodu girin; cihaz saatinin doğru olduğundan emin olun."; return; }
      try{
        const vault = { v:1, issuer:TFA_ISSUER, account:TFA_ACCOUNT, algorithm:"SHA1", digits:6, period:30, enrolledAt:new Date().toISOString(), box: await QA_TOTP.sealText(tfaDraftSecret, pw) };
        const html = buildSelfCopy(vault);
        markStep(step);
        C.downloadBlob(new Blob([html], {type:"text/html"}), selfFileName());
        tfaPendingFile = "on"; tfaDraftSecret = null;
        holder.innerHTML = ""; renderAdmin2faBanner();
      }catch(e){ err.textContent = "Dosya üretilemedi: " + e.message; }
    };
    return;
  }
  // etkin durum: yönet
  holder.innerHTML = `
    <div class="tfa-panel">
      <h3>İki Adımlı Doğrulama</h3>
      <span class="tfa-status on">Etkin</span>
      <div class="tfa-sub">Hesap: ${esc(TOTP_VAULT.issuer)} · ${esc(TOTP_VAULT.account)} — kurulum tarihi ${new Date(TOTP_VAULT.enrolledAt).toLocaleString("tr-TR")}.<br>Anahtarı yenilemek veya iki adımlı doğrulamayı kapatmak için parolanızı ve güncel kodu girin.</div>
      <div class="form-grid-2">
        <div class="form-row"><label>Yönetici parolası</label><input type="password" id="tfaPw" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--raised);color:var(--text);"></div>
        <div class="form-row"><label>Güncel doğrulama kodu</label><input type="text" id="tfaCode" inputmode="numeric" maxlength="7" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--raised);color:var(--text);font-family:var(--font-mono);letter-spacing:.2em;"></div>
      </div>
      <div class="gate-err" id="tfaErr" style="text-align:left;"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-sm" id="btnTfaRotate">Anahtarı Yenile</button>
        <button class="btn-sm danger" id="btnTfaDisable">Devre Dışı Bırak</button>
        <button class="btn-sm" id="btnTfaCancel">Kapat</button>
      </div>
    </div>`;
  const check = async ()=>{
    const err = document.getElementById("tfaErr");
    const r = await verifyPasswordAndCode(document.getElementById("tfaPw").value, document.getElementById("tfaCode").value, TOTP_VAULT);
    if(!r.ok){ err.textContent = r.msg; return false; }
    markStep(r.step); return true;
  };
  document.getElementById("btnTfaCancel").onclick = ()=>{ holder.innerHTML = ""; };
  document.getElementById("btnTfaRotate").onclick = async ()=>{ if(await check()){ tfaDraftSecret = QA_TOTP.randomSecret(20); renderTfaPanel("enroll"); } };
  document.getElementById("btnTfaDisable").onclick = async ()=>{
    if(!await check()) return;
    if(!confirm("İki adımlı doğrulama kapatılacak ve yönetici girişi yalnızca parolayla korunacak. Emin misiniz?")) return;
    C.downloadBlob(new Blob([buildSelfCopy(null)], {type:"text/html"}), selfFileName());
    tfaPendingFile = "off"; holder.innerHTML = ""; renderAdmin2faBanner();
  };
}

function leaveAdmin(){
  pendingAfterLogin = null;
  if(location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
  document.getElementById("adminFormHolder").innerHTML = "";
  C.goLanding();
}

/* ---------------------------------------------------------
   Analiz bağlamı — kendi içimizde yapılan deneme veya
   müşteriden gelen dosya. Devam eden anket durumunu bozmaz.
--------------------------------------------------------- */
let analysis = null; // { questions, answers, orgName, meta:{ source, submittedAt, fileVersion, qset:{status,...} } }

function promptForPassword(){
  return new Promise(resolve=>{
    const modal = document.getElementById("passwordModal");
    const input = document.getElementById("passwordModalInput");
    const err = document.getElementById("passwordModalErr");
    err.textContent = ""; input.value = "";
    modal.classList.remove("hidden");
    input.focus();
    const cleanup = (val)=>{ modal.classList.add("hidden"); resolve(val); };
    document.getElementById("passwordModalOk").onclick = ()=> cleanup(input.value.trim());
    document.getElementById("passwordModalCancel").onclick = ()=> cleanup(null);
    input.onkeydown = (e)=>{ if(e.key==="Enter") cleanup(input.value.trim()); };
  });
}

async function resolveQuestionSet(payload){
  const currentHash = await C.qsetHash(S.questions);
  if(Array.isArray(payload.questions) && payload.questions.length){
    const rawHash = await C.qsetHash(payload.questions);              // dosyadaki haliyle (bütünlük kontrolü)
    const integrityOk = !payload.qsetHash || payload.qsetHash === rawHash;
    const normQs = C.normalizeQuestions(clone(payload.questions));     // eski etki adları → yeni adlar
    const normHash = await C.qsetHash(normQs);
    if(normHash === currentHash) return { questions: clone(S.questions), qset:{ status:"match", integrityOk } };
    const reg = loadIssuedSets(), issued = reg[rawHash] || reg[normHash];
    if(issued) return { questions: C.normalizeQuestions(clone(issued.questions)), qset:{ status:"issued", issuedAt: issued.date, integrityOk } };
    const byId = {}; S.questions.forEach(q => byId[q.id] = q);
    let enriched = 0;
    const qs = normQs.map(q => {
      const cur = byId[q.id];
      if(cur && cur.soru === q.soru){ enriched++; return Object.assign({}, q, { regulatory: clone(cur.regulatory || {}) }); }
      return Object.assign({}, q, { regulatory: {} });
    });
    return { questions: qs, qset:{ status:"snapshot", enriched, total: qs.length, integrityOk } };
  }
  // v1.0 formatı: dosyada soru seti yok — mevcut setle id üzerinden eşlenir
  const curIds = new Set(S.questions.map(q => String(q.id)));
  const fileIds = Object.keys(payload.answers || {});
  const unknownIds = fileIds.filter(id => !curIds.has(String(id))).length;
  const countMismatch = payload.questionCount != null && payload.questionCount !== S.questions.length;
  return { questions: clone(S.questions), qset:{ status: (unknownIds || countMismatch) ? "legacy-mismatch" : "legacy", unknownIds, fileCount: payload.questionCount } };
}

function importSubmissionFile(file){
  const reader = new FileReader();
  reader.onload = async (ev)=>{
    try{
      const data = JSON.parse(ev.target.result);
      let payload;
      if(data && data.type === "quickassess_encrypted_submission"){
        const pass = await promptForPassword();
        if(pass == null) return;
        payload = await C.decryptJsonPayload(data, pass);
      } else payload = data;
      if(!payload || !payload.answers || typeof payload.answers !== "object") throw new Error("geçersiz dosya — cevap verisi bulunamadı");
      const { questions, qset } = await resolveQuestionSet(payload);
      analysis = {
        questions,
        answers: C.normalizeAnswers(payload.answers, questions),
        orgName: payload.orgName || "",
        meta: { source:"import", submittedAt: payload.submittedAt || null, fileVersion: payload.appVersion || "1.0", qset },
      };
      heroMetric = "overall"; activeRegDetail = null;
      C.showScreen("results");
      renderResults();
    }catch(err){
      alert("Dosya okunamadı: " + err.message);
    }
  };
  reader.readAsText(file);
}

function qsetBannerHTML(meta){
  if(!meta || !meta.qset) return "";
  const q = meta.qset;
  const integrity = q.integrityOk === false ? " <b>Uyarı:</b> dosyadaki soru seti parmak izi tutmuyor; dosya gönderildikten sonra değiştirilmiş olabilir." : "";
  if(q.status === "match") return integrity ? `<div class="completion-banner">${integrity}</div>` : "";
  if(q.status === "issued") return `<div class="info-banner"><b>Soru seti:</b> Cevap dosyası, ${new Date(q.issuedAt).toLocaleDateString("tr-TR")} tarihinde üretilen müşteri modülünün soru setiyle doldurulmuş. Mevcut soru bankanız farklı olduğu için analiz, o tarihte kaydedilen soru setiyle yapıldı.${integrity}</div>`;
  if(q.status === "snapshot") return `<div class="completion-banner"><b>Soru seti farklı.</b> Dosya, mevcut soru bankanızdan farklı bir soru setiyle doldurulmuş ve bu set kayıtlı müşteri modülleri arasında bulunamadı. Analiz, dosyadaki soru setiyle yapıldı. Mevzuat eşlemesi ${q.enriched} / ${q.total} soru için mevcut bankadan aktarılabildi; diğer sorular regülatif analize dahil değildir.${integrity}</div>`;
  if(q.status === "legacy-mismatch") return `<div class="completion-banner"><b>Soru seti doğrulanamadı.</b> Dosya v1.0 formatında (soru seti kopyası içermiyor) ve mevcut soru bankasıyla uyuşmuyor${q.unknownIds ? ` — ${q.unknownIds} cevap mevcut sette karşılığı olmayan sorulara ait` : ""}${q.fileCount!=null ? `; dosyadaki soru sayısı ${q.fileCount}, mevcut set ${S.questions.length}` : ""}. Sonuçlar hatalı olabilir; müşteriye gönderilen soru setini "JSON İçe Aktar" ile yükleyip dosyayı yeniden açın.</div>`;
  if(q.status === "legacy") return `<div class="info-banner"><b>Soru seti:</b> Dosya v1.0 formatında; soru seti kopyası içermediği için mevcut soru bankasıyla soru numarası üzerinden eşleştirildi.</div>`;
  return "";
}

/* ---------------------------------------------------------
   Puanlama
--------------------------------------------------------- */
function weightedAvg(items){
  if(items.length === 0) return null;
  let wsum = 0, vsum = 0;
  items.forEach(x=>{ const w = IMPACT_WEIGHT[x.q.etki] || 2; wsum += w; vsum += w * x.level; });
  return wsum > 0 ? vsum / wsum : null;
}
function effectiveLevel(q, a){
  const contributing = DIM_KEYS.filter(d => q[d] !== null && (!a || a[d] !== OUT_OF_SCOPE));
  if(contributing.length === 0) return null;
  return contributing.reduce((s,d)=>{ const v = a ? a[d] : null; return s + ((typeof v === "number") ? v : 1); }, 0) / contributing.length;
}
function dimItems(questions, answerMap, d){
  return questions
    .filter(q => q[d] !== null)
    .filter(q => { const a = answerMap[q.id]; return !a || a[d] !== OUT_OF_SCOPE; })
    .map(q => { const v = answerMap[q.id] ? answerMap[q.id][d] : null; return { q, level: (typeof v === "number") ? v : 1 }; });
}
/* Öncelik: etki × olgunluk eksikliği (yalnızca asgari seviyenin altındakiler) */
function priorityOf(etki, level){
  if(level >= TARGET_LEVEL) return null;
  const w = IMPACT_WEIGHT[etki] || 2;
  if(level < 2) return w >= 3 ? P1 : (w === 2 ? P2 : P3);
  return w >= 3 ? P2 : P3;
}
const P1 = "1. Öncelik", P2 = "2. Öncelik", P3 = "3. Öncelik";
const PRIORITY_RANK = { [P1]:3, [P2]:2, [P3]:1 };

function questionStatus(q, a){
  const applicable = DIM_KEYS.filter(d => q[d] !== null);
  const na = applicable.filter(d => a && a[d] === OUT_OF_SCOPE);
  const contributing = applicable.filter(d => !(a && a[d] === OUT_OF_SCOPE));
  const answered = contributing.filter(d => a && typeof a[d] === "number");
  const missing = contributing.filter(d => !(a && typeof a[d] === "number"));
  let status;
  if(contributing.length === 0) status = "Kapsam Dışı";
  else if(missing.length === 0) status = "Tam Yanıtlandı";
  else if(answered.length === 0) status = "Yanıtlanmadı";
  else status = "Kısmen Yanıtlandı";
  return { status, na, missing, answered };
}

/* ---------------------------------------------------------
   Yanıtlar arası uyumsuzluk kontrolleri
   Sorular id + içerik anahtar kelimesiyle eşlenir; soru bankası
   değiştirilip eşleşme bozulursa ilgili kural sessizce atlanır.
--------------------------------------------------------- */
const RX = {
  "1":/yönetim/i, "2":/politika/i, "3":/envanter|veri harita/i, "4":/risk analiz/i, "6":/giriş|çıkış/i, "7":/uzaktan/i,
  "8":/doğrulama|MFA/i, "10":/yetki/i, "12":/log|denetim/i, "16":/VPN|tünel/i, "18":/yama|güncelleme/i, "21":/sızma|pentest/i,
  "22":/DLP|dışarı/i, "24":/yedek/i, "25":/yedek/i, "26":/süreklilik/i, "27":/log/i, "28":/SOC|izley/i, "29":/sözleşme/i, "30":/tedarik/i,
};
const SCOPE_RULES = [
  { a:"29", b:"30", topic:"tedarikçi / üçüncü taraf hizmeti", check:"Kurumda tedarikçi veya dış hizmet sağlayıcı ilişkisinin bulunup bulunmadığının ve ilgili yanıtların teyit edilmesi önerilir." },
  { a:"30", b:"29", topic:"tedarikçi / üçüncü taraf hizmeti", check:"Kurumda tedarikçi veya dış hizmet sağlayıcı ilişkisinin bulunup bulunmadığının ve ilgili yanıtların teyit edilmesi önerilir." },
  { a:"7",  b:"16", topic:"uzaktan çalışma / uzaktan erişim", check:"Kurumda uzaktan erişim uygulamasının bulunup bulunmadığının teyit edilmesi önerilir." },
  { a:"16", b:"7",  topic:"uzaktan çalışma / uzaktan erişim", check:"Kurumda uzaktan erişim uygulamasının bulunup bulunmadığının teyit edilmesi önerilir." },
  { a:"16", b:"8",  topic:"dışarıdan (VPN) erişim", check:"Dışarıdan erişim imkânının bulunup bulunmadığının teyit edilmesi önerilir." },
];
const DEP_RULES = [
  { hi:"25", lo:"24", txt:"yedeklerin ağdan izole bir kopyasının tutulduğu belirtilirken, düzenli yedekleme ve geri dönüş testlerine ilişkin olgunluk düşük işaretlenmiştir", check:"Yedekleme sürecinin kapsamı ve geri dönüş testlerinin uygulanma düzeyinin birlikte teyit edilmesi önerilir." },
  { hi:"26", lo:"24", txt:"test edilmiş bir iş sürekliliği planının bulunduğu belirtilirken, planın dayandığı yedeklerin geri dönüş testleriyle doğrulanmasına ilişkin olgunluk düşük işaretlenmiştir", check:"İş sürekliliği testlerinin yedekten geri dönüş adımlarını kapsayıp kapsamadığının teyit edilmesi önerilir." },
  { hi:"28", lo:"27", txt:"7/24 izleme ve müdahale (SOC) hizmetinin olgun olduğu belirtilirken, bu hizmetin dayandığı merkezi log yönetimine ilişkin olgunluk düşük işaretlenmiştir", check:"SOC hizmetinin hangi log kaynaklarını ve hangi altyapıyı kullandığının teyit edilmesi önerilir." },
  { hi:"12", lo:"27", txt:"denetimde log kayıtlarının bütünlüğü korunarak hızlıca sunulabileceği belirtilirken, logların merkezi ve imzalı saklanmasına ilişkin olgunluk düşük işaretlenmiştir", check:"Log kayıtlarının nerede ve nasıl saklandığının teyit edilmesi önerilir." },
  { hi:"1",  lo:"4",  txt:"siber risklerin üst yönetimde düzenli görüşüldüğü belirtilirken, bu görüşmelere temel oluşturacak resmi risk analizine ilişkin olgunluk düşük işaretlenmiştir", check:"Üst yönetime sunulan risk bilgisinin hangi çalışmaya dayandığının teyit edilmesi önerilir." },
  { hi:"7",  lo:"2",  txt:"uzaktan çalışma için resmi bir politika bulunduğu belirtilirken, genel siber güvenlik politikalarına ilişkin olgunluk düşük işaretlenmiştir", check:"Politika setinin kapsamı ve onay durumunun teyit edilmesi önerilir." },
  { hi:"6",  lo:"10", txt:"işe giriş ve çıkışlarda yetkilerin anında ve eksiksiz yönetildiği belirtilirken, merkezi yetki yönetimine (en az yetki, merkezi dizin) ilişkin olgunluk düşük işaretlenmiştir", check:"Yetki değişikliklerinin hangi sistem üzerinden yönetildiğinin teyit edilmesi önerilir." },
  { hi:"8",  lo:"16", txt:"VPN erişiminde çok faktörlü doğrulamanın olgun olduğu belirtilirken, dış bağlantıların VPN veya şifreli tünel üzerinden yapılmasına ilişkin olgunluk düşük işaretlenmiştir", check:"Dış bağlantı yöntemlerinin ve çok faktörlü doğrulamanın kapsamının teyit edilmesi önerilir." },
  { hi:"22", lo:"3",  txt:"hassas verilerin dışarı çıkışını izleyen/engelleyen bir sistemin (DLP) bulunduğu belirtilirken, hassas verilerin nerede tutulduğunu gösteren envanter/veri haritasına ilişkin olgunluk düşük işaretlenmiştir", check:"DLP kurallarının hangi veri sınıflandırmasına dayandığının teyit edilmesi önerilir." },
  { hi:"21", lo:"18", txt:"sızma testi bulgularının kapatılarak doğrulandığı belirtilirken, güvenlik güncellemelerinin (yama) yönetimine ilişkin olgunluk düşük işaretlenmiştir", check:"Sızma testi bulgularının kapatılma yönteminin ve yama sürecinin teyit edilmesi önerilir." },
];
function ansInfo(q, a){
  const app = DIM_KEYS.filter(d => q[d] !== null);
  const nums = app.filter(d => a && typeof a[d] === "number").map(d => ({ d, v:a[d] }));
  const na = app.filter(d => a && a[d] === OUT_OF_SCOPE);
  return { app, nums, na, allNA: app.length > 0 && na.length === app.length, avg: nums.length ? nums.reduce((s,x)=>s+x.v,0)/nums.length : null };
}
function detectInconsistencies(questions, answerMap){
  const idx = {}; questions.forEach((q,i) => { idx[String(q.id)] = i; });
  const get = id => { const i = idx[id]; if(i == null) return null; const q = questions[i]; if(RX[id] && !RX[id].test(q.soru)) return null; return { q, no:i+1, info: ansInfo(q, answerMap[q.id]) }; };
  const f = v => v.toFixed(1).replace(".", ",").replace(",0", "");
  const notes = [];
  SCOPE_RULES.forEach(r => {
    const A = get(r.a), B = get(r.b);
    if(!A || !B || !A.info.allNA || B.info.avg == null || B.info.avg < 2) return;
    notes.push({ kind:"Kapsam", nos:[A.no, B.no],
      text:`${A.no}. soruda ${r.topic} konusu kurum için kapsam dışı olarak işaretlenmiştir; ${B.no}. soruda ise aynı konuya ilişkin uygulamaların bulunduğunu gösteren seviye ${f(B.info.avg)} seçilmiştir.`,
      check:r.check });
  });
  DEP_RULES.forEach(r => {
    const H = get(r.hi), L = get(r.lo);
    if(!H || !L || H.info.avg == null || L.info.avg == null) return;
    if(H.info.avg >= 4 && L.info.avg <= 2){
      notes.push({ kind:"Ön koşul", nos:[H.no, L.no], text:`${H.no}. soruda (seviye ${f(H.info.avg)}) ${r.txt} (${L.no}. soru, seviye ${f(L.info.avg)}).`, check:r.check });
    }
  });
  questions.forEach((q, i) => {
    const inf = ansInfo(q, answerMap[q.id]);
    if(inf.nums.length < 2) return;
    const hi = inf.nums.reduce((m,x)=> x.v > m.v ? x : m), lo = inf.nums.reduce((m,x)=> x.v < m.v ? x : m);
    if(hi.v - lo.v < 3) return;
    const lead = { teknoloji:"teknik altyapının süreç ve sahiplikle", surec:"tanımlı süreçlerin uygulamada ve teknik araçlarla", insan:"farkındalık ve sahipliğin süreç ve teknik araçlarla" }[hi.d];
    notes.push({ kind:"Boyut farkı", nos:[i+1],
      text:`${i+1}. soruda boyutlar arasında belirgin fark görülmüştür (${inf.nums.map(x => `${DIM_LABELS[x.d]} ${x.v}`).join(", ")}).`,
      check:`${lead[0].toLocaleUpperCase("tr-TR") + lead.slice(1)} desteklenme düzeyinin teyit edilmesi önerilir.` });
  });
  const all = []; questions.forEach(q => ansInfo(q, answerMap[q.id]).nums.forEach(x => all.push(x.v)));
  if(all.length >= 15){
    const cnt = {}; all.forEach(v => cnt[v] = (cnt[v]||0) + 1);
    const [topV, topN] = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
    if(topN / all.length >= 0.8){
      notes.push({ kind:"Yanıt örüntüsü", nos:[],
        text:`Verilen yanıtların büyük bölümünde (%${Math.round(topN/all.length*100)}) aynı seviye (${topV}) seçilmiştir.`,
        check:"Kontroller arasındaki gerçek farklılıkların yanıtlara yeterince yansıdığının birlikte gözden geçirilmesi önerilir." });
    }
  }
  return notes;
}

function computeResults(questions, answerMap){
  const perQuestion = questions.map(q => ({ q, level: effectiveLevel(q, answerMap[q.id]) })).filter(x => x.level != null);
  const overall = weightedAvg(perQuestion);

  const statusCounts = { "Tam Yanıtlandı":0, "Kısmen Yanıtlandı":0, "Yanıtlanmadı":0, "Kapsam Dışı":0 };
  questions.forEach(q => statusCounts[questionStatus(q, answerMap[q.id]).status]++);
  const completion = { fullyAnswered: statusCounts["Tam Yanıtlandı"], partiallyAnswered: statusCounts["Kısmen Yanıtlandı"], fullyUnanswered: statusCounts["Yanıtlanmadı"], outOfScope: statusCounts["Kapsam Dışı"], consideredTotal: perQuestion.length };

  const domains = [...new Set(questions.map(q=>q.domain))];
  const perDomain = domains.map(dom => {
    const items = perQuestion.filter(x => x.q.domain === dom);
    return { domain: dom, avg: weightedAvg(items), count: items.length, total: questions.filter(q=>q.domain===dom).length };
  });
  const perDim = DIM_KEYS.map(d => { const items = dimItems(questions, answerMap, d); return { dim:d, avg: weightedAvg(items), count: items.length, below: items.filter(x=>x.level < TARGET_LEVEL).length }; });

  const allGaps = perQuestion
    .filter(x => x.level < TARGET_LEVEL)
    .map(x => Object.assign({}, x, { priority: priorityOf(x.q.etki, x.level) }))
    .sort((a,b)=> (PRIORITY_RANK[b.priority]-PRIORITY_RANK[a.priority]) || (IMPACT_WEIGHT[b.q.etki]-IMPACT_WEIGHT[a.q.etki]) || (a.level-b.level));
  const gaps = allGaps.slice(0, 8);

  const perReg = REG_FW_KEYS.map(fw => {
    const items = perQuestion.filter(x => x.q.regulatory && x.q.regulatory[fw]);
    const touched = questions.filter(q => q.regulatory && q.regulatory[fw]).length;
    const regGaps = items.filter(x => x.level < TARGET_LEVEL).sort((a,b)=> a.level-b.level);
    const avg = weightedAvg(items);
    return { fw, avg, answered: items.length, touched, gaps: regGaps, passed: avg != null && avg >= TARGET_LEVEL && regGaps.length === 0 };
  }).filter(r => r.touched > 0);

  const perDomainByMetric = {};
  ["overall", ...DIM_KEYS, ...perReg.map(r=>r.fw)].forEach(m => { perDomainByMetric[m] = perDomainForMetric(questions, answerMap, m); });

  const notes = detectInconsistencies(questions, answerMap);
  return { overall, perDomain, perDim, gaps, allGaps, perReg, perDomainByMetric, completion, perQuestion, notes, answeredCount: perQuestion.length, total: questions.length };
}
function perDomainForMetric(questions, answerMap, metric){
  const domains = [...new Set(questions.map(q=>q.domain))];
  return domains.map(dom => {
    const inDomain = questions.filter(q => q.domain === dom);
    let items;
    if(metric === "overall") items = inDomain.map(q => ({ q, level: effectiveLevel(q, answerMap[q.id]) })).filter(x=>x.level!=null);
    else if(DIM_KEYS.includes(metric)) items = dimItems(inDomain, answerMap, metric);
    else if(REG_FW_KEYS.includes(metric)) items = inDomain.filter(q => q.regulatory && q.regulatory[metric]).map(q => ({ q, level: effectiveLevel(q, answerMap[q.id]) })).filter(x=>x.level!=null);
    else items = [];
    return { domain: dom, avg: weightedAvg(items), count: items.length, total: inDomain.length };
  });
}
/* Seviye bantları asgari eşikle hizalı: 1:<2,0 · 2:2,0–2,9 · 3:3,0–3,9 · 4:4,0–4,4 · 5:≥4,5 */
function bandOf(v){ if(v == null) return null; if(v < 2) return 1; if(v < 3) return 2; if(v < 4) return 3; if(v < 4.5) return 4; return 5; }

/* ---------------------------------------------------------
   Sonuç ekranı
--------------------------------------------------------- */
function levelColorScale(v){
  if(v == null) return "var(--text-faint)";
  return ["","var(--l1)","var(--l2)","var(--l3)","var(--l4)","var(--l5)"][bandOf(v)];
}
function wrapLabel(text, max){
  const lines = []; let cur = "";
  text.split(" ").forEach(w=>{ const c = cur ? cur + " " + w : w; if(c.length > max && cur){ lines.push(cur); cur = w; } else cur = c; });
  if(cur) lines.push(cur);
  return lines;
}
function renderRadarSVG(perDomain){
  const size = 620, cx = size/2, cy = size/2, r = 155, n = perDomain.length;
  const angleFor = i => -Math.PI/2 + i * (2*Math.PI/n);
  const pt = (i, v) => { const a = angleFor(i), rad = r * (v/5); return [cx + rad*Math.cos(a), cy + rad*Math.sin(a)]; };
  const grid = [1,2,3,4,5].map(l => `<polygon points="${perDomain.map((_,i)=>pt(i,l).join(",")).join(" ")}" fill="none" stroke="var(--border)" stroke-width="1"/>`).join("");
  const axes = perDomain.map((_,i)=>{ const [x,y] = pt(i,5); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`; }).join("");
  const poly = `<polygon points="${perDomain.map((d,i)=>pt(i, d.avg||0).join(",")).join(" ")}" fill="rgba(79,166,216,.18)" stroke="var(--brand)" stroke-width="2.2"/>`;
  const dots = perDomain.map((d,i)=>{ const [x,y] = pt(i, d.avg||0); return `<circle cx="${x}" cy="${y}" r="4" fill="${levelColorScale(d.avg)}"><title>${esc(d.domain)}: ${d.avg==null?'—':d.avg.toFixed(1)}</title></circle>`; }).join("");
  const labels = perDomain.map((d,i)=>{
    const a = angleFor(i), lr = r + 58, x = cx + lr*Math.cos(a), y = cy + lr*Math.sin(a);
    const anchor = Math.cos(a) > 0.15 ? "start" : Math.cos(a) < -0.15 ? "end" : "middle";
    const lines = wrapLabel(d.domain, 15), startY = y - (lines.length-1)*6.5;
    return lines.map((line,li)=>`<text x="${x}" y="${startY+li*13}" font-size="10.5" fill="var(--text-dim)" text-anchor="${anchor}" dominant-baseline="middle" font-family="var(--font-mono)">${esc(line)}</text>`).join("");
  }).join("");
  return `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" style="max-width:${size}px;overflow:visible">${grid}${axes}${poly}${dots}${labels}</svg>`;
}

let activeRegDetail = null;
let heroMetric = "overall";

function regulatoryHTML(perReg){
  if(!perReg || perReg.length === 0) return "";
  const cards = perReg.map(r => {
    const badgeText = r.avg == null ? "Henüz veri yok" : (r.passed ? "Asgari Uyum Sağlanıyor" : "Asgari Uyum Seviyesine Henüz Ulaşılmadı");
    const col = r.avg == null ? "var(--text-faint)" : (r.passed ? "var(--l5)" : "var(--l1)");
    return `
      <div class="dim-card reg-gauge-card ${activeRegDetail === r.fw ?'active':''}" data-fw="${r.fw}">
        <div class="dim-card-label">${esc(REG_LABELS[r.fw] || r.fw)}</div>
        <div class="reg-bar-track">
          <div class="reg-bar-fill" style="width:${r.avg==null?0:(r.avg-1)/4*100}%;background:${r.passed?'var(--l5)':'var(--l1)'}"></div>
          <div class="reg-bar-threshold" title="Asgari uyum eşiği (3.0)"></div>
        </div>
        <div class="dim-card-val" style="color:${r.passed?'var(--l5)':'var(--l1)'}">${r.avg==null?'—':r.avg.toFixed(1)}</div>
        <div class="reg-badge"><span class="rozet ${r.avg == null ? "" : (r.passed ? "iyi" : "zayif")}">${badgeText}</span></div>
        <div class="reg-touch-note">${r.answered} / ${r.touched} ilgili soru değerlendirildi</div>
      </div>`;
  }).join("");
  const active = perReg.find(r => r.fw === activeRegDetail);
  let detail = "";
  if(active){
    const label = REG_LABELS[active.fw] || active.fw;
    detail = active.gaps.length === 0
      ? `<div class="reg-detail"><div class="no-gaps">${esc(label)} ile ilgili sorularda asgari eşiğin altında kalan kontrol bulunmuyor.</div></div>`
      : `<div class="reg-detail"><div class="reg-detail-title">${esc(label)} — Asgari Eşiğin Altındaki Kontroller</div>
          ${active.gaps.map(g => `<div class="gap-row"><span class="gap-domain">${esc(g.q.domain)}</span><span class="gap-text">${esc(g.q.soru)}</span><span class="gap-levels"><b>${g.level.toFixed(1)}</b> / 5.0</span></div>`).join("")}</div>`;
  }
  return `
    <div class="gaps-section" style="margin-bottom:28px;">
      <div class="gaps-title">Regülatif Uyum Sinyali</div>
      <div class="gaps-sub">Soruların ilgili olduğu mevzuat/standartlara göre yönlendirici bir gösterge — uyum denetiminin yerini tutmaz. İşaretli çizgi asgari uyum eşiğidir. Bir kartı tıklayarak eşik altındaki kontrolleri görebilirsiniz.</div>
      <div class="reg-gauge-row">${cards}</div>
      ${detail}
    </div>`;
}

function allMetricsListHTML(res, activeMetric){
  const overallRow = res.overall != null ? [["overall","Genel", res.overall]] : [];
  const dimRows = DIM_KEYS.map(d => [d, DIM_LABELS[d], (res.perDim.find(x=>x.dim===d)||{}).avg]).filter(r => r[2] != null).sort((a,b)=> a[2]-b[2]);
  const regRows = res.perReg.map(r => [r.fw, REG_LABELS_SHORT[r.fw]||r.fw, r.avg]).filter(r => r[2] != null).sort((a,b)=> a[2]-b[2]);
  const all = [...overallRow, ...dimRows];
  if(all.length === 0 && regRows.length === 0) return "";
  const rowHtml = ([key,label,val]) => `
    <div class="metric-compare-row ${key===activeMetric?'active':''}" data-metric="${key}">
      <span class="metric-compare-name">${esc(label)}</span>
      <div class="metric-compare-track"><div class="metric-compare-fill" style="width:${(val-1)/4*100}%;background:${levelColorScale(val)}"></div></div>
      <span class="metric-compare-val" style="color:${levelColorScale(val)}">${val.toFixed(1)}</span>
    </div>`;
  return `
    <div class="metric-compare-list">
      ${all.length ? `<div class="metric-compare-group-label">Olgunluk Boyutu</div>${all.map(rowHtml).join("")}` : ""}
      ${regRows.length ? `<div class="metric-compare-group-label">Regülasyon Uyumu</div>${regRows.map(rowHtml).join("")}` : ""}
    </div>`;
}
function domainMiniListHTML(perDomain){
  const sorted = [...perDomain].filter(d => d.avg != null).sort((a,b)=> a.avg - b.avg);
  if(sorted.length === 0) return `<div class="domain-mini-empty">Bu mercek için henüz veri yok.</div>`;
  return `<div class="domain-mini-list">${sorted.map(d => `
    <div class="domain-mini-row">
      <span class="domain-mini-name">${esc(d.domain)}</span>
      <div class="domain-mini-track"><div class="domain-mini-fill" style="width:${(d.avg-1)/4*100}%;background:${levelColorScale(d.avg)}"></div></div>
      <span class="domain-mini-val" style="color:${levelColorScale(d.avg)}">${d.avg.toFixed(1)}</span>
    </div>`).join("")}</div>`;
}
function radarCaption(metric){
  if(metric === "overall") return "Tüm boyutların ortalamasına göre kontrol alanları";
  if(DIM_KEYS.includes(metric)) return `${DIM_LABELS[metric]} boyutuna göre kontrol alanları`;
  return `${REG_LABELS[metric]||metric} ile ilgili sorulara göre kontrol alanları`;
}
function heroValueAndLabel(res, metric){
  if(metric === "overall") return { value: res.overall };
  if(DIM_KEYS.includes(metric)){ const d = res.perDim.find(x=>x.dim===metric); return { value: d ? d.avg : null }; }
  const r = res.perReg.find(x=>x.fw===metric); return { value: r ? r.avg : null };
}
function heroSelectHTML(res){
  const dimOpts = [["overall","Genel"],["insan","İnsan"],["surec","Süreç"],["teknoloji","Teknoloji"]];
  const regOpts = (res.perReg||[]).map(r => [r.fw, REG_LABELS_SHORT[r.fw] || r.fw]);
  const pills = (opts) => opts.map(([v,l])=>`<button class="metric-pill ${heroMetric===v?'active':''}" data-metric="${v}">${esc(l)}</button>`).join("");
  return `
    <div class="metric-selector">
      <div class="metric-group"><span class="metric-group-label">Olgunluk</span><div class="metric-pill-row">${pills(dimOpts)}</div></div>
      ${regOpts.length ? `<div class="metric-group"><span class="metric-group-label">Regülasyon</span><div class="metric-pill-row">${pills(regOpts)}</div></div>` : ""}
    </div>`;
}
function completionBannerHTML(c){
  if(!c || (c.fullyUnanswered === 0 && c.partiallyAnswered === 0)) return "";
  const parts = [`${c.fullyAnswered} tam yanıtlandı`];
  if(c.partiallyAnswered > 0) parts.push(`${c.partiallyAnswered} kısmen yanıtlandı`);
  if(c.fullyUnanswered > 0) parts.push(`${c.fullyUnanswered} hiç yanıtlanmadı`);
  return `<div class="completion-banner"><b>Bu değerlendirme henüz tam değil.</b> ${c.consideredTotal} sorudan ${parts.join(", ")}. Yanıtlanmayan boyutlar hesaplamalarda <b>en düşük seviye (1)</b> olarak dikkate alınmıştır — puanlar bu nedenle gerçekte olabileceğinden daha düşük görünüyor olabilir.</div>`;
}

function resultsHTML(res, orgLabel, isDemo, meta){
  const hv = heroValueAndLabel(res, heroMetric);
  const bandLabel = hv.value == null ? "" : BAND_LABELS[bandOf(hv.value)];
  const dimBreakdownHtml = res.perDim.map(d=>`
    <div class="dim-card">
      <div class="dim-card-label">${DIM_LABELS[d.dim]}</div>
      <div class="dim-bar-track"><div class="dim-bar-fill" style="width:${d.avg == null ? 0 : d.avg/5*100}%;background:${levelColorScale(d.avg)}"></div></div>
      <div class="dim-card-val" style="color:${levelColorScale(d.avg)}">${d.avg==null?'—':d.avg.toFixed(1)}</div>
    </div>`).join("");
  const gapsHtml = res.gaps.length === 0
    ? `<div class="no-gaps">Öncelikli bir boşluk bulunmuyor.</div>`
    : res.gaps.map(g => `<div class="gap-row"><span class="gap-domain">${esc(g.q.domain)}</span><span class="gap-text">${esc(g.q.soru)}</span><span class="gap-levels">${esc(g.priority)} · <b>${g.level.toFixed(1)}</b> / 5.0</span></div>`).join("");
  const isSelf = meta && meta.source === "self";
  return `
    ${isDemo ? `<div class="demo-banner">Bu, örnek verilerle oluşturulmuş bir gösterimdir — gerçek değerlendirme sonucunuz değildir.</div>` : ""}
    ${!isDemo ? qsetBannerHTML(meta) : ""}
    ${completionBannerHTML(res.completion)}
    ${!isDemo ? `<button class="btn-home corner-home" id="btnResultsHome" title="Ana sayfaya dön"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 11.5L12 4l8 7.5M6 9.5V20h12V9.5"/></svg></button>` : ""}
    <div class="results-head">
      <div class="eyebrow">Değerlendirme Sonucu</div>
      <h1 class="results-title">${esc(orgLabel)}</h1>
      <div class="results-sub">${res.answeredCount} / ${res.total} soru değerlendirildi</div>
    </div>
    <div class="results-top-grid">
      <div class="score-card">
        ${heroSelectHTML(res)}
        <div class="score-hero-content">
          <div class="hero-bar-track"><div class="hero-bar-fill" style="width:${hv.value==null?0:(hv.value-1)/4*100}%;background:${levelColorScale(hv.value)}"></div></div>
          <div class="hero-bar-scale"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
          <div class="score-big" style="color:${levelColorScale(hv.value)}">${hv.value==null?'—':hv.value.toFixed(1)}</div>
          <div class="score-band">${esc(bandLabel)}</div>
          ${allMetricsListHTML(res, heroMetric)}
        </div>
      </div>
      <div class="radar-card">
        <div class="radar-caption">${esc(radarCaption(heroMetric))}</div>
        ${renderRadarSVG(res.perDomainByMetric[heroMetric] || res.perDomain)}
      </div>
    </div>
    <div class="domain-list-panel">
      <div class="gaps-title">Kontrol Alanları Detayı</div>
      <div class="gaps-sub">${esc(radarCaption(heroMetric))}</div>
      ${domainMiniListHTML(res.perDomainByMetric[heroMetric] || res.perDomain)}
    </div>
    <div class="dim-breakdown">${dimBreakdownHtml}</div>
    ${regulatoryHTML(res.perReg)}
    <div class="gaps-section">
      <div class="gaps-title">Öncelikli Boşluklar</div>
      <div class="gaps-sub">Etki seviyesi yüksek olan ve görece düşük puanlanan kontroller (ilk 8). Tam liste Word raporunda yer alır.</div>
      <div>${gapsHtml}</div>
    </div>
    ${res.notes && res.notes.length ? `
    <div class="gaps-section">
      <div class="gaps-title">Değerlendirme Notları</div>
      <div class="gaps-sub">Bazı yanıtlar arasında uyumsuzluklar görülmüştür. Bu notlar Word raporunun son bölümünde yer alır; kurumla birlikte teyit edilmesi önerilir.</div>
      ${res.notes.map(n => `<div class="gap-row"><span class="gap-domain">${esc(n.kind)}</span><span class="gap-text">${esc(n.text)} <i>${esc(n.check)}</i></span></div>`).join("")}
    </div>` : ""}
    <div class="results-actions">
      ${isDemo
        ? `<button class="btn-nav primary" id="btnCloseDemo">Ana Sayfaya Dön</button>`
        : `${isSelf ? `<button class="btn-nav" id="btnRestart">Yeniden Başla</button>` : ""}
           <button class="btn-nav" id="btnViewAnswers">Tüm Cevapları Görüntüle</button>
           <button class="btn-nav" id="btnExportHtml">HTML İnfografik Rapor</button>
           <button class="btn-nav primary" id="btnExportDocx">Word Rapor Oluştur</button>`}
    </div>
    ${!isDemo ? `<div class="report-progress" id="reportProgress"></div>` : ""}`;
}

function orgLabelOf(a){ return a.orgName ? `${a.orgName} — Olgunluk Haritası` : "Olgunluk Haritası"; }

function renderResults(){
  if(!analysis) return;
  const res = computeResults(analysis.questions, analysis.answers);
  rerenderResultsWrap("resultsWrap", res, orgLabelOf(analysis), false);
}
function rerenderResultsWrap(wrapId, res, orgLabel, isDemo){
  const wrap = document.getElementById(wrapId);
  wrap.innerHTML = resultsHTML(res, orgLabel, isDemo, isDemo ? null : analysis.meta);
  wrap.querySelectorAll(".metric-pill, .metric-compare-row").forEach(btn=>{
    btn.addEventListener("click", ()=>{ heroMetric = btn.getAttribute("data-metric"); rerenderResultsWrap(wrapId, res, orgLabel, isDemo); });
  });
  wrap.querySelectorAll(".reg-gauge-card").forEach(card=>{
    card.addEventListener("click", ()=>{ const fw = card.getAttribute("data-fw"); activeRegDetail = (activeRegDetail === fw) ? null : fw; rerenderResultsWrap(wrapId, res, orgLabel, isDemo); });
  });
  if(isDemo){
    document.getElementById("btnCloseDemo").addEventListener("click", ()=> C.goLanding());
    return;
  }
  const btnRestart = document.getElementById("btnRestart");
  if(btnRestart) btnRestart.addEventListener("click", ()=>{
    if(!confirm("Tüm yanıtlarınız sıfırlanacak. Emin misiniz?")) return;
    C.clearProgress(); C.resetAnswers(); C.goLanding();
  });
  const reportK = () => ({ REG_LABELS, REG_LABELS_SHORT, BAND_LABELS, TARGET_LEVEL, IMPACT_WEIGHT, IMPACT_LEVELS, PRIORITY_RANK, P1, P2, P3, questionStatus, bandOf, priorityOf, effectiveLevel });
  document.getElementById("btnExportHtml").addEventListener("click", async (e)=>{
    const btn = e.currentTarget, prog = document.getElementById("reportProgress");
    btn.disabled = true; prog.textContent = "HTML rapor hazırlanıyor…";
    try{ await window.QA_HTMLREPORT.generate(analysis, res, reportK()); prog.textContent = "HTML rapor indirildi."; }
    catch(err){ console.error(err); prog.textContent = ""; alert("HTML rapor oluşturulamadı: " + err.message); }
    finally{ btn.disabled = false; }
  });
  document.getElementById("btnExportDocx").addEventListener("click", async (e)=>{
    const btn = e.currentTarget, prog = document.getElementById("reportProgress");
    btn.disabled = true; prog.textContent = "Rapor hazırlanıyor…";
    try{
      await window.QA_REPORT.generate(analysis, res, { REG_LABELS, REG_LABELS_SHORT, BAND_LABELS, TARGET_LEVEL, IMPACT_WEIGHT, IMPACT_LEVELS, PRIORITY_RANK, P1, P2, P3, questionStatus, bandOf, priorityOf, effectiveLevel });
      prog.textContent = "Rapor indirildi.";
    }catch(err){
      console.error(err);
      prog.textContent = "";
      alert("Rapor oluşturulamadı: " + err.message);
    }finally{ btn.disabled = false; }
  });
  document.getElementById("btnViewAnswers").addEventListener("click", ()=>{ C.showScreen("answerDetails"); renderAnswerDetails(orgLabel); });
  document.getElementById("btnResultsHome").addEventListener("click", ()=> C.goLanding());
}

function answerDetailsHTML(orgLabel){
  const rows = analysis.questions.map((q,i) => {
    const a = analysis.answers[q.id] || {};
    const cells = DIM_KEYS.map(dim=>{
      if(q[dim] === null) return `<div class="ad-dim"><span class="ad-dim-label">${DIM_LABELS[dim]}</span><span class="ad-dim-val na">Uygulanamaz</span></div>`;
      const lvl = a[dim];
      let valText, valColor, txt = null;
      if(lvl === OUT_OF_SCOPE){ valText = "Kapsam Dışı"; valColor = "var(--text-faint)"; }
      else if(typeof lvl === "number"){ valText = `Seviye ${lvl}`; valColor = levelColorScale(lvl); txt = q[dim][lvl]; }
      else { valText = "Yanıtlanmadı (en düşük seviye sayılır)"; valColor = "var(--l1)"; }
      return `<div class="ad-dim"><span class="ad-dim-label">${DIM_LABELS[dim]}</span><span class="ad-dim-val" style="color:${valColor}">${valText}</span>${txt ? `<span class="ad-dim-text">${esc(txt)}</span>` : ""}</div>`;
    }).join("");
    return `<div class="ad-row"><div class="ad-row-head"><span class="ad-row-num">${i+1}</span><span class="domain-badge">${esc(q.domain)}</span></div><div class="ad-row-q">${esc(q.soru)}</div><div class="ad-dims">${cells}</div></div>`;
  }).join("");
  return `
    <button class="btn-home corner-home" id="btnAnswerDetailsHome" title="Ana sayfaya dön"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 11.5L12 4l8 7.5M6 9.5V20h12V9.5"/></svg></button>
    <div class="results-head"><div class="eyebrow">Cevap Detayları</div><h1 class="results-title">${esc(orgLabel)}</h1></div>
    <div class="ad-list">${rows}</div>
    <div class="results-actions"><button class="btn-nav primary" id="btnBackToResults">Sonuçlara Dön</button></div>`;
}
function renderAnswerDetails(orgLabel){
  document.getElementById("answerDetailsWrap").innerHTML = answerDetailsHTML(orgLabel);
  document.getElementById("btnBackToResults").addEventListener("click", ()=>{ C.showScreen("results"); renderResults(); });
  document.getElementById("btnAnswerDetailsHome").addEventListener("click", ()=> C.goLanding());
}

/* ---------------- Örnek (demo) sonuç ---------------- */
function buildDemoAnswers(questions){
  const pI = [2,3,4,2,5,3,1,4,3,2], pS = [1,2,3,1,3,2,1,2,2,1], pT = [3,4,5,3,5,4,2,5,4,3];
  const demo = {};
  questions.forEach((q,i)=>{
    demo[q.id] = { insan: q.insan !== null ? pI[i % 10] : null, surec: q.surec !== null ? pS[i % 10] : null, teknoloji: q.teknoloji !== null ? pT[i % 10] : null };
  });
  return demo;
}
function renderDemoResults(){
  const res = computeResults(S.questions, buildDemoAnswers(S.questions));
  heroMetric = "overall"; activeRegDetail = null;
  rerenderResultsWrap("demoResultsWrap", res, "Örnek Kurum A.Ş. — Olgunluk Haritası", true);
}

/* Kendi içimizde yapılan deneme değerlendirmesi tamamlandığında */
function finishAssessment(){
  analysis = { questions: S.questions, answers: S.answers, orgName: S.orgName, meta:{ source:"self", submittedAt: new Date().toISOString(), fileVersion: C.APP_VERSION, qset:{ status:"match" } } };
  heroMetric = "overall"; activeRegDetail = null;
  C.showScreen("results");
  renderResults();
}

/* ---------------------------------------------------------
   Yönetici paneli
--------------------------------------------------------- */
let editingId = null;
function renderAdminList(){
  const holder = document.getElementById("adminList");
  holder.innerHTML = S.questions.map((q, idx) => `
    <div class="admin-list-row" data-id="${esc(q.id)}">
      <span class="q-id">#${idx+1}</span>
      <span class="q-domain">${esc(q.domain)}</span>
      <span class="q-preview">${esc(q.soru)}</span>
      <div class="reorder-btns">
        <button data-up="${esc(q.id)}" ${idx===0?'disabled':''}>▲</button>
        <button data-down="${esc(q.id)}" ${idx===S.questions.length-1?'disabled':''}>▼</button>
      </div>
      <div class="row-actions">
        <button class="btn-sm" data-edit="${esc(q.id)}">Düzenle</button>
        <button class="btn-sm danger" data-del="${esc(q.id)}">Sil</button>
      </div>
    </div>`).join("");
  holder.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", ()=> openAdminForm(b.getAttribute("data-edit"))));
  holder.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", ()=>{
    if(!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    S.questions = S.questions.filter(q => q.id !== b.getAttribute("data-del"));
    C.resetAnswers(); saveQuestions(); renderAdminList();
  }));
  holder.querySelectorAll("[data-up]").forEach(b => b.addEventListener("click", ()=> moveQuestion(b.getAttribute("data-up"), -1)));
  holder.querySelectorAll("[data-down]").forEach(b => b.addEventListener("click", ()=> moveQuestion(b.getAttribute("data-down"), 1)));
}
function moveQuestion(id, dir){
  const idx = S.questions.findIndex(q=>q.id===id), n = idx + dir;
  if(n < 0 || n >= S.questions.length) return;
  const [item] = S.questions.splice(idx,1); S.questions.splice(n,0,item);
  saveQuestions(); renderAdminList();
}
function blankQuestion(){
  const mk = () => ({1:"",2:"",3:"",4:"",5:""});
  return { id: uid(), domain: UCT_DOMAINS[0], soru:"", aciklama:"", etki: IMPACT_LEVELS[0], insan: mk(), surec: mk(), teknoloji: mk(), regulatory: {} };
}
function dimEditBlockHTML(dimKey, label, dimData){
  const isNA = dimData === null, levels = dimData || {1:"",2:"",3:"",4:"",5:""};
  return `
    <div class="dim-edit-block" data-dim="${dimKey}">
      <div class="dim-edit-head"><h4>${label}</h4><label class="na-toggle"><input type="checkbox" class="na-checkbox" ${isNA?'checked':''}> Bu soru için uygulanamaz</label></div>
      <div class="dim-levels" style="${isNA?'display:none':''}">
        ${[1,2,3,4,5].map(l => `<div class="level-edit-row"><span class="lvl-num">${l}</span><textarea data-level="${l}" rows="2">${esc(levels[l]||"")}</textarea></div>`).join("")}
      </div>
    </div>`;
}
function regEditBlockHTML(regData){
  regData = regData || {};
  return `
    <div class="form-row">
      <label>İlgili Mevzuat/Standart Maddeleri (opsiyonel — virgülle ayırın, boş bırakılan çerçeve bu soruda sayılmaz)</label>
      <div class="form-grid-2" style="margin-top:6px;">
        ${REG_FW_KEYS.map(fw => `<div style="margin-bottom:10px;"><label style="font-weight:400;">${esc(REG_LABELS[fw])}</label><input type="text" class="reg-input" data-fw="${fw}" value="${esc((regData[fw]||[]).join(', '))}" placeholder="ör. 3.1.1.1, 3.1.2.4"></div>`).join("")}
      </div>
    </div>`;
}
function openAdminForm(id){
  editingId = id;
  const isNew = id === null;
  const q = isNew ? blankQuestion() : S.questions.find(x=>x.id===id);
  const holder = document.getElementById("adminFormHolder");
  holder.innerHTML = `
    <div class="admin-form">
      <h3 style="margin-bottom:16px;">${isNew ? "Yeni Soru" : "Soruyu Düzenle"}</h3>
      <div class="form-grid-2">
        <div class="form-row"><label>Kontrol Alanı</label><select id="f_domain">${UCT_DOMAINS.map(d=>`<option ${d===q.domain?'selected':''}>${esc(d)}</option>`).join("")}</select></div>
        <div class="form-row"><label>Etki Seviyesi</label><select id="f_etki">${IMPACT_LEVELS.map(e=>`<option ${e===q.etki?'selected':''}>${esc(e)}</option>`).join("")}</select></div>
      </div>
      <div class="form-row"><label>Değerlendirme Sorusu</label><textarea id="f_soru" rows="2">${esc(q.soru)}</textarea></div>
      <div class="form-row"><label>Açıklama (amaç ve kapsam)</label><textarea id="f_aciklama" rows="2">${esc(q.aciklama)}</textarea></div>
      <div id="f_dims">
        ${dimEditBlockHTML("insan","İnsan (People)", q.insan)}
        ${dimEditBlockHTML("surec","Süreç (Process)", q.surec)}
        ${dimEditBlockHTML("teknoloji","Teknoloji (Technology)", q.teknoloji)}
      </div>
      ${regEditBlockHTML(q.regulatory)}
      <div style="display:flex;gap:10px;margin-top:18px;"><button class="btn-sm primary" id="btnSaveQuestion">Kaydet</button><button class="btn-sm" id="btnCancelForm">İptal</button></div>
    </div>`;
  holder.querySelectorAll(".na-checkbox").forEach(cb=>{
    cb.addEventListener("change", ()=>{ cb.closest(".dim-edit-block").querySelector(".dim-levels").style.display = cb.checked ? "none" : "block"; });
  });
  document.getElementById("btnCancelForm").addEventListener("click", ()=>{ holder.innerHTML = ""; editingId = null; });
  document.getElementById("btnSaveQuestion").addEventListener("click", ()=>{
    const newQ = { id: q.id, domain: document.getElementById("f_domain").value, etki: document.getElementById("f_etki").value,
      soru: document.getElementById("f_soru").value.trim(), aciklama: document.getElementById("f_aciklama").value.trim() };
    DIM_KEYS.forEach(dimKey=>{
      const block = holder.querySelector(`.dim-edit-block[data-dim="${dimKey}"]`);
      if(block.querySelector(".na-checkbox").checked){ newQ[dimKey] = null; return; }
      const levels = {};
      block.querySelectorAll("textarea[data-level]").forEach(ta=>{ levels[parseInt(ta.getAttribute("data-level"),10)] = ta.value.trim(); });
      newQ[dimKey] = levels;
    });
    newQ.regulatory = {};
    holder.querySelectorAll(".reg-input").forEach(inp=>{
      const codes = inp.value.split(",").map(s=>s.trim()).filter(Boolean);
      if(codes.length) newQ.regulatory[inp.getAttribute("data-fw")] = codes;
    });
    if(isNew) S.questions.push(newQ);
    else S.questions[S.questions.findIndex(x=>x.id===id)] = newQ;
    C.resetAnswers(); saveQuestions(); renderAdminList();
    holder.innerHTML = ""; editingId = null;
  });
  holder.scrollIntoView({behavior:"smooth"});
}

/* ---------------- Excel içe/dışa aktarım ---------------- */
const XLSX_HEADERS = ["Sıra No","Ana Kontrol Alanı (UCT)","Değerlendirme Sorusu","Açıklama (Amacı ve Kapsamı)",
  "İnsan (People) Olgunluk Şıkları","Süreç (Process) Olgunluk Şıkları","Teknoloji (Technology) Olgunluk Şıkları",
  "Etki Seviyesi","İlgili Mevzuat/Standart Maddeleri"];
function fmtLevelsForXlsx(dim){ return (dim === null || dim === undefined) ? "Uygulanamaz" : [1,2,3,4,5].map(l => `(${l}) ${dim[l]||""}`).join("\n"); }
function parseLevelsFromXlsx(text){
  if(!text || !text.trim() || text.trim().toLowerCase() === "uygulanamaz") return null;
  const out = {1:"",2:"",3:"",4:"",5:""};
  const re = /\((\d)\)\s*([\s\S]*?)(?=\n?\(\d\)\s|$)/g;
  let m;
  while((m = re.exec(text)) !== null){ const lvl = parseInt(m[1],10); if(lvl>=1 && lvl<=5) out[lvl] = m[2].trim(); }
  return out;
}
function fmtRegulatoryForXlsx(reg){ return reg ? REG_FW_KEYS.filter(fw=>reg[fw] && reg[fw].length).map(fw => `${REG_LABELS[fw]}: ${reg[fw].join(", ")}`).join("\n") : ""; }
function parseRegulatoryFromXlsx(text){
  const out = {};
  if(!text || !text.trim()) return out;
  const rev = {}; REG_FW_KEYS.forEach(fw => { rev[REG_LABELS[fw]] = fw; rev[fw] = fw; rev[REG_LABELS_SHORT[fw]] = fw; });
  text.split("\n").forEach(line=>{
    const idx = line.indexOf(":"); if(idx < 0) return;
    const fw = rev[line.slice(0,idx).trim()], codes = line.slice(idx+1).trim();
    if(fw && codes) out[fw] = codes.split(",").map(s=>s.trim()).filter(Boolean);
  });
  return out;
}
function questionsToWorkbook(){
  const rows = [XLSX_HEADERS];
  S.questions.forEach(q=> rows.push([q.id, q.domain, q.soru, q.aciklama, fmtLevelsForXlsx(q.insan), fmtLevelsForXlsx(q.surec), fmtLevelsForXlsx(q.teknoloji), q.etki, fmtRegulatoryForXlsx(q.regulatory)]));
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{wch:8},{wch:26},{wch:40},{wch:40},{wch:40},{wch:40},{wch:40},{wch:16},{wch:32}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hızlı Değerlendirme (UCT)");
  return wb;
}
function xlsxSheetToQuestions(ws){
  const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:""});
  const parsed = [];
  rows.slice(1).forEach(r=>{
    if(!r || r.length === 0 || (!r[1] && !r[2])) return;
    parsed.push({ id: String(r[0] ?? "").trim() || uid(), domain: String(r[1]||"").trim(), soru: String(r[2]||"").trim(), aciklama: String(r[3]||"").trim(),
      insan: parseLevelsFromXlsx(String(r[4]||"")), surec: parseLevelsFromXlsx(String(r[5]||"")), teknoloji: parseLevelsFromXlsx(String(r[6]||"")),
      etki: C.normalizeImpact(String(r[7]||"").trim()) || IMPACT_LEVELS[0], regulatory: parseRegulatoryFromXlsx(String(r[8]||"")) });
  });
  return parsed;
}

/* ---------------------------------------------------------
   Müşteri modülü üretimi — sayfanın ilk (bozulmamış) kaynağından
   tüm data-full öğeleri (yönetim, puanlama, rapor, kütüphaneler,
   şablon) fiziksel olarak çıkarılır; geriye yalnızca anket kalır.
--------------------------------------------------------- */
function safeJsonForScript(obj){ return JSON.stringify(obj).replace(/</g, "\\u003c"); }
function buildClientModuleHTML(){
  const src = window.__QA_PRISTINE;
  if(!src) throw new Error("kaynak belge bulunamadı");
  const doc = new DOMParser().parseFromString(src, "text/html");
  doc.querySelectorAll("[data-full]").forEach(el => el.remove());
  ["landingSubClient","clientInfoPanels"].forEach(id => { const el = doc.getElementById(id); if(el) el.classList.remove("hidden"); });
  const core = doc.getElementById("qaCore");
  if(!core) throw new Error("çekirdek modül bulunamadı");
  const re = /const DEFAULT_QUESTIONS = [\s\S]*?;\/\*@END_QUESTIONS\*\//;
  if(!re.test(core.textContent)) throw new Error("soru verisi bulunamadı");
  const qJson = safeJsonForScript(C.clientView(S.questions));
  core.textContent = core.textContent.replace(re, () => `const DEFAULT_QUESTIONS = ${qJson};/*@END_QUESTIONS*/`);
  const html = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
  // Güvenlik kontrolü: dahili koddan hiçbir iz kalmamalı
  ["ADMIN_HASH","computeResults","QA_REPORT","JSZip","__QA_PRISTINE","data-full","adminPassInput","regulatory"].forEach(tok=>{
    if(html.includes(tok)) throw new Error("müşteri modülünde dahili içerik kaldı: " + tok);
  });
  return html;
}

function initAdmin(){
  document.getElementById("btnAdminLogin").addEventListener("click", tryAdminLogin);
  document.getElementById("adminPassInput").addEventListener("keydown", e=>{ if(e.key==="Enter"){ if(TOTP_VAULT) document.getElementById("adminOtpInput").focus(); else tryAdminLogin(); } });
  document.getElementById("adminOtpInput").addEventListener("keydown", e=>{ if(e.key==="Enter") tryAdminLogin(); });
  document.getElementById("btnAdmin2fa").addEventListener("click", ()=>{ renderTfaPanel(); document.getElementById("adminFormHolder").scrollIntoView({behavior:"smooth"}); });
  document.getElementById("btnAdminGateBack").addEventListener("click", leaveAdmin);
  document.getElementById("btnAdminAddNew").addEventListener("click", ()=> openAdminForm(null));
  document.getElementById("btnAdminExport").addEventListener("click", ()=>{
    C.downloadBlob(new Blob([JSON.stringify(S.questions, null, 1)], {type:"application/json"}), `soru_seti_${new Date().toISOString().slice(0,10)}.json`);
  });
  document.getElementById("btnAdminImport").addEventListener("click", ()=> document.getElementById("adminImportFile").click());
  document.getElementById("adminImportFile").addEventListener("change", (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const parsed = JSON.parse(ev.target.result);
        if(!Array.isArray(parsed)) throw new Error("beklenen dizi formatı değil");
        S.questions = C.normalizeQuestions(parsed); C.resetAnswers(); saveQuestions(); renderAdminList();
        alert("Soru seti içe aktarıldı.");
      }catch(err){ alert("Dosya okunamadı: " + err.message); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });
  document.getElementById("btnAdminExportXlsx").addEventListener("click", ()=>{
    XLSX.writeFile(questionsToWorkbook(), `soru_seti_${new Date().toISOString().slice(0,10)}.xlsx`);
  });
  document.getElementById("btnAdminImportXlsx").addEventListener("click", ()=> document.getElementById("adminImportXlsxFile").click());
  document.getElementById("adminImportXlsxFile").addEventListener("change", (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const wb = XLSX.read(ev.target.result, {type:"array"});
        const parsed = xlsxSheetToQuestions(wb.Sheets[wb.SheetNames[0]]);
        if(parsed.length === 0) throw new Error("okunabilir soru satırı bulunamadı");
        S.questions = parsed; C.resetAnswers(); saveQuestions(); renderAdminList();
        alert(`${parsed.length} soru Excel dosyasından içe aktarıldı.`);
      }catch(err){ alert("Excel dosyası okunamadı: " + err.message); }
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  });
  document.getElementById("btnAdminReset").addEventListener("click", ()=>{
    if(!confirm("Tüm düzenlemeleriniz silinip varsayılan soru setine dönülecek. Emin misiniz?")) return;
    try{ localStorage.removeItem(LS_QUESTIONS); }catch(e){}
    S.questions = loadQuestions(); C.resetAnswers(); saveQuestions(); renderAdminList();
  });
  document.getElementById("btnAdminExportHtml").addEventListener("click", exportClientModule);
  document.getElementById("btnAdminExit").addEventListener("click", (e)=>{ e.preventDefault(); leaveAdmin(); });
  document.getElementById("btnAdminLogout").addEventListener("click", ()=>{ adminAuthed = false; leaveAdmin(); });
}

function handleRoute(){
  if(location.hash === "#admin"){ openAdmin(); return true; }
  return false;
}

async function exportClientModule(){
  try{
    const html = buildClientModuleHTML();
    saveIssuedSet(await C.qsetHash(S.questions), S.questions);
    C.downloadBlob(new Blob([html], {type:"text/html"}), `Degerlendirme_Anket_${new Date().toISOString().slice(0,10)}.html`);
    renderHubMetrics();
  }catch(err){ alert("Müşteri modülü oluşturulamadı: " + err.message); }
}

/* ---------------- Araç merkezi (dahili açılış ekranı) ---------------- */
function renderHubMetrics(){
  const el = document.getElementById("hubMetrics");
  if(!el) return;
  const nQ = S.questions.length, nD = new Set(S.questions.map(q=>q.domain)).size;
  const mapped = S.questions.filter(q => q.regulatory && Object.keys(q.regulatory).length).length;
  const fws = REG_FW_KEYS.filter(fw => S.questions.some(q => q.regulatory && q.regulatory[fw])).length;
  const issued = Object.values(loadIssuedSets()).map(x => x.date).sort().pop();
  const tfa = !!TOTP_VAULT;
  el.innerHTML = `
    <div class="olcut lamba-marka"><div class="olcut-sayi">${nQ}</div><div class="olcut-etiket">Soru</div><div class="olcut-not">${nD} kontrol alanı · 3 boyut</div></div>
    <div class="olcut lamba-marka"><div class="olcut-sayi">${mapped}</div><div class="olcut-etiket">Mevzuat eşlemeli soru</div><div class="olcut-not">${fws} çerçeve (7545, BİGR, KVKK, ISO 27001)</div></div>
    <div class="olcut ${issued ? "lamba-marka" : ""}"><div class="olcut-sayi kucuk-sayi">${issued ? new Date(issued).toLocaleDateString("tr-TR") : "—"}</div><div class="olcut-etiket">Son üretilen anket</div><div class="olcut-not">${issued ? "Bu tarayıcıda kayıtlı" : "Henüz anket üretilmedi"}</div></div>
    <div class="olcut ${tfa ? "lamba-iyi" : "lamba-uyari"}"><div class="olcut-sayi kucuk-sayi"><span class="rozet ${tfa ? "iyi" : "uyari"}">${tfa ? "Etkin" : "Kurulu değil"}</span></div><div class="olcut-etiket">İki adımlı doğrulama</div><div class="olcut-not">Yönetici girişi ${tfa ? "parola + kod" : "yalnızca parola"}</div></div>`;
}
function initDropZone(){
  const dz = document.getElementById("dropZone"), inp = document.getElementById("submissionFileInput");
  const pick = ()=> inp.click();
  document.getElementById("btnLoadSubmission").addEventListener("click", (e)=>{ e.stopPropagation(); pick(); });
  dz.addEventListener("click", pick);
  dz.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); pick(); } });
  let depth = 0;
  dz.addEventListener("dragenter", (e)=>{ e.preventDefault(); depth++; dz.classList.add("surukleniyor"); });
  dz.addEventListener("dragover", (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
  dz.addEventListener("dragleave", ()=>{ if(--depth <= 0){ depth = 0; dz.classList.remove("surukleniyor"); } });
  dz.addEventListener("drop", (e)=>{
    e.preventDefault(); depth = 0; dz.classList.remove("surukleniyor");
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(!f) return;
    if(!/\.json$/i.test(f.name) && f.type !== "application/json"){ alert("Lütfen şifreli cevap dosyasını (.json) bırakın."); return; }
    importSubmissionFile(f);
  });
  // Sayfanın başka yerine bırakılan dosya tarayıcıda açılmasın
  ["dragover","drop"].forEach(ev => window.addEventListener(ev, (e)=>{ if(!dz.contains(e.target)) e.preventDefault(); }));
}

function init(){
  initAdmin();
  initDropZone();
  renderHubMetrics();
  document.getElementById("btnHubExport").addEventListener("click", ()=>{
    if(adminAuthed){ exportClientModule(); return; }
    pendingAfterLogin = "export"; openAdmin();
  });
  document.getElementById("submissionFileInput").addEventListener("change", (e)=>{
    const file = e.target.files[0]; if(!file) return;
    importSubmissionFile(file); e.target.value = "";
  });
  document.getElementById("btnGoAdmin").addEventListener("click", openAdmin);
  window.addEventListener("hashchange", ()=>{ if(!handleRoute()) C.goLanding(); });
  return handleRoute();
}

window.QA_FULL = { loadQuestions, finishAssessment, init, onLanding: renderHubMetrics };
})();
