(function(){
"use strict";
/* =========================================================
   ÇEKİRDEK MODÜL — müşteri anketi ve dahili uygulama ortak kodu.
   Bu blok müşteri modülüne olduğu gibi kopyalanır; yönetim,
   puanlama ve raporlama kodu burada YER ALMAZ (dahili modülde).
========================================================= */

/* ---------------- SÜRÜM (tek kaynak) ---------------- */
const APP_VERSION = "1.6";
const APP_CHANGELOG = [
  { v:"1.6", date:"2026-10-08", notes:"HTML raporda regülasyon kartlarının durum rozeti kartın altına tam genişlikte taşındı; puan başlığın yanına alındı." },
  { v:"1.5", date:"2026-10-08", notes:"Word raporunda kontrollerin geçtiği tablolara ve yönetici özetine Soru No referansı eklendi. Müşteriye yönelik HTML infografik rapor eklendi: renkli göstergeler, radar, ısı haritası, risk matrisi, öncelik şeritleri; bölümler, kontrol alanları ve sorular arasında çift yönlü iç bağlantılar; Soru/Cevap süzgeci; çevrimdışı ve ağ bağlantısı kapalı." },
  { v:"1.4", date:"2026-10-06", notes:"Arayüz, arayuz-tasarim-sistemi'ne göre yeniden düzenlendi (IBM Plex / Space Grotesk, belirteçler, mühendislik kağıdı zemini, koyu/aydınlık tema, ıraksak mavi↔kırmızı veri paleti). Dahili açılış ekranı araç merkezine dönüştürüldü: anket değerlendirme (sürükle-bırak alanı + dosya seçme düğmesi), soru yönetimi ve anket üretimi. Müşteri anketi açılışı değişmedi." },
  { v:"1.3", date:"2026-10-02", notes:"Etki seviyeleri sadeleştirildi (Çok Yüksek / Yüksek / Orta / Düşük Etki), öncelik sınıfları 1–3. Öncelik olarak adlandırıldı. Yanıtlar arasındaki uyumsuzlukları tespit eden kontroller ve rapora Değerlendirme Notları bölümü eklendi. Rapora veri gizliliği beyanı eklendi; uygulama ağ bağlantısı kuramayacak şekilde kısıtlandı (CSP). Rapor dili müşteri odaklı ve nazik ifadelerle güncellendi." },
  { v:"1.2", date:"2026-10-02", notes:"Yönetici girişine iki adımlı doğrulama (TOTP, RFC 6238) eklendi: Kimlik Doğrulayıcı uygulaması veya Google/Microsoft Authenticator ile 6 haneli kod. Gizli anahtar yönetici parolasıyla şifrelenip uygulama dosyasına gömülür; kod tekrar kullanımı ve deneme sınırı uygulanır. Seviye bantları asgari eşikle hizalandı." },
  { v:"1.1", date:"2026-10-02", notes:"Word (DOCX) rapor şablona göre üretiliyor; müşteri modülü fiziksel olarak ayrıştırıldı (yönetim/puanlama kodu içermiyor); yönetici girişi zorunlu; soru seti doğrulaması ve cevap dosyasında soru seti kopyası; kütüphane ve fontlar gömülü (çevrimdışı çalışır)." },
  { v:"1.0", date:"2026-10-02", notes:"Temel sürüm (baseline)." },
];

/* ---------------- Soru seti (dışa aktarımda değiştirilir) ---------------- */
const DEFAULT_QUESTIONS = __QUESTIONS__;/*@END_QUESTIONS*/

const DIM_KEYS = ["insan","surec","teknoloji"];
const DIM_LABELS = { insan: "İnsan", surec: "Süreç", teknoloji: "Teknoloji" };
const LEVEL_COLOR = { 1:"var(--l1)", 2:"var(--l2)", 3:"var(--l3)", 4:"var(--l4)", 5:"var(--l5)" };
const IMPACT_COLOR = {
  "Düşük Etki": { bg:"var(--gray-dim)", fg:"var(--text-faint)" },
  "Orta Etki": { bg:"var(--gray-dim)", fg:"var(--text-dim)" },
  "Yüksek Etki": { bg:"var(--amber-dim)", fg:"var(--amber)" },
  "Çok Yüksek Etki": { bg:"var(--red-dim)", fg:"var(--red)" },
};
/* v1.3: etki seviyesi adları sadeleştirildi; eski adlar (önceki soru setleri ve
   daha önce gönderilmiş müşteri modüllerinden gelen dosyalar) otomatik çevrilir. */
const IMPACT_RENAME = { "Yaşamsal Etki":"Çok Yüksek Etki", "Ciddi Etki":"Yüksek Etki", "Ölçülü Etki":"Orta Etki", "İhmal Edilebilir":"Düşük Etki" };
function normalizeImpact(e){ return IMPACT_RENAME[e] || e; }
function normalizeQuestions(qs){ (qs||[]).forEach(q => { if(q) q.etki = normalizeImpact(q.etki); }); return qs; }
const OUT_OF_SCOPE = "NA"; // "kurumumuz için geçerli değil" — yanıtlanmamıştan farklı

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function uid(){ return "q" + Math.random().toString(36).slice(2,9); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

/* Müşteriye gösterilen alanlar — mevzuat eşlemesi gibi iç bilgiler bu görünümde yoktur. */
function clientView(questions){
  return questions.map(q => ({
    id:String(q.id), domain:q.domain, soru:q.soru, aciklama:q.aciklama, etki:q.etki,
    insan:q.insan===undefined?null:q.insan, surec:q.surec===undefined?null:q.surec, teknoloji:q.teknoloji===undefined?null:q.teknoloji,
  }));
}
function fnv1a(str){
  let h = 0x811c9dc5;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h>>>0).toString(16).padStart(8,"0");
}
async function sha256Hex(str){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
/* Soru setinin parmak izi — müşteriye görünen içerik üzerinden hesaplanır. */
function qsetHash(questions){ return sha256Hex(JSON.stringify(clientView(questions))); }

/* ---------------- Paylaşılan durum ---------------- */
const S = { questions:[], answers:{}, orgName:"", current:0 };
let FULL = null; // dahili modül varsa init sırasında bağlanır

function progressKey(){
  return FULL ? "qa_progress_full_v1" : "qa_progress_client_v1_" + fnv1a(JSON.stringify(clientView(S.questions)));
}

/* ---------------- İlerleme kaydı ---------------- */
let qFilter = { unansweredOnly:false, domains:new Set(), impacts:new Set() };
let saveTimer = null;

function questionMatchesFilter(q){
  if(qFilter.unansweredOnly && isAnswered(q)) return false;
  if(qFilter.domains.size > 0 && !qFilter.domains.has(q.domain)) return false;
  if(qFilter.impacts.size > 0 && !qFilter.impacts.has(q.etki)) return false;
  return true;
}
function isFilterActive(){ return qFilter.unansweredOnly || qFilter.domains.size > 0 || qFilter.impacts.size > 0; }
function clearFilter(){ qFilter = { unansweredOnly:false, domains:new Set(), impacts:new Set() }; }

function resetAnswers(){
  S.answers = {};
  S.questions.forEach(q => { S.answers[q.id] = { insan:null, surec:null, teknoloji:null }; });
  S.current = 0;
}
function normalizeAnswers(raw, questions){
  const out = {};
  questions.forEach(q=>{
    const a = (raw||{})[q.id];
    out[q.id] = (a && typeof a === "object") ? { insan:a.insan??null, surec:a.surec??null, teknoloji:a.teknoloji??null } : { insan:null, surec:null, teknoloji:null };
  });
  return out;
}
function persistProgress(){
  try{ localStorage.setItem(progressKey(), JSON.stringify({ orgName:S.orgName, current:S.current, answers:S.answers, ts: Date.now() })); }catch(e){}
  const ind = document.getElementById("saveIndicator");
  if(ind){
    ind.classList.add("show");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(()=> ind.classList.remove("show"), 1400);
  }
}
function loadProgress(){
  try{ const raw = localStorage.getItem(progressKey()); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function clearProgress(){ try{ localStorage.removeItem(progressKey()); }catch(e){} }

/* ---------------- Açılış ekranı ---------------- */
const DOMAIN_INFO = {
  "Yönetişim, Risk ve Uyumluluk": { icon:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>', desc:"Üst yönetim sorumluluğu, risk yönetimi ve mevzuat uyumu" },
  "Varlık ve Yapılandırma Yönetimi": { icon:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>', desc:"Donanım, yazılım ve veri envanterinin takibi" },
  "Kimlik ve Erişim Yönetimi": { icon:'<circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M17 15l2-2M14 18l2-2"/>', desc:"Çok faktörlü doğrulama, yetkilendirme ve hesap güvenliği" },
  "Ağ ve İletişim Güvenliği": { icon:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 7l10 0M6 8l5 8M18 8l-5 8"/>', desc:"Güvenlik duvarı, ağ segmentasyonu ve şifreli iletişim" },
  "Veri ve Kriptografi Güvenliği": { icon:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>', desc:"Veri şifreleme ve veri sızıntısı önleme" },
  "Tehdit ve Zafiyet Yönetimi": { icon:'<path d="M12 4l9 15H3z"/><path d="M12 10v4M12 17h.01"/>', desc:"Zararlı yazılımdan korunma, yama yönetimi ve sızma testleri" },
  "Olay Müdahale, İzleme ve Süreklilik": { icon:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', desc:"7/24 izleme, yedekleme ve iş sürekliliği planları" },
  "Uygulama ve Sistem Güvenliği": { icon:'<path d="M8 5L3 12l5 7M16 5l5 7-5 7"/>', desc:"Yazılım geliştirme ve sistem sıkılaştırma pratikleri" },
  "Fiziksel Güvenlik": { icon:'<rect x="5" y="8" width="14" height="12"/><path d="M9 8V4h6v4M9 13h2M13 13h2M9 17h2M13 17h2"/>', desc:"Sunucu odası ve fiziksel erişim kontrolleri" },
  "İnsan Kaynakları Güvenliği": { icon:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 15c2.5 0 5 1.5 5 5"/>', desc:"Farkındalık eğitimleri ve güvenlik kültürü" },
  "Tedarikçi ve Üçüncü Taraf Güvenliği": { icon:'<path d="M8 12l3 3 5-5"/><circle cx="12" cy="12" r="9"/>', desc:"Tedarikçi sözleşmeleri ve erişim denetimi" },
};

function renderDomainCloud(){
  const domains = [...new Set(S.questions.map(q=>q.domain))];
  document.getElementById("domainCloud").innerHTML = domains.map(d => {
    const info = DOMAIN_INFO[d] || { icon:'<circle cx="12" cy="12" r="8"/>', desc:"" };
    return `
      <div class="domain-card">
        <div class="domain-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${info.icon}</svg></div>
        <div class="domain-card-body">
          <div class="domain-card-name">${esc(d)}</div>
          <div class="domain-card-desc">${esc(info.desc)}</div>
        </div>
      </div>`;
  }).join("");
}
function updateLandingMeta(){
  const nD = new Set(S.questions.map(q=>q.domain)).size, nQ = S.questions.length;
  const set = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = v; };
  set("landingEyebrow", `Hızlı Değerlendirme · ${nD} Alan · ${nQ} Soru`);
  set("metaDomains", nD); set("metaQuestions", nQ);
  document.querySelectorAll(".js-qcount").forEach(el => el.textContent = nQ);
}

let hasActiveProgress = false;
function updateStartButtonState(){
  const btn = document.getElementById("btnStart");
  if(!btn) return;
  hasActiveProgress = S.questions.filter(isAnswered).length > 0;
  const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  btn.innerHTML = (hasActiveProgress ? "Değerlendirmeye Devam Et " : "Değerlendirmeye Başla ") + arrow;
}
function goLanding(){
  document.getElementById("orgNameInput").value = S.orgName;
  showScreen("landing");
  updateStartButtonState();
  if(FULL && FULL.onLanding) FULL.onLanding();
}

/* ---------------------------------------------------------
   AES-256-GCM şifreli cevap dosyası (anahtar: 8 haneli şifre, PBKDF2)
--------------------------------------------------------- */
function generateSubmissionPassword(){
  return String(Math.floor(10000000 + Math.random() * 90000000));
}
function buf2b64(buf){
  const bytes = new Uint8Array(buf); let bin = "";
  for(let i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b642buf(b64){
  const bin = atob(b64); const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
async function deriveAesKey(password, saltBuf){
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), {name:"PBKDF2"}, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name:"PBKDF2", salt: saltBuf, iterations: 150000, hash: "SHA-256" }, keyMaterial, { name:"AES-GCM", length: 256 }, false, ["encrypt","decrypt"]);
}
async function encryptJsonPayload(obj, password){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { type:"quickassess_encrypted_submission", alg:"AES-256-GCM/PBKDF2-SHA256", salt:buf2b64(salt), iv:buf2b64(iv), ciphertext:buf2b64(ciphertext) };
}
async function decryptJsonPayload(envelope, password){
  const key = await deriveAesKey(password, b642buf(envelope.salt));
  let plainBuf;
  try{ plainBuf = await crypto.subtle.decrypt({name:"AES-GCM", iv:b642buf(envelope.iv)}, key, b642buf(envelope.ciphertext)); }
  catch(e){ throw new Error("Şifre yanlış veya dosya bozuk."); }
  return JSON.parse(new TextDecoder().decode(plainBuf));
}
function slugForFilename(s){
  return (s||"Kurum").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g,"").slice(0,40) || "Kurum";
}
function downloadBlob(blob, filename){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}

let currentSubmissionPassword = null;
async function exportAnswersAsJson(){
  const qs = clientView(S.questions);
  const submission = {
    type: "quickassess_submission",
    format: 2,
    appVersion: APP_VERSION,
    orgName: S.orgName,
    submittedAt: new Date().toISOString(),
    questionCount: qs.length,
    qsetHash: await qsetHash(S.questions),
    questions: qs,           // cevaplanan soru setinin birebir kopyası
    answers: S.answers,
  };
  currentSubmissionPassword = generateSubmissionPassword();
  const envelope = await encryptJsonPayload(submission, currentSubmissionPassword);
  downloadBlob(new Blob([JSON.stringify(envelope)], {type:"application/json"}),
    `Degerlendirme_Cevaplari_${slugForFilename(S.orgName)}_${new Date().toISOString().slice(0,10)}.json`);
  const el = document.getElementById("submissionPasswordValue");
  if(el) el.textContent = currentSubmissionPassword || "—";
}

function checkResume(){
  const saved = loadProgress();
  if(!saved) return;
  const answeredCount = Object.values(saved.answers||{}).filter(v => v && (v.insan!=null || v.surec!=null || v.teknoloji!=null)).length;
  if(answeredCount === 0) return;
  document.getElementById("resumeText").textContent =
    `${saved.orgName ? '"'+saved.orgName+'" için ' : ''}${answeredCount} / ${S.questions.length} soru yanıtlanmış bir değerlendirme bulundu. Kaldığınız yerden devam etmek ister misiniz?`;
  document.getElementById("resumeModal").classList.remove("hidden");
  document.getElementById("btnResumeContinue").onclick = ()=>{
    document.getElementById("resumeModal").classList.add("hidden");
    S.orgName = saved.orgName || "";
    S.answers = normalizeAnswers(saved.answers, S.questions);
    S.current = Math.min(saved.current || 0, S.questions.length - 1);
    document.getElementById("orgNameInput").value = S.orgName;
    startAssessment(true);
  };
  document.getElementById("btnResumeFresh").onclick = ()=>{
    document.getElementById("resumeModal").classList.add("hidden");
    clearProgress(); resetAnswers();
    updateStartButtonState();
  };
}

/* ---------------------------------------------------------
   Anket akışı
--------------------------------------------------------- */
function isAnswered(q){
  const a = S.answers[q.id];
  if(!a) return false;
  return DIM_KEYS.some(d => q[d] !== null && a[d] != null);
}

function renderFilterPanel(){
  const panel = document.getElementById("filterPanel");
  const domains = [...new Set(S.questions.map(q=>q.domain))];
  const impacts = ["Çok Yüksek Etki","Yüksek Etki","Orta Etki","Düşük Etki"].filter(imp => S.questions.some(q=>q.etki===imp));
  const matchCount = S.questions.filter(questionMatchesFilter).length;
  panel.innerHTML = `
    <div class="filter-row">
      <span class="filter-row-label">Durum</span>
      <div class="filter-chip-row"><button class="filter-chip ${qFilter.unansweredOnly?'active':''}" data-kind="unanswered">Sadece Yanıtlanmamış</button></div>
    </div>
    <div class="filter-row">
      <span class="filter-row-label">Kontrol Alanı</span>
      <div class="filter-chip-row">${domains.map(d=>`<button class="filter-chip ${qFilter.domains.has(d)?'active':''}" data-kind="domain" data-val="${esc(d)}">${esc(d)}</button>`).join("")}</div>
    </div>
    <div class="filter-row">
      <span class="filter-row-label">Etki Seviyesi</span>
      <div class="filter-chip-row">${impacts.map(imp=>`<button class="filter-chip ${qFilter.impacts.has(imp)?'active':''}" data-kind="impact" data-val="${esc(imp)}">${esc(imp)}</button>`).join("")}</div>
    </div>
    <div class="filter-panel-footer">
      <span class="filter-match-count">${isFilterActive() ? `${matchCount} / ${S.questions.length} soru eşleşiyor` : "Filtre uygulanmıyor"}</span>
      <button class="filter-clear-btn" id="btnClearFilter">Filtreyi Temizle</button>
    </div>`;
  panel.querySelectorAll(".filter-chip").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      const kind = chip.getAttribute("data-kind"), v = chip.getAttribute("data-val");
      if(kind === "unanswered") qFilter.unansweredOnly = !qFilter.unansweredOnly;
      else if(kind === "domain") qFilter.domains.has(v) ? qFilter.domains.delete(v) : qFilter.domains.add(v);
      else if(kind === "impact") qFilter.impacts.has(v) ? qFilter.impacts.delete(v) : qFilter.impacts.add(v);
      renderFilterPanel(); renderStepDots();
    });
  });
  document.getElementById("btnClearFilter").addEventListener("click", ()=>{ clearFilter(); renderFilterPanel(); renderStepDots(); });
}

function renderStepDots(){
  document.getElementById("stepDots").innerHTML = S.questions.map((q,i)=>{
    let cls = "step-dot";
    if(i === S.current) cls += " current";
    else if(isAnswered(q)) cls += " done";
    if(isFilterActive() && !questionMatchesFilter(q)) cls += " filtered-out";
    return `<button class="${cls}" data-idx="${i}" title="Soru ${i+1}: ${esc(q.domain)}"></button>`;
  }).join("");
  document.querySelectorAll(".step-dot").forEach(dot=>{
    dot.addEventListener("click", ()=> goTo(parseInt(dot.getAttribute("data-idx"),10)));
  });
}
function updateProgress(){
  const answeredCount = S.questions.filter(isAnswered).length;
  document.getElementById("progressFill").style.width = `${(answeredCount/Math.max(1,S.questions.length)*100).toFixed(1)}%`;
}

const NA_TEXT = "Bu boyut kurumunuz için kapsam dışı olarak işaretlendi — hesaplamalara dahil edilmeyecek.";
const PLACEHOLDER_TEXT = "Bir seviye seçin veya üzerine gelerek önizleyin. Yanıtlanmazsa, hesaplamada en düşük seviye (1) olarak dikkate alınır.";

function dimAnswerBlockHTML(q, dim){
  if(q[dim] === null) return "";
  const selected = S.answers[q.id][dim];
  const isNA = selected === OUT_OF_SCOPE;
  const pills = [1,2,3,4,5].map(lvl => `<button class="pill-btn ${selected===lvl?'selected':''}" style="--pc:${LEVEL_COLOR[lvl]}" data-dim="${dim}" data-level="${lvl}">${lvl}</button>`).join("");
  const naPill = `<button class="pill-btn pill-na ${isNA?'selected':''}" data-dim="${dim}" data-level="na">Kapsam Dışı</button>`;
  const shownLevel = (typeof selected === "number") ? selected : null;
  const textHtml = isNA ? `<div class="dim-answer-text">${NA_TEXT}</div>`
    : shownLevel ? `<div class="dim-answer-text">${esc(q[dim][shownLevel])}</div>`
    : `<div class="dim-answer-text placeholder">${PLACEHOLDER_TEXT}</div>`;
  return `
    <div class="dim-answer-block" data-dim="${dim}">
      <div class="dim-answer-head">
        <span class="dim-answer-label">${DIM_LABELS[dim]}</span>
        ${shownLevel ? `<span class="dim-answer-badge" style="color:${LEVEL_COLOR[shownLevel]}">Seviye ${shownLevel}</span>` : ""}
        ${isNA ? `<span class="dim-answer-badge" style="color:var(--text-faint)">Kapsam Dışı</span>` : ""}
      </div>
      <div class="dim-answer-pills">${pills}${naPill}</div>
      ${textHtml}
    </div>`;
}

function renderQuestion(){
  const q = S.questions[S.current];
  const impact = IMPACT_COLOR[q.etki] || IMPACT_COLOR["Orta Etki"];
  const blocksHtml = DIM_KEYS.filter(d => q[d] !== null).map(d => dimAnswerBlockHTML(q, d)).join("");
  document.getElementById("qCard").innerHTML = `
    <div class="q-meta-row">
      <span class="domain-badge">${esc(q.domain)}</span>
      <span class="impact-badge" style="background:${impact.bg};color:${impact.fg}">${esc(q.etki)}</span>
      <span class="q-number">Soru ${S.current+1} / ${S.questions.length}</span>
    </div>
    <div class="q-text">${esc(q.soru)}</div>
    <div class="q-why"><b>Neden soruyoruz:</b> ${esc(q.aciklama)}</div>
    <div class="q-hint">İnsan, Süreç ve Teknoloji boyutları farklı olgunlukta olabilir — her biri için ayrı ayrı, kurumunuzu bugün en iyi tanımlayan seviyeyi seçin.</div>
    <div class="dim-answer-list">${blocksHtml}</div>`;

  document.querySelectorAll("#qCard .pill-btn").forEach(btn=>{
    const dim = btn.getAttribute("data-dim");
    const raw = btn.getAttribute("data-level");
    const lvl = raw === "na" ? OUT_OF_SCOPE : parseInt(raw, 10);
    btn.addEventListener("click", ()=>{
      S.answers[q.id][dim] = (S.answers[q.id][dim] === lvl) ? null : lvl;
      renderQuestion(); renderStepDots(); updateProgress(); persistProgress();
    });
    if(lvl === OUT_OF_SCOPE) return;
    const textEl = () => btn.closest(".dim-answer-block").querySelector(".dim-answer-text");
    btn.addEventListener("mouseenter", ()=>{ const t = textEl(); t.textContent = q[dim][lvl]; t.classList.remove("placeholder"); });
    btn.addEventListener("mouseleave", ()=>{
      const t = textEl(); const sel = S.answers[q.id][dim];
      if(typeof sel === "number"){ t.textContent = q[dim][sel]; t.classList.remove("placeholder"); }
      else if(sel === OUT_OF_SCOPE){ t.textContent = NA_TEXT; t.classList.remove("placeholder"); }
      else { t.textContent = PLACEHOLDER_TEXT; t.classList.add("placeholder"); }
    });
  });
  document.getElementById("btnPrev").disabled = S.current === 0;
  document.getElementById("btnNext").textContent = S.current === S.questions.length - 1
    ? (FULL ? "Sonuçları Gör →" : "Tamamla ve Dosyayı İndir →") : "Sonraki →";
}

function goTo(idx){
  S.current = Math.max(0, Math.min(S.questions.length - 1, idx));
  renderQuestion(); renderStepDots();
  window.scrollTo({top:0, behavior:"smooth"});
}
function findMatchingIndex(fromIdx, dir){
  let idx = fromIdx + dir;
  while(idx >= 0 && idx < S.questions.length){
    if(questionMatchesFilter(S.questions[idx])) return idx;
    idx += dir;
  }
  return null;
}
function startAssessment(resumed){
  if(!resumed){ resetAnswers(); clearFilter(); }
  document.getElementById("filterPanel").classList.add("hidden");
  showScreen("assessment");
  goTo(S.current);
  updateProgress();
}

/* ---------------- Ekran geçişleri ---------------- */
function showScreen(id){
  document.querySelectorAll("section.screen").forEach(s => s.classList.toggle("hidden", s.id !== id));
  window.scrollTo({top:0});
}

/* ---------------- Tema ve sürüm ---------------- */
/* Tema: arayuz-tasarim-sistemi mekaniği — ilk değer <head>'deki başlatıcıda
   (yanıp sönme olmasın diye) html[data-theme]'ya yazılır; burada yalnız düğme bağlanır. */
function initTheme(){
  const root = document.documentElement;
  if(!root.getAttribute("data-theme")) root.setAttribute("data-theme", "dark");
  document.getElementById("themeToggle").addEventListener("click", ()=>{
    const t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", t);
    try{ localStorage.setItem("arayuz-tema", t); }catch(e){}
  });
}
function initVersionBadge(){
  const b = document.getElementById("appVersionBadge");
  if(!b) return;
  b.textContent = "v" + APP_VERSION;
  b.title = APP_CHANGELOG.map(c => `v${c.v} (${c.date}): ${c.notes}`).join("\n\n");
}

/* ---------------- Dahili modüle açılan arayüz ---------------- */
window.QA_CORE = {
  APP_VERSION, APP_CHANGELOG, DEFAULT_QUESTIONS, DIM_KEYS, DIM_LABELS, LEVEL_COLOR, OUT_OF_SCOPE, S,
  esc, uid, clone, clientView, normalizeImpact, normalizeQuestions, qsetHash, sha256Hex, fnv1a, normalizeAnswers, decryptJsonPayload,
  slugForFilename, downloadBlob, showScreen, goLanding, startAssessment, resetAnswers, clearProgress,
  renderDomainCloud, updateLandingMeta, updateStartButtonState, isAnswered,
};

/* ---------------- Başlatma ---------------- */
function init(){
  FULL = window.QA_FULL || null;
  initVersionBadge();
  initTheme();
  S.questions = normalizeQuestions(FULL ? FULL.loadQuestions() : clone(DEFAULT_QUESTIONS));
  resetAnswers();
  renderDomainCloud();
  updateLandingMeta();
  document.title = FULL ? "Olgunluk Değerlendirmesi — Yönetim Paneli" : "Siber Güvenlik Olgunluk Anketi";

  document.getElementById("btnStart").addEventListener("click", ()=>{
    S.orgName = document.getElementById("orgNameInput").value.trim();
    startAssessment(hasActiveProgress);
  });
  document.getElementById("btnToggleFilter").addEventListener("click", ()=>{
    const panel = document.getElementById("filterPanel");
    if(panel.classList.contains("hidden")) renderFilterPanel();
    panel.classList.toggle("hidden");
  });
  document.getElementById("btnGoHome").addEventListener("click", goLanding);
  document.getElementById("btnRedownloadSubmission").addEventListener("click", ()=> exportAnswersAsJson());
  document.getElementById("btnEditAnswers").addEventListener("click", ()=>{ showScreen("assessment"); goTo(S.current); updateProgress(); });
  document.getElementById("btnClientRestart").addEventListener("click", ()=>{
    if(!confirm("Tüm yanıtlarınız sıfırlanacak. Emin misiniz?")) return;
    clearProgress(); resetAnswers(); goLanding();
  });
  document.getElementById("btnPrev").addEventListener("click", ()=>{
    if(isFilterActive()){ const idx = findMatchingIndex(S.current, -1); if(idx != null) goTo(idx); }
    else goTo(S.current-1);
  });
  document.getElementById("btnNext").addEventListener("click", async ()=>{
    if(S.current === S.questions.length - 1){
      if(FULL){ FULL.finishAssessment(); }
      else { await exportAnswersAsJson(); showScreen("clientDone"); }
    } else if(isFilterActive()){
      const idx = findMatchingIndex(S.current, 1); if(idx != null) goTo(idx);
    } else goTo(S.current+1);
  });

  if(FULL){
    // Dahili modül: açılış ekranı araç merkezidir (anket değerlendirme, soru yönetimi, anket üretimi).
    document.documentElement.classList.add("mod-tam");
    const ma = document.getElementById("markaAlt"); if(ma) ma.textContent = "Yönetim Paneli";
    FULL.init();
    return;
  }
  updateStartButtonState();
  checkResume();
}
document.addEventListener("DOMContentLoaded", init);
})();
