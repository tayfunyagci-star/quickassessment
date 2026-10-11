/* Kompakt banka alan indeksleri — bank_compact.json ile birebir eşleşir. */
const F = { id:0, g:1, n:2, t:3, q:4, w:5, m:6, tag:7, reg:8, arch:9, k:10 };
const AXES = ["I","S","T"];

/* Kapsam dışı işareti — ankette 6. şık olarak gönderilir (survey.js NA_VALUE ile aynı).
   Kapsam dışı cevaplar hiçbir skora girmez; paydadan da çıkarılır. */
const NA_VALUE = 0;
const NA_REASON = {
  user:  "Kapsam dışı (uygulanamaz)",
  scope: "Kapsam dışı (kapsam sorusu)",
  allNA: "Kapsam dışı (tüm kontroller kapsam dışı)"
};
const NA_AXIS_NOTE = "Kapsam dışı — bu boyutun kurumda uygulama alanı yok; skora ve paydaya dâhil edilmedi.";
function naReasonLabel(reason){ return NA_REASON[reason] || NA_REASON.user; }
const AXIS_NAME = { I:"İnsan", S:"Süreç", T:"Teknoloji" };
const AXIS_FULL = { I:"İnsan (People)", S:"Süreç (Process)", T:"Teknoloji (Technology)" };
const AXIS_COLOR = { I:"var(--axis-i)", S:"var(--axis-s)", T:"var(--axis-t)" };
const CRIT_LABEL = { 1:"Düşük", 2:"Orta", 3:"Yüksek", 4:"Kritik" };
const ML_LABEL = { 1:"Başlangıç / Ad-hoc", 2:"Tekrarlanabilir", 3:"Tanımlanmış", 4:"Yönetilen ve Ölçülen", 5:"Optimize Edilmiş" };
const FUNC_NAME = { GV:"Yönetişim", ID:"Tanımlama", PR:"Koruma", DE:"Tespit", RS:"Müdahale", RC:"İyileştirme" };
const FUNC_ORDER = ["GV","ID","PR","DE","RS","RC"];
const LEVEL_COLORS = ["","var(--l1)","var(--l2)","var(--l3)","var(--l4)","var(--l5)"];

/* Mevzuat / çerçeve uyum çubukları — reg alanındaki ön ekle eşleşir. */
const REG_DEFS = [
  { key:"7545",     label:"7545 sayılı Siber Güvenlik Kanunu", color:"var(--navy)" },
  { key:"BİGR",     label:"BİGR — Bilgi ve İletişim Güvenliği Rehberi", color:"var(--navy-2)" },
  { key:"ISO27001", label:"ISO/IEC 27001:2022 (yaklaşık eşleme)", color:"var(--teal)" },
  { key:"KVKK",     label:"KVKK — Kişisel Verilerin Korunması", color:"var(--gold)" },
  { key:"CIS",      label:"CIS Controls v8", color:"var(--coral)" }
];

/* Kontrol alanı gerekçeleri — ankette alanın ilk sorusunda gösterilir. */
const RATIONALE = {
  "GV.OC":"Kurumun neyi, kimin için koruduğunun net olması tüm diğer kararların temelidir.",
  "GV.RM":"Kabul edilebilir risk seviyesi tanımlı olmadan hangi yatırımın öncelikli olduğuna karar verilemez.",
  "GV.RR":"Sorumluluğun kimde olduğu net değilse, bir olay anında kimin karar vereceği de net değildir.",
  "GV.PO":"Yazılı politika, beklenen davranışın kişiye değil kuruma ait olmasını sağlar.",
  "GV.OV":"Bağımsız gözetim olmadan programın gerçekten çalışıp çalışmadığı yalnızca varsayımdan ibarettir.",
  "GV.SC":"Kurumun kendi kontrolleri güçlü olsa da zayıf bir tedarikçi tüm zinciri riske atabilir.",
  "ID.AM":"Envanterde olmayan bir varlık korunamaz; çoğu ihlal unutulmuş sistemlerden başlar.",
  "ID.RA":"Zafiyetler düzenli taranmazsa saldırganlar bunları savunmadan önce bulur.",
  "ID.IM":"Aynı hatanın tekrarlanmaması, dersin çıkarılıp sisteme geri beslenmesiyle mümkündür.",
  "PR.AA":"Çalınan veya aşırı yetkili bir hesap saldırganlar için en kısa yoldur.",
  "PR.AT":"Teknik kontroller ne kadar güçlü olursa olsun, en zayıf halka çoğu zaman bilgilendirilmemiş bir kullanıcıdır.",
  "PR.DS":"Bir sızıntının yasal ve itibari maliyeti verinin korunma biçimine bağlıdır.",
  "PR.PS":"Yamanmamış bir sistem, bilinen açıkların otomatik taranıp istismar edildiği bir hedef hâline gelir.",
  "PR.IR":"Bir felaket anında iş sürekliliği, önceden test edilmiş yedekleme ve kurtarma kapasitesine bağlıdır.",
  "DE.CM":"Fark edilmeyen bir saldırı aylarca sistemde kalıp zararını katlayarak büyütebilir.",
  "DE.AE":"Ham alarmların anlamlı bir olaya dönüşmesi doğru analiz ve önceliklendirmeden geçer.",
  "RS.MA":"Bir olay anında kime, hangi sırayla ne yapılacağının belli olmaması küçük bir sorunu krize dönüştürür.",
  "RS.AN":"Kök nedeni bulunmayan bir olay kısa süre sonra farklı bir yoldan tekrar yaşanır.",
  "RS.CO":"Yasal bildirim süresini kaçırmak, olayın kendisi kadar ciddi bir uyum riski yaratabilir.",
  "RS.MI":"Bir tehdidi hızla izole edebilme kapasitesi etkiyi dakikalar içinde sınırlayabilir.",
  "RC.RP":"Test edilmemiş bir kurtarma planı gerçek bir kriz anında beklenenden çok daha yavaş çalışır.",
  "RC.CO":"Kurtarma teknik olarak başarılı olsa da iletişimsizlik güveni ve itibarı zedeleyebilir.",
  "VARLIK_YAPILANDIRMA":"Envanterde olmayan ve yapılandırması bilinmeyen bir varlık korunamaz.",
  "IAM":"Kimlik ve erişim kontrolleri, ihlallerin en sık başladığı noktadır.",
  "AG_ILETISIM":"Ağ mimarisi ve segmentasyon, bir ihlalin ne kadar yayılacağını belirler.",
  "VERI_KRIPTO":"Verinin sınıflandırılması ve şifrelenmesi, sızıntının yasal ve itibari maliyetini doğrudan etkiler.",
  "TEHDIT_ZAFIYET":"Zafiyetler düzenli taranıp kapatılmazsa saldırganlar bunları savunmadan önce bulur.",
  "OLAY_SOC":"Tespit, müdahale ve süreklilik kapasitesi bir olayın krize dönüşüp dönüşmeyeceğini belirler.",
  "UYGULAMA_SISTEM":"Güvenli yapılandırma ve güvenli geliştirme, uygulama katmanındaki riski baştan azaltır.",
  "FIZIKSEL":"Fiziksel erişimi olan bir kişi, mantıksal kontrollerin çoğunu aşabilir.",
  "YONETISIM_RISK":"Üst yönetim sahipliği ve yazılı politika olmadan diğer kontroller sürdürülebilir olmaz.",
  "IK_GUVENLIK":"İşe alımdan ayrılışa kadar insan faktörü, kontrollerin en değişken bileşenidir.",
  "TEDARIKCI":"Zayıf bir tedarikçi, kurumun kendi kontrolleri güçlü olsa dahi tüm zinciri riske atar."
};

/* =====================================================================
   YARDIMCILAR
   ===================================================================== */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fmt(n, d){ return (n==null || isNaN(n)) ? "—" : Number(n).toFixed(d===undefined?1:d).replace(".", ","); }
function levelColor(t){ return LEVEL_COLORS[Math.max(1, Math.min(5, Math.round(t)))]; }
function bandForMaturity(t){
  if(t < 1.8) return {lvl:1, label:"Seviye 1 · Başlangıç Öncesi", color:"var(--l1)"};
  if(t < 2.6) return {lvl:2, label:"Seviye 2 · Tekrarlanabilir", color:"var(--l2)"};
  if(t < 3.4) return {lvl:3, label:"Seviye 3 · Tanımlanmış", color:"var(--l3)"};
  if(t < 4.2) return {lvl:4, label:"Seviye 4 · Yönetilen", color:"var(--l4)"};
  return {lvl:5, label:"Seviye 5 · Optimize", color:"var(--l5)"};
}
/* Doğrulanmış seviye rozeti — kilitli seviyeye göre renk ve etiket. */
function lockBand(lock){
  if(!lock || lock.verified == null) return { color:"var(--slate-2)", label:"Ölçüm yok" };
  if(lock.verified === 0) return { color:"var(--l1)", label:"Seviye 0 · Doğrulanmamış" };
  const b = bandForMaturity(lock.verified);
  return { color:b.color, label:"Seviye " + lock.verified + " · doğrulandı" };
}
/* Merdiven şeridi: her basamak geçti / kaldı / ölçülmedi. */
function rungsHTML(lock){
  if(!lock) return "";
  return '<div class="rungs">' + [1,2,3,4,5].map(m => {
    const l = lock.levels[m];
    const cls = l.pass === true ? "pass" : (l.pass === false ? "fail" : "none");
    const t = "Seviye " + m + ": " + (l.score == null ? "ölçülmedi" : fmt(l.score,0) + "/100 (" + l.n + " cevap)");
    return '<span class="rung ' + cls + '" title="' + esc(t) + '"></span>';
  }).join("") + '</div>';
}
/* Kilidin neden orada durduğunu tek cümlede anlatır. */
function lockExplain(lock){
  if(!lock || lock.verified == null) return "Skorlanan cevap bulunmadığı için basamak kilidi hesaplanamadı.";
  const th = fmt(lock.threshold, 0);
  let s = "Bir seviyenin doğrulanmış sayılması için o basamağın ve altındaki tüm ölçülmüş basamakların ağırlıklı skorunun " +
          "en az %" + th + " olması gerekir. ";
  if(lock.blockedAt != null)
    s += "<b>Seviye " + lock.blockedAt + " basamağı %" + fmt(lock.blockedScore,0) + " ile eşiğin altında kaldığı için " +
         "merdiven burada durdu</b> — üst basamaklardaki puanlar seviyeyi yükseltmez. ";
  else
    s += "Ölçülen basamakların tamamı eşiği geçti. ";
  if(lock.unmeasured.length)
    s += "Ölçülmemiş basamak(lar): " + lock.unmeasured.join(", ") + " — bunlar kilidi tetiklemez, ancak " +
         "doğrulanmış seviye en yüksek ölçülmüş ve geçilmiş basamakla sınırlıdır.";
  return s;
}

function bandForRisk(s){
  if(s <= 20) return {label:"Düşük Risk", color:"var(--l5)"};
  if(s <= 40) return {label:"Orta-Düşük Risk", color:"var(--l4)"};
  if(s <= 60) return {label:"Orta Risk", color:"var(--l3)"};
  if(s <= 80) return {label:"Yüksek Risk", color:"var(--l2)"};
  return {label:"Kritik Risk", color:"var(--l1)"};
}
function slug(s){ return (s||"Kurum").replace(/[^\p{L}\p{N}]+/gu,"_").replace(/^_+|_+$/g,"").slice(0,40) || "Kurum"; }
function download(name, content, mime){
  const blob = new Blob([content], {type: mime || "application/octet-stream"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* Banka indeksleri */
const Q_BY_ID = {};
function rebuildBankIndex(){
  Object.keys(Q_BY_ID).forEach(k => { delete Q_BY_ID[k]; });
  BANK.Q.forEach(q => Q_BY_ID[q[F.id]] = q);
}
rebuildBankIndex();
function regOf(id){ const q = Q_BY_ID[id]; return (q && q[F.reg]) || []; }
function hasReg(id, key){ return regOf(id).some(r => r.indexOf(key + ":") === 0); }
function regDetail(id, key){
  const hit = regOf(id).filter(r => r.indexOf(key + ":") === 0);
  return hit.length ? hit[0].slice(key.length + 1).trim() : "";
}
/* Arketip şablonuna konuyu gömerek cevap metnini üretir. */
function ansText(arch, axis, level, konu){
  const set = (BANK.ans[arch] || BANK.ans["politika"] || BANK.ans[Object.keys(BANK.ans)[0]])[axis];
  return String(set[level-1]).replace(/\{k\}/g, konu || "");
}

/* Ayarlanabilir ağırlıklar */
const DEF_CRIT = {1:1, 2:2, 3:3, 4:4};
const DEF_ML = {1:1, 2:2, 3:3, 4:4, 5:5};
function getW(){
  try{
    const raw = localStorage.getItem("aoc_w_v4");
    if(raw){
      const p = JSON.parse(raw);
      if(p && p.crit && p.ml){
        if(p.lock == null || isNaN(p.lock)) p.lock = LOCK_THRESHOLD_DEFAULT;   /* geriye dönük uyum */
        return p;
      }
    }
  }catch(e){}
  return { crit: Object.assign({}, DEF_CRIT), ml: Object.assign({}, DEF_ML), lock: LOCK_THRESHOLD_DEFAULT };
}
function setW(w){ try{ localStorage.setItem("aoc_w_v4", JSON.stringify(w)); }catch(e){} }

/* =====================================================================
   HAVUZ — anket üretimi (kapsam filtresi ARTIK ankette çalışır)
   ===================================================================== */
function areaMeta(tax){
  return tax === "nist"
    ? BANK.nist.map(x => ({ code:x[0], name:x[1], func:x[2] }))
    : BANK.uct.map(x => ({ code:x[0], name:x[1], func:null }));
}
/* Seçilen taksonomiye göre TAM havuzları kurar; hiçbir madde elenmez. */
function buildFullAreas(tax){
  const metas = areaMeta(tax);
  const codeOf = tax === "nist" ? (q => (q[F.n] >= 0 ? BANK.nist[q[F.n]][0] : null))
                                : (q => BANK.uct[q[F.g]][0]);
  const buckets = {};
  BANK.Q.forEach(q => {
    const c = codeOf(q); if(!c) return;
    (buckets[c] = buckets[c] || []).push({
      id:q[F.id], t:q[F.t], q:q[F.q], w:q[F.w], m:q[F.m], tag:q[F.tag], arch:q[F.arch], k:q[F.k]
    });
  });
  return metas.filter(m => buckets[m.code] && buckets[m.code].length).map(m => ({
    c: m.code, n: m.name, f: m.func, r: RATIONALE[m.code] || "", pool: buckets[m.code]
  }));
}

/* =====================================================================
   SKORLAMA
   ===================================================================== */
function computeResults(sub){
  const W = getW();
  const areaNames = sub.areaNames || {};
  const tax = sub.taxonomy || "nist";
  const metas = areaMeta(tax);
  const metaByCode = {}; metas.forEach(m => metaByCode[m.code] = m);

  /* --- kontrol sorusu düzeyinde topla ---
     Her maddede yalnızca kapsam içi (>0) eksenler «live» kabul edilir; tamamen
     kapsam dışı bir madde hiçbir hesaba girmez. */
  const allQ = [];
  const byId = {};
  const naByArea = {};                 /* alan kodu -> { ax, q, skipped } */
  const axisNa = { I:0, S:0, T:0 };    /* skorlanan sorulardaki kapsam dışı eksen sayısı */
  let naAxisCount = 0, naQuestionCount = 0;

  Object.keys(sub.results).forEach(code => {
    const r = sub.results[code];
    if(!r) return;
    const acc = naByArea[code] = { ax:0, q:0, skipped: (r.skipped || []).length };
    naQuestionCount += acc.skipped;    /* ankette baştan atlanan tümüyle kapsam dışı sorular */
    if(r.na) return;
    (r.items || []).forEach(it => {
      /* KOPYA — operatör seviye ataması kaynak gönderiyi değiştirmemeli. */
      const raw = Object.assign({}, (typeof it.r === "object" && it.r !== null) ? it.r : { I:it.r, S:it.r, T:it.r });
      const live = AXES.filter(ax => raw[ax] > 0);
      if(!live.length){ acc.q++; naQuestionCount++; return; }   /* üçü de kapsam dışı → madde düşer */
      const naHere = AXES.length - live.length;
      if(naHere){
        acc.ax += naHere; naAxisCount += naHere;
        AXES.forEach(ax => { if(raw[ax] === NA_VALUE) axisNa[ax]++; });
      }
      const rq = live.reduce((s,ax) => s + raw[ax], 0) / live.length;
      const rec = { area:code, id:it.id, q:it.q, t:it.t, arch:it.arch || (Q_BY_ID[it.id] || [])[F.arch] || "politika",
                    k:it.k || (Q_BY_ID[it.id] || [])[F.k] || "", w:it.w, ml:it.ml,
                    r:raw, live:live, na:naHere, rq:rq, cap:5, gated:false,
                    evidence: it.ev || "", flags: (it.cf || []).slice(), scored:true };
      allQ.push(rec); byId[it.id] = rec;
    });
  });

  /* --- bağlamsal çelişki taraması (arketip tabanlı, taksonomiden bağımsız) --- */
  const contraMap = contradictionsByQuestion(allQ.map(q => ({ id:q.id, area:q.area, arch:q.arch, mean:q.rq })));
  allQ.forEach(q => {
    const hits = contraMap[q.id] || [];
    q.contra = hits;
    hits.forEach(c => { if(q.flags.indexOf(c.id) === -1) q.flags.push(c.id); });
    q.flagged = q.flags.length > 0;
  });

  /* --- operatör kararları --- Karar verilmemiş bulgular skora GİRMEZ. */
  const dec = sub.__decisions || {};
  let reviewPending = 0, reviewApproved = 0, reviewExcluded = 0, reviewOverridden = 0, evidenceCount = 0;
  allQ.forEach(q => {
    if(!q.flagged){ q.review = null; return; }
    if(q.evidence) evidenceCount++;
    const d = dec[q.id];
    if(!d || !d.action){ q.review = "pending"; q.scored = false; reviewPending++; return; }
    q.reviewNote = d.note || "";
    if(d.action === "approve"){ q.review = "approved"; reviewApproved++; return; }
    if(d.action === "exclude"){ q.review = "excluded"; q.scored = false; reviewExcluded++; return; }
    if(d.action === "override"){
      const v = Math.max(1, Math.min(5, Number(d.value) || 1));
      q.review = "override"; q.overrideValue = v; reviewOverridden++;
      q.rOriginal = Object.assign({}, q.r);      /* katılımcının özgün cevabı korunur */
      q.live.forEach(ax => { q.r[ax] = v; });
      q.rq = v;
      return;
    }
    q.review = "pending"; q.scored = false; reviewPending++;
  });

  const questions = allQ.filter(q => q.scored);
  const flaggedQuestions = allQ.filter(q => q.flagged);
  /* Skora girmeyen sorular bağımlılık kapısını da sürmemeli. */
  Object.keys(byId).forEach(k => { if(!byId[k].scored) delete byId[k]; });

  /* --- bağımlılık kapıları (kontrol sorusu düzeyinde) --- */
  let gateCount = 0;
  BANK.deps.forEach(d => {
    const q = byId[d[0]], p = byId[d[1]];
    if(!q || !p) return;
    if(((p.rq - 1) / 4) < d[2] && q.rq > p.rq){
      q.cap = p.rq; q.gated = true; gateCount++;
      q.gateFrom = { id:p.id, q:p.q, rq:p.rq, threshold:d[2] };
    }
  });

  /* --- eksen düzeyinde düzleştir --- */
  const flat = [];
  questions.forEach(qr => {
    qr.live.forEach(ax => {
      const r = qr.r[ax];
      flat.push({ area:qr.area, id:qr.id, q:qr.q, t:qr.t, arch:qr.arch, k:qr.k,
                  ax:ax, w:qr.w, ml:qr.ml, r:r, rEff: Math.min(r, qr.cap), gated:qr.gated });
    });
    qr.rqEff = qr.live.reduce((s,ax) => s + Math.min(qr.r[ax], qr.cap), 0) / qr.live.length;
  });

  const wOf = it => (W.crit[it.w] || it.w) * (W.ml[it.ml] || it.ml);
  const score = list => {
    let num = 0, den = 0;
    list.forEach(it => { const w = wOf(it); num += ((it.rEff - 1) / 4) * w; den += w; });
    return den > 0 ? (num / den) * 100 : null;
  };
  const th = s => (s == null ? null : 1 + 4 * s / 100);

  const overallScore = score(flat);

  /* --- kontrol alanları --- */
  const rows = [];
  Object.keys(sub.results).forEach(code => {
    const r = sub.results[code];
    const meta = metaByCode[code] || { name: areaNames[code] || code, func:null };
    const acc = naByArea[code] || { ax:0, q:0, skipped:0 };
    if(!r || r.na){
      rows.push({ code, name: areaNames[code] || meta.name, func: meta.func, na:true,
                  reason: (r && r.reason) || "user", naAx: acc.ax, naQ: acc.q, skipped: acc.skipped });
      return;
    }
    const its = flat.filter(x => x.area === code);
    const qs = questions.filter(x => x.area === code);
    /* Alanın çalışma havuzundaki her kontrol kapsam dışı işaretlenmişse alan da kapsam dışıdır. */
    if(!qs.length){
      rows.push({ code, name: areaNames[code] || meta.name, func: meta.func, na:true,
                  reason:"allNA", naAx: acc.ax, naQ: acc.q, skipped: acc.skipped });
      return;
    }
    const s = score(its);
    rows.push({ code, name: areaNames[code] || meta.name, func: meta.func, na:false,
                naAx: acc.ax, naQ: acc.q, skipped: acc.skipped,
                lock: ladderLock(its, wOf, W.lock),
                items: its, questions: qs, score: s, theta: th(s), n: qs.length, nAns: its.length,
                axis: AXES.reduce((o,ax) => { const sub2 = its.filter(x => x.ax === ax); o[ax] = { score: score(sub2), theta: th(score(sub2)) }; return o; }, {}),
                impact: qs.reduce((a,x) => a + x.w, 0) / (qs.length || 1) });
  });
  rows.sort((a,b) => metas.findIndex(m => m.code === a.code) - metas.findIndex(m => m.code === b.code));

  /* --- eksenler --- */
  const axisScores = {};
  AXES.forEach(ax => {
    const its = flat.filter(x => x.ax === ax);
    const s = score(its);
    axisScores[ax] = { score:s, theta:th(s), n: its.length, na: axisNa[ax], items: its };
  });

  /* --- NIST fonksiyonları --- */
  const perFunction = {};
  if(tax === "nist") FUNC_ORDER.forEach(fc => {
    const its = flat.filter(x => (metaByCode[x.area] || {}).func === fc);
    const s = score(its); perFunction[fc] = { score:s, theta:th(s), n:its.length, items: its };
  });

  /* --- olgunluk basamakları --- */
  const perMl = {};
  [1,2,3,4,5].forEach(m => { const its = flat.filter(x => x.ml === m); perMl[m] = { score: score(its), n: its.length, items: its }; });

  /* --- mevzuat / çerçeve uyum oranları --- */
  const regScores = REG_DEFS.map(def => {
    const its = flat.filter(x => hasReg(x.id, def.key));
    const qs = questions.filter(x => hasReg(x.id, def.key));
    const s = score(its);
    const bankTotal = BANK.Q.filter(q => hasReg(q[F.id], def.key)).length;
    return { key:def.key, label:def.label, color:def.color, score:s, theta:th(s),
             n: qs.length, nAns: its.length, items: its, questions: qs, bankTotal: bankTotal,
             coverage: bankTotal ? (qs.length / bankTotal) * 100 : null };
  });

  /* --- açıklar / güçlü yanlar --- */
  const gaps = questions.slice().map(x => {
    const w = wOf(x);
    return Object.assign({}, x, { deficit: (5 - x.rqEff) / 4 * w, areaName: (rows.find(r => r.code === x.area) || {}).name });
  }).sort((a,b) => b.deficit - a.deficit).slice(0, 12);

  const strengths = questions.slice().filter(x => x.rqEff >= 4)
    .sort((a,b) => (b.rqEff - a.rqEff) || (b.w * b.ml - a.w * a.ml)).slice(0, 6)
    .map(x => Object.assign({}, x, { areaName: (rows.find(r => r.code === x.area) || {}).name }));

  const scored = rows.filter(r => !r.na);
  const iSum = scored.reduce((a,r) => a + r.impact, 0) || 1;
  const overallRisk = scored.reduce((a,r) => a + ((5 - r.theta) / 4 * 100) * r.impact, 0) / iSum;

  /* --- olgunluk basamağı kilidi (genel) --- */
  const lock = ladderLock(flat, wOf, W.lock);

  /* --- anomali tespiti --- */
  const anomalies = [];
  questions.forEach(qr => {
    questionAnomalies(qr.r).forEach(a => anomalies.push(Object.assign({}, a, {
      scope:"question", area:qr.area, id:qr.id, question:qr.q
    })));
    if(qr.gated && qr.gateFrom) anomalies.push({
      code:"DEP_VIOL", sev:"high", scope:"question", area:qr.area, id:qr.id, question:qr.q,
      msg:"Ön koşul kontrolü «" + qr.gateFrom.id + "» " + fmt(qr.gateFrom.rq,1) +
          "/5 düzeyindeyken bu kontrol " + fmt(qr.rq,1) + "/5 beyan edildi. Puan ön koşul seviyesine indirgendi."
    });
  });
  rows.filter(r => !r.na).forEach(r => {
    areaAnomalies(r.questions.map(x => ({ ml:x.ml, raw:x.r, mean:x.rq }))).forEach(a =>
      anomalies.push(Object.assign({}, a, { scope:"area", area:r.code, areaName:r.name })));
  });
  const anomalyByCode = {};
  anomalies.forEach(a => { (anomalyByCode[a.code] = anomalyByCode[a.code] || []).push(a); });
  const anomalyHigh = anomalies.filter(a => a.sev === "high").length;

  return { tax, rows, flat, questions, overallScore, overallTheta: th(overallScore),
           lock, anomalies, anomalyByCode, anomalyHigh,
           flaggedQuestions, allQuestions: allQ,
           reviewPending, reviewApproved, reviewExcluded, reviewOverridden,
           flaggedCount: flaggedQuestions.length, evidenceCount,
           reviewDone: reviewApproved + reviewExcluded + reviewOverridden,
           axisScores, perFunction, perMl, regScores, gaps, strengths, overallRisk, gateCount,
           naCount: rows.filter(r => r.na).length,
           naScope: rows.filter(r => r.na && r.reason === "scope").length,
           naAreaAll: rows.filter(r => r.na && r.reason === "allNA").length,
           naAxisCount, naQuestionCount, axisNa,
           totalQuestions: questions.length, totalItems: flat.length };
}

/* =====================================================================
   GÖRSELLEŞTİRME
   ===================================================================== */
function radarSvg(labels, values, size){
  size = size || 250;
  const cx = size/2, cy = size/2, R = size*0.33, n = labels.length;
  const pt = (i, v) => { const a = -Math.PI/2 + i*(2*Math.PI/n), r = (v/5)*R; return [cx + r*Math.cos(a), cy + r*Math.sin(a)]; };
  let s = "";
  [1,2,3,4,5].forEach(l => { s += '<polygon points="' + labels.map((_,i) => pt(i,l).join(",")).join(" ") + '" fill="none" stroke="var(--line)" stroke-width="1"/>'; });
  labels.forEach((lb,i) => {
    const p = pt(i,5); s += '<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="var(--line)" stroke-width="1"/>';
    const q = pt(i, 5.85);
    s += '<text x="'+q[0].toFixed(1)+'" y="'+q[1].toFixed(1)+'" font-size="8.5" font-family="Poppins,sans-serif" font-weight="600" fill="var(--slate-2)" text-anchor="middle" dominant-baseline="middle">'+esc(lb)+'</text>';
  });
  const dp = labels.map((_,i) => pt(i, values[i] || 0).join(",")).join(" ");
  s += '<polygon points="'+dp+'" fill="rgba(29,143,116,.16)" stroke="var(--teal)" stroke-width="2" stroke-linejoin="round"/>';
  labels.forEach((_,i) => { const p = pt(i, values[i] || 0); s += '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.6" fill="var(--teal)"/>'; });
  return '<svg viewBox="0 0 '+size+' '+size+'" width="100%" style="max-width:'+size+'px" role="img">'+s+'</svg>';
}

/* pct: 0–100 doluluk. Fill her zaman display:block (CSS) — inline span yüksekliği sorunu yok. */
function barFill(pct, color){
  const p = Math.max(0, Math.min(100, pct || 0));
  return '<span class="track"><span class="fill" style="width:' + p.toFixed(1) + '%;background:' + color + '"></span></span>';
}
function barRow(label, theta, color){
  const pct = theta == null ? 0 : (theta-1)/4*100;
  return '<div class="bar-row"><span class="lbl">'+esc(label)+'</span>' +
         barFill(pct, color || levelColor(theta)) +
         '<span class="val">'+fmt(theta)+'</span></div>';
}
/* Tıklanabilir satır: özet çubuk + açılınca skoru oluşturan sorular. */
function drillRow(label, pct, valText, color, bodyHTML, note, rozetHTML){
  return '<details class="drill"><summary><div class="bar-row">' +
    '<span class="lbl"><span class="chev">▶</span> ' + esc(label) + (rozetHTML || "") + '</span>' +
    barFill(pct, color) +
    '<span class="val">' + valText + '</span></div></summary>' +
    '<div class="drill-body">' + (note ? '<div class="drill-note">' + note + '</div>' : '') +
    bodyHTML + '</div></details>';
}

/* Bir soru kümesini cevaplarıyla birlikte listeler.
   axisFilter verilirse yalnızca o eksenin cevabı gösterilir. */
function questionDetailHTML(qs, axisFilter, regKey){
  /* Eksen filtreli listede o eksende kapsam dışı bırakılmış sorular hiç görünmez. */
  const list = axisFilter ? qs.filter(x => x.r[axisFilter] > 0) : qs;
  if(!list.length) return '<div class="drill-note">Bu başlıkta cevaplanmış soru bulunmuyor.</div>';
  return list.map(x => {
    const axs = axisFilter ? [axisFilter] : AXES;
    return '<div class="drill-q"><div class="drill-qt">' + esc(x.q) + '</div>' +
      axs.map(ax => {
        const r = x.r[ax];
        if(r === NA_VALUE)
          return '<div class="drill-ax"><span class="ab" style="color:var(--slate-2)">' + AXIS_NAME[ax] + '</span>' +
            '<span class="av na">—</span><span class="at" style="color:var(--slate-2)">' + esc(NA_AXIS_NOTE) + '</span></div>';
        const eff = Math.min(r, x.cap);
        return '<div class="drill-ax"><span class="ab" style="color:' + AXIS_COLOR[ax] + '">' + AXIS_NAME[ax] + '</span>' +
          '<span class="av" style="background:' + levelColor(eff) + '">' + r + '/5</span>' +
          '<span class="at">' + esc(ansText(x.arch, ax, r, x.k)) +
          (eff !== r ? ' <b style="color:var(--coral)">(ön koşul karşılanmadı → ' + fmt(eff,1) + ')</b>' : '') +
          '</span></div>';
      }).join("") +
      '<div class="drill-meta"><span class="tag-chip">' + esc(x.id) + '</span>' +
      '<span class="tag-chip">' + esc(x.t) + '</span>' +
      '<span class="tag-chip">' + CRIT_LABEL[x.w] + '</span>' +
      '<span class="tag-chip">Olgunluk ' + x.ml + '</span>' +
      '<span class="tag-chip">' + esc(BANK.arch[x.arch] || x.arch) + '</span>' +
      (!axisFilter && x.na ? '<span class="tag-chip" style="color:var(--slate-2)">' + x.na + ' boyut kapsam dışı</span>' : '') +
      (regKey ? '<span class="tag-chip">' + esc(regKey + ": " + regDetail(x.id, regKey)) + '</span>' : '') +
      '</div></div>';
  }).join("");
}

/* =====================================================================
   ŞİFRE ÇÖZME
   ===================================================================== */
function b642buf(b64){ const bin = atob(b64); const b = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) b[i] = bin.charCodeAt(i); return b.buffer; }
async function deriveAesKey(pw, salt){
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), {name:"PBKDF2"}, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2", salt, iterations:150000, hash:"SHA-256"}, km, {name:"AES-GCM", length:256}, false, ["decrypt"]);
}
async function decryptEnvelope(env, pw){
  const key = await deriveAesKey(pw, b642buf(env.salt));
  let plain;
  try{ plain = await crypto.subtle.decrypt({name:"AES-GCM", iv:new Uint8Array(b642buf(env.iv))}, key, b642buf(env.ciphertext)); }
  catch(e){ throw new Error("Şifre yanlış veya dosya bozuk."); }
  return JSON.parse(new TextDecoder().decode(plain));
}

/* =====================================================================
   ARAYÜZ — sekmeler
   ===================================================================== */
/* Panelin üç fonksiyonu: Anket Üretimi (gen), Anket Analizi (analiz), Soru Yönetimi (soru).
   Merkez (hub) açılış ekranıdır; sekme çubuğu yalnızca bulunulan fonksiyonun sekmelerini gösterir. */
const TAB_SECTION = { hub:null, gen:"gen", review:"analiz", results:"analiz", answers:"analiz",
                      bank:"soru", method:"soru", security:null };
function switchTab(t){
  if(t === "load") t = "hub";
  const sec = TAB_SECTION[t];
  document.getElementById("tabsBar").classList.toggle("hidden", t === "hub");
  document.querySelectorAll("#tabsBar .tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === t);
    if(b.dataset.sec) b.classList.toggle("hidden", b.dataset.sec !== sec);
  });
  Object.keys(TAB_SECTION).forEach(id => {
    const el = document.getElementById("tab" + id.charAt(0).toUpperCase() + id.slice(1));
    if(el) el.classList.toggle("hidden", id !== t);
  });
  if(t === "security" && typeof renderSecurity === "function") renderSecurity();
  window.scrollTo({top:0});
}
document.querySelectorAll("#tabsBar .tab-btn").forEach(b => b.addEventListener("click", () => { if(!b.disabled) switchTab(b.dataset.tab); }));
document.querySelectorAll(".hub-card[data-goto]").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.goto)));
document.getElementById("btnHome").addEventListener("click", () => switchTab("hub"));
document.getElementById("btnSecurity").addEventListener("click", () => switchTab("security"));
document.getElementById("btnLogout").addEventListener("click", () => location.reload());

/* =====================================================================
   ANKET ÜRET SEKMESİ
   ===================================================================== */
let genTax = "nist";

function renderTaxChoices(){
  const nistN = BANK.Q.filter(q => q[F.n] >= 0).length;
  const opts = [
    { id:"nist", ttl:"NIST CSF 2.0", sub:"Master setteki maddelerin NIST CSF 2.0 alt kategori eşlemeleri kullanılır. 6 fonksiyon (GV/ID/PR/DE/RS/RC) ve 22 kontrol alanı üzerinden raporlanır.", meta: BANK.nist.length + " kontrol alanı · " + nistN + " eşlenmiş soru" },
    { id:"uct", ttl:"UCT — Birleşik Kontrol Taksonomisi", sub:"Tüm regülasyonlardan konsolide edilmiş 11 ana kontrol alanı. Master setin tamamı kullanılabilir olduğu için alan başına daha derin bir olgunluk merdiveni kurulur.", meta: BANK.uct.length + " kontrol alanı · " + BANK.Q.length + " soru" }
  ];
  document.getElementById("taxChoices").innerHTML = opts.map(o =>
    '<button type="button" class="choice' + (genTax === o.id ? " sel" : "") + '" data-tax="' + o.id + '">' +
    '<span class="ttl"><span class="radio"></span>' + esc(o.ttl) + '</span>' +
    '<p>' + esc(o.sub) + '</p><div class="meta">' + esc(o.meta) + '</div></button>').join("");
  document.querySelectorAll("#taxChoices .choice").forEach(b => b.addEventListener("click", () => { genTax = b.dataset.tax; renderTaxChoices(); renderPreview(); }));
}

/* Kapsam listesi artık salt bilgilendirmedir — filtre ankette çalışır. */
function renderScopes(){
  document.getElementById("scopeList").innerHTML = BANK.scopes.map(s => {
    const n = s[3] >= 0 ? BANK.Q.filter(q => q[F.tag] === s[3]).length : 0;
    return '<div class="scope-item"><span class="sq">' + esc(s[1]) +
      '<span class="sn">' + esc(s[4] || "") + (n ? " — «Hayır» yanıtında " + n + " madde elenir" : "") + '</span></span>' +
      '<span class="tag-chip">ankette sorulur</span></div>';
  }).join("");
}

let lastFullAreas = null;
function currentTarget(){ return Number(document.getElementById("targetRange").value); }

function renderPreview(){
  const target = currentTarget();
  document.getElementById("targetVal").textContent = target;
  document.getElementById("targetSub").textContent = "= " + (target*3) + " İ/S/T cevabı";
  const full = buildFullAreas(genTax);
  lastFullAreas = full;
  /* En geniş kapsam (tüm kapsam soruları «Evet») senaryosunun önizlemesi */
  const resolved = resolveAreas(full, [], target);
  const live = resolved.filter(a => !a.scopeOut);
  const lo = live.reduce((a,x) => a + x.askMin, 0), hi = live.reduce((a,x) => a + x.askMax, 0);
  const poolTotal = full.reduce((a,x) => a + x.pool.length, 0);
  document.getElementById("previewGrid").innerHTML =
    '<div class="pv"><div class="n">' + live.length + '</div><div class="l">Kontrol Alanı</div></div>' +
    '<div class="pv"><div class="n">' + lo + '–' + hi + '</div><div class="l">Kontrol Sorusu</div></div>' +
    '<div class="pv"><div class="n">' + (lo*3) + '–' + (hi*3) + '</div><div class="l">İ/S/T Cevabı</div></div>' +
    '<div class="pv"><div class="n">' + poolTotal + '</div><div class="l">Ankete Gönderilen Havuz</div></div>';

  let hint = '<div class="note" style="margin-bottom:18px">Havuzun tamamı (<b>' + poolTotal + ' madde</b>) ankete gömülür; ' +
    'kapsam filtresi ve kota hesabı katılımcı kapsam sorularını yanıtladıktan sonra <b>anket içinde</b> çalışır. ' +
    'Aşağıdaki dağılım, tüm kapsam sorularına «Evet» yanıtı verilen en geniş senaryoyu gösterir.</div>';
  if(lo > target) hint += '<div class="note" style="margin-bottom:18px">Bu çerçevede <b>' + live.length +
    ' kontrol alanının</b> her birine en az 2 kontrol sorusu düştüğü için taban <b>' + lo +
    '</b>. Hedefi düşürmek toplam soru sayısını bu değerin altına indirmez.</div>';
  const maxPool = Math.max.apply(null, live.map(a => a.pool.length).concat([1]));
  document.getElementById("previewDetail").innerHTML = hint +
    '<div style="font-family:var(--font-display);font-weight:700;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--slate-2);margin-bottom:10px">Alan başına çalışma havuzu ve sorulacak kontrol sorusu</div>' +
    live.map(a => '<div class="bar-row"><span class="lbl">' + esc(a.c + " · " + a.n) + '</span>' +
      barFill(a.pool.length / maxPool * 100, "var(--teal)") +
      '<span class="val">' + a.askMin + '–' + a.askMax + '</span></div>').join("");
}
document.getElementById("targetRange").addEventListener("input", renderPreview);

document.getElementById("btnGenPreview").addEventListener("click", () => {
  const full = lastFullAreas || buildFullAreas(genTax);
  const resolved = resolveAreas(full, [], currentTarget());
  const byCode = {}; resolved.forEach(a => byCode[a.c] = a);
  const html = '<div class="panel-card" style="margin-top:4px"><h2 style="font-size:1rem">Çalışma havuzu (en geniş kapsam)</h2>' +
    resolved.filter(a => !a.scopeOut).map(a =>
      '<div style="margin-bottom:18px"><div style="font-family:var(--font-display);font-weight:700;color:var(--navy);font-size:.9rem">' +
      esc(a.c + " · " + a.n) + ' <span style="color:var(--slate-2);font-weight:600;font-size:.78rem">— ' + a.askMin + '–' + a.askMax +
      ' kontrol sorusu sorulur, çalışma havuzunda ' + a.pool.length + ', tam havuzda ' + a.fullSize + '</span></div>' +
      a.pool.map(p => '<div class="bank-item"><div class="bq">' + esc(p.q) + '</div><div class="bm">' +
        '<span class="tag-chip">' + esc(p.id) + '</span><span class="tag-chip">' + esc(BANK.arch[p.arch] || p.arch) + '</span>' +
        '<span class="tag-chip">Olgunluk ' + p.m + '</span><span class="tag-chip">' + CRIT_LABEL[p.w] + '</span></div></div>').join("") +
      '</div>').join("") + '</div>';
  document.getElementById("genMsg").innerHTML = html;
});

const SURVEY_MARKER = "/*__SURVEY__*/null/*__/SURVEY__*/";

/* ---- Üretilen anketlerin kaydı ----
   Her anketin taşıdığı soruların o anki bankadaki tam kaydı (kritiklik, olgunluk,
   arketip, mevzuat) bu tarayıcıda saklanır. Cevap dosyası geldiğinde puanlama bu
   kayıttan yapılır; banka sonradan değişse de anket üretildiği hâliyle değerlendirilir. */
const LS_ISSUED = "aoc_issued_v1";
function issuedRegistry(){ try{ return JSON.parse(localStorage.getItem(LS_ISSUED) || "{}") || {}; }catch(e){ return {}; } }
function saveIssued(reg){
  const ids = Object.keys(reg).sort((a,b) => String(reg[a].at).localeCompare(String(reg[b].at)));
  for(;;){
    try{ localStorage.setItem(LS_ISSUED, JSON.stringify(reg)); return true; }
    catch(e){ if(!ids.length) return false; delete reg[ids.shift()]; }   /* yer açmak için en eski kayıt silinir */
  }
}
async function sha256Hex(text){
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* Her kapsam kombinasyonu (2^n) için alan planı: kapsam dışı mı, kaç kontrol sorusu
   sorulur, çalışma havuzu hangi sırayla. Kota ve ağırlık hesabı burada kalır;
   ankete yalnızca sonuç (plan) ve planlarda geçen soruların metni gider. */
function scopePlans(full, target){
  const scopes = BANK.scopes, items = [], idx = {}, plans = {};
  const add = p => {
    if(idx[p.id] === undefined){ idx[p.id] = items.length; items.push({ id:p.id, t:p.t, q:p.q, arch:p.arch, k:p.k, m:p.m, p:p.w }); }
    return idx[p.id];
  };
  for(let mask = 0; mask < (1 << scopes.length); mask++){
    const answers = {};
    scopes.forEach((s, i) => { answers[s[0]] = !!(mask & (1 << i)); });
    plans[mask] = resolveAreas(full, excludedTagsFrom(scopes, answers), target)
      .map(a => ({ c:a.c, s:a.scopeOut ? 1 : 0, a:a.askMin, b:a.askMax, p:a.pool.map(add) }));
  }
  return { items, plans };
}

async function anketVerisi(full){
  const org = document.getElementById("genOrgName").value.trim();
  const contact = document.getElementById("genContact").value.trim();
  const target = currentTarget();
  const { items, plans } = scopePlans(full, target);
  const used = Array.from(new Set(items.map(x => x.arch)));
  const pick = obj => used.reduce((o, k) => { if(obj[k]) o[k] = obj[k]; return o; }, {});
  const qset = await sha256Hex(JSON.stringify({ tax:genTax, items, plans }));
  return {
    v: 5,
    meta: {
      id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      tax: genTax,
      taxName: genTax === "nist" ? "NIST CSF 2.0" : "UCT Kontrol Taksonomisi",
      appVersion: APP_VERSION,
      generatedAt: new Date().toISOString(),
      orgName: org, target: target, contactEmail: contact || "webrequest@scaleteknoloji.com", qset: qset
    },
    scopes: BANK.scopes.map(s => [s[0], s[1], s[2], s[4] || ""]),
    areas: full.map(a => ({ c:a.c, n:a.n, f:a.f, r:a.r })),
    items: items, plans: plans,
    arch: pick(BANK.arch), ans: pick(BANK.ans)
  };
}

function anketKapsami(full){
  const target = currentTarget();
  const resolved = resolveAreas(full, [], target).filter(a => !a.scopeOut);
  return { lo: resolved.reduce((a,x) => a + x.askMin, 0), hi: resolved.reduce((a,x) => a + x.askMax, 0) };
}

document.getElementById("btnGenerate").addEventListener("click", async () => {
  const full = lastFullAreas || buildFullAreas(genTax);
  const msg = document.getElementById("genMsg");
  if(!full.length){ msg.innerHTML = '<div class="note warn">Bu çerçevede hiç soru bulunamadı.</div>'; return; }
  if(SURVEY_TEMPLATE.indexOf(SURVEY_MARKER) === -1){ msg.innerHTML = '<div class="note warn">Şablon işaretçisi bulunamadı.</div>'; return; }
  const org = document.getElementById("genOrgName").value.trim();
  const note = document.getElementById("genNote").value.trim();
  const data = await anketVerisi(full);
  /* '<' kaçışlanır: soru metinleri betiği erken kapatamaz. */
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const html = SURVEY_TEMPLATE.replace(SURVEY_MARKER, () => json).replace("/*@FONTS@*/", () => gomuluFontlar());

  const reg = issuedRegistry();
  reg[data.meta.id] = { at: data.meta.generatedAt, org: org, note: note, tax: genTax, qset: data.meta.qset,
                        bankVersion: BANK.v, appVersion: APP_VERSION,
                        rows: data.items.reduce((o, x) => { o[x.id] = Q_BY_ID[x.id]; return o; }, {}) };
  const kayitli = saveIssued(reg);

  const k = anketKapsami(full);
  const lo = k.lo, hi = k.hi;
  const fname = "hizli-degerlendirme_" + genTax + (org ? "_" + slug(org) : "") + (note ? "_" + slug(note) : "") + ".html";
  download(fname, html, "text/html;charset=utf-8");
  msg.innerHTML =
    '<div class="note"><b>' + esc(fname) + '</b> indirildi. ' + full.length + ' kontrol alanı; ankete yalnızca kapsam planlarında geçen ' +
    data.items.length + ' kontrol sorusunun metni gömüldü (bankada ' + BANK.Q.length + '). Katılımcıya en geniş kapsamda ' + lo + '–' + hi +
    ' kontrol sorusu (' + (lo*3) + '–' + (hi*3) + ' İ/S/T cevabı) sorulacak. ' +
    'Kapsam soruları anketin ilk sayfasında yer alır. Dosya tek başına ve internetsiz çalışır (ağ erişimi kapalı); cevaplar cihazdan kendiliğinden çıkmaz.</div>' +
    (kayitli ? '' : '<div class="note warn">Anket kaydı tarayıcıya yazılamadı; cevaplar güncel soru bankasıyla puanlanacak.</div>');
});

/* =====================================================================
   BROŞÜR RAPORU — müşteri adayına gidecek, A4 sayfalara bölünmüş belge
   ---------------------------------------------------------------------
   Konsol ekranının çıktısı değil, bağımsız tasarlanmış bir belgedir.
   Yeni sekmede açılır; "PDF olarak kaydet" ile vektörel, metni seçilebilir
   bir PDF üretir (harici kütüphane yok, Türkçe karakter sorunu yok).

   RENK KARARLARI (dataviz yöntemi, doğrulayıcıdan geçirildi)
   ----------------------------------------------------------
   Belge, panelin koyu temasını DEĞİL açık/basıma uygun bir tema kullanır:
   koyu zeminli bir PDF yazıcıda okunmaz hâle gelir ve çok mürekkep tüketir.
   Tipografi ve marka mavisi İç Tetkik sisteminden alınmıştır.

   · Olgunluk 1–5 sıralı bir ölçektir → TEK HUE (marka mavisi) ordinal rampa.
     #74B8DD #4AA1D4 #2C7CB0 #1D5A82 #103954 — monotone L, ΔL ≥ .06,
     açık uç 2,12:1 kontrast, hue yayılımı 8°. Dört kontrolden de geçer.
   · İnsan / Süreç / Teknoloji kimliktir → KATEGORİK üç slot.
     #C4523A #7E63B8 #1D8F74 — bant, kroma, CVD ΔE 12,5 (deutan),
     normal görüş 20,9 ve kontrast kontrollerinin tamamı PASS.
     Mavi bilinçli olarak kimlik slotlarında kullanılmaz: ısı haritasının
     sıralı rampası zaten mavidir, iki anlam aynı hueyi paylaşmamalıdır.
   · Tek serili çubuklarda (alan sıralaması, fonksiyon kırılımı) bütün
     çubuklar TEK renktedir — uzunluk zaten büyüklüğü kodluyor; rengi de
     aynı değere bağlamak serbest kanalı israf eder.
   · Durum rozetleri yalnızca üç durumda ve HER ZAMAN metinle birlikte
     kullanılır; renk tek başına anlam taşımaz.
   ===================================================================== */

var BROSUR_RAMP = ["#74B8DD", "#4AA1D4", "#2C7CB0", "#1D5A82", "#103954"];
var BROSUR_AXIS = { I: "#C4523A", S: "#7E63B8", T: "#1D8F74" };
var BROSUR_BAR = "#2C7CB0";
var BROSUR_DURUM = {
  kritik: { renk: "#C4523A", ad: "Kritik" },
  gelisme: { renk: "#C98A3B", ad: "Geliştirilmeli" },
  guclu: { renk: "#1D8F74", ad: "Güçlü" }
};

function brosurRampa(theta) {
  if (theta == null || isNaN(theta)) return "#D8D0BE";
  var i = Math.max(0, Math.min(4, Math.round(theta) - 1));
  return BROSUR_RAMP[i];
}
function brosurDurum(theta) {
  if (theta == null) return BROSUR_DURUM.gelisme;
  if (theta < 2.6) return BROSUR_DURUM.kritik;
  if (theta < 3.4) return BROSUR_DURUM.gelisme;
  return BROSUR_DURUM.guclu;
}
function brosurYuzde(theta) {
  return theta == null ? 0 : Math.max(0, Math.min(100, (theta - 1) / 4 * 100));
}

/* ---------- işaretler ---------- */

/* Yatay çubuk: ince, uç köşeleri 4px yuvarlatılmış, taban çizgisine oturur.
   Değer çubuğun ucunda doğrudan etiketlenir; hiçbir değer renge bağlı değildir. */
function brosurBar(etiket, theta, opts) {
  opts = opts || {};
  var p = brosurYuzde(theta);
  var renk = opts.renk || BROSUR_BAR;
  return '<div class="b-row">' +
    '<div class="b-lbl">' + esc(etiket) + (opts.ek || "") +
    (opts.alt ? '<span class="b-alt">' + esc(opts.alt) + '</span>' : '') + '</div>' +
    '<div class="b-track"><div class="b-fill" style="width:' + p.toFixed(1) + '%;background:' + renk + '"></div></div>' +
    '<div class="b-val">' + (theta == null ? "—" : fmt(theta, 1)) + '</div>' +
    (opts.rozet ? '<div class="b-chip-cell">' + opts.rozet + '</div>' : '') +
    '</div>';
}

/* Basamak merdiveni — doğrulanmış seviyeyi ve nerede takıldığını gösterir.
   Renk tek kanal değildir: her basamağın altında numarası yazar. */
function brosurMerdiven(lock) {
  if (!lock) return "";
  var h = '<div class="ladder">';
  for (var m = 1; m <= 5; m++) {
    var l = lock.levels[m];
    var sinif = l.pass === true ? "pass" : (l.pass === false ? "fail" : "none");
    var bg = l.pass === true ? BROSUR_RAMP[m - 1] : (l.pass === false ? "#DE9A93" : "#EFEADF");
    h += '<div class="rung ' + sinif + '">' +
      '<div class="rung-bar" style="background:' + bg + '"></div>' +
      '<div class="rung-no">' + m + '</div></div>';
  }
  return h + '</div>';
}

/* Radar — altı fonksiyon, tek seri. Sayısal değerler yanındaki tabloda da
   yer alır, yani hiçbir bilgi yalnızca şekle bağlı değildir. */
function brosurRadar(labels, values, size) {
  size = size || 300;
  var cx = size / 2, cy = size / 2, R = size * 0.315, n = labels.length;
  function pt(i, v) {
    var a = -Math.PI / 2 + i * (2 * Math.PI / n), r = (v / 5) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  var s = "";
  [1, 2, 3, 4, 5].forEach(function (l) {
    s += '<polygon points="' + labels.map(function (_, i) { return pt(i, l).join(","); }).join(" ") +
      '" fill="' + (l === 5 ? "#FFFFFF" : "none") + '" stroke="#E6E1D6" stroke-width="1"/>';
  });
  labels.forEach(function (lb, i) {
    var p = pt(i, 5);
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#E6E1D6" stroke-width="1"/>';
    var q = pt(i, 6.05);
    s += '<text x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) + '" font-size="9.5" font-weight="600" ' +
      'fill="#5B6472" text-anchor="middle" dominant-baseline="middle">' + esc(lb) + '</text>';
  });
  var dp = labels.map(function (_, i) { return pt(i, values[i] || 0).join(","); }).join(" ");
  s += '<polygon points="' + dp + '" fill="rgba(44,124,176,.14)" stroke="' + BROSUR_BAR + '" stroke-width="2" stroke-linejoin="round"/>';
  labels.forEach(function (_, i) {
    var p = pt(i, values[i] || 0);
    s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="' + BROSUR_BAR + '" stroke="#FFFFFF" stroke-width="2"/>';
  });
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" style="max-width:' + size + 'px" role="img" ' +
    'aria-label="Fonksiyon bazında olgunluk radarı">' + s + '</svg>';
}

/* Halka gösterge — kapaktaki tek büyük sayı. */
function brosurHalka(theta, size) {
  size = size || 190;
  var r = size / 2 - 13, c = 2 * Math.PI * r, p = brosurYuzde(theta) / 100;
  var band = bandForMaturity(theta || 1);
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" ' +
    'aria-label="Genel olgunluk ' + fmt(theta, 1) + ' / 5">' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#EFEADF" stroke-width="13"/>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + brosurRampa(theta) +
    '" stroke-width="13" stroke-linecap="round" stroke-dasharray="' + (c * p).toFixed(1) + ' ' + c.toFixed(1) +
    '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
    '<text x="50%" y="47%" text-anchor="middle" font-size="42" font-weight="700" fill="#132A4C">' + fmt(theta, 1) + '</text>' +
    '<text x="50%" y="63%" text-anchor="middle" font-size="12" font-weight="600" fill="#8A8F9C">/ 5,0</text>' +
    '</svg>' +
    '<div class="ring-band" style="color:' + band.color + '">' + esc(band.label) + '</div>';
}

/* Isı haritası — kontrol alanı × boyut. Her hücrede sayı yazar, yani
   renk tek kanal değildir; tablonun kendisi "table view" işlevini görür. */
function brosurIsiHaritasi(rows) {
  var h = '<div class="heat"><div class="heat-head"><div></div>' +
    AXES.map(function (ax) { return '<div class="heat-col">' + esc(AXIS_NAME[ax]) + '</div>'; }).join("") +
    '<div class="heat-col">Alan</div></div>';
  rows.forEach(function (r) {
    h += '<div class="heat-row"><div class="heat-lbl">' + esc(r.code) + '<span>' + esc(r.name) + '</span></div>';
    AXES.forEach(function (ax) {
      var t = (r.axis && r.axis[ax]) ? r.axis[ax].theta : null;
      var koyu = t != null && t >= 3.4;
      h += '<div class="heat-cell" style="background:' + (t == null ? "#F4F1EA" : brosurRampa(t)) +
        ';color:' + (koyu ? "#FFFFFF" : "#20242C") + '">' + (t == null ? "—" : fmt(t, 1)) + '</div>';
    });
    var koyuA = r.theta >= 3.4;
    h += '<div class="heat-cell strong" style="background:' + brosurRampa(r.theta) +
      ';color:' + (koyuA ? "#FFFFFF" : "#20242C") + '">' + fmt(r.theta, 1) + '</div></div>';
  });
  return h + '</div>' +
    '<div class="heat-legend"><span>Olgunluk</span>' +
    BROSUR_RAMP.map(function (c, i) { return '<span class="hl-step"><i style="background:' + c + '"></i>' + (i + 1) + '</span>'; }).join("") +
    '<span class="hl-note">1 = tanımsız · 5 = optimize</span></div>';
}

function brosurRozet(theta) {
  var d = brosurDurum(theta);
  return '<span class="chip" style="border-color:' + d.renk + ';color:' + d.renk + '">' +
    '<i style="background:' + d.renk + '"></i>' + d.ad + '</span>';
}

/* Kilit rozeti — emoji yerine hizalı SVG; etiketle birlikte tek satırda kalır. */
function brosurKilit(lock) {
  if (!lock || lock.blockedAt == null) return "";
  return '<span class="lock" title="Seviye ' + lock.blockedAt + ' basamağında takıldı">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
    '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>' +
    'S' + lock.blockedAt + '</span>';
}

/* ---------- öneri üretimi ---------- */
function brosurOneri(r) {
  var enZayif = null;
  AXES.forEach(function (ax) {
    var t = r.axis && r.axis[ax] ? r.axis[ax].theta : null;
    if (t != null && (enZayif === null || t < enZayif.t)) enZayif = { ax: ax, t: t };
  });
  var takildi = r.lock && r.lock.blockedAt != null;
  var metin = "";
  if (r.theta < 2.0) {
    metin = "Bu alanda tanımlı bir uygulama tespit edilmedi. Öncelik, temel kontrolleri yazılı hâle getirmek " +
      "ve sorumluluğu tek bir role bağlamaktır.";
  } else if (r.theta < 2.6) {
    metin = "Uygulama var ancak kişiye bağlı ve tutarsız. Öncelik, mevcut pratiği prosedüre dönüştürüp " +
      "kurum genelinde aynı şekilde işletmektir.";
  } else if (r.theta < 3.4) {
    metin = "Süreç tanımlı ancak ölçülmüyor. Öncelik, uygulamanın düzenli olarak izlendiğini gösteren " +
      "metrik ve kayıtları oluşturmaktır.";
  } else if (r.theta < 4.2) {
    metin = "Alan yönetiliyor ve ölçülüyor. İyileştirme alanı, tekrar eden işleri otomatikleştirip " +
      "kontrolü sürekli doğrulanır hâle getirmektir.";
  } else {
    metin = "Alan olgun. Kazanımın korunması için periyodik doğrulama ve bağımsız denetim önerilir.";
  }
  if (takildi) {
    metin += " Olgunluk merdiveni <b>Seviye " + r.lock.blockedAt + "</b> basamağında takılıyor: " +
      "üst basamaklardaki beyanlar, bu basamak doğrulanmadan skora yansımıyor.";
  }
  if (enZayif && enZayif.t != null) {
    metin += " En zayıf boyut <b>" + esc(AXIS_NAME[enZayif.ax]) + "</b> (" + fmt(enZayif.t, 1) + "/5).";
  }
  return metin;
}

/* ---------- belge ---------- */
function brosurHTML(st, sub) {
  var isNist = st.tax === "nist";
  var scored = st.rows.filter(function (r) { return !r.na; });
  var siraliArtan = scored.slice().sort(function (a, b) { return a.theta - b.theta; });
  var band = bandForMaturity(st.overallTheta || 1);
  var lk = st.lock;
  var kurum = sub.orgName || "Kurum";
  var tarih = new Date(sub.submittedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
  var iletisim = sub.contact || null;
  var cerceve = sub.taxonomyName || (isNist ? "NIST CSF 2.0" : "UCT Kontrol Taksonomisi");

  /* Radar TÜM kontrol alanlarını gösterir — bir alt kümesi değil.
     NIST'te 22 alan altı fonksiyona toplandığı için radar fonksiyon bazındadır;
     UCT'de alan sayısı radar için uygun olduğundan alanların tamamı çizilir.
     "En zayıflar" ayrı bir grafikte (aşağıdaki sıralı çubuklarda) verilir. */
  var radarKaynak = isNist ? null : st.rows.filter(function (r) { return !r.na; });
  var radarLabels = isNist
    ? FUNC_ORDER
    : radarKaynak.map(function (r) { return r.code.length > 12 ? r.code.slice(0, 11) + "…" : r.code; });
  var radarVals = isNist
    ? FUNC_ORDER.map(function (f) { return (st.perFunction[f] || {}).theta || 0; })
    : radarKaynak.map(function (r) { return r.theta || 0; });

  var css = [
"@page{ size:A4; margin:14mm 13mm; }",
"*,*::before,*::after{ box-sizing:border-box; }",
/* Belge dili Türkçe olduğu için text-transform:uppercase, \"i\" harfini \"İ\"ye çevirir
   (CONFİDENTİAL gibi). İngilizce sözcükler lang=\"en\" ile bu dönüşümün dışında tutulur;
   metin zaten büyük harfle yazılır. */
"[lang=\"en\"]{ text-transform:none !important; }",
"html,body{ margin:0; padding:0; }",
"body{ font-family:'IBM Plex Sans',system-ui,sans-serif; color:#20242C; background:#E4E7EA; font-size:10.5pt; line-height:1.6;",
"  -webkit-print-color-adjust:exact; print-color-adjust:exact; }",
"h1,h2,h3,h4{ font-family:'Space Grotesk','IBM Plex Sans',sans-serif; color:#132A4C; margin:0 0 .5em; letter-spacing:-.012em; line-height:1.25; }",
"p{ margin:0 0 .8em; color:#5B6472; }",
"b,strong{ color:#132A4C; }",
".sheet{ width:210mm; min-height:297mm; padding:16mm 15mm; margin:0 auto 8mm; background:#FFFFFF; position:relative; }",
"@media print{ body{ background:#FFFFFF; } .sheet{ margin:0; padding:0; width:auto; min-height:0; page-break-after:always; }",
"  .sheet:last-child{ page-break-after:auto; } .no-print{ display:none !important; } }",

/* --- araç çubuğu (yalnızca ekranda) --- */
".bar{ position:sticky; top:0; z-index:9; background:#132A4C; color:#fff; padding:10px 16px; display:flex; gap:12px;",
"  align-items:center; justify-content:center; flex-wrap:wrap; font-family:'Space Grotesk',sans-serif; font-size:13px; }",
".bar button{ font-family:inherit; font-weight:600; font-size:13px; padding:.6em 1.3em; border-radius:99px; border:none;",
"  cursor:pointer; background:linear-gradient(135deg,#2C7CB0,#4FA6D8); color:#fff; }",
".bar span{ opacity:.8; }",

/* --- kapak --- */
".cover{ display:flex; flex-direction:column; min-height:265mm; }",
".mark{ display:flex; align-items:center; gap:11px; }",
".mark .m-ico{ width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#1D8F74,#3FB897); color:#fff;",
"  display:flex; align-items:center; justify-content:center; }",
".mark .m-ico svg{ width:21px; height:21px; }",
".mark .m-tx{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:#132A4C; letter-spacing:.14em; text-transform:uppercase; line-height:1.15; }",
".mark .m-tx small{ display:block; font-weight:600; font-size:9.5px; letter-spacing:.06em; color:#8A8F9C; text-transform:none; }",
".cover-mid{ flex:1; display:flex; flex-direction:column; justify-content:center; }",
".eyebrow{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:9.5pt; letter-spacing:.2em; text-transform:uppercase;",
"  color:#2C7CB0; display:flex; align-items:center; gap:.7em; margin:0 0 1.2em; }",
".eyebrow::before{ content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }",
".cover h1{ font-size:30pt; max-width:15ch; margin-bottom:.35em; }",
".cover .org{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:15pt; color:#2C7CB0; margin:0 0 .2em; }",
".cover .meta{ font-size:10pt; color:#8A8F9C; margin:0; }",
".cover-ring{ display:flex; align-items:center; gap:34px; margin:30px 0 0; padding:26px 0 0; border-top:1px solid #E6E1D6; }",
".ring-band{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:10pt; text-align:center; margin-top:6px; }",
".cover-ring .rd{ flex:1; }",
".cover-ring .rd h3{ font-size:13pt; margin-bottom:.4em; }",
".kpi{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:22px; }",
".kpi div{ border:1px solid #E6E1D6; border-radius:10px; padding:12px 14px; background:#FBF7F1; }",
".kpi .n{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:17pt; color:#132A4C; line-height:1.1; }",
".kpi .l{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; letter-spacing:.12em; text-transform:uppercase; color:#8A8F9C; margin-top:.5em; }",
".cover-foot{ margin-top:auto; padding-top:22px; border-top:1px solid #E6E1D6; display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; font-size:8.5pt; color:#8A8F9C; }",

/* --- gizlilik derecesi --- */
".gizli{ display:inline-flex; align-items:center; gap:.45em; font-family:'Space Grotesk',sans-serif; font-weight:700;",
"  font-size:8pt; letter-spacing:.16em; text-transform:uppercase; color:#B03A2E; background:#FBEAE7; white-space:nowrap;",
"  border:1.4px solid #E3A9A0; border-radius:5px; padding:.32em .8em; }",
".gizli i{ width:8px; height:8px; border-radius:2px; background:#B03A2E; }",
".gizli-sm{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; letter-spacing:.16em;",
"  text-transform:uppercase; color:#B03A2E; }",
".ph-right{ display:flex; align-items:center; gap:12px; }",

/* --- kapaktaki uyarı bloğu --- */
".disclaimer{ border:1.4px solid #E3A9A0; border-left:4px solid #B03A2E; border-radius:0 10px 10px 0;",
"  background:#FDF5F3; padding:15px 18px; margin-top:22px; }",
".disclaimer h4{ font-family:'Space Grotesk',sans-serif; font-size:8.5pt; letter-spacing:.12em; text-transform:uppercase;",
"  color:#B03A2E; margin:0 0 .6em; }",
".disclaimer p{ font-size:8.6pt; line-height:1.55; color:#6B4A44; margin:0 0 .5em; }",
".disclaimer p:last-child{ margin-bottom:0; }",
".disclaimer b{ color:#8A3B30; }",

/* --- ortak sayfa başlığı --- */
".ph{ display:flex; justify-content:space-between; align-items:baseline; gap:16px; padding-bottom:10px; margin-bottom:20px; border-bottom:1px solid #E6E1D6; }",
".ph .t{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:8.5pt; letter-spacing:.16em; text-transform:uppercase; color:#2C7CB0; }",
".ph .o{ font-size:8.5pt; color:#8A8F9C; }",
".pf{ position:absolute; left:15mm; right:15mm; bottom:9mm; display:flex; justify-content:space-between; font-size:7.5pt; color:#A9AFB9; border-top:1px solid #EFEADF; padding-top:6px; }",
"@media print{ .pf{ position:fixed; bottom:4mm; left:0; right:0; } }",

/* --- çubuklar --- */
".b-row{ display:flex; align-items:center; gap:12px; margin-bottom:9px; page-break-inside:avoid; }",
".b-lbl{ flex:0 0 46%; font-size:9pt; color:#20242C; line-height:1.35; }",
".b-lbl .b-alt{ display:block; font-size:7.8pt; color:#8A8F9C; }",
".b-track{ flex:1; height:9px; border-radius:5px; background:#F4F1EA; overflow:hidden; }",
".b-fill{ height:100%; border-radius:0 4px 4px 0; }",
".b-val{ flex:0 0 34px; text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:9pt; color:#132A4C;",
"  font-variant-numeric:tabular-nums; }",
".b-chip-cell{ flex:0 0 78px; text-align:right; }",
".legend{ display:flex; gap:16px; flex-wrap:wrap; margin:0 0 14px; font-size:8.5pt; color:#5B6472; }",
/* Dar kutularda etiket sütunu daralır, yoksa çubuk sıfıra iner. */
".box .b-lbl{ flex:0 0 52%; }",
".box .b-track{ min-width:52px; }",
".box .b-row{ margin-bottom:11px; }",
".legend i{ display:inline-block; width:11px; height:11px; border-radius:3px; margin-right:.45em; vertical-align:-1px; }",

/* --- rozetler --- */
".chip{ display:inline-flex; align-items:center; gap:.4em; white-space:nowrap; font-family:'Space Grotesk',sans-serif;",
"  font-weight:700; font-size:7.4pt; letter-spacing:.04em; text-transform:uppercase; border:1.2px solid; border-radius:99px; padding:.28em .7em; }",
".chip i{ width:7px; height:7px; border-radius:50%; }",
".lock{ display:inline-flex; align-items:center; gap:.3em; white-space:nowrap; font-family:'Space Grotesk',sans-serif;",
"  font-weight:700; font-size:7.4pt; color:#C4523A; background:#FBEEE9; border:1px solid #EFCBBE; border-radius:99px; padding:.2em .55em; margin-left:.45em; }",
".lock svg{ width:9px; height:9px; }",

/* --- merdiven --- */
".ladder{ display:flex; gap:5px; }",
".ladder .rung{ flex:1; text-align:center; }",
".ladder .rung-bar{ height:9px; border-radius:3px; }",
".ladder .rung-no{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; color:#A9AFB9; margin-top:3px; }",
".ladder .rung.pass .rung-no{ color:#2C7CB0; }",
".ladder .rung.fail .rung-no{ color:#C4523A; }",

/* --- ısı haritası --- */
".heat{ border:1px solid #E6E1D6; border-radius:10px; overflow:hidden; }",
".heat-head,.heat-row{ display:grid; grid-template-columns:1fr 54px 54px 54px 58px; }",
".heat-head{ background:#FBF7F1; border-bottom:1px solid #E6E1D6; }",
".heat-col{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; letter-spacing:.1em; text-transform:uppercase;",
"  color:#8A8F9C; text-align:center; padding:7px 0; }",
".heat-row{ border-top:1px solid #EFEADF; page-break-inside:avoid; }",
".heat-row:first-child{ border-top:none; }",
".heat-lbl{ padding:6px 10px; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:7.6pt; color:#132A4C; line-height:1.25; }",
".heat-lbl span{ display:block; font-family:'IBM Plex Sans',sans-serif; font-weight:400; font-size:7.4pt; color:#8A8F9C; }",
".heat-cell{ display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700;",
"  font-size:9pt; border-left:2px solid #FFFFFF; font-variant-numeric:tabular-nums; }",
".heat-cell.strong{ border-left:3px solid #FFFFFF; }",
".heat-legend{ display:flex; align-items:center; gap:8px; margin-top:10px; font-size:8pt; color:#8A8F9C; flex-wrap:wrap; }",
".heat-legend .hl-step{ display:inline-flex; align-items:center; gap:.3em; font-weight:700; color:#5B6472; }",
".heat-legend .hl-step i{ width:15px; height:11px; border-radius:3px; display:inline-block; }",
".heat-legend .hl-note{ color:#A9AFB9; }",

/* --- kartlar / tablolar --- */
".grid2{ display:grid; grid-template-columns:1fr 1fr; gap:20px; }",
".box{ border:1px solid #E6E1D6; border-radius:12px; padding:16px 18px; background:#FBF7F1; }",
".box h4{ font-size:9pt; letter-spacing:.1em; text-transform:uppercase; color:#8A8F9C; margin-bottom:.8em; }",
".area{ border:1px solid #E6E1D6; border-radius:12px; padding:14px 16px; margin-bottom:12px; page-break-inside:avoid; background:#fff; }",
".area-h{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px; }",
".area-h .nm{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:10pt; color:#132A4C; line-height:1.3; }",
".area-h .nm small{ display:block; font-family:'IBM Plex Sans',sans-serif; font-weight:400; font-size:8pt; color:#8A8F9C; letter-spacing:0; text-transform:none; }",
".area-h .sc{ text-align:right; white-space:nowrap; }",
".area-h .sc b{ font-family:'Space Grotesk',sans-serif; font-size:15pt; color:#132A4C; }",
".area-h .sc span{ font-size:8pt; color:#8A8F9C; }",
".area-grid{ display:grid; grid-template-columns:1.15fr 1fr; gap:16px; align-items:center; }",
".area-note{ font-size:8.6pt; line-height:1.55; color:#5B6472; margin:10px 0 0; padding-top:9px; border-top:1px solid #EFEADF; }",
"table.t{ width:100%; border-collapse:collapse; font-size:8.6pt; }",
"table.t th{ text-align:left; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; letter-spacing:.1em;",
"  text-transform:uppercase; color:#8A8F9C; padding:0 8px 7px 0; border-bottom:1px solid #E6E1D6; }",
"table.t td{ padding:6px 8px 6px 0; border-bottom:1px solid #EFEADF; color:#5B6472; font-variant-numeric:tabular-nums; }",
"table.t td.n{ text-align:right; font-family:'Space Grotesk',sans-serif; font-weight:700; color:#132A4C; }",
".callout{ border-left:3px solid #2C7CB0; background:#EAF2F8; border-radius:0 10px 10px 0; padding:12px 16px; font-size:9pt; color:#1D5A82; margin:0 0 16px; }",
".callout.warn{ border-left-color:#C98A3B; background:#FBF4E7; color:#6B583E; }",
".contact{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px 22px; font-size:9pt; }",
".contact div span{ display:block; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:7pt; letter-spacing:.1em;",
"  text-transform:uppercase; color:#8A8F9C; margin-bottom:.2em; }",
".contact div b{ font-weight:400; color:#20242C; }",
".cta{ background:linear-gradient(150deg,#0E1F3B,#16375C); color:#E1E7F0; border-radius:14px; padding:26px 28px; }",
".cta h3{ color:#fff; font-size:14pt; }",
".cta p{ color:#C9D3E0; font-size:9.4pt; }",
".cta a{ color:#A8DCF2; }",
".steps{ counter-reset:s; list-style:none; margin:0; padding:0; }",
".steps li{ counter-increment:s; position:relative; padding-left:34px; margin-bottom:12px; font-size:9.2pt; color:#5B6472; page-break-inside:avoid; }",
".steps li::before{ content:counter(s); position:absolute; left:0; top:-1px; width:23px; height:23px; border-radius:50%;",
"  background:#2C7CB0; color:#fff; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:9pt; display:flex; align-items:center; justify-content:center; }",
".steps li b{ display:block; color:#132A4C; font-family:'Space Grotesk',sans-serif; font-size:9.6pt; margin-bottom:.15em; }"
  ].join("\n");

  var mark =
    '<div class="mark"><span class="m-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></span>' +
    '<span class="m-tx">Scale<small>Bilgi Güvenliği ve Danışmanlık</small></span></div>';

  function sayfaBasi(baslik) {
    return '<div class="ph"><span class="t">' + esc(baslik) + '</span>' +
      '<span class="ph-right"><span class="o">' + esc(kurum) + ' · ' + esc(tarih) + '</span>' +
      '<span class="gizli-sm">Gizli</span></span></div>';
  }
  function sayfaAlti(no) {
    return '<div class="pf"><span><b class="gizli-sm">Gizli</b> &nbsp;·&nbsp; Siber Güvenlik Olgunluk Değerlendirmesi · ' +
      esc(cerceve) + '</span><span>' + no + '</span></div>';
  }

  /* ---------- 1 · kapak ---------- */
  var s1 = '<section class="sheet cover">' + mark +
    '<div class="cover-mid">' +
    '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:1.2em">' +
    '<p class="eyebrow" style="margin:0">Hızlı Değerlendirme Raporu</p>' +
    '<span class="gizli"><i></i>Gizli · <span lang="en">CONFIDENTIAL</span></span></div>' +
    '<h1>Siber Güvenlik Olgunluk Değerlendirmesi</h1>' +
    '<p class="org">' + esc(kurum) + '</p>' +
    '<p class="meta">' + esc(cerceve) + ' &middot; ' + esc(tarih) + '</p>' +
    '<div class="cover-ring"><div style="text-align:center">' + brosurHalka(st.overallTheta, 190) + '</div>' +
    '<div class="rd"><h3>Genel olgunluk</h3>' +
    '<p style="font-size:9.6pt">Kurumunuzun ' + scored.length + ' kontrol alanındaki ' + st.totalQuestions +
    ' kontrol sorusuna verdiği ' + st.totalItems + ' İnsan / Süreç / Teknoloji cevabı, kontrolün kritikliği ve ' +
    'olgunluk seviyesiyle ağırlıklandırılarak hesaplanmıştır.</p>' +
    (lk && lk.verified != null
      ? (lk.verified === 0
          ? '<p style="font-size:9.6pt;margin:0"><b>Doğrulanmış seviye: 0</b> — merdivenin ilk basamağı henüz ' +
            'eşiği geçmediği için hiçbir seviye doğrulanmış sayılmamaktadır. Ağırlıklı ortalama daha yüksek ' +
            'olsa bile, temel basamak karşılanmadan üst seviyeler doğrulanamaz.</p>'
          : '<p style="font-size:9.6pt;margin:0"><b>Doğrulanmış seviye: ' + lk.verified + '</b> — merdiven ' +
            'mantığıyla, altındaki tüm basamaklar da karşılandığı için doğrulanmış sayılan en yüksek seviye.</p>')
      : '') +
    '</div></div>' +
    '<div class="kpi">' +
    '<div><div class="n">' + scored.length + '</div><div class="l">Kontrol Alanı</div></div>' +
    '<div><div class="n">' + st.totalQuestions + '</div><div class="l">Kontrol Sorusu</div></div>' +
    '<div><div class="n">' + (lk && lk.verified != null ? "Seviye " + lk.verified : "—") + '</div><div class="l">Doğrulanmış Olgunluk</div></div>' +
    '</div>' +
    '<div class="disclaimer">' +
    '<h4>Gizlilik ve kapsam bildirimi</h4>' +
    '<p><b>Gizlilik derecesi: GİZLİ.</b> Bu rapor yalnızca ' + esc(kurum) + ' ve Scale Teknoloji ve Danışmanlık ' +
    'için hazırlanmıştır; kurumun güvenlik açıklarına işaret eden bulgular içerir. Üçüncü taraflarla ' +
    'paylaşılması, çoğaltılması veya kamuya açık ortamlarda saklanması yazılı izne tabidir.</p>' +
    '<p><b>Bu bir öz-değerlendirmedir.</b> Bulgular kurum temsilcisinin anket beyanlarına dayanır; ' +
    'yerinde inceleme, kanıt doğrulaması veya teknik test yapılmamıştır. Beyanların doğruluğu ' +
    'teyit edilmemiştir.</p>' +
    '<p>Rapor <b>bağımsız denetim görüşü, uygunluk beyanı, sertifikasyon veya hukuki mütalaa ' +
    'niteliği taşımaz</b>; mevzuata uygunluğun kanıtı olarak kullanılamaz. Skorlar, kullanılan soru ' +
    'bankası ve ağırlıklandırma yöntemine özgüdür; başka çerçevelerin sonuçlarıyla doğrudan ' +
    'karşılaştırılamaz. Kararlarınızı bu rapora dayandırmadan önce bulguların kanıtlarla ' +
    'doğrulanmasını öneririz.</p>' +
    '</div></div>' +
    '<div class="cover-foot"><span>Rapor otomatik olarak üretilmiştir · Soru bankası: ' + esc(sub.bankVersion || "—") + '</span>' +
    '<span>© ' + new Date().getFullYear() + ' Scale Teknoloji ve Danışmanlık</span></div></section>';

  /* ---------- 2 · yönetici özeti ---------- */
  var axisSirali = AXES.slice().sort(function (a, b) {
    return ((st.axisScores[a] || {}).theta || 0) - ((st.axisScores[b] || {}).theta || 0);
  });
  var enZayifEksen = axisSirali[0], enGucluEksen = axisSirali[2];
  var enZayif5 = siraliArtan.slice(0, 5), enGuclu5 = siraliArtan.slice(-5).reverse();

  var s2 = '<section class="sheet">' + sayfaBasi("Yönetici Özeti") +
    '<div class="callout' + (st.overallTheta < 2.6 ? " warn" : "") + '">' +
    '<b>' + esc(kurum) + '</b> genel olgunlukta <b>' + fmt(st.overallTheta, 1) + ' / 5,0</b> ' +
    '(' + esc(band.label) + ') düzeyindedir. ' +
    'Boyutlar arasında en güçlü alan <b>' + esc(AXIS_NAME[enGucluEksen]) + '</b> (' +
    fmt((st.axisScores[enGucluEksen] || {}).theta, 1) + '), en zayıf alan <b>' + esc(AXIS_NAME[enZayifEksen]) + '</b> (' +
    fmt((st.axisScores[enZayifEksen] || {}).theta, 1) + ') olarak ölçülmüştür.' +
    (lk && lk.blockedAt != null
      ? ' Olgunluk merdiveni <b>Seviye ' + lk.blockedAt + '</b> basamağında takılmaktadır; bu basamak doğrulanmadan ' +
        'üst seviyelerdeki beyanlar skora yansımaz.'
      : '') + '</div>' +

    '<div class="grid2" style="margin-bottom:22px"><div>' +
    '<h4 style="font-size:9pt;letter-spacing:.1em;text-transform:uppercase;color:#8A8F9C">' +
    (isNist ? "Fonksiyon bazında olgunluk" : "Kontrol alanlarının tamamı (" + radarLabels.length + ")") + '</h4>' +
    brosurRadar(radarLabels, radarVals, 300) + '</div>' +
    '<div><h4 style="font-size:9pt;letter-spacing:.1em;text-transform:uppercase;color:#8A8F9C">Boyut kırılımı</h4>' +
    '<div class="legend">' + AXES.map(function (ax) {
      return '<span><i style="background:' + BROSUR_AXIS[ax] + '"></i>' + esc(AXIS_NAME[ax]) + '</span>';
    }).join("") + '</div>' +
    AXES.map(function (ax) {
      var a = st.axisScores[ax] || {};
      return brosurBar(AXIS_FULL[ax], a.theta, { renk: BROSUR_AXIS[ax], alt: (a.n || 0) + " cevap" });
    }).join("") +
    '<h4 style="font-size:9pt;letter-spacing:.1em;text-transform:uppercase;color:#8A8F9C;margin-top:20px">Olgunluk merdiveni</h4>' +
    brosurMerdiven(lk) +
    '<p style="font-size:8.4pt;margin-top:8px">Bir seviyenin doğrulanmış sayılması için o basamağın ve altındaki tüm ' +
    'ölçülmüş basamakların eşiği geçmesi gerekir. Koyu dolgu geçilen, kırmızı takılan, boş ise ölçülmeyen basamağı gösterir.</p>' +
    '</div></div>' +

    /* "En zayıf" bilgisi radardan ayrı, kendi grafiğinde verilir. */
    '<div class="grid2">' +
    '<div class="box"><h4>Öne çıkan güçlü alanlar</h4>' +
    enGuclu5.map(function (r) {
      return brosurBar(r.code, r.theta, { alt: r.name });
    }).join("") + '</div>' +
    '<div class="box"><h4>Öncelikli iyileştirme alanları</h4>' +
    enZayif5.map(function (r) {
      return brosurBar(r.code, r.theta, { alt: r.name, ek: brosurKilit(r.lock) });
    }).join("") + '</div></div>' +

    (iletisim ? '<div class="box" style="margin-top:20px"><h4>Değerlendirmeyi ileten yetkili</h4>' +
      '<div class="contact">' +
      '<div><span>E-posta</span><b>' + esc(iletisim.email || "—") + '</b></div>' +
      '<div><span>Telefon</span><b>' + esc(iletisim.telefon || "—") + '</b></div>' +
      '<div><span>Kurum</span><b>' + esc(kurum) + '</b></div>' +
      '<div><span>Gönderim</span><b>' + esc(tarih) + '</b></div>' +
      '</div></div>' : '') +
    sayfaAlti(2) + '</section>';

  /* ---------- 3 · fonksiyon / alan sıralaması ---------- */
  var s3 = '<section class="sheet">' + sayfaBasi(isNist ? "Fonksiyon Kırılımı ve Alan Sıralaması" : "Kontrol Alanı Sıralaması");
  if (isNist) {
    s3 += '<h3 style="font-size:12pt">NIST CSF 2.0 fonksiyonları</h3>' +
      '<p style="font-size:9pt;margin-bottom:14px">Her fonksiyon, kapsamındaki kontrol alanlarının ağırlıklı ' +
      'ortalamasıdır. Çubuk uzunluğu olgunluğu gösterir; tek seri olduğu için tek renk kullanılmıştır.</p>' +
      FUNC_ORDER.map(function (f) {
        var pf = st.perFunction[f] || {};
        return brosurBar(FUNC_NAME[f] + " (" + f + ")", pf.theta, { alt: (pf.n || 0) + " cevap" });
      }).join("") + '<div style="height:18px"></div>';
  }
  s3 += '<h3 style="font-size:12pt">Kontrol alanları — düşükten yükseğe</h3>' +
    '<p style="font-size:9pt;margin-bottom:14px">Rozet, alanın <b>doğrulanmış</b> olgunluk durumunu özetler; ' +
    'kilit işareti merdivenin takıldığı basamağı gösterir.</p>' +
    siraliArtan.map(function (r) {
      return brosurBar(r.code + " · " + r.name, r.theta, { rozet: brosurRozet(r.theta) + brosurKilit(r.lock) });
    }).join("") +
    sayfaAlti(3) + '</section>';

  /* ---------- 4 · ısı haritası ---------- */
  var s4 = '<section class="sheet">' + sayfaBasi("Boyut Isı Haritası") +
    '<h3 style="font-size:12pt">Kontrol alanı × İnsan / Süreç / Teknoloji</h3>' +
    '<p style="font-size:9pt;margin-bottom:16px">Aynı kontrol alanının üç boyutu çoğu zaman farklı olgunluktadır: ' +
    'teknoloji kurulmuş ama süreç yazılmamış ya da süreç tanımlı ama personel bilgilendirilmemiş olabilir. ' +
    'Bu tablo, yatırımın hangi boyutta karşılıksız kaldığını gösterir. Her hücrede sayısal değer de yazılıdır.</p>' +
    brosurIsiHaritasi(scored) +
    sayfaAlti(4) + '</section>';

  /* ---------- 5..N · alan detayları ---------- */
  var detay = "";
  var sayfaNo = 5;
  var grup = [];
  siraliArtan.forEach(function (r, i) {
    grup.push(r);
    if (grup.length === 4 || i === siraliArtan.length - 1) {
      detay += '<section class="sheet">' + sayfaBasi("Kontrol Alanı Detayları") +
        grup.map(function (a) {
          return '<div class="area"><div class="area-h">' +
            '<div class="nm">' + esc(a.code) + brosurKilit(a.lock) + '<small>' + esc(a.name) +
            (isNist && a.func ? ' · ' + esc(FUNC_NAME[a.func] || a.func) : '') + '</small></div>' +
            '<div class="sc"><b>' + fmt(a.theta, 1) + '</b><span> / 5,0</span><br>' + brosurRozet(a.theta) + '</div></div>' +
            '<div class="area-grid"><div>' +
            AXES.map(function (ax) {
              var t = a.axis && a.axis[ax] ? a.axis[ax].theta : null;
              return brosurBar(AXIS_NAME[ax], t, { renk: BROSUR_AXIS[ax] });
            }).join("") + '</div>' +
            '<div><div style="font-family:Poppins,sans-serif;font-weight:700;font-size:7pt;letter-spacing:.1em;' +
            'text-transform:uppercase;color:#8A8F9C;margin-bottom:6px">Olgunluk merdiveni</div>' +
            brosurMerdiven(a.lock) +
            '<div style="font-size:8.2pt;color:#8A8F9C;margin-top:8px">' + a.n + ' kontrol sorusu · ' + a.nAns + ' cevap' +
            (a.naAx ? ' · ' + a.naAx + ' boyut kapsam dışı' : '') + '</div></div></div>' +
            '<p class="area-note">' + brosurOneri(a) + '</p></div>';
        }).join("") +
        sayfaAlti(sayfaNo++) + '</section>';
      grup = [];
    }
  });

  /* ---------- son · öneriler + iletişim ---------- */
  var oncelikli = siraliArtan.slice(0, 5);
  var sSon = '<section class="sheet">' + sayfaBasi("Öncelikli Aksiyonlar") +
    '<h3 style="font-size:13pt">Nereden başlamalı?</h3>' +
    '<p style="font-size:9.4pt;margin-bottom:18px">Aşağıdaki sıralama, olgunluğu en düşük alanlardan ' +
    'oluşturulmuştur. Merdiven mantığı gereği, takılan basamağın altındaki eksikler giderilmeden üst ' +
    'seviyedeki yatırımlar skora yansımaz — bu yüzden sıra önemlidir.</p>' +
    '<ol class="steps">' + oncelikli.map(function (r) {
      return '<li><b>' + esc(r.code) + ' · ' + esc(r.name) + ' — ' + fmt(r.theta, 1) + '/5</b>' + brosurOneri(r) + '</li>';
    }).join("") + '</ol>' +
    (st.flaggedCount ? '<div class="callout warn" style="margin-top:16px"><b>Kanıt incelemesi:</b> ' +
      st.flaggedCount + ' soruda cevaplar arasında bağlamsal çelişki tespit edilmiştir. ' +
      (st.reviewPending ? st.reviewPending + ' bulgu henüz karara bağlanmadığı için skorlara dâhil edilmemiştir; ' +
        'inceleme tamamlandığında skorlar güncellenecektir.' : 'Bulguların tamamı karara bağlanmıştır.') + '</div>' : '') +
    '<div class="cta" style="margin-top:22px"><h3>Sonuçları birlikte gözden geçirelim</h3>' +
    '<p>Bu rapor kurumunuzun kendi beyanına dayanır. Bulguları kanıtlarla doğrulamak, önceliklendirmeyi ' +
    'bütçe ve yükümlülük takviminizle hizalamak ve bir yol haritasına dönüştürmek için ücretsiz bir ' +
    'değerlendirme oturumu düzenliyoruz.</p>' +
    '<p style="margin-bottom:0"><b style="color:#fff">webrequest@scaleteknoloji.com</b> &nbsp;·&nbsp; ' +
    '<a href="https://infosec.scaleteknoloji.com">infosec.scaleteknoloji.com</a></p></div>' +
    '<p style="font-size:8pt;color:#A9AFB9;margin-top:18px">Bu belge öz-değerlendirme sonuçlarından otomatik ' +
    'olarak üretilmiştir. Bağımsız denetim görüşü, hukuki mütalaa veya uygunluk beyanı niteliği taşımaz. ' +
    'Soru bankası: ' + esc(sub.bankVersion || "—") + '</p>' +
    sayfaAlti(sayfaNo) + '</section>';

  return '<!DOCTYPE html>\n<html lang="tr"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>[GİZLİ] Siber Güvenlik Olgunluk Raporu — ' + esc(kurum) + '</title>' +
    '<style>' + gomuluFontlar() + '</style>' +
    '<style>' + css + '</style></head><body>' +
    '<div class="bar no-print"><span style="font-weight:700;letter-spacing:.14em;color:#F0A8A0">GİZLİ</span>' +
    '<button onclick="window.print()">PDF olarak kaydet</button>' +
    '<span>Yazdırma penceresinde hedef olarak <b>«PDF olarak kaydet»</b> seçin · kenar boşluğu: varsayılan · arka plan grafikleri: açık</span></div>' +
    s1 + s2 + s3 + s4 + detay + sSon +
    '</body></html>';
}

/* Yeni sekmede açar; açılır pencere engellenirse dosya olarak indirir. */
/* Panelin gömülü yazı tipleri rapora da aynen taşınır (ağ erişimi yok). */
function gomuluFontlar(){
  const el = document.getElementById("qaFonts");
  return el ? el.textContent : "";
}
function brosurAc(st, sub) {
  var html = brosurHTML(st, sub);
  var w = window.open("", "_blank");
  if (!w) {
    download("Siber_Olgunluk_Raporu_" + slug(sub.orgName) + "_" +
      new Date().toISOString().slice(0, 10) + ".html", html, "text/html;charset=utf-8");
    return false;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

/* =====================================================================
   SONUÇ YÜKLEME
   ===================================================================== */
let chosenFile = null, currentSub = null, currentState = null;

/* =====================================================================
   OPERATÖR KARARLARI — kanıt incelemesi
   Kararlar hem tarayıcıda saklanır hem de karar dosyası olarak dışa
   aktarılabilir; başka bir makinede cevap dosyasıyla birlikte yüklenince
   inceleme aynen geri gelir.
   ===================================================================== */
const REVIEW_ACTIONS = {
  approve:  "Kanıt kabul edildi — analize dâhil",
  exclude:  "Reddedildi — kapsam dışı bırakıldı",
  override: "Reddedildi — operatör seviye atadı"
};
function reviewKey(sub){
  if(!sub) return null;
  return "aoc_review_v1::" + slug(sub.orgName || "Kurum") + "::" + (sub.submittedAt || "");
}
function loadDecisions(sub){
  const k = reviewKey(sub); if(!k) return {};
  try{ const raw = localStorage.getItem(k); if(raw) return JSON.parse(raw) || {}; }catch(e){}
  return {};
}
function saveDecisions(sub, dec){
  const k = reviewKey(sub); if(!k) return;
  try{ localStorage.setItem(k, JSON.stringify(dec)); }catch(e){}
}
function setDecision(id, action, value, note){
  if(!currentSub) return;
  currentSub.__decisions = currentSub.__decisions || {};
  if(!action) delete currentSub.__decisions[id];
  else currentSub.__decisions[id] = { action, value, note: note || "",
                                      at: new Date().toISOString() };
  saveDecisions(currentSub, currentSub.__decisions);
  currentState = computeResults(currentSub);
  renderReview(); renderResults(); renderAnswers();
}
const uploadBox = document.getElementById("uploadBox");
document.getElementById("btnChooseFile").addEventListener("click", () => document.getElementById("fileInput").click());
document.getElementById("fileInput").addEventListener("change", e => { if(e.target.files[0]) showFile(e.target.files[0]); });
["dragenter","dragover"].forEach(ev => uploadBox.addEventListener(ev, e => { e.preventDefault(); uploadBox.classList.add("drag"); }));
["dragleave","drop"].forEach(ev => uploadBox.addEventListener(ev, e => { e.preventDefault(); uploadBox.classList.remove("drag"); }));
uploadBox.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if(f) showFile(f); });
function showFile(f){
  chosenFile = f;
  document.getElementById("uploadFilename").textContent = f.name;
  document.getElementById("decryptErr").textContent = "";
  document.getElementById("pwInput").focus();
}
document.getElementById("pwInput").addEventListener("keydown", e => { if(e.key === "Enter") document.getElementById("btnDecrypt").click(); });

document.getElementById("btnDecrypt").addEventListener("click", async () => {
  const err = document.getElementById("decryptErr");
  err.textContent = "";
  if(!chosenFile){ err.textContent = "Önce bir dosya seçin."; return; }
  const pw = document.getElementById("pwInput").value.trim();
  if(!pw){ err.textContent = "Şifreyi girin."; return; }
  try{
    const txt = await chosenFile.text();
    const env = JSON.parse(txt);
    if(!env || !env.ciphertext) throw new Error("Bu dosya geçerli bir şifreli cevap dosyası değil.");
    const sub = await decryptEnvelope(env, pw);
    document.getElementById("pwInput").value = "";
    loadSubmission(sub);
  }catch(e){ err.textContent = e.message || "Dosya çözülemedi."; }
});
document.getElementById("btnNewLoad").addEventListener("click", () => { switchTab("hub"); });

/* ---- Cevap dosyası bütünlüğü ----
   Puanlamada kullanılan kritiklik, olgunluk basamağı, arketip ve konu cevap
   dosyasından ALINMAZ (dosya katılımcı tarafında üretilir). Kaynak önceliği:
   1) anketin bu tarayıcıdaki üretim kaydı (parmak izi eşleşirse),
   2) güncel soru bankası (soru kimliğiyle).
   Eski (v4) dosyalarda dosyadaki değerler yalnızca bankada bulunmayan
   sorular için ve uyarıyla kullanılır. */
function resolveSubmission(sub){
  const reg = sub.surveyId ? issuedRegistry()[sub.surveyId] : null;
  const legacy = sub.type !== "aoc_submission_v5";
  const useIssued = !!(reg && (!sub.qset || reg.qset === sub.qset));
  const info = { source: useIssued ? "issued" : "bank", legacy: legacy, issuedAt: reg ? reg.at : null,
                 qsetMismatch: !!(reg && sub.qset && reg.qset !== sub.qset),
                 dropped: [], fromFile: [], textDiff: [], valueDiff: [] };
  Object.keys(sub.results || {}).forEach(code => {
    const r = sub.results[code];
    if(!r || !Array.isArray(r.items)) return;
    r.items = r.items.filter(it => {
      const row = (useIssued && reg.rows && reg.rows[it.id]) || Q_BY_ID[it.id];
      if(!row){
        if(legacy && it.w != null && it.ml != null){ info.fromFile.push(it.id); return true; }
        info.dropped.push(it.id); return false;
      }
      if(legacy && ((it.w != null && it.w !== row[F.w]) || (it.ml != null && it.ml !== row[F.m]))) info.valueDiff.push(it.id);
      if(it.q && it.q !== row[F.q]) info.textDiff.push(it.id);
      it.w = row[F.w]; it.ml = row[F.m]; it.arch = row[F.arch]; it.k = row[F.k];
      if(!it.t) it.t = row[F.t];
      if(!it.q) it.q = row[F.q];
      return true;
    });
  });
  sub.bankVersion = sub.bankVersion || (reg && reg.bankVersion) || BANK.v;
  sub.__qset = info;
  return sub;
}
function qsetNoteHTML(sub){
  const q = sub.__qset; if(!q) return "";
  const src = q.source === "issued"
    ? "Soru seti, anketin bu tarayıcıdaki üretim kaydıyla eşleşti (" + esc(new Date(q.issuedAt).toLocaleString("tr-TR")) + "); puanlama o kayıttan yapıldı."
    : "Anketin üretim kaydı bu tarayıcıda bulunamadı" + (q.qsetMismatch ? " ya da parmak izi eşleşmedi" : "") + "; puanlama güncel soru bankasından yapıldı.";
  const warn = [];
  if(q.legacy) warn.push("Dosya eski anket sürümüyle (v4) üretilmiş.");
  if(q.valueDiff.length) warn.push(q.valueDiff.length + " soruda dosyadaki kritiklik/olgunluk bilgisi bankadan farklıydı; banka değerleri kullanıldı.");
  if(q.textDiff.length) warn.push(q.textDiff.length + " sorunun metni bankada değişmiş; cevaplar katılımcının gördüğü metinle gösterilir.");
  if(q.fromFile.length) warn.push(q.fromFile.length + " soru bankada bulunamadı; dosyadaki değerlerle puanlandı: " + esc(q.fromFile.join(", ")) + ".");
  if(q.dropped.length) warn.push(q.dropped.length + " soru bankada bulunamadığı için analize alınmadı: " + esc(q.dropped.join(", ")) + ".");
  return '<div class="note' + (warn.length ? " warn" : "") + '" style="margin-bottom:20px"><b>Soru seti.</b> ' + src +
         (warn.length ? " " + warn.join(" ") : "") + '</div>';
}

let loadCount = 0;
function loadSubmission(sub){
  resolveSubmission(sub);
  currentSub = sub; loadCount++;
  if(!sub.__decisions) sub.__decisions = loadDecisions(sub);
  currentState = computeResults(sub);
  document.getElementById("tabBtnResults").disabled = false;
  document.getElementById("tabBtnAnswers").disabled = false;
  document.getElementById("tabBtnReview").disabled = false;
  renderResults(); renderAnswers(); renderReview();
  const last = document.getElementById("hubLast");
  last.classList.remove("hidden");
  document.getElementById("hubLastSub").textContent = (sub.orgName || "Kurum") + " · " +
    new Date(sub.submittedAt).toLocaleDateString("tr-TR");
  switchTab(currentState.reviewPending ? "review" : "results");
}

/* =====================================================================
   SONUÇ EKRANI
   ===================================================================== */
function renderResults(){
  const st = currentState, sub = currentSub;
  const band = bandForMaturity(st.overallTheta || 1);
  const risk = bandForRisk(st.overallRisk || 0);
  const isNist = st.tax === "nist";
  const scored = st.rows.filter(r => !r.na);
  let h = "";

  h += qsetNoteHTML(sub);
  if(sub.demo) h += '<div class="note warn" style="margin-bottom:20px"><b>Demo verisi</b> — bu ekran örnek yanıtlarla üretilmiştir, gerçek bir değerlendirme değildir.</div>';

  /* Kanıt incelemesi uyarısı — raporu okuyan herkes görmeli. */
  if(st.flaggedCount) h += '<div class="note ' + (st.reviewPending ? "warn" : "") + '" style="margin-bottom:20px">' +
    '<b>Tutarlılık şüphesi:</b> bu ankette <b>' + st.flaggedCount + ' soruda</b> cevaplar arasında bağlamsal çelişki ' +
    'tespit edilmiş ve kanıt talep edilmiştir. Katılımcı <b>' + st.evidenceCount + '</b> soruda kanıt sunmuştur. ' +
    (st.reviewPending
      ? '<b>' + st.reviewPending + ' bulgu henüz analiz operatörü tarafından incelenmemiştir ve bu skorlara dâhil edilmemiştir</b> ' +
        '(hem paydan hem paydadan çıkarılmıştır). İnceleme tamamlanana kadar skorlar geçicidir. ' +
        'Kanıt talep edilen soruların ayrıntıları «Kanıt İncelemesi» sekmesindedir.'
      : 'Bulguların tamamı analiz operatörü tarafından karara bağlanmıştır: ' +
        st.reviewApproved + ' kanıt kabul edildi, ' + st.reviewExcluded + ' kapsam dışı bırakıldı, ' +
        st.reviewOverridden + ' soruda operatör seviye atadı.') +
    '</div>';

  h += '<div class="panel-card"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap">' +
       '<div><h2 style="margin-bottom:.2em">' + esc(sub.orgName || "Kurum") + '</h2>' +
       '<p class="sub" style="margin:0">' + esc(sub.taxonomyName || (isNist ? "NIST CSF 2.0" : "UCT")) + ' · ' +
       new Date(sub.submittedAt).toLocaleDateString("tr-TR", {year:"numeric", month:"long", day:"numeric"}) +
       ' · ' + st.totalQuestions + ' skorlanan kontrol sorusu · ' + st.totalItems + ' skorlanan İ/S/T cevabı · ' + scored.length + ' kontrol alanı' +
       (st.naCount ? ' · ' + st.naCount + ' alan kapsam dışı' +
          (st.naScope || st.naAreaAll
            ? ' (' + [st.naScope ? st.naScope + "'i kapsam sorusundan" : "", st.naAreaAll ? st.naAreaAll + "'i tüm kontrolleri kapsam dışı olduğu için" : ""].filter(Boolean).join(", ") + ')'
            : '') : '') +
       (st.naAxisCount ? ' · ' + st.naAxisCount + ' boyut cevabı kapsam dışı' : '') +
       (st.naQuestionCount ? ' · ' + st.naQuestionCount + ' soru tümüyle kapsam dışı' : '') + '</p></div>' +
       '<span class="pillbadge" style="background:' + band.color + '">' + esc(band.label) + '</span></div>' +
       /* Anketi gönderen yetkili — sonuç raporunun gideceği adres burada görünür. */
       (sub.contact ? '<div class="contact-card">' +
          '<div class="cc"><span class="cc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span>' +
          '<div><div class="cc-l">E-posta</div><div class="cc-v"><a href="mailto:' + esc(sub.contact.email || "") + '">' +
          esc(sub.contact.email || "—") + '</a></div></div></div>' +
          '<div class="cc"><span class="cc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2a2 2 0 01-2 2A16 16 0 014 5z"/></svg></span>' +
          '<div><div class="cc-l">Telefon</div><div class="cc-v"><a href="tel:' +
          esc(String(sub.contact.telefon || "").replace(/\s/g, "")) + '">' + esc(sub.contact.telefon || "—") +
          '</a></div></div></div>' +
          (sub.contact.onayZamani
            ? '<div class="cc"><span class="cc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>' +
              '<div><div class="cc-l">KVKK onayı</div><div class="cc-v">' +
              (sub.contact.onay ? new Date(sub.contact.onayZamani).toLocaleString("tr-TR") : "Verilmedi") +
              '</div></div></div>'
            : '') +
          '</div>' : '') +
       ((st.naAxisCount || st.naQuestionCount || st.naCount)
         ? '<div class="note" style="margin-top:14px;margin-bottom:0">Katılımcının <b>kapsam dışı</b> işaretlediği cevaplar hiçbir skora girmez: ' +
           'paydan olduğu gibi <b>paydadan da çıkarılmıştır</b>. Bir sorunun üç boyutu da kapsam dışıysa soru hiç sayılmaz; ' +
           'bir alanın çalışma havuzundaki tüm kontroller kapsam dışıysa alan kapsam dışı sayılır. ' +
           'Skorlar yalnızca kapsam içi cevaplar üzerinden hesaplanır.</div>'
         : '') + '</div>';

  /* skor kartları */
  const radarLabels = isNist ? FUNC_ORDER : scored.map(r => r.code.slice(0,8));
  const radarVals = isNist ? FUNC_ORDER.map(f => (st.perFunction[f] || {}).theta || 0) : scored.map(r => r.theta || 0);
  const lk = st.lock, lkBand = lockBand(lk);
  h += '<div class="score-grid">' +
    '<div class="score-card primary"><div class="score-card-label">Doğrulanmış Olgunluk Seviyesi</div>' +
      '<div class="score-big" style="color:' + lkBand.color + '">' + (lk.verified == null ? "—" : lk.verified) + '</div>' +
      '<div class="score-sub">' + (lk.verified == null ? "ölçüm yok" : "5 üzerinden · basamak kilidi") + '</div>' +
      '<span class="pillbadge" style="background:' + lkBand.color + '">' + esc(lkBand.label) + '</span>' +
      rungsHTML(lk) + '</div>' +
    '<div class="score-card"><div class="score-card-label">Ağırlıklı Olgunluk (θ)</div><div class="score-big" style="color:' + band.color + '">' + fmt(st.overallTheta) + '</div>' +
      '<div class="score-sub">5 üzerinden · kilitsiz ortalama</div><span class="pillbadge" style="background:' + band.color + '">Seviye ' + band.lvl + '</span></div>' +
    '<div class="score-card"><div class="score-card-label">Ağırlıklı Skor</div><div class="score-big">' + fmt(st.overallScore, 0) + '</div>' +
      '<div class="score-sub">100 üzerinden</div></div>' +
    '<div class="score-card"><div class="score-card-label">Risk Göstergesi</div><div class="score-big" style="color:' + risk.color + '">' + fmt(st.overallRisk, 0) + '</div>' +
      '<div class="score-sub">Etki ağırlıklı açık oranı</div><span class="pillbadge" style="background:' + risk.color + '">' + esc(risk.label) + '</span></div>' +
    '<div class="radar-card"><div class="radar-caption">' + (isNist ? "NIST CSF Fonksiyonları" : "UCT Kontrol Alanları") + '</div>' +
      radarSvg(radarLabels, radarVals, isNist ? 230 : 270) + '</div></div>';

  /* ---- 1) Kontrol alanı olgunluğu (tıklanabilir) ---- */
  h += '<div class="panel-card"><h2>Kontrol alanı olgunluğu</h2>' +
       '<p class="sub">' + (isNist ? "NIST CSF 2.0" : "UCT") + ' kontrol alanları. Değer sütunu <b>doğrulanmış seviye / ağırlıklı θ</b> ' +
       'biçimindedir; kilit rozeti alanın bir alt basamakta takıldığını gösterir. ' +
       'Bir satıra tıklayarak kilidin nerede durduğunu ve skoru oluşturan cevapları görebilirsiniz.</p>' +
       scored.slice().sort((a,b) => a.theta - b.theta).map(r =>
         drillRow(r.code + " · " + r.name,
           (r.theta-1)/4*100, (r.lock.verified == null ? "—" : "S" + r.lock.verified) + " / " + fmt(r.theta),
           "var(--teal)",
           questionDetailHTML(r.questions, null, null),
           '<b>Doğrulanmış seviye: ' + (r.lock.verified == null ? "—" : r.lock.verified) + '</b> · ' + lockExplain(r.lock) + '<br>' +
           r.n + ' skorlanan kontrol sorusu · ' + r.nAns + ' skorlanan İ/S/T cevabı · ağırlıklı skor ' + fmt(r.score,0) + '/100 · ' +
           'eksen kırılımı — İnsan ' + fmt(r.axis.I.theta) + ' · Süreç ' + fmt(r.axis.S.theta) + ' · Teknoloji ' + fmt(r.axis.T.theta) +
           ((r.naAx || r.naQ || r.skipped)
             ? ' · kapsam dışı: ' + [r.naAx ? r.naAx + ' boyut cevabı' : "", (r.naQ + r.skipped) ? (r.naQ + r.skipped) + ' kontrol sorusu' : ""].filter(Boolean).join(", ") +
               ' (skora ve paydaya girmedi)'
             : ''),
           r.lock.blockedAt != null
             ? '<span class="lockchip" title="Seviye ' + r.lock.blockedAt + ' basamağında takıldı">'
               + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">'
               + '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>S'
               + r.lock.blockedAt + '</span>'
             : '')
       ).join("") + '</div>';

  /* ---- 2) İnsan / Süreç / Teknoloji (tıklanabilir) ---- */
  h += '<div class="panel-card"><h2>İnsan · Süreç · Teknoloji</h2>' +
       '<p class="sub">Her kontrol sorusu üç boyut için ayrı yanıtlanmıştır; skorlar aynı ağırlıklı formülle hesaplanır.</p>' +
       '<div class="func-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">' +
       AXES.map(a => {
         const x = st.axisScores[a];
         return '<div class="func-card" style="border-left:3px solid ' + AXIS_COLOR[a] + '"><div class="code">' + AXIS_FULL[a] + '</div>' +
           '<div class="val" style="color:' + (x.theta ? levelColor(x.theta) : "var(--slate-2)") + '">' + fmt(x.theta) + '</div>' +
           '<div class="nm">' + (x.score == null ? "veri yok" : fmt(x.score,0) + " / 100 · " + x.n + " skorlanan cevap") +
           (x.na ? " · " + x.na + " kapsam dışı" : "") + '</div></div>';
       }).join("") + '</div>' +
       AXES.map(a => {
         const x = st.axisScores[a];
         return drillRow(AXIS_FULL[a], x.theta == null ? 0 : (x.theta-1)/4*100, fmt(x.theta), AXIS_COLOR[a],
           questionDetailHTML(st.questions, a, null),
           x.n + ' skorlanan cevap' + (x.na ? ' · ' + x.na + ' kapsam dışı (listelenmez, paydaya girmez)' : '') +
           ' · ağırlıklı skor ' + fmt(x.score,0) + '/100 · yalnızca bu boyutun kapsam içi cevapları listelenir.');
       }).join("") + '</div>';

  /* ---- 3) Mevzuat / çerçeve uyum oranı (tıklanabilir) ---- */
  h += '<div class="panel-card"><h2>Mevzuat ve çerçeve uyum oranı</h2>' +
       '<p class="sub">Her çerçeve için, o çerçeveye eşlenmiş sorulardan gelen cevaplar aynı ağırlıklı formülle puanlanır. ' +
       'Bu bir uygunluk beyanı değil, cevaplara dayalı <b>yaklaşık</b> bir göstergedir.</p>' +
       st.regScores.map(rg =>
         drillRow(rg.label, rg.score == null ? 0 : rg.score, rg.score == null ? "—" : fmt(rg.score,0) + "%",
           rg.color, questionDetailHTML(rg.questions, null, rg.key),
           rg.n ? (rg.n + ' kontrol sorusu · ' + rg.nAns + ' cevap · bu çerçeveye bankada eşlenmiş ' + rg.bankTotal +
                   ' maddenin ' + fmt(rg.coverage,0) + '%\'i soruldu · θ ' + fmt(rg.theta))
                : 'Bu çerçeveye eşlenmiş hiçbir soru sorulmadı.')
       ).join("") +
       '<div class="reg-legend"><b>Not:</b> 7545, BİGR, KVKK ve CIS eşlemeleri master kontrol setinden gelir. ' +
       'ISO/IEC 27001:2022 eşlemesi master sette bulunmadığı için kontrol arketipi üzerinden türetilmiş <b>yaklaşık</b> bir eşlemedir ' +
       've resmî bir sertifikasyon değerlendirmesi yerine geçmez.</div></div>';

  /* NIST fonksiyonları */
  if(isNist){
    h += '<div class="panel-card"><h2>NIST CSF 2.0 Fonksiyonları</h2><div class="func-grid">' +
      FUNC_ORDER.map(f => {
        const x = st.perFunction[f] || {};
        return '<div class="func-card"><div class="code">' + f + '</div><div class="nm">' + FUNC_NAME[f] + '</div>' +
          '<div class="val" style="color:' + (x.theta ? levelColor(x.theta) : "var(--slate-2)") + '">' + fmt(x.theta) + '</div></div>';
      }).join("") + '</div>' +
      FUNC_ORDER.map(f => {
        const x = st.perFunction[f] || {};
        if(!x.n) return "";
        const qs = st.questions.filter(q => (areaMeta("nist").find(m => m.code === q.area) || {}).func === f);
        return drillRow(f + " · " + FUNC_NAME[f], x.theta == null ? 0 : (x.theta-1)/4*100, fmt(x.theta), levelColor(x.theta),
          questionDetailHTML(qs, null, null), x.n + ' cevap · ağırlıklı skor ' + fmt(x.score,0) + '/100');
      }).join("") + '</div>';
  }

  /* kontrol alanı tablosu */
  h += '<div class="panel-card"><h2>Kontrol alanı tablosu</h2><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
       '<th>Kod</th><th>Kontrol alanı</th>' + (isNist ? '<th>Fonksiyon</th>' : '') +
       '<th>Soru</th><th>Cevap</th><th>Skor</th><th>θ</th><th>İ</th><th>S</th><th>T</th><th>Doğr.</th><th>Seviye</th></tr></thead><tbody>' +
       st.rows.map(r => {
         if(r.na) return '<tr><td class="mono">' + esc(r.code) + '</td><td class="nm">' + esc(r.name) + '</td>' +
           (isNist ? '<td>' + esc(r.func || "—") + '</td>' : '') + '<td colspan="9" style="color:var(--slate-2)">' +
           esc(naReasonLabel(r.reason)) +
           ((r.naQ + r.skipped) ? ' — ' + (r.naQ + r.skipped) + ' kontrol sorusu kapsam dışı işaretlendi' : '') + '</td></tr>';
         return '<tr><td class="mono">' + esc(r.code) + '</td><td class="nm">' + esc(r.name) + '</td>' +
           (isNist ? '<td>' + esc(r.func || "—") + '</td>' : '') + '<td>' + r.n + '</td><td>' + r.nAns + '</td><td>' + fmt(r.score,0) + '</td><td>' + fmt(r.theta) + '</td>' +
           '<td>' + fmt(r.axis.I.theta) + '</td><td>' + fmt(r.axis.S.theta) + '</td><td>' + fmt(r.axis.T.theta) + '</td>' +
           '<td><span class="lvl-chip" style="background:' + lockBand(r.lock).color + '" title="' + esc(lockExplain(r.lock).replace(/<[^>]+>/g,"")) + '">' +
           (r.lock.verified == null ? "—" : r.lock.verified) + '</span></td>' +
           '<td><span class="lvl-chip" style="background:' + levelColor(r.theta) + '">' + Math.max(1,Math.min(5,Math.round(r.theta))) + '</span></td></tr>';
       }).join("") + '</tbody></table></div></div>';

  /* öncelikli açıklar */
  h += '<div class="panel-card"><h2>Öncelikli iyileştirme alanları</h2>' +
       '<p class="sub">Sıralama: (5 − etkin cevap ortalaması) × kritiklik × olgunluk çarpanı. En yüksek ağırlıklı açık en üstte.</p>' +
       st.gaps.map((g,i) =>
         '<div class="gap-row"><span class="gap-rank">' + (i+1) + '</span><div class="gap-body">' +
         '<div class="gap-domain">' + esc(g.areaName || g.area) + '</div>' +
         '<div class="gap-q">' + esc(g.q) + '</div>' +
         '<div class="gap-meta"><span class="tag-chip">' + esc(g.id) + '</span>' +
         g.live.map(ax => '<span class="tag-chip" style="color:' + AXIS_COLOR[ax] + '">' + AXIS_NAME[ax] + ' ' + g.r[ax] + '/5</span>').join("") +
         AXES.filter(ax => g.r[ax] === NA_VALUE).map(ax => '<span class="tag-chip" style="color:var(--slate-2)">' + AXIS_NAME[ax] + ' — kapsam dışı</span>').join("") +
         '<span class="tag-chip">' + CRIT_LABEL[g.w] + '</span>' +
         '<span class="tag-chip">Olgunluk ' + g.ml + '</span>' +
         (g.gated ? '<span class="tag-chip" style="color:var(--coral);border-color:var(--coral)">Ön koşul karşılanmadı</span>' : '') +
         '</div></div><span class="gap-lvl" style="background:' + levelColor(g.rqEff) + '">' + fmt(g.rqEff) + '/5</span></div>').join("") + '</div>';

  if(st.strengths.length){
    h += '<div class="panel-card"><h2>Güçlü yanlar</h2>' +
      st.strengths.map(g => '<div class="gap-row"><span class="gap-rank">✓</span><div class="gap-body">' +
        '<div class="gap-domain">' + esc(g.areaName || g.area) + '</div><div class="gap-q">' + esc(g.q) + '</div>' +
        '<div class="gap-meta">' + g.live.map(ax => '<span class="tag-chip" style="color:' + AXIS_COLOR[ax] + '">' + AXIS_NAME[ax] + ' ' + g.r[ax] + '/5</span>').join("") +
        AXES.filter(ax => g.r[ax] === NA_VALUE).map(ax => '<span class="tag-chip" style="color:var(--slate-2)">' + AXIS_NAME[ax] + ' — kapsam dışı</span>').join("") +
        '<span class="tag-chip">Olgunluk ' + g.ml + '</span></div></div>' +
        '<span class="gap-lvl" style="background:' + levelColor(g.rqEff) + '">' + fmt(g.rqEff) + '/5</span></div>').join("") + '</div>';
  }

  /* olgunluk basamağı analizi */
  h += '<div class="panel-card"><h2>Olgunluk basamağı analizi ve kilit</h2>' +
       '<p class="sub">Basamaklar sırayla değerlendirilir: <b>alt basamak eşiği geçmeden üst basamak sayılmaz</b>. ' +
       'Aşağıdaki çubuklarda eşiği geçemeyen ilk basamak kilidin durduğu yerdir.</p>' +
       [1,2,3,4,5].map(m => {
         const x = st.perMl[m], l = lk.levels[m];
         if(!x.n) return '<div class="bar-row"><span class="lbl">Seviye ' + m + ' · ' + ML_LABEL[m] + '</span>' +
           barFill(0, "var(--line)") + '<span class="val" style="color:var(--slate-2)">ölçülmedi</span></div>';
         const blocked = lk.blockedAt === m;
         return '<div class="bar-row"><span class="lbl">' +
           (blocked ? '🔒 ' : (l.pass ? '✓ ' : '')) + 'Seviye ' + m + ' · ' + ML_LABEL[m] + '</span>' +
           barFill(x.score || 0, l.pass ? "var(--l5)" : (blocked ? "var(--coral)" : "var(--l2)")) +
           '<span class="val"' + (blocked ? ' style="color:var(--coral)"' : '') + '>' + fmt(x.score,0) + '</span></div>';
       }).join("") +
       '<div class="lock-note">' + lockExplain(lk) + ' Eşik <b>%' + fmt(lk.threshold,0) +
       '</b> olarak uygulanmıştır; Metodoloji sekmesinden değiştirilebilir.</div></div>';

  /* ---- cevap tutarlılığı / anomali raporu ---- */
  h += '<div class="panel-card"><h2>Cevap tutarlılığı</h2>' +
       '<p class="sub">Cevap örüntülerinde olağandışı durumlar taranır. Bunlar bir hata iddiası değildir; ' +
       'kanıt istenmesi veya cevabın teyit edilmesi gereken noktaları işaret eder.</p>';
  if(!st.anomalies.length){
    h += '<div class="note">Taranan kurallarda anomali bulunmadı. Cevap örüntüsü içsel olarak tutarlı.</div>';
  } else {
    h += '<div class="note warn" style="margin-bottom:16px"><b>' + st.anomalies.length + ' bulgu</b>' +
         (st.anomalyHigh ? ' — bunların <b>' + st.anomalyHigh + "'i</b> yüksek önemde" : '') +
         '. Yüksek önemli bulgularda ilgili kontrol için kanıt istenmesi önerilir.</div>';
    h += Object.keys(st.anomalyByCode).map(code => {
      const list = st.anomalyByCode[code], def = ANOMALY_DEFS[code] || { label:code, sev:"med" };
      return '<details class="drill"><summary><div class="bar-row">' +
        '<span class="lbl"><span class="chev">▶</span> ' + esc(def.label) + '</span>' +
        barFill(Math.min(100, list.length / Math.max(1, st.totalQuestions) * 100 * 4), def.sev === "high" ? "var(--coral)" : "var(--gold)") +
        '<span class="val">' + list.length + '</span></div></summary><div class="drill-body">' +
        list.slice(0, 40).map(a =>
          '<div class="anom"><span class="sev ' + a.sev + '">' + (a.sev === "high" ? "Yüksek" : "Orta") + '</span>' +
          '<div class="abody"><div class="atitle">' + esc(a.areaName || (st.rows.find(r => r.code === a.area) || {}).name || a.area) + '</div>' +
          '<div class="amsg">' + esc(a.msg) + '</div>' +
          (a.question ? '<div class="aq">' + esc(a.id) + ' · ' + esc(a.question) + '</div>' : '') +
          '</div></div>').join("") +
        (list.length > 40 ? '<div class="drill-note">İlk 40 bulgu gösteriliyor.</div>' : '') +
        '</div></details>';
    }).join("");
  }
  h += '</div>';

  if(st.gateCount) h += '<div class="note warn">' + st.gateCount + ' kontrol sorusunda bağımlılık kapısı devreye girdi: ön koşul kontrolü yeterince karşılanmadığı için bu maddelerin puanı ön koşul seviyesine indirgendi.</div>';

  document.getElementById("resultsWrap").innerHTML = h;
}

function renderAnswers(){
  const st = currentState, sub = currentSub;
  let h = '<div class="panel-card"><h2>Verilen cevaplar</h2><p class="sub">' + esc(sub.orgName || "Kurum") + ' · ' +
          st.totalQuestions + ' skorlanan kontrol sorusu · ' + st.totalItems + ' skorlanan İ/S/T cevabı' +
          (st.naAxisCount ? ' · ' + st.naAxisCount + ' boyut cevabı kapsam dışı' : '') +
          (st.naQuestionCount ? ' · ' + st.naQuestionCount + ' soru tümüyle kapsam dışı' : '') + '</p></div>';
  st.rows.forEach(r => {
    if(r.na){
      h += '<div class="ans-block"><div class="ans-head"><h3 style="font-size:.98rem;margin:0">' + esc(r.code + " · " + r.name) + '</h3>' +
        '<span class="tag-chip">' + esc(naReasonLabel(r.reason)) +
        ((r.naQ + r.skipped) ? ' · ' + (r.naQ + r.skipped) + ' soru' : '') + '</span></div></div>'; return;
    }
    h += '<div class="ans-block"><div class="ans-head"><h3 style="font-size:.98rem;margin:0">' + esc(r.code + " · " + r.name) + '</h3>' +
      '<span class="lvl-chip" style="background:' + levelColor(r.theta) + '">θ ' + fmt(r.theta) + '</span></div>' +
      questionDetailHTML(r.questions, null, null) + '</div>';
  });
  document.getElementById("answersWrap").innerHTML = h;
}

/* =====================================================================
   KANIT İNCELEME EKRANI
   ===================================================================== */
function reviewStatusChip(q){
  if(q.review === "approved")  return '<span class="rv-chip ok">Analize dâhil</span>';
  if(q.review === "excluded")  return '<span class="rv-chip out">Kapsam dışı</span>';
  if(q.review === "override")  return '<span class="rv-chip ov">Operatör seviyesi ' + q.overrideValue + '/5</span>';
  return '<span class="rv-chip pend">İncelenmedi — skora girmiyor</span>';
}
function renderReview(){
  const st = currentState, sub = currentSub;
  if(!st){ document.getElementById("reviewWrap").innerHTML = ""; return; }
  const list = st.flaggedQuestions;
  const btn = document.getElementById("tabBtnReview");
  if(btn) btn.textContent = "Kanıt İncelemesi" + (st.reviewPending ? " (" + st.reviewPending + ")" : "");

  let h = '';
  if(!list.length){
    h = '<div class="panel-card"><div class="note">Bu değerlendirmede bağlamsal çelişki bulunmadı; ' +
        'kanıt istenmesi gereken soru yok. Tüm cevaplar skorlamaya dâhil edildi.</div></div>';
    document.getElementById("reviewWrap").innerHTML = h;
    return;
  }

  h += '<div class="panel-card"><div class="score-grid" style="grid-template-columns:repeat(4,1fr)">' +
    '<div class="score-card"><div class="score-card-label">Kanıt İstenen</div><div class="score-big">' + st.flaggedCount + '</div><div class="score-sub">soru</div></div>' +
    '<div class="score-card"><div class="score-card-label">Bekleyen</div><div class="score-big" style="color:' + (st.reviewPending ? "var(--coral)" : "var(--l5)") + '">' + st.reviewPending + '</div><div class="score-sub">skora girmiyor</div></div>' +
    '<div class="score-card"><div class="score-card-label">Karara Bağlanan</div><div class="score-big">' + st.reviewDone + '</div><div class="score-sub">onay / ret</div></div>' +
    '<div class="score-card"><div class="score-card-label">Kanıt Sunulan</div><div class="score-big">' + st.evidenceCount + '</div><div class="score-sub">katılımcı metni</div></div>' +
    '</div></div>';

  h += list.map(q => {
    const areaName = (st.rows.find(r => r.code === q.area) || {}).name || q.area;
    const d = (sub.__decisions || {})[q.id] || {};
    return '<div class="panel-card rv-card"><div class="rv-head">' +
      '<div><div class="rv-area">' + esc(areaName) + ' · ' + esc(q.id) + '</div>' +
      '<div class="rv-q">' + esc(q.q) + '</div></div>' + reviewStatusChip(q) + '</div>' +

      '<div class="rv-sec"><div class="rv-lbl">Tespit edilen çelişki</div>' +
      (q.contra || []).map(c => '<div class="rv-contra"><b>' + esc(c.label) + '</b> — ' + esc(c.msg) +
        '<div class="rv-nums">ön koşul ortalaması <b>' + fmt(c.preAvg,1) + '/5</b> (' + esc(c.preArch.map(a => BANK.arch[a] || a).join(", ")) +
        ') · bu yetenek <b>' + fmt(c.depAvg,1) + '/5</b> (' + esc(c.depArch.map(a => BANK.arch[a] || a).join(", ")) + ')</div></div>').join("") +
      '</div>' +

      '<div class="rv-sec"><div class="rv-lbl">Katılımcının verdiği cevaplar' +
      (q.rOriginal ? ' (operatör seviyesi ' + q.overrideValue + '/5 ile değiştirildi)' : '') + '</div>' +
      AXES.map(ax => {
        const r = (q.rOriginal || q.r)[ax];
        if(r === NA_VALUE) return '<div class="drill-ax"><span class="ab" style="color:var(--slate-2)">' + AXIS_NAME[ax] + '</span><span class="av na">—</span><span class="at" style="color:var(--slate-2)">kapsam dışı</span></div>';
        return '<div class="drill-ax"><span class="ab" style="color:' + AXIS_COLOR[ax] + '">' + AXIS_NAME[ax] + '</span>' +
          '<span class="av" style="background:' + levelColor(r) + '">' + r + '/5</span>' +
          '<span class="at">' + esc(ansText(q.arch, ax, r, q.k)) + '</span></div>';
      }).join("") + '</div>' +

      '<div class="rv-sec"><div class="rv-lbl">Katılımcının sunduğu kanıt</div>' +
      (q.evidence ? '<div class="rv-ev">' + esc(q.evidence) + '</div>'
                  : '<div class="rv-ev none">Kanıt sunulmadı. Bu soru, kararınız olmadan skorlamaya dâhil edilmez.</div>') +
      '</div>' +

      '<div class="rv-sec"><div class="rv-lbl">Kararınız</div><div class="rv-actions">' +
      '<button type="button" class="btn btn-ghost rv-act' + (d.action === "approve" ? " sel" : "") + '" data-rv="approve" data-id="' + esc(q.id) + '">Kanıtı kabul et — analize dâhil et</button>' +
      '<button type="button" class="btn btn-ghost rv-act' + (d.action === "exclude" ? " sel" : "") + '" data-rv="exclude" data-id="' + esc(q.id) + '">Reddet — kapsam dışı bırak</button>' +
      '<span class="rv-ovwrap">Reddet — seviyeyi sen seç: ' +
      [1,2,3,4,5].map(v => '<button type="button" class="rv-lvl' + (d.action === "override" && Number(d.value) === v ? " sel" : "") +
        '" data-rv="override" data-id="' + esc(q.id) + '" data-v="' + v + '">' + v + '</button>').join("") + '</span>' +
      (d.action ? '<button type="button" class="btn btn-ghost rv-act" data-rv="" data-id="' + esc(q.id) + '">Kararı geri al</button>' : '') +
      '</div>' +
      '<input type="text" class="rv-note" data-note="' + esc(q.id) + '" placeholder="Operatör notu (isteğe bağlı)" value="' + esc(d.note || "") + '">' +
      '</div></div>';
  }).join("");

  document.getElementById("reviewWrap").innerHTML = h;
  document.querySelectorAll("#reviewWrap [data-rv]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.id;
    const note = (document.querySelector('#reviewWrap [data-note="' + id + '"]') || {}).value || "";
    setDecision(id, b.dataset.rv || null, b.dataset.v ? Number(b.dataset.v) : undefined, note);
  }));
}

document.getElementById("btnReviewExport").addEventListener("click", () => {
  if(!currentSub) return;
  const payload = { type:"aoc_review_v1", org: currentSub.orgName, submittedAt: currentSub.submittedAt,
                    bankVersion: currentSub.bankVersion, exportedAt: new Date().toISOString(),
                    actions: REVIEW_ACTIONS, decisions: currentSub.__decisions || {} };
  download("Kanit_Incelemesi_" + slug(currentSub.orgName) + ".json", JSON.stringify(payload, null, 2), "application/json");
  const m = document.getElementById("reviewMsg"); m.textContent = "Karar dosyası indirildi.";
  setTimeout(() => m.textContent = "", 2600);
});
document.getElementById("btnReviewImport").addEventListener("click", () => document.getElementById("reviewFileInput").click());
document.getElementById("reviewFileInput").addEventListener("change", async e => {
  const f = e.target.files[0]; if(!f || !currentSub) return;
  const m = document.getElementById("reviewMsg");
  try{
    const p = JSON.parse(await f.text());
    if(!p || p.type !== "aoc_review_v1" || !p.decisions) throw new Error("Bu dosya geçerli bir karar dosyası değil.");
    const mismatch = p.submittedAt && currentSub.submittedAt && p.submittedAt !== currentSub.submittedAt;
    currentSub.__decisions = p.decisions;
    saveDecisions(currentSub, p.decisions);
    currentState = computeResults(currentSub);
    renderReview(); renderResults(); renderAnswers();
    m.style.color = mismatch ? "var(--coral)" : "var(--teal)";
    m.textContent = Object.keys(p.decisions).length + " karar yüklendi." +
      (mismatch ? " DİKKAT: karar dosyası farklı bir gönderime ait görünüyor." : "");
  }catch(err){ m.style.color = "var(--coral)"; m.textContent = err.message || "Karar dosyası okunamadı."; }
  e.target.value = "";
  setTimeout(() => { m.textContent = ""; m.style.color = "var(--teal)"; }, 6000);
});
document.getElementById("btnReviewClear").addEventListener("click", () => {
  if(!currentSub) return;
  currentSub.__decisions = {};
  saveDecisions(currentSub, {});
  currentState = computeResults(currentSub);
  renderReview(); renderResults(); renderAnswers();
  const m = document.getElementById("reviewMsg"); m.textContent = "Tüm kararlar sıfırlandı.";
  setTimeout(() => m.textContent = "", 2600);
});

/* ---- Açık / koyu tema seçimi ---- */
(function(){
  const K = "aoc_tema";
  const btn = document.getElementById("btnTema"), lbl = document.getElementById("temaLbl");
  function uygula(t){
    document.documentElement.setAttribute("data-tema", t);
    if(btn) btn.setAttribute("aria-pressed", t === "koyu" ? "true" : "false");
    if(lbl) lbl.textContent = t === "koyu" ? "Koyu" : "Açık";
  }
  let mevcut; try{ mevcut = localStorage.getItem(K); }catch(e){}
  uygula(mevcut === "acik" ? "acik" : "koyu");
  if(btn) btn.addEventListener("click", () => {
    const yeni = document.documentElement.getAttribute("data-tema") === "koyu" ? "acik" : "koyu";
    try{ localStorage.setItem(K, yeni); }catch(e){}
    uygula(yeni);
  });
})();

document.getElementById("btnPrint").addEventListener("click", () => window.print());

/* Broşür raporu — müşteri adayına gidecek, A4 sayfalara bölünmüş ayrı belge.
   Konsol ekranının çıktısı değildir; kendi tasarımı ve sayfa akışı vardır. */
document.getElementById("btnBrosur").addEventListener("click", () => {
  if(!currentState || !currentSub){ alert("Önce bir sonuç dosyası yükleyin."); return; }
  if(!brosurAc(currentState, currentSub)){
    alert("Tarayıcı yeni sekmeyi engelledi; rapor HTML dosyası olarak indirildi. " +
          "Dosyayı açıp Ctrl+P ile «PDF olarak kaydet» diyebilirsiniz.");
  }
});
document.getElementById("btnJson").addEventListener("click", () => {
  const st = currentState;
  const rep = {
    org: currentSub.orgName, submittedAt: currentSub.submittedAt, taxonomy: st.tax,
    bankVersion: currentSub.bankVersion, overallScore: st.overallScore, overallTheta: st.overallTheta,
    overallRisk: st.overallRisk,
    verifiedLevel: st.lock.verified,
    maturityLock: { threshold: st.lock.threshold, verified: st.lock.verified,
                    blockedAt: st.lock.blockedAt, blockedScore: st.lock.blockedScore,
                    unmeasured: st.lock.unmeasured,
                    rungs: [1,2,3,4,5].reduce((o,m) => (o[m] = st.lock.levels[m], o), {}) },
    anomalies: st.anomalies.map(a => ({ code:a.code, severity:a.sev, scope:a.scope,
                                        area:a.area, id:a.id, question:a.question, message:a.msg })),
    anomalySummary: Object.keys(st.anomalyByCode).reduce((o,c) => (o[c] = st.anomalyByCode[c].length, o), {}),
    evidenceReview: {
      flagged: st.flaggedCount, evidenceProvided: st.evidenceCount,
      pending: st.reviewPending, approved: st.reviewApproved,
      excluded: st.reviewExcluded, overridden: st.reviewOverridden,
      pendingExcludedFromScoring: true,
      items: st.flaggedQuestions.map(q => ({
        id:q.id, area:q.area, question:q.q,
        answers: q.rOriginal || q.r, scoredAnswers: q.r,
        rules: (q.contra || []).map(c => ({ id:c.id, label:c.label, preAvg:c.preAvg, depAvg:c.depAvg })),
        evidence: q.evidence || null, status: q.review,
        operatorValue: q.overrideValue == null ? null : q.overrideValue,
        operatorNote: q.reviewNote || null, scored: q.scored
      }))
    },
    axes: AXES.reduce((o,a) => (o[a] = { score: st.axisScores[a].score, theta: st.axisScores[a].theta,
                                         n: st.axisScores[a].n, outOfScope: st.axisScores[a].na }, o), {}),
    outOfScope: {
      axisAnswers:         st.naAxisCount,
      questions:           st.naQuestionCount,
      areas:               st.naCount,
      areasByScopeQuestion:st.naScope,
      areasAllNA:          st.naAreaAll
    },
    functions: Object.keys(st.perFunction).reduce((o,f) => (o[f] = { score: st.perFunction[f].score, theta: st.perFunction[f].theta, n: st.perFunction[f].n }, o), {}),
    maturityLadder: [1,2,3,4,5].reduce((o,m) => (o[m] = { score: st.perMl[m].score, n: st.perMl[m].n }, o), {}),
    compliance: st.regScores.map(r => ({ key:r.key, label:r.label, score:r.score, theta:r.theta,
                                         questions:r.n, answers:r.nAns, bankMapped:r.bankTotal, coverage:r.coverage })),
    areas: st.rows.map(r => ({ code:r.code, name:r.name, func:r.func, na:!!r.na, reason:r.reason,
                               n:r.n, answers:r.nAns, score:r.score, theta:r.theta,
                               verifiedLevel: r.lock ? r.lock.verified : null,
                               blockedAt: r.lock ? r.lock.blockedAt : null,
                               outOfScope: { axisAnswers: r.naAx || 0, questions: (r.naQ || 0) + (r.skipped || 0) },
                               axes: r.na ? null : AXES.reduce((o,a) => (o[a] = r.axis[a].theta, o), {}) })),
    topGaps: st.gaps.map(g => ({ id:g.id, area:g.areaName, question:g.q, crit:g.w, maturity:g.ml,
                                 answers:g.r, scoredAxes:g.live, outOfScopeAxes: AXES.filter(a => g.r[a] === NA_VALUE),
                                 effective:g.rqEff, gated:g.gated, deficit:g.deficit })),
    gateCount: st.gateCount
  };
  download("Olgunluk_Raporu_" + slug(currentSub.orgName) + ".json", JSON.stringify(rep, null, 2), "application/json");
});
document.getElementById("btnCsv").addEventListener("click", () => {
  const st = currentState;
  /* Her kontrol sorusu için üç eksen de yazılır; kapsam dışı satırlar «Skorlandı = hayır». */
  const rows = [["Alan Kodu","Alan","Soru ID","Soru","Kontrol Arketipi","Eksen","Kritiklik","Olgunluk Seviyesi","Skorlandı","Cevap","Etkin Cevap","Kapı","Seçilen Cevap Metni","Mevzuat"]];
  st.questions.forEach(x => {
    const area = st.rows.find(r => r.code === x.area) || {};
    AXES.forEach(ax => {
      const r = x.r[ax];
      const na = r === NA_VALUE;
      rows.push([x.area, area.name || "", x.id, x.q, BANK.arch[x.arch] || x.arch, AXIS_NAME[ax],
                 CRIT_LABEL[x.w], x.ml, na ? "hayır" : "evet",
                 na ? "kapsam dışı" : r, na ? "—" : fmt(Math.min(r, x.cap), 2),
                 (!na && x.gated) ? "evet" : "",
                 na ? "kapsam dışı" : ansText(x.arch, ax, r, x.k), regOf(x.id).join(" | ")]);
    });
  });
  const csv = "﻿" + rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(";")).join("\r\n");
  download("Olgunluk_Cevaplar_" + slug(currentSub.orgName) + ".csv", csv, "text/csv;charset=utf-8");
});

/* =====================================================================
   METODOLOJİ SEKMESİ
   ===================================================================== */
function renderMethod(){
  const W = getW();
  document.getElementById("depCount").textContent = BANK.deps.length;
  document.getElementById("lockThreshold").value = W.lock;
  document.getElementById("critBody").innerHTML = [1,2,3,4].map(k =>
    '<tr><td class="nm">' + CRIT_LABEL[k] + '</td><td><input type="number" min="0" max="10" step="0.5" value="' + W.crit[k] + '" data-ck="' + k + '" style="width:80px"></td>' +
    '<td>' + BANK.Q.filter(q => q[F.w] === k).length + '</td></tr>').join("");
  document.getElementById("mlBody").innerHTML = [1,2,3,4,5].map(k =>
    '<tr><td class="nm">Seviye ' + k + '</td><td>' + ML_LABEL[k] + '</td>' +
    '<td><input type="number" min="0" max="10" step="0.5" value="' + W.ml[k] + '" data-mk="' + k + '" style="width:80px"></td>' +
    '<td>' + BANK.Q.filter(q => q[F.m] === k).length + '</td></tr>').join("");
}
document.getElementById("btnSaveW").addEventListener("click", () => {
  const w = { crit:{}, ml:{}, lock: LOCK_THRESHOLD_DEFAULT };
  document.querySelectorAll("[data-ck]").forEach(i => w.crit[i.dataset.ck] = Number(i.value) || 0);
  document.querySelectorAll("[data-mk]").forEach(i => w.ml[i.dataset.mk] = Number(i.value) || 0);
  const lt = Number(document.getElementById("lockThreshold").value);
  w.lock = isNaN(lt) ? LOCK_THRESHOLD_DEFAULT : Math.max(0, Math.min(100, lt));
  setW(w);
  const m = document.getElementById("wMsg"); m.textContent = "Kaydedildi.";
  if(currentSub){ currentState = computeResults(currentSub); renderResults(); renderAnswers(); m.textContent = "Kaydedildi ve sonuçlar yeniden hesaplandı."; }
  setTimeout(() => m.textContent = "", 2600);
});
document.getElementById("btnResetW").addEventListener("click", () => {
  try{ localStorage.removeItem("aoc_w_v4"); }catch(e){}
  renderMethod();
  if(currentSub){ currentState = computeResults(currentSub); renderResults(); renderAnswers(); }
  const m = document.getElementById("wMsg"); m.textContent = "Varsayılana dönüldü."; setTimeout(() => m.textContent = "", 2600);
});

/* =====================================================================
   SORU BANKASI SEKMESİ
   ===================================================================== */
function renderBankFilters(){
  const sel = document.getElementById("fltArea");
  sel.innerHTML = '<option value="">Tüm kontrol alanları</option>' +
    '<optgroup label="UCT">' + BANK.uct.map((u,i) => '<option value="g' + i + '">' + esc(u[1]) + '</option>').join("") + '</optgroup>' +
    '<optgroup label="NIST CSF 2.0">' + BANK.nist.map((n,i) => '<option value="n' + i + '">' + esc(n[0] + " · " + n[1]) + '</option>').join("") + '</optgroup>';
  const sa = document.getElementById("fltArch");
  sa.innerHTML = '<option value="">Tüm kontrol arketipleri</option>' +
    Object.keys(BANK.arch).sort((a,b) => BANK.arch[a].localeCompare(BANK.arch[b], "tr"))
      .map(a => '<option value="' + a + '">' + esc(BANK.arch[a]) + '</option>').join("");
  document.getElementById("bankSub").textContent =
    BANK.v + " · " + BANK.Q.length + " kontrol maddesi · " + BANK.uct.length + " UCT alanı · " + BANK.nist.length +
    " NIST CSF alanı · " + BANK.deps.length + " bağımlılık · " + Object.keys(BANK.arch).length + " arketip · her madde için 3 × 5 cevap";
}
function renderBank(){
  const area = document.getElementById("fltArea").value;
  const arch = document.getElementById("fltArch").value;
  const ml = document.getElementById("fltMl").value;
  const cr = document.getElementById("fltCrit").value;
  const tx = document.getElementById("fltText").value.trim().toLocaleLowerCase("tr");
  let list = BANK.Q;
  if(area){ const i = Number(area.slice(1)); list = list.filter(q => area[0] === "g" ? q[F.g] === i : q[F.n] === i); }
  if(arch) list = list.filter(q => q[F.arch] === arch);
  if(ml) list = list.filter(q => q[F.m] === Number(ml));
  if(cr) list = list.filter(q => q[F.w] === Number(cr));
  if(tx) list = list.filter(q => (q[F.q] + " " + q[F.t] + " " + q[F.id]).toLocaleLowerCase("tr").indexOf(tx) !== -1);
  document.getElementById("bankCount").textContent = list.length + " soru listeleniyor";
  document.getElementById("bankList").innerHTML = list.slice(0, 200).map(q =>
    '<div class="bank-item"><div class="bq">' + esc(q[F.q]) + '</div><div class="bm">' +
    '<span class="tag-chip">' + esc(q[F.id]) + '</span>' +
    '<span class="tag-chip">' + esc(BANK.uct[q[F.g]][1]) + '</span>' +
    (q[F.n] >= 0 ? '<span class="tag-chip">' + esc(BANK.nist[q[F.n]][0]) + '</span>' : '') +
    '<span class="tag-chip">' + esc(BANK.arch[q[F.arch]] || q[F.arch]) + '</span>' +
    '<span class="tag-chip">Olgunluk ' + q[F.m] + '</span>' +
    '<span class="tag-chip">' + CRIT_LABEL[q[F.w]] + '</span>' +
    (q[F.reg] || []).map(r => '<span class="tag-chip">' + esc(r) + '</span>').join("") +
    '<button type="button" class="btn btn-ghost q-edit-btn" data-qedit="' + esc(q[F.id]) + '">Düzenle</button>' +
    '</div><div style="font-size:.78rem;color:var(--slate-2);margin-top:.3em">' + esc(q[F.t]) + '</div>' +
    '<details class="drill" style="margin-top:8px"><summary style="padding:8px 12px;font-family:var(--font-display);font-weight:600;font-size:.78rem;color:var(--navy)">' +
    '<span class="chev">▶</span> İnsan / Süreç / Teknoloji cevap setini göster</summary><div class="drill-body">' +
    AXES.map(ax => '<div style="margin-bottom:10px"><div class="ab" style="color:' + AXIS_COLOR[ax] + ';font-family:var(--font-display);font-weight:700;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">' + AXIS_FULL[ax] + '</div>' +
      [1,2,3,4,5].map(l => '<div class="drill-ax"><span class="av" style="background:' + levelColor(l) + '">' + l + '</span>' +
        '<span class="at">' + esc(ansText(q[F.arch], ax, l, q[F.k])) + '</span></div>').join("") + '</div>').join("") +
    '</div></details></div>').join("") +
    (list.length > 200 ? '<p style="margin-top:14px;font-size:.82rem">İlk 200 sonuç gösteriliyor.</p>' : "");
}
["fltArea","fltArch","fltMl","fltCrit"].forEach(id => document.getElementById(id).addEventListener("change", renderBank));
document.getElementById("fltText").addEventListener("input", renderBank);

/* =====================================================================
   OTOMASYON KÖPRÜSÜ — const/let bağlamaları classic script'te window'a
   düşmediği için headless testlerin ihtiyaç duyduğu değerler burada
   açıkça yayımlanır. Arayüz davranışını değiştirmez.
   ===================================================================== */
Object.assign(window, { BANK, F, AXES, AXIS_NAME, AXIS_FULL, CRIT_LABEL, REG_DEFS, NA_VALUE, NA_REASON });
Object.defineProperty(window, "currentState", { get: () => currentState, configurable: true });
Object.defineProperty(window, "currentSub",   { get: () => currentSub,   configurable: true });
Object.defineProperty(window, "loadCount",    { get: () => loadCount,    configurable: true });
Object.defineProperty(window, "genTax",       { get: () => genTax,       configurable: true });

/* =====================================================================
   BAŞLANGIÇ
   ===================================================================== */
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("bankPill").textContent = BANK.v;
document.getElementById("footMeta").textContent = "v" + APP_VERSION + " · " + BANK.v + " · " + BANK.Q.length + " kontrol maddesi";
document.getElementById("footMeta").title = APP_CHANGELOG.map(c => "v" + c.v + " (" + c.date + "): " + c.notes).join("\n\n");
/* ---- Anket Üret adım menüsü ---- */
(function(){
  const nav = document.getElementById("genNav");
  const paneller = Array.from(document.querySelectorAll("#tabGen .gen-panel"));
  function goster(n){
    paneller.forEach(p => p.classList.toggle("active", p.dataset.step === String(n)));
    nav.querySelectorAll(".gen-step").forEach(b => b.classList.toggle("active", b.dataset.step === String(n)));
  }
  nav.addEventListener("click", e => {
    const b = e.target.closest(".gen-step");
    if(b) goster(b.dataset.step);
  });
  goster(1);
})();

renderTaxChoices();
renderScopes();
renderPreview();
renderMethod();
renderBankFilters();
renderBank();
