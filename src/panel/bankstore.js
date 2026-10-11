/* =====================================================================
   ETKİN SORU BANKASI
   ---------------------------------------------------------------------
   BANK_DEFAULT build sırasında src/data/bank.json'dan gömülür. Soru
   Yönetimi'nde yapılan düzenlemeler bu tarayıcıda (localStorage) saklanır
   ve açılışta varsayılanın yerine geçer. "Varsayılana dön" düzenlemeleri
   siler. Yapı her yüklemede doğrulanır; bozuk kayıt varsa varsayılan
   kullanılır.
   Satır biçimi (F): [id, uctIdx, nistIdx, başlık, soru, kritiklik(1–4),
   olgunluk(1–5), kapsamEtiketiIdx, mevzuat[], arketip, konu]
   ===================================================================== */
const LS_BANK = "aoc_bank_v1";

function validateBank(b){
  const errs = [];
  if(!b || typeof b !== "object") return ["banka nesnesi yok"];
  ["uct","nist","tags","scopes","deps","Q"].forEach(k => { if(!Array.isArray(b[k])) errs.push(k + " listesi yok"); });
  ["arch","ans"].forEach(k => { if(!b[k] || typeof b[k] !== "object") errs.push(k + " tablosu yok"); });
  if(errs.length) return errs;
  const ids = new Set();
  b.Q.forEach((q, i) => {
    const at = "satır " + (i + 1) + (q && q[0] ? " (" + q[0] + ")" : "");
    if(!Array.isArray(q) || q.length !== 11){ errs.push(at + ": alan sayısı hatalı"); return; }
    if(!q[0] || typeof q[0] !== "string") errs.push(at + ": soru kimliği yok");
    else if(ids.has(q[0])) errs.push(at + ": kimlik tekrarlanıyor");
    ids.add(q[0]);
    if(!(q[1] >= 0 && q[1] < b.uct.length)) errs.push(at + ": UCT alanı geçersiz");
    if(!(q[2] === -1 || (q[2] >= 0 && q[2] < b.nist.length))) errs.push(at + ": NIST alanı geçersiz");
    if(!String(q[4] || "").trim()) errs.push(at + ": soru metni boş");
    if(![1,2,3,4].includes(q[5])) errs.push(at + ": kritiklik 1–4 olmalı");
    if(![1,2,3,4,5].includes(q[6])) errs.push(at + ": olgunluk 1–5 olmalı");
    if(!(q[7] >= 0 && q[7] < b.tags.length)) errs.push(at + ": kapsam etiketi geçersiz");
    if(!Array.isArray(q[8])) errs.push(at + ": mevzuat listesi geçersiz");
    if(!b.arch[q[9]] || !b.ans[q[9]]) errs.push(at + ": arketip tanımsız (" + q[9] + ")");
  });
  Object.keys(b.ans).forEach(a => ["I","S","T"].forEach(ax => {
    const set = b.ans[a] && b.ans[a][ax];
    if(!Array.isArray(set) || set.length !== 5 || set.some(s => !String(s || "").trim())) errs.push("cevap şablonu eksik: " + a + "/" + ax);
  }));
  b.deps.forEach((d, i) => {
    if(!Array.isArray(d) || d.length < 3 || !ids.has(d[0]) || !(d[2] >= 0 && d[2] <= 1)) errs.push("bağımlılık " + (i + 1) + " geçersiz");
  });
  return errs;
}

function cloneBank(b){ return JSON.parse(JSON.stringify(b)); }

const BANK = (function(){
  try{
    const raw = localStorage.getItem(LS_BANK);
    if(raw){
      const b = JSON.parse(raw);
      if(validateBank(b).length === 0) return b;
    }
  }catch(e){}
  return cloneBank(BANK_DEFAULT);
})();

function bankIsEdited(){ try{ return !!localStorage.getItem(LS_BANK); }catch(e){ return false; } }

/* Etkin bankanın yerine yenisini koyar (yerinde günceller ki tüm referanslar geçerli kalsın). */
function replaceBank(nb){
  Object.keys(BANK).forEach(k => { delete BANK[k]; });
  Object.assign(BANK, cloneBank(nb));
}
function saveBank(){
  const errs = validateBank(BANK);
  if(errs.length) throw new Error("Banka doğrulanamadı: " + errs.slice(0, 3).join("; "));
  BANK.vBase = BANK.vBase || BANK_DEFAULT.v;
  BANK.v = BANK.vBase + " · düzenlendi " + new Date().toLocaleDateString("tr-TR");
  BANK.editedAt = new Date().toISOString();
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
}
function resetBank(){
  try{ localStorage.removeItem(LS_BANK); }catch(e){}
  replaceBank(BANK_DEFAULT);
}
