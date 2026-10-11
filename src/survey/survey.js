"use strict";
/* =====================================================================
   Scale Bilgi Güvenliği — Hızlı Değerlendirme anket motoru
   Kaynak: src/survey/ — Analiz Paneli build sırasında tek dosyalık
   anket şablonuna gömülür; anket verisi (SURVEY) üretim anında eklenir.
   ===================================================================== */

/* =====================================================================
   ANKET VERİSİ — Analiz Paneli tarafından üretilir.
   ===================================================================== */
const SURVEY = /*__SURVEY__*/null/*__/SURVEY__*/;

/* =====================================================================
   SABİTLER
   ===================================================================== */
const AXES = ["I","S","T"];
const AXIS_NAME = { I:"İnsan", S:"Süreç", T:"Teknoloji" };
const AXIS_FULL = { I:"İnsan (People)", S:"Süreç (Process)", T:"Teknoloji (Technology)" };
const AXIS_HINT = {
  I:"Sorumluluk, rol ve farkındalık tarafı — bu işi kim sahipleniyor?",
  S:"Süreç tarafı — yazılı kural var mı, düzenli işletiliyor mu?",
  T:"Teknoloji tarafı — hangi araç/kontrol devrede?"
};
/* 0 = kapsam dışı: bu boyutun kurumda karşılığı yok. Skorlamaya girmez. */
const NA_VALUE = 0;
const NA_TEXT = "Bu boyutun kurumumuzda uygulama alanı bulunmamaktadır (kapsam dışı).";

/* Anket verisi (v5) yalnızca katılımcının göreceği metinleri ve uyarlamalı akışın
   ihtiyaç duyduğu sıra bilgisini taşır: her kapsam kombinasyonu için alan planı
   (sorulacak soru aralığı + çalışma havuzu) panelde önceden hesaplanmıştır.
   Puanlama ağırlıkları, mevzuat eşlemeleri ve bağımlılıklar ankette yoktur. */
const SCOPES = SURVEY.scopes || [];
const AREA_META = {};
SURVEY.areas.forEach(a => AREA_META[a.c] = a);
const FULL_AREAS = SURVEY.areas;              /* alan adları (bilgi şeridi için) */
/* m = olgunluk basamağı (akışın yukarı/aşağı adımı), p = öncelik sırası */
const ITEMS = SURVEY.items.map(x => ({ id:x.id, t:x.t, q:x.q, arch:x.arch, k:x.k, m:x.m, w:x.p }));
const ITEM_BY_ID = {};
ITEMS.forEach(x => ITEM_BY_ID[x.id] = x);

/* Çalışma anında kapsam cevaplarına göre kurulan alan listesi */
let AREAS = [];
let AREA_BY_CODE = {};

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Arketip şablonuna sorunun konusunu gömer. */
function ansText(arch, axis, level, konu){
  const set = (SURVEY.ans[arch] || SURVEY.ans[Object.keys(SURVEY.ans)[0]])[axis];
  return String(set[level-1]).replace(/\{k\}/g, konu || "");
}

/* =====================================================================
   KAPSAM — anketin ilk sayfası
   ===================================================================== */
function defaultScopeAnswers(){
  const o = {}; SCOPES.forEach(s => o[s[0]] = !!s[2]); return o;
}

/* Kapsam cevaplarına göre AREAS'ı yeniden kurar.
   Havuzu tamamen elenen alan otomatik olarak kapsam dışı sayılır. */
function scopeMask(scopeAnswers){
  return SCOPES.reduce((m, s, i) => {
    const on = scopeAnswers[s[0]] === undefined ? !!s[2] : !!scopeAnswers[s[0]];
    return on ? (m | (1 << i)) : m;
  }, 0);
}
function rebuildAreas(scopeAnswers){
  const plan = SURVEY.plans[scopeMask(scopeAnswers)] || [];
  AREAS = plan.map(pa => {
    const meta = AREA_META[pa.c] || { c:pa.c, n:pa.c };
    return { c:pa.c, n:meta.n, f:meta.f || null, r:meta.r || "", scopeOut: !!pa.s,
             askMin:pa.a, askMax:pa.b, pool: pa.p.map(i => ITEMS[i]) };
  });
  AREA_BY_CODE = {}; AREAS.forEach(a => AREA_BY_CODE[a.c] = a);
  return AREAS;
}
function liveAreas(){ return AREAS.filter(a => !a.scopeOut); }

/* =====================================================================
   ADAPTİF MOTOR — bir alan içinde sıradaki kontrol sorusunun seçimi.
   prior: [{i:havuzIndeksi, r:1..5 (üç eksenin ortalaması)}]
   ===================================================================== */
function nextItemIndex(area, prior){
  const pool = area.pool;
  const used = prior.map(p => p.i);
  const free = i => used.indexOf(i) === -1;
  if(!pool.length) return -1;

  /* Yalnızca puanlanan (en az bir ekseni kapsam içi) cevaplar kotayı tüketir. */
  const scored = prior.filter(p => p.r !== null);
  if(scored.length >= area.askMax) return -1;

  const all = []; for(let i=0;i<pool.length;i++) if(free(i)) all.push(i);
  if(all.length === 0) return -1;                 /* havuz tükendi */

  const pickBy = (cands, keyFn) => cands.reduce((x,y) => {
    const kx = keyFn(x), ky = keyFn(y);
    return (ky[0] < kx[0] || (ky[0] === kx[0] && ky[1] < kx[1])) ? y : x;
  });

  /* İlk soru: olgunluk 2 civarı, en kritik olan. */
  if(prior.length === 0) return pickBy(all, i => [Math.abs(pool[i].m - 2), -pool[i].w]);

  const lastEntry = prior[prior.length-1];

  /* Son soru tamamen kapsam dışıydı → yana kay: farklı kontrol başlığı dene,
     kotayı tüketmediği için aynı basamakta kalınır. */
  if(lastEntry.r === null){
    const base = scored.length ? pool[scored[scored.length-1].i].m : 2;
    const lastT = pool[lastEntry.i].t;
    const other = all.filter(i => pool[i].t !== lastT);
    const c = other.length ? other : all;
    return pickBy(c, i => [Math.abs(pool[i].m - base), -pool[i].w]);
  }

  /* Yakınsama kontrolü son iki PUANLANAN cevaba bakar. */
  if(scored.length >= area.askMin){
    const a = scored[scored.length-2], b = scored[scored.length-1];
    if(a && Math.abs(a.r - b.r) <= 1) return -1;
  }

  const curM = pool[lastEntry.i].m;
  if(lastEntry.r >= 4){                             /* tavanı sına */
    const up = all.filter(i => pool[i].m > curM);
    const c = up.length ? up : all;
    return c.reduce((x,y) => (pool[y].m > pool[x].m || (pool[y].m === pool[x].m && pool[y].w > pool[x].w)) ? y : x);
  }
  if(lastEntry.r <= 2){                             /* tabanı sına */
    const dn = all.filter(i => pool[i].m < curM);
    const c = dn.length ? dn : all;
    return c.reduce((x,y) => (pool[y].m < pool[x].m || (pool[y].m === pool[x].m && pool[y].w > pool[x].w)) ? y : x);
  }
  return pickBy(all, i => [Math.abs(pool[i].m - curM - 1), -pool[i].w]);   /* bir üst basamak */
}

/* Kapsam dışı (0) eksenler ortalamaya girmez. Üçü de kapsam dışıysa null. */
function meanR(r){
  const v = AXES.map(a => r[a]).filter(x => x > 0);
  return v.length ? v.reduce((a,b) => a + b, 0) / v.length : null;
}
function isAllNA(r){ return AXES.every(a => r[a] === NA_VALUE); }
function naAxisCount(r){ return AXES.filter(a => r[a] === NA_VALUE).length; }

/* =====================================================================
   ŞİFRELEME (AES-256-GCM / PBKDF2-SHA256)
   ===================================================================== */
function generateSubmissionPassword(){
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  return String(10000000 + (a[0] % 90000000));
}
function buf2b64(buf){ const b = new Uint8Array(buf); let s=""; for(let i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s); }
async function deriveAesKey(password, saltBuf){
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), {name:"PBKDF2"}, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2", salt:saltBuf, iterations:150000, hash:"SHA-256"}, km, {name:"AES-GCM", length:256}, false, ["encrypt"]);
}
async function encryptJsonPayload(obj, password){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ct = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { type:"aoc_encrypted_submission", alg:"AES-256-GCM/PBKDF2-SHA256", salt:buf2b64(salt), iv:buf2b64(iv), ciphertext:buf2b64(ct) };
}
const TR_ASCII = { "ç":"c","Ç":"C","ğ":"g","Ğ":"G","ı":"i","İ":"I","ö":"o","Ö":"O","ş":"s","Ş":"S","ü":"u","Ü":"U" };
function slugForFilename(s){
  let t = String(s || "Kurum").replace(/[çÇğĞıİöÖşŞüÜ]/g, ch => TR_ASCII[ch]);
  try { t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch(e) {}
  return t.replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40) || "Kurum";
}

/* =====================================================================
   DURUM — kapsam cevapları + düz geçmiş dizisi
   history[k] = {a:alanKodu, i:havuzIndeksi, r:{I,S,T}} | {a:alanKodu, na:true}
   ===================================================================== */
let state = { orgName:"", scope:defaultScopeAnswers(), history:[], contact:null };
let viewIdx = 0;

function resetState(orgName){
  state = { orgName: orgName||"", scope: defaultScopeAnswers(), history: [], contact: null };
  viewIdx = 0; rebuildAreas(state.scope);
}

function deriveStateFromHistory(history){
  const areas = liveAreas();
  const results = {}; let areaPtr = 0, current = [], h = 0;
  for(; areaPtr < areas.length; areaPtr++){
    const area = areas[areaPtr];
    if(h < history.length && history[h].a === area.c && history[h].na){
      results[area.c] = { na:true, reason:"user", items:[] }; h++; continue;
    }
    const acc = [];
    while(h < history.length && history[h].a === area.c && !history[h].na){
      acc.push({ i:history[h].i, r:meanR(history[h].r), raw:history[h].r,
                 ev:history[h].ev, cf:history[h].cf }); h++;
      if(nextItemIndex(area, acc) === -1) break;
    }
    if(acc.length > 0 && nextItemIndex(area, acc) === -1){
      const scored = acc.filter(x => x.r !== null);
      const skipped = acc.filter(x => x.r === null).map(x => {
        const it = area.pool[x.i];
        return { id:it.id, q:it.q, t:it.t };
      });
      if(scored.length === 0){
        /* Alanın çalışma havuzundaki her kontrol kapsam dışı işaretlendi. */
        results[area.c] = { na:true, reason:"allNA", items:[], skipped:skipped };
      } else {
        results[area.c] = { na:false, skipped:skipped, items: scored.map(x => {
          const it = area.pool[x.i];
          /* Yalnızca soru kimliği, katılımcının gördüğü metin ve cevap gönderilir;
             puanlama değerlerini panel kendi kaydından okur. */
          const o = { id:it.id, q:it.q, t:it.t, r:x.raw };
          if(x.ev) o.ev = x.ev;          /* katılımcının yazdığı kanıt */
          if(x.cf && x.cf.length) o.cf = x.cf;   /* tetiklenen çelişki kuralları */
          return o;
        })};
      }
      continue;
    }
    current = acc; break;
  }
  return { results, areaPtr, current, areas };
}

/* Kapsam dışı kalan alanlar sonuç paketine de yazılır. */
function scopeOutResults(){
  const o = {};
  AREAS.filter(a => a.scopeOut).forEach(a => { o[a.c] = { na:true, reason:"scope", items:[] }; });
  return o;
}

/* =====================================================================
   OTURUM (localStorage)
   ===================================================================== */
const LS_PROGRESS = "aoc_client_progress_" + (SURVEY.meta.id || "v4");
function saveProgress(){ try{ localStorage.setItem(LS_PROGRESS, JSON.stringify(state)); }catch(e){} }
function clearProgress(){ try{ localStorage.removeItem(LS_PROGRESS); }catch(e){} }
function loadProgress(){
  try{ const raw = localStorage.getItem(LS_PROGRESS); if(!raw) return null;
    const p = JSON.parse(raw); return (p && Array.isArray(p.history)) ? p : null; }catch(e){ return null; }
}

/* =====================================================================
   EKRANLAR
   ===================================================================== */
const SCREENS = ["landing","scopeScreen","assessment","clientDone"];
function showScreen(id){
  SCREENS.forEach(s => { const el = document.getElementById(s); if(el) el.classList.toggle("hidden", s !== id); });
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
}
function reducedMotion(){ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function transitionSlide(dir, buildFn){
  const card = document.getElementById("slideCard");
  if(reducedMotion()){ buildFn(); return; }
  card.classList.add(dir === "fwd" ? "slide-out-fwd" : "slide-out-back");
  setTimeout(() => {
    card.classList.remove("slide-out-fwd","slide-out-back");
    buildFn();
    card.classList.add(dir === "fwd" ? "slide-in-fwd" : "slide-in-back");
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("slide-in-fwd","slide-in-back")));
  }, 200);
}

/* ---------------------------------------------------------------------
   KAPSAM SAYFASI
   --------------------------------------------------------------------- */
function renderScopeScreen(){
  const wrap = document.getElementById("scopeList");
  wrap.innerHTML = SCOPES.map(s => {
    const on = state.scope[s[0]];
    return '<div class="scope-q" data-id="' + esc(s[0]) + '">' +
      '<div class="scope-q-text">' + esc(s[1]) + '</div>' +
      (s[3] ? '<div class="scope-q-note">' + esc(s[3]) + '</div>' : '') +
      '<div class="scope-q-btns">' +
      '<button type="button" class="scope-btn' + (on ? " on" : "") + '" data-v="1">Evet</button>' +
      '<button type="button" class="scope-btn' + (!on ? " on no" : "") + '" data-v="0">Hayır</button>' +
      '</div></div>';
  }).join("");
  wrap.querySelectorAll(".scope-btn").forEach(b => b.addEventListener("click", () => {
    state.scope[b.closest(".scope-q").dataset.id] = b.dataset.v === "1";
    rebuildAreas(state.scope); saveProgress(); renderScopeScreen();
  }));
  const areas = rebuildAreas(state.scope);
  const live = areas.filter(a => !a.scopeOut), out = areas.filter(a => a.scopeOut);
  const lo = live.reduce((s,a) => s + a.askMin, 0), hi = live.reduce((s,a) => s + a.askMax, 0);
  document.getElementById("scopeSummary").innerHTML =
    '<div class="scope-sum-grid">' +
    '<div class="pv"><div class="n">' + live.length + '</div><div class="l">Kapsamdaki kontrol alanı</div></div>' +
    '<div class="pv"><div class="n">' + lo + '–' + hi + '</div><div class="l">Kontrol sorusu</div></div>' +
    '<div class="pv"><div class="n">' + (lo*3) + '–' + (hi*3) + '</div><div class="l">İ/S/T cevabı</div></div>' +
    '<div class="pv"><div class="n">~' + Math.max(8, Math.round(hi * 0.8)) + 'dk</div><div class="l">Tahmini süre</div></div>' +
    '</div>' +
    (out.length ? '<div class="scope-out-note"><b>' + out.length + ' kontrol alanı</b> kapsam dışı sayıldı: ' +
       out.map(a => esc(a.n)).join(", ") + '. Bu alanlar skorlamaya dâhil edilmeyecektir.</div>' : '');
  document.getElementById("btnScopeNext").disabled = live.length === 0;
  document.getElementById("scopeEmpty").classList.toggle("hidden", live.length !== 0);
}

/* ---------------------------------------------------------------------
   İLERLEME ÇUBUĞU
   --------------------------------------------------------------------- */
function updateTopbar(d){
  const areas = d.areas || liveAreas();
  const total = areas.length;
  const done = Math.min(d.areaPtr, total);
  const answered = state.history.filter(x => !x.na);
  const nq = answered.filter(x => !isAllNA(x.r)).length;
  const naA = answered.reduce((s2,x) => s2 + naAxisCount(x.r), 0);
  document.getElementById("assessProgressLabel").textContent =
    "Alan " + Math.min(done+1, total) + "/" + total + " · " + nq + " kontrol sorusu · " +
    (answered.length * 3 - naA) + " skorlanan cevap" +
    (naA ? " · " + naA + " kapsam dışı" : "");
  document.getElementById("assessProgressFill").style.width = Math.round((done/(total||1))*100) + "%";
  document.getElementById("funcDots").innerHTML = areas.map((a,i) =>
    '<span class="func-dot ' + (i < done ? "done" : (i === done ? "current" : "")) + '" title="' + esc(a.n) + '"></span>').join("");
}

/* ---------------------------------------------------------------------
   SORU KARTI — tek kontrol sorusu, üç eksen
   --------------------------------------------------------------------- */
function axisBlockHTML(item, axis, selected, acik){
  const has = selected != null;
  const na = selected === NA_VALUE;
  const chev = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const durum = na ? "Kapsam dışı" : (has ? "Seviye " + selected + "/5" : "Seçilmedi");
  let h = '<div class="axis-block axis-' + axis.toLowerCase() + (has ? " answered" : "") + (na ? " na" : "") +
          (acik ? " open" : "") + '" data-axis="' + axis + '">' +
    '<button type="button" class="axis-head" data-toggle="' + axis + '" aria-expanded="' + (acik ? "true" : "false") + '">' +
      '<span class="axis-badge">' + esc(AXIS_FULL[axis]) + '</span>' +
      '<span class="axis-state">' + durum + chev + '</span></button>';
  if(acik){
    const opts = [1,2,3,4,5].map(l =>
      '<button type="button" class="reply-opt' + (selected === l ? " selected" : "") + '" data-ax="' + axis + '" data-r="' + l + '">' +
      '<span class="radio"></span><span class="txt">' + esc(ansText(item.arch, axis, l, item.k)) + '</span></button>').join("") +
      '<button type="button" class="reply-opt na-opt' + (na ? " selected" : "") + '" data-ax="' + axis + '" data-r="' + NA_VALUE + '">' +
      '<span class="radio"></span><span class="txt">' + esc(NA_TEXT) + '</span></button>';
    h += '<div class="axis-hint">' + esc(AXIS_HINT[axis]) + '</div>' +
         '<div class="reply-options">' + opts + '</div>';
  } else if(has){
    h += '<div class="axis-summary">' + esc(na ? NA_TEXT : ansText(item.arch, axis, selected, item.k)) + '</div>';
  } else {
    h += '<div class="axis-summary-empty">Cevaplamak için başlığa tıklayın.</div>';
  }
  return h + '</div>';
}

/* Şimdiye kadar puanlanmış tüm cevaplar — bağlamsal çelişki taraması için.
   Kesinleşmiş alanlar + içinde bulunulan alanın birikimi. */
function answeredSoFar(extra){
  const out = [];
  try{
    const d = deriveStateFromHistory(state.history);
    Object.keys(d.results).forEach(code => {
      (d.results[code].items || []).forEach(it => {
        const m = meanR(it.r);
        const src = ITEM_BY_ID[it.id] || {};
        if(m != null) out.push({ id:it.id, area:code, arch:src.arch, mean:m, r:it.r, ml:src.m, q:src.q });
      });
    });
    const area = d.areas[d.areaPtr];
    if(area) (d.current || []).forEach(x => {
      if(x.r == null) return;
      const p = area.pool[x.i];
      out.push({ id:p.id, area:area.c, arch:p.arch, mean:x.r, r:x.raw, ml:p.m, q:p.q });
    });
  }catch(e){}
  if(extra) out.push(extra);
  return out;
}

/* Bu soruya iliştirilen bağlamsal çelişki bulguları. */
function liveContradictions(area, item, sel, editing){
  if(!AXES.every(ax => sel[ax] != null)) return [];
  const m = meanR(sel);
  if(m == null) return [];
  const all = answeredSoFar({ id:item.id, area:area.c, arch:item.arch, mean:m, r:sel, ml:item.m, q:item.q })
    .filter((x,i,arr) => arr.findIndex(y => y.id === x.id) === i || x.id === item.id);
  /* aynı soru hem geçmişten hem taslaktan gelebilir → son hâli kalsın */
  const dedup = {}; all.forEach(x => dedup[x.id] = x);
  const map = contradictionsByQuestion(Object.keys(dedup).map(k => dedup[k]));
  return map[item.id] || [];
}

/* Anlık anomali taraması. Üç eksen de seçilmeden çalışmaz; düzenleme modunda
   alan düzeyi kurallar atlanır (birikim o alana ait olmayabilir). */
function liveAnomalies(area, item, sel, editing){
  if(!AXES.every(ax => sel[ax] != null)) return [];
  const out = questionAnomalies(sel).slice();
  if(editing) return out;
  try{
    const cur = deriveStateFromHistory(state.history).current || [];
    const list = cur.filter(x => x.raw).map(x => ({ ml: area.pool[x.i].m, raw: x.raw, mean: x.r }));
    list.push({ ml: item.m, raw: sel, mean: meanR(sel) });
    areaAnomalies(list).forEach(a => out.push(a));
  }catch(e){}
  return out;
}

function questionSlideHTML(area, item, opts){
  const idxInArea = opts.answeredInArea + 1;
  const sel = opts.selected || {};
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">' + esc(area.c + " · " + area.n) + '</span>' +
          '<span class="slide-cat-count">Kontrol sorusu ' + idxInArea + '/' + area.askMax + '</span></div>';
  if(idxInArea === 1 && area.r) h += '<p class="slide-rationale">' + esc(area.r) + '</p>';
  if(opts.reviewNote) h += '<div class="slide-review-note">' + opts.reviewNote + '</div>';
  h += '<div class="pill-row">' +
       '<span class="axis-pill">' + esc(SURVEY.arch[item.arch] || item.arch) + '</span></div>';
  h += '<div class="slide-question">' + esc(item.q) + '</div>';
  h += '<div class="slide-hint">Kontrol başlığı: ' + esc(item.t) +
       ' &middot; Aynı kontrolü üç boyutta değerlendirin; her boyut için kurumunuzu bugün en iyi tanımlayan ifadeyi seçin.</div>';
  const acik = acikEksenSec(sel);
  const cevaplanan = AXES.filter(ax => sel[ax] != null).length;
  h += '<div class="axis-steps"><span class="' + (cevaplanan === 3 ? "done" : "") + '">' +
       cevaplanan + ' / 3 boyut cevaplandı</span></div>';
  h += AXES.map(ax => axisBlockHTML(item, ax, sel[ax] == null ? null : sel[ax], ax === acik)).join("");
  const complete = AXES.every(ax => sel[ax] != null);
  const naCount = AXES.filter(ax => sel[ax] === NA_VALUE).length;
  if(naCount === 3) h += '<div class="na-note"><b>Bu kontrol kapsam dışı sayılacak.</b> Skorlamaya girmeyecek ve ' +
    'soru kotanızdan düşülmeyecek — yerine bu alandan başka bir kontrol sorulacaktır.</div>';
  else if(naCount) h += '<div class="na-note">' + naCount + ' boyut kapsam dışı işaretlendi; yalnızca kalan ' +
    (3 - naCount) + ' boyut skorlamaya girecek.</div>';

  /* Bağlamsal çelişki → kanıt talebi. İlerlemeyi engellemez; boş bırakılırsa
     soru «kanıtsız» olarak analiz operatörünün inceleme kuyruğuna düşer. */
  const contra = liveContradictions(area, item, sel, opts.editing);
  if(contra.length){
    h += '<div class="ev-box"><div class="ev-head">Bu cevap için kanıt isteniyor</div>' +
      '<ul class="ev-list">' + contra.map(c =>
        '<li><b>' + esc(c.label) + ':</b> ' + esc(c.msg) + '</li>').join("") + '</ul>' +
      '<label class="ev-label" for="evInput">Bu yeteneği doğrulayan kanıtı kısaca tarif edin ' +
      '(belge adı, sistem/rapor adı, tarih, sorumlu birim vb.):</label>' +
      '<textarea id="evInput" class="ev-input" rows="3" placeholder="Örn. «Varlık Envanteri Prosedürü v2.1, CMDB kayıtları, son gözden geçirme 03/2026, BT Operasyon»">' +
      esc(opts.evidence || "") + '</textarea>' +
      '<span class="ev-sub">Kanıt zorunlu değildir. Boş bırakırsanız bu soru, analiz operatörü ' +
      'inceleyip karar verene kadar skorlamaya dâhil edilmez.</span></div>';
  }

  /* Cevap örüntüsü uyarısı — engellemez, yalnızca gözden geçirmeye davet eder. */
  const anoms = liveAnomalies(area, item, sel, opts.editing);
  if(anoms.length) h += '<div class="anom-note"><b>Cevabınızı gözden geçirmek ister misiniz?</b>' +
    '<ul>' + anoms.map(a => '<li>' + esc(a.msg) + '</li>').join("") + '</ul>' +
    '<span class="anom-sub">Bu bir hata değildir; cevabınız olduğu gibi kaydedilebilir. ' +
    'Ancak değerlendirme sonrasında bu kontrol için kanıt istenebilir.</span></div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"' + (viewIdx > 0 ? "" : " disabled") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button>' +
       (opts.showNA ? '<button class="na-btn" id="btnNA">Bu alan kurumumuzda uygulanamaz</button>' : '') + '</div>' +
       '<button class="btn btn-primary" id="btnForward"' + (complete ? "" : " disabled") + '>İleri</button></div>';
  return h;
}

function naSlideHTML(area){
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">' + esc(area.c + " · " + area.n) + '</span>' +
          '<span class="slide-cat-count">Uygulanamaz</span></div>';
  h += '<div class="slide-question">Bu alanı «kurumumuzda uygulanamaz» olarak işaretlediniz.</div>';
  h += '<div class="slide-hint">Bu alan skorlamaya dâhil edilmeyecektir. Kararınızı değiştirebilirsiniz.</div>';
  h += '<div class="reply-options"><button type="button" class="reply-opt selected" id="btnKeepNA"><span class="radio"></span><span class="txt">Evet, uygulanamaz olarak kalsın</span></button>' +
       '<button type="button" class="reply-opt" id="btnUndoNA"><span class="radio"></span><span class="txt">Hayır, bu alanı normal şekilde cevaplamak istiyorum</span></button></div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"' + (viewIdx > 0 ? "" : " disabled") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button></div>' +
       '<button class="btn btn-primary" id="btnForward">İleri</button></div>';
  return h;
}

function completionSlideHTML(){
  const d = deriveStateFromHistory(state.history);
  const naUser = Object.keys(d.results).filter(k => d.results[k].na && d.results[k].reason === "user").length;
  const naScope = AREAS.filter(a => a.scopeOut).length;
  const answered = state.history.filter(x => !x.na);
  const nq = answered.filter(x => !isAllNA(x.r)).length;
  const naAx = answered.reduce((s2,x) => s2 + naAxisCount(x.r), 0);
  const naQ = answered.filter(x => isAllNA(x.r)).length;
  const naAllArea = Object.keys(d.results).filter(k => d.results[k].reason === "allNA").length;
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">Tamamlandı</span></div>';
  h += '<div class="slide-question">Tüm kontrol alanları için sorularınız tamamlandı.</div>';
  h += '<div class="slide-hint">' + liveAreas().length + ' alan · ' + nq + ' kontrol sorusu · ' +
       (nq*3 - (naAx - naQ*3)) + ' skorlanan İ/S/T cevabı' +
       (naQ ? ' · ' + naQ + ' kontrol kapsam dışı' : '') +
       ((naAx - naQ*3) ? ' · ' + (naAx - naQ*3) + ' boyut kapsam dışı' : '') +
       (naAllArea ? ' · ' + naAllArea + ' alan tamamen kapsam dışı' : '') +
       (naUser ? ' · ' + naUser + ' alan uygulanamaz işaretlendi' : '') +
       (naScope ? ' · ' + naScope + ' alan kapsam sorusundan kapandı' : '') +
       '. «Anketi Tamamla» dediğinizde iletişim bilgileriniz alınacak ve yanıtlarınız cihazınızda şifrelenerek bilgisayarınıza indirilecektir.</div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button></div>' +
       '<button class="btn btn-primary" id="btnFinish">Anketi Tamamla</button></div>';
  return h;
}

/* ---------------------------------------------------------------------
   ETKİLEŞİM
   --------------------------------------------------------------------- */
/* Açık boyut: null = otomatik (ilk cevaplanmamış), "" = hiçbiri, "I"/"S"/"T" = kullanıcı seçimi */
let acikEksen = null;
function acikEksenSec(sel){
  if(acikEksen === "") return null;
  if(acikEksen && AXES.indexOf(acikEksen) !== -1) return acikEksen;
  for(var i = 0; i < AXES.length; i++) if(sel[AXES[i]] == null) return AXES[i];
  return null;
}

let draft = null;   /* canlı slaytta henüz tamamlanmamış {I,S,T} seçimi */
let draftEv = "";   /* canlı slaytta yazılmakta olan kanıt metni */

function countDownstream(fromIdx){ return state.history.length - fromIdx - 1; }

function wireQuestionSlide(area, item, editIdx, sel){
  const card = document.getElementById("slideCard");
  card.querySelectorAll(".reply-opt[data-r]").forEach(btn => {
    btn.addEventListener("click", () => {
      sel[btn.dataset.ax] = Number(btn.dataset.r);
      acikEksen = null;   /* cevaplanınca sıradaki boyut kendiliğinden açılır */
      if(editIdx === null || editIdx === undefined) draft = sel;
      rerenderSlideInPlace(area, item, editIdx, sel);
    });
  });
  card.querySelectorAll(".axis-head[data-toggle]").forEach(b => {
    b.addEventListener("click", () => {
      const ax = b.dataset.toggle;
      acikEksen = (acikEksenSec(sel) === ax) ? "" : ax;
      rerenderSlideInPlace(area, item, editIdx, sel);
    });
  });

  /* Kanıt metni yeniden çizimlerde kaybolmasın diye taslakta tutulur. */
  const ev = card.querySelector("#evInput");
  if(ev){
    ev.addEventListener("input", () => { draftEv = ev.value; });
    if(document.activeElement !== ev && ev.value){
      ev.selectionStart = ev.selectionEnd = ev.value.length;
    }
  }
  const f = card.querySelector("#btnForward");
  if(f) f.addEventListener("click", () => commitAnswer(area, item, sel, editIdx));
  const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
  const na = card.querySelector("#btnNA");
  if(na) na.addEventListener("click", () => {
    draft = null; draftEv = "";
    state.history.push({ a:area.c, na:true });
    viewIdx = state.history.length; saveProgress();
    transitionSlide("fwd", renderAtViewIdx);
  });
}

function rerenderSlideInPlace(area, item, editIdx, sel){
  const card = document.getElementById("slideCard");
  const answeredBefore = editIdx === null || editIdx === undefined
    ? deriveStateFromHistory(state.history).current.filter(x => x.r !== null).length
    : state.history.slice(0, editIdx).filter(x => x.a === area.c && !x.na && !isAllNA(x.r)).length;
  const note = (editIdx !== null && editIdx !== undefined && countDownstream(editIdx) > 0)
    ? "Bu cevabı değiştirirseniz, bu noktadan sonra verdiğiniz <b>" + countDownstream(editIdx) + "</b> kontrol sorusu sıfırlanır ve anket buradan yeniden uyarlanır."
    : null;
  const liveScored = (editIdx === null || editIdx === undefined)
    ? deriveStateFromHistory(state.history).current.filter(x => x.r !== null).length : 1;
  card.innerHTML = questionSlideHTML(area, item, {
    selected: sel, showNA: (editIdx === null || editIdx === undefined) && liveScored === 0,
    reviewNote: note, answeredInArea: answeredBefore, evidence: draftEv,
    editing: editIdx !== null && editIdx !== undefined
  });
  wireQuestionSlide(area, item, editIdx, sel);
}

function commitAnswer(area, item, sel, editIdx){
  if(!AXES.every(ax => sel[ax] != null)) return;
  const r = { I:sel.I, S:sel.S, T:sel.T };
  /* Çelişki bulguları ve katılımcının yazdığı kanıt cevapla birlikte saklanır. */
  const cf = liveContradictions(area, item, sel, editIdx !== null && editIdx !== undefined).map(c => c.id);
  const ev = (draftEv || "").trim();
  const rec = { a:area.c, i:item._i, r:r };
  if(cf.length) rec.cf = cf;
  if(ev) rec.ev = ev;
  draft = null; draftEv = "";
  if(editIdx === undefined || editIdx === null){
    state.history.push(rec);
  } else {
    const prev = state.history[editIdx];
    const same = prev.r && AXES.every(ax => prev.r[ax] === r[ax]) && (prev.ev || "") === ev;
    if(same){ viewIdx = editIdx + 1; saveProgress(); transitionSlide("fwd", renderAtViewIdx); return; }
    state.history = state.history.slice(0, editIdx);
    state.history.push(rec);
  }
  viewIdx = state.history.length;
  saveProgress();
  transitionSlide("fwd", renderAtViewIdx);
}

function goForwardFromReview(){ viewIdx = Math.min(viewIdx + 1, state.history.length); transitionSlide("fwd", renderAtViewIdx); }
function goBack(){ if(viewIdx > 0){ draft = null; viewIdx--; transitionSlide("back", renderAtViewIdx); } }

function renderReviewAt(idx){
  const rec = state.history[idx];
  const area = AREA_BY_CODE[rec.a];
  const card = document.getElementById("slideCard");
  updateTopbar(deriveStateFromHistory(state.history.slice(0, idx)));
  if(rec.na){
    card.innerHTML = naSlideHTML(area);
    card.querySelector("#btnKeepNA").addEventListener("click", goForwardFromReview);
    card.querySelector("#btnUndoNA").addEventListener("click", () => {
      state.history = state.history.slice(0, idx); viewIdx = state.history.length;
      saveProgress(); transitionSlide("fwd", renderAtViewIdx);
    });
    const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
    const f = card.querySelector("#btnForward"); if(f) f.addEventListener("click", goForwardFromReview);
    return;
  }
  const item = Object.assign({}, area.pool[rec.i], {_i: rec.i});
  draftEv = rec.ev || "";
  rerenderSlideInPlace(area, item, idx, Object.assign({}, rec.r));
}

function renderLive(){
  const d = deriveStateFromHistory(state.history);
  const card = document.getElementById("slideCard");
  updateTopbar(d);
  if(d.areaPtr >= d.areas.length){ card.innerHTML = completionSlideHTML(); wireCompletion(); return; }
  const area = d.areas[d.areaPtr];
  const ni = nextItemIndex(area, d.current);
  if(ni === -1){ card.innerHTML = completionSlideHTML(); wireCompletion(); return; }
  const item = Object.assign({}, area.pool[ni], {_i: ni});
  const sel = draft || {};
  rerenderSlideInPlace(area, item, null, sel);
}
function wireCompletion(){
  const card = document.getElementById("slideCard");
  const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
  const fin = card.querySelector("#btnFinish"); if(fin) fin.addEventListener("click", finishAssessment);
}

function renderAtViewIdx(){
  acikEksen = null;   /* yeni soruya geçince akordeon başa döner */ if(viewIdx < state.history.length) renderReviewAt(viewIdx); else renderLive(); }

/* =====================================================================
   ŞİFRELE + İNDİR
   ===================================================================== */
let currentPassword = null, lastEnvelope = null;

function buildSubmission(){
  const d = deriveStateFromHistory(state.history);
  const results = Object.assign({}, scopeOutResults(), d.results);
  return {
    type:"aoc_submission_v5",
    appVersion: SURVEY.meta.appVersion,
    orgName: state.orgName,
    submittedAt: new Date().toISOString(),
    taxonomy: SURVEY.meta.tax,
    taxonomyName: SURVEY.meta.taxName,
    surveyId: SURVEY.meta.id,
    qset: SURVEY.meta.qset,
    scope: state.scope,
    contact: state.contact || null,
    areaNames: AREAS.reduce((o,a) => (o[a.c] = a.n, o), {}),
    results: results
  };
}

function finishAssessment(){
  /* Tamamlama akışı iletişim + şifreleme adımlarıyla yürütülür (delivery.js). */
  finishAssessmentSite();
}

/* =====================================================================
   BAŞLANGIÇ
   ===================================================================== */
function initLanding(){
  const m = SURVEY.meta;
  rebuildAreas(state.scope);
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("taxPill").textContent = m.taxName;
  document.getElementById("footMeta").textContent = m.taxName + (m.appVersion ? " · v" + m.appVersion : "");
  const live = liveAreas();
  const lo = live.reduce((a,x) => a + x.askMin, 0), hi = live.reduce((a,x) => a + x.askMax, 0);
  document.getElementById("statAreas").textContent = live.length;
  document.getElementById("statAreasLbl").textContent = m.tax === "nist" ? "NIST CSF 2.0 Kontrol Alanı" : "UCT Kontrol Alanı";
  document.getElementById("statRange").textContent = lo + "–" + hi;
  document.getElementById("statRangeSub").textContent = "= " + (lo*3) + "–" + (hi*3) + " İ/S/T cevabı";
  document.getElementById("statTime").textContent = "~" + Math.max(8, Math.round(hi * 0.8)) + "dk";
  document.getElementById("leadText").textContent =
    live.length + " " + m.taxName + " kontrol alanını İnsan, Süreç ve Teknoloji boyutlarında değerlendiren kısa bir öz-değerlendirme anketidir. " +
    "Her kontrol sorusunu üç boyut için ayrı ayrı yanıtlarsınız. Bu bir sınav değildir; doğru ya da yanlış cevap yoktur — " +
    "amaç yalnızca kurumunuzu bugün en iyi tanımlayan ifadeleri seçmenizdir. Sorular cevaplarınıza göre uyarlanır; " +
    "dilediğiniz zaman ara verip kaldığınız yerden devam edebilirsiniz.";
  if(m.orgName) document.getElementById("orgNameInput").value = m.orgName;

  const strip = document.getElementById("funcStrip");
  strip.innerHTML = "";
  FULL_AREAS.forEach(a => { const el = document.createElement("span"); el.textContent = a.n; strip.appendChild(el); });

  document.getElementById("btnStart").addEventListener("click", () => {
    const org = document.getElementById("orgNameInput").value.trim() || "Kurum";
    resetState(org);
    showScreen("scopeScreen"); renderScopeScreen();
  });
  document.getElementById("btnScopeBack").addEventListener("click", () => showScreen("landing"));
  document.getElementById("btnScopeNext").addEventListener("click", () => {
    rebuildAreas(state.scope); saveProgress();
    showScreen("assessment"); renderAtViewIdx();
  });
  document.getElementById("btnHomeFromAssess").addEventListener("click", () => { saveProgress(); showScreen("landing"); });

  const saved = loadProgress();
  if(saved && saved.history.length > 0){
    document.getElementById("resumeModal").classList.remove("hidden");
    document.getElementById("btnResumeFresh").onclick = () => { clearProgress(); document.getElementById("resumeModal").classList.add("hidden"); };
    document.getElementById("btnResumeContinue").onclick = () => {
      document.getElementById("resumeModal").classList.add("hidden");
      state = { orgName: saved.orgName || "", scope: saved.scope || defaultScopeAnswers(), history: saved.history };
      rebuildAreas(state.scope);
      viewIdx = state.history.length;
      showScreen("assessment"); renderAtViewIdx();
    };
  }
}

/* =====================================================================
   OTOMASYON KÖPRÜSÜ — headless doğrulama için (arayüzü etkilemez).
   ===================================================================== */
Object.assign(window, { SURVEY, SCOPES, AXES, AXIS_NAME, FULL_AREAS });
Object.defineProperty(window, "AREAS",        { get: () => AREAS,        configurable: true });
Object.defineProperty(window, "AREA_BY_CODE", { get: () => AREA_BY_CODE, configurable: true });
Object.defineProperty(window, "state",        { get: () => state,        configurable: true });
Object.defineProperty(window, "viewIdx",      { get: () => viewIdx,      configurable: true });

initLanding();
showScreen("landing");
