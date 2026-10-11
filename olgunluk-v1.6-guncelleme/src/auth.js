(function(){
"use strict";
/* =========================================================
   KİMLİK DOĞRULAYICI — TOTP kod üreteci
   Hesaplar ana parolayla (PBKDF2-SHA256 250k → AES-256-GCM)
   şifrelenip yalnızca bu tarayıcıda saklanır; açık hâli bellekte.
========================================================= */
const APP_VERSION = "1.0";
const APP_CHANGELOG = [
  { v:"1.0", date:"2026-10-02", notes:"İlk sürüm: TOTP (RFC 6238) kod üretimi, otpauth bağlantısı veya elle hesap ekleme, şifreli kasa, otomatik kilit, şifreli yedek." },
];
const T = window.QA_TOTP;
const LS_VAULT = "qa_authenticator_vault_v1", LS_PREFS = "qa_authenticator_prefs_v1";

let master = null;     // açık oturumda ana parola (yalnızca bellek)
let accounts = [];     // [{id, issuer, account, secret, digits, period, algorithm, added}]
let prefs = { autolock:5, hide:false, theme:null };
let lastActivity = Date.now();
let revealed = new Set();
let tickTimer = null;

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){ const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(()=> t.classList.remove("show"), 1600); }
function show(id){ ["scrSetup","scrLock","scrMain"].forEach(s => $(s).classList.toggle("hidden", s !== id)); }
function loadPrefs(){ try{ Object.assign(prefs, JSON.parse(localStorage.getItem(LS_PREFS) || "{}")); }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(LS_PREFS, JSON.stringify(prefs)); }catch(e){} }
function readVault(){ try{ return JSON.parse(localStorage.getItem(LS_VAULT) || "null"); }catch(e){ return null; } }
async function persist(){
  const box = await T.sealText(JSON.stringify({ accounts }), master);
  localStorage.setItem(LS_VAULT, JSON.stringify(box));
}
function applyTheme(){ if(prefs.theme) document.documentElement.setAttribute("data-theme", prefs.theme); else document.documentElement.removeAttribute("data-theme"); }

/* ---------------- Kurulum / kilit ---------------- */
async function doSetup(){
  const a = $("setupPw").value, b = $("setupPw2").value;
  if(a.length < 8){ $("setupErr").textContent = "Ana parola en az 8 karakter olmalı."; return; }
  if(a !== b){ $("setupErr").textContent = "Parolalar eşleşmiyor."; return; }
  master = a; accounts = [];
  $("btnSetup").disabled = true;
  await persist();
  $("setupPw").value = $("setupPw2").value = "";
  $("btnSetup").disabled = false;
  enterMain();
}
async function doUnlock(){
  const pw = $("lockPw").value; $("lockErr").textContent = "";
  $("btnUnlock").disabled = true;
  try{
    const data = JSON.parse(await T.openText(readVault(), pw));
    master = pw; accounts = data.accounts || [];
    $("lockPw").value = "";
    enterMain();
  }catch(e){ $("lockErr").textContent = "Ana parola hatalı."; }
  finally{ $("btnUnlock").disabled = false; }
}
function lock(){
  master = null; accounts = []; revealed.clear();
  clearInterval(tickTimer); tickTimer = null;
  $("list").innerHTML = "";
  ["dlgAdd","dlgSettings"].forEach(d => $(d).classList.add("hidden"));
  show("scrLock");
  setTimeout(()=> $("lockPw").focus(), 50);
}
function enterMain(){
  show("scrMain");
  lastActivity = Date.now();
  renderList();
  clearInterval(tickTimer);
  tickTimer = setInterval(tick, 1000);
  tick();
}

/* ---------------- Liste ve kodlar ---------------- */
const ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>';
const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

function renderList(){
  const q = ($("search").value || "").toLocaleLowerCase("tr-TR");
  $("search").classList.toggle("hidden", accounts.length < 5);
  $("empty").classList.toggle("hidden", accounts.length > 0);
  const items = accounts.filter(a => !q || (a.issuer + " " + a.account).toLocaleLowerCase("tr-TR").includes(q));
  $("list").innerHTML = items.map(a => `
    <div class="acct" data-id="${a.id}">
      <div class="acct-main">
        <div class="acct-issuer">${esc(a.issuer || "—")}</div>
        <div class="acct-name">${esc(a.account || "")}</div>
        <button class="acct-code" data-copy="${a.id}" title="Kopyalamak için tıklayın">••• •••</button>
      </div>
      <div class="acct-side">
        <div class="ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--raised2)" stroke-width="4"/><circle class="ring-fg" cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="100.5" stroke-dashoffset="0"/></svg><span class="ring-txt"></span></div>
        <div class="mini">
          <button data-copy="${a.id}" title="Kopyala">${ICON_COPY}</button>
          <button data-edit="${a.id}" title="Düzenle">${ICON_EDIT}</button>
          <button data-del="${a.id}" title="Sil">${ICON_DEL}</button>
        </div>
      </div>
    </div>`).join("");
  $("list").querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", ()=> copyCode(b.getAttribute("data-copy"))));
  $("list").querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", ()=> openAdd(b.getAttribute("data-edit"))));
  $("list").querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", ()=> delAccount(b.getAttribute("data-del"))));
  tick();
}
const fmtCode = c => c.length === 6 ? c.slice(0,3) + " " + c.slice(3) : c.slice(0,4) + " " + c.slice(4);
async function tick(){
  if(!master) return;
  const ms = prefs.autolock > 0 ? prefs.autolock * 60000 : 0;
  if(ms && Date.now() - lastActivity > ms){ lock(); return; }
  const now = new Date();
  $("clock").textContent = `Cihaz saati: ${now.toLocaleTimeString("tr-TR")} — kodlar cihaz saatine göre üretilir; saat doğru olmalıdır.`;
  for(const a of accounts){
    const el = document.querySelector(`.acct[data-id="${a.id}"]`);
    if(!el) continue;
    const period = a.period || 30;
    const left = period - (Math.floor(Date.now()/1000) % period);
    const codeEl = el.querySelector(".acct-code");
    const code = await T.totp(a.secret, { digits:a.digits, period, algorithm:a.algorithm });
    const masked = prefs.hide && !revealed.has(a.id);
    codeEl.textContent = masked ? "••• •••" : fmtCode(code);
    codeEl.classList.toggle("masked", masked);
    codeEl.classList.toggle("warn", !masked && left <= 5);
    el.querySelector(".ring-fg").setAttribute("stroke-dashoffset", String(100.5 * (1 - left/period)));
    el.querySelector(".ring-fg").setAttribute("stroke", left <= 5 ? "var(--warn)" : "var(--accent)");
    el.querySelector(".ring-txt").textContent = left;
  }
}
async function copyCode(id){
  const a = accounts.find(x => x.id === id); if(!a) return;
  if(prefs.hide && !revealed.has(id)){ revealed.add(id); setTimeout(()=>{ revealed.delete(id); tick(); }, 15000); tick(); }
  const code = await T.totp(a.secret, { digits:a.digits, period:a.period, algorithm:a.algorithm });
  try{ await navigator.clipboard.writeText(code); toast("Kod kopyalandı"); setTimeout(()=>{ navigator.clipboard.writeText("").catch(()=>{}); }, 30000); }
  catch(e){ toast("Kopyalanamadı — kodu elle yazın"); }
}
async function delAccount(id){
  const a = accounts.find(x => x.id === id); if(!a) return;
  if(!confirm(`"${a.issuer} · ${a.account}" silinecek. Bu hesapla girişte kod üretemezsiniz. Emin misiniz?`)) return;
  accounts = accounts.filter(x => x.id !== id);
  await persist(); renderList(); toast("Hesap silindi");
}

/* ---------------- Hesap ekle / düzenle ---------------- */
let editingId = null, addTab = "uri";
function setTab(t){
  addTab = t;
  document.querySelectorAll("#dlgAdd .tab").forEach(b => b.classList.toggle("active", b.getAttribute("data-tab") === t));
  document.querySelectorAll("#dlgAdd [data-pane]").forEach(p => p.classList.toggle("hidden", p.getAttribute("data-pane") !== t));
  updatePreview();
}
function openAdd(id){
  editingId = id || null;
  const a = id ? accounts.find(x => x.id === id) : null;
  $("addTitle").textContent = a ? "Hesabı Düzenle" : "Hesap Ekle";
  $("addUri").value = "";
  $("addIssuer").value = a ? a.issuer : ""; $("addAccount").value = a ? a.account : "";
  $("addSecret").value = a ? a.secret : ""; $("addDigits").value = String(a ? a.digits : 6);
  $("addPeriod").value = String(a ? a.period : 30); $("addAlg").value = a ? a.algorithm : "SHA1";
  $("addErr").textContent = ""; $("addPreview").textContent = "";
  document.querySelector('#dlgAdd .tab[data-tab="uri"]').classList.toggle("hidden", !!a);
  setTab(a ? "manual" : "uri");
  $("dlgAdd").classList.remove("hidden");
  setTimeout(()=> (a ? $("addIssuer") : $("addUri")).focus(), 50);
}
function readAddForm(){
  if(addTab === "uri"){
    const raw = $("addUri").value.trim();
    if(!raw) throw new Error("Bağlantıyı yapıştırın.");
    return T.parseOtpauth(raw);
  }
  const secret = $("addSecret").value.toUpperCase().replace(/[\s-]/g, "");
  if(!secret) throw new Error("Gizli anahtarı girin.");
  T.base32Decode(secret);
  if(T.base32Decode(secret).length < 10) throw new Error("Anahtar çok kısa (en az 16 Base32 karakter).");
  return { issuer:$("addIssuer").value.trim(), account:$("addAccount").value.trim(), secret,
    digits:parseInt($("addDigits").value,10), period:parseInt($("addPeriod").value,10), algorithm:$("addAlg").value };
}
async function updatePreview(){
  try{
    const o = readAddForm();
    const c = await T.totp(o.secret, { digits:o.digits, period:o.period, algorithm:o.algorithm });
    $("addPreview").textContent = `${o.issuer || "—"} · ${o.account || "—"} → şu anki kod: ${fmtCode(c)}`;
    $("addErr").textContent = "";
  }catch(e){ $("addPreview").textContent = ""; }
}
async function saveAdd(){
  let o;
  try{ o = readAddForm(); }catch(e){ $("addErr").textContent = e.message; return; }
  if(!o.issuer && !o.account){ $("addErr").textContent = "Hizmet veya hesap adı girin."; return; }
  if(editingId){
    const a = accounts.find(x => x.id === editingId);
    Object.assign(a, o);
  } else {
    if(accounts.some(x => x.secret === o.secret)){ $("addErr").textContent = "Bu anahtar zaten kayıtlı."; return; }
    accounts.push(Object.assign({ id: "a" + Math.random().toString(36).slice(2,10), added: new Date().toISOString() }, o));
  }
  await persist();
  $("dlgAdd").classList.add("hidden");
  renderList(); toast(editingId ? "Hesap güncellendi" : "Hesap eklendi");
}

/* ---------------- Ayarlar ---------------- */
function openSettings(){
  $("setAutolock").value = String(prefs.autolock);
  $("setHide").checked = !!prefs.hide;
  $("chgPwBox").classList.add("hidden");
  $("setVersion").textContent = APP_CHANGELOG.map(c => `v${c.v} (${c.date}) — ${c.notes}`).join(" ");
  $("dlgSettings").classList.remove("hidden");
}
function download(blob, name){
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.style.display = "none";
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
async function exportBackup(){
  const box = await T.sealText(JSON.stringify({ accounts, exportedAt:new Date().toISOString() }), master);
  download(new Blob([JSON.stringify({ type:"qa_authenticator_backup", version:APP_VERSION, box })], {type:"application/json"}),
    `Kimlik_Dogrulayici_Yedek_${new Date().toISOString().slice(0,10)}.json`);
  toast("Şifreli yedek indirildi");
}
function importBackup(file){
  const r = new FileReader();
  r.onload = async ()=>{
    try{
      const d = JSON.parse(r.result);
      if(d.type !== "qa_authenticator_backup") throw new Error("Bu dosya bir Kimlik Doğrulayıcı yedeği değil.");
      const pw = prompt("Yedeğin oluşturulduğu ana parolayı girin:");
      if(pw == null) return;
      const data = JSON.parse(await T.openText(d.box, pw));
      const incoming = data.accounts || [];
      if(!master){ // kurulum ekranından geri yükleme: yedeğin parolası ana parola olur
        master = pw; accounts = incoming;
      } else {
        let added = 0;
        incoming.forEach(a => { if(!accounts.some(x => x.secret === a.secret)){ accounts.push(a); added++; } });
        toast(`${added} hesap eklendi`);
      }
      await persist();
      $("dlgSettings").classList.add("hidden");
      enterMain();
    }catch(e){ alert("Yedek yüklenemedi: " + e.message); }
  };
  r.readAsText(file);
}
async function changePw(){
  const o = $("chgOld").value, n = $("chgNew").value, n2 = $("chgNew2").value;
  if(o !== master){ $("chgErr").textContent = "Mevcut parola hatalı."; return; }
  if(n.length < 8){ $("chgErr").textContent = "Yeni parola en az 8 karakter olmalı."; return; }
  if(n !== n2){ $("chgErr").textContent = "Yeni parolalar eşleşmiyor."; return; }
  master = n; await persist();
  $("chgOld").value = $("chgNew").value = $("chgNew2").value = ""; $("chgErr").textContent = "";
  $("chgPwBox").classList.add("hidden"); toast("Ana parola güncellendi");
}
function wipe(){
  if(!confirm("Kasadaki tüm hesaplar bu tarayıcıdan kalıcı olarak silinecek. Yedeğiniz yoksa bu hesaplar için kod üretemezsiniz. Devam edilsin mi?")) return;
  localStorage.removeItem(LS_VAULT);
  master = null; accounts = [];
  clearInterval(tickTimer);
  $("dlgSettings").classList.add("hidden");
  show("scrSetup");
}

/* ---------------- Başlatma ---------------- */
function init(){
  $("ver").textContent = "v" + APP_VERSION;
  $("ver").title = APP_CHANGELOG.map(c => `v${c.v} (${c.date}): ${c.notes}`).join("\n");
  loadPrefs(); applyTheme();
  if(!window.crypto || !crypto.subtle){ document.body.innerHTML = "<p style='padding:24px'>Bu tarayıcı Web Crypto desteklemiyor. Güncel bir Chrome, Edge veya Firefox kullanın.</p>"; return; }

  $("btnSetup").onclick = doSetup;
  $("setupPw2").addEventListener("keydown", e => { if(e.key === "Enter") doSetup(); });
  $("btnUnlock").onclick = doUnlock;
  $("lockPw").addEventListener("keydown", e => { if(e.key === "Enter") doUnlock(); });
  $("btnLock").onclick = lock;
  $("btnAdd").onclick = ()=> openAdd(); $("btnAddEmpty").onclick = ()=> openAdd();
  $("btnAddCancel").onclick = ()=> $("dlgAdd").classList.add("hidden");
  $("btnAddSave").onclick = saveAdd;
  document.querySelectorAll("#dlgAdd .tab").forEach(b => b.onclick = ()=> setTab(b.getAttribute("data-tab")));
  ["addUri","addIssuer","addAccount","addSecret","addDigits","addPeriod","addAlg"].forEach(id => $(id).addEventListener("input", updatePreview));
  $("btnSettings").onclick = openSettings;
  $("btnSettingsClose").onclick = ()=> $("dlgSettings").classList.add("hidden");
  $("setAutolock").onchange = ()=>{ prefs.autolock = parseInt($("setAutolock").value,10); savePrefs(); };
  $("setHide").onchange = ()=>{ prefs.hide = $("setHide").checked; savePrefs(); revealed.clear(); tick(); };
  $("btnExport").onclick = exportBackup;
  $("btnImport").onclick = ()=> $("fileImport").click();
  $("btnSetupImport").onclick = ()=> $("fileImport").click();
  $("fileImport").onchange = e => { const f = e.target.files[0]; if(f) importBackup(f); e.target.value = ""; };
  $("btnChangePw").onclick = ()=> $("chgPwBox").classList.toggle("hidden");
  $("btnChgSave").onclick = changePw;
  $("btnWipe").onclick = wipe;
  $("search").addEventListener("input", renderList);
  $("btnTheme").onclick = ()=>{
    const dark = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() === "#101019";
    prefs.theme = dark ? "light" : "dark"; savePrefs(); applyTheme();
  };
  ["click","keydown","mousemove","touchstart"].forEach(ev => document.addEventListener(ev, ()=>{ lastActivity = Date.now(); }, { passive:true }));

  if(readVault()) lock(); else show("scrSetup");
}
document.addEventListener("DOMContentLoaded", init);
})();
