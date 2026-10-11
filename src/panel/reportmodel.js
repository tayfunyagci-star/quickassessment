/* =====================================================================
   RAPOR MODELİ — Word ve HTML raporu aynı veriden üretilir
   ---------------------------------------------------------------------
   computeResults çıktısı (st) ve çözülmüş gönderi (sub) raporlamaya hazır,
   biçimden bağımsız bir modele dönüştürülür. Soru numaraları (Soru No)
   EK-1 Soru / Cevap tablosundaki sırayı esas alır; diğer tüm tablolar bu
   numaraya bağlanır.
   ===================================================================== */
const RPT = {
  /* Olgunluk 1–5 sıralı ölçek: tek renk tonu (marka mavisi) rampası. */
  RAMP: ["#74B8DD", "#4AA1D4", "#2C7CB0", "#1D5A82", "#103954"],
  /* İnsan / Süreç / Teknoloji kimlik renkleri (kategorik). */
  AXIS: { I:"#C4523A", S:"#7E63B8", T:"#1D8F74" },
  BAR: "#2C7CB0",
  DURUM: { kritik:{ renk:"#C4523A", ad:"Kritik" }, gelisme:{ renk:"#C98A3B", ad:"Geliştirilmeli" }, guclu:{ renk:"#1D8F74", ad:"Güçlü" } },
  NA: "#B8BEC7",
  INK: "#20242C", NAVY: "#132A4C", DIM: "#5B6472", GRID: "#E2E6EC",
  KURUM: "Scale Teknoloji ve Danışmanlık",
  ADRES: "[Ofis adresi eklenecek]",
  EPOSTA: "[e-posta adresi]",
  WEB: "scaleteknoloji.com"
};
RPT.ramp = t => (t == null || isNaN(t)) ? RPT.NA : RPT.RAMP[Math.max(0, Math.min(4, Math.round(t) - 1))];
RPT.durum = t => t == null ? RPT.DURUM.gelisme : (t < 2.6 ? RPT.DURUM.kritik : (t < 3.4 ? RPT.DURUM.gelisme : RPT.DURUM.guclu));
RPT.f1 = v => (v == null || isNaN(v)) ? "—" : Number(v).toFixed(1).replace(".", ",");
RPT.f0 = v => (v == null || isNaN(v)) ? "—" : String(Math.round(v));
RPT.trDate = d => d ? new Date(d).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric" }) : "—";
RPT.bandLabel = t => t == null ? "—" : bandForMaturity(t).label;
RPT.riskLabel = s => s == null ? "—" : bandForRisk(s).label;

const REVIEW_TXT = { approved:"Kanıt kabul edildi", excluded:"Reddedildi — skora alınmadı", override:"Reddedildi — danışman seviye atadı", pending:"Karar bekliyor — skora alınmadı" };

/* Alan için kısa öneri cümlesi (düz metin). */
function areaAdvice(r){
  let weak = null;
  AXES.forEach(ax => { const t = r.axis && r.axis[ax] ? r.axis[ax].theta : null; if(t != null && (!weak || t < weak.t)) weak = { ax, t }; });
  let s;
  if(r.theta < 2.0) s = "Bu alanda tanımlı bir uygulama tespit edilmedi. Öncelik, temel kontrolleri yazılı hâle getirmek ve sorumluluğu tek bir role bağlamaktır.";
  else if(r.theta < 2.6) s = "Uygulama var ancak kişiye bağlı ve tutarsız. Öncelik, mevcut pratiği prosedüre dönüştürüp kurum genelinde aynı şekilde işletmektir.";
  else if(r.theta < 3.4) s = "Süreç tanımlı ancak ölçülmüyor. Öncelik, uygulamanın düzenli işletildiğini gösteren metrik ve kayıtları oluşturmaktır.";
  else if(r.theta < 4.2) s = "Alan yönetiliyor ve ölçülüyor. İyileştirme alanı, tekrar eden işleri otomatikleştirip kontrolü sürekli doğrulanır hâle getirmektir.";
  else s = "Alan olgun. Kazanımın korunması için periyodik doğrulama ve bağımsız denetim önerilir.";
  if(r.lock && r.lock.blockedAt != null) s += " Olgunluk merdiveni Seviye " + r.lock.blockedAt + " basamağında takılıyor; üst basamaklardaki beyanlar bu basamak doğrulanmadan seviyeye yansımıyor.";
  if(weak) s += " En zayıf boyut " + AXIS_NAME[weak.ax] + " (" + RPT.f1(weak.t) + "/5).";
  return s;
}

function buildReportModel(st, sub){
  const W = getW();
  const isNist = st.tax === "nist";
  const areaName = code => { const r = st.rows.find(x => x.code === code); return r ? r.name : code; };

  /* --- sorular: EK-1 sırası --- */
  const qs = st.allQuestions.map((q, i) => {
    const axes = AXES.map(ax => {
      const v = q.r[ax], orig = q.rOriginal ? q.rOriginal[ax] : v;
      const eff = (v > 0) ? Math.min(v, q.cap) : null;
      return { ax, name: AXIS_NAME[ax], v, orig, eff, na: v === NA_VALUE,
               text: v === NA_VALUE ? NA_AXIS_NOTE : ansText(q.arch, ax, orig > 0 ? orig : v, q.k) };
    });
    return { no: i + 1, id: q.id, area: q.area, areaName: areaName(q.area), q: q.q, t: q.t, arch: q.arch, archName: BANK.arch[q.arch] || q.arch,
             w: q.w, crit: CRIT_LABEL[q.w], ml: q.ml, mlLabel: ML_LABEL[q.ml], rq: q.rq, rqEff: q.rqEff != null ? q.rqEff : q.rq,
             gated: q.gated, gateFrom: q.gateFrom || null, flagged: q.flagged, contra: q.contra || [], review: q.review,
             reviewNote: q.reviewNote || "", overrideValue: q.overrideValue, evidence: q.evidence || "", scored: q.scored,
             naAxes: q.na, axes, reg: regOf(q.id) };
  });
  const noOf = {}; qs.forEach(q => { noOf[q.id] = q.no; });

  /* --- alanlar --- */
  const areas = st.rows.filter(r => !r.na).map(r => ({
    code: r.code, name: r.name, func: r.func, theta: r.theta, score: r.score, band: RPT.bandLabel(r.theta),
    durum: RPT.durum(r.theta), n: r.n, nAns: r.nAns, naAx: r.naAx,
    axis: AXES.reduce((o, ax) => { o[ax] = r.axis[ax] ? r.axis[ax].theta : null; return o; }, {}),
    lock: r.lock, verified: r.lock ? r.lock.verified : null, blockedAt: r.lock ? r.lock.blockedAt : null,
    advice: areaAdvice(r), qnos: r.questions.map(q => noOf[q.id]).filter(Boolean)
  }));
  const naAreas = st.rows.filter(r => r.na).map(r => ({ code: r.code, name: r.name, reason: naReasonLabel(r.reason) }));
  const sorted = areas.slice().sort((a, b) => a.theta - b.theta);

  /* --- eksenler, fonksiyonlar, basamaklar, mevzuat --- */
  const axes = AXES.map(ax => ({ ax, name: AXIS_NAME[ax], full: AXIS_FULL[ax], theta: st.axisScores[ax].theta,
                                 score: st.axisScores[ax].score, n: st.axisScores[ax].n, na: st.axisScores[ax].na }));
  const functions = isNist ? FUNC_ORDER.map(fc => ({ code: fc, name: FUNC_NAME[fc], theta: (st.perFunction[fc] || {}).theta,
                                                      n: (st.perFunction[fc] || {}).n || 0 })) : [];
  const rungs = [1,2,3,4,5].map(m => {
    const l = st.lock && st.lock.levels ? st.lock.levels[m] : null;
    return { m, label: ML_LABEL[m], score: l ? l.score : null, n: l ? l.n : 0, pass: l ? l.pass : null };
  });
  const regs = st.regScores.map(r => ({ key: r.key, label: r.label, theta: r.theta, score: r.score, n: r.n, nAns: r.nAns,
                                        bankTotal: r.bankTotal, coverage: r.coverage,
                                        qnos: r.questions.map(q => noOf[q.id]).filter(Boolean) }));

  /* --- öncelikler ve güçlü yanlar --- */
  const weakAxes = g => AXES.filter(ax => g.r[ax] > 0 && Math.min(g.r[ax], g.cap) < 3)
                           .map(ax => AXIS_NAME[ax] + " " + Math.min(g.r[ax], g.cap) + "/5");
  const gaps = st.gaps.map((g, i) => ({ rank: i + 1, no: noOf[g.id], id: g.id, areaName: g.areaName, q: g.q, crit: CRIT_LABEL[g.w], w: g.w,
                                       ml: g.ml, theta: g.rqEff, weak: weakAxes(g), deficit: g.deficit }));
  const strengths = st.strengths.map(s => ({ no: noOf[s.id], id: s.id, areaName: s.areaName, q: s.q, theta: s.rqEff, crit: CRIT_LABEL[s.w] }));

  /* --- risk matrisi: kritiklik × olgunluk (puanlanan sorular) --- */
  const COLS = [["< 2,0", v => v < 2], ["2,0 – 2,9", v => v >= 2 && v < 3], ["3,0 – 3,9", v => v >= 3 && v < 4], ["≥ 4,0", v => v >= 4]];
  const matrix = [4,3,2,1].map(w => ({ w, label: CRIT_LABEL[w],
    cells: COLS.map(([lbl, test]) => ({ lbl, qnos: qs.filter(q => q.scored && q.w === w && test(q.rqEff)).map(q => q.no) })) }));

  /* --- değerlendirme notları --- */
  const notes = [];
  qs.filter(q => q.flagged).forEach(q => q.contra.forEach(c => notes.push({
    kind: c.id === "KONU" ? "Aynı konuda çelişki" : "Ön koşul çelişkisi", label: c.label, text: c.msg,
    nos: [q.no].concat((c.preIds || []).map(id => noOf[id]).filter(Boolean)).filter((v, i, a) => a.indexOf(v) === i),
    decision: REVIEW_TXT[q.review] || "—", note: q.reviewNote, evidence: q.evidence })));
  qs.filter(q => q.gated && q.gateFrom).forEach(q => notes.push({
    kind: "Ön koşul kapısı", label: "Ön koşul karşılanmadan üst kontrol",
    text: "Bu kontrol " + RPT.f1(q.rq) + "/5 beyan edilmiş; ön koşulu olan kontrol (Soru " + (noOf[q.gateFrom.id] || q.gateFrom.id) + ") " +
          RPT.f1(q.gateFrom.rq) + "/5 düzeyinde kaldığı için puan " + RPT.f1(q.gateFrom.rq) + "/5 ile sınırlandı.",
    nos: [q.no, noOf[q.gateFrom.id]].filter(Boolean), decision: "Puan sınırlandı", note: "", evidence: "" }));
  st.anomalies.filter(a => a.code !== "DEP_VIOL").forEach(a => notes.push({
    kind: (ANOMALY_DEFS[a.code] || {}).label || a.code, label: (ANOMALY_DEFS[a.code] || {}).label || a.code, text: a.msg,
    nos: a.scope === "question" ? [noOf[a.id]].filter(Boolean) : [], area: a.scope === "area" ? (a.areaName || areaName(a.area)) : areaName(a.area),
    decision: "Bilgi", note: "", evidence: "" }));

  /* --- kapsam cevapları --- */
  const scope = BANK.scopes.map(s => ({ id: s[0], q: s[1], yes: sub.scope ? (sub.scope[s[0]] === undefined ? !!s[2] : !!sub.scope[s[0]]) : !!s[2] }));
  const qsetTxt = !sub.__qset ? "—" : (sub.__qset.source === "issued"
      ? "Doğrulandı — anketin üretim kaydıyla eşleşti (" + RPT.trDate(sub.__qset.issuedAt) + ")"
      : "Anketin üretim kaydı bulunamadı; güncel soru bankası kullanıldı");

  return {
    org: sub.orgName || "Kurum", submittedAt: sub.submittedAt, reportDate: new Date().toISOString(),
    tax: st.tax, taxName: sub.taxonomyName || (isNist ? "NIST CSF 2.0" : "UCT Kontrol Taksonomisi"), isNist,
    appVersion: APP_VERSION, fileVersion: sub.appVersion || (sub.type === "aoc_submission_v5" ? "—" : "v4"), bankVersion: sub.bankVersion || BANK.v,
    qsetTxt, scope,
    overall: { theta: st.overallTheta, score: st.overallScore, band: RPT.bandLabel(st.overallTheta), risk: st.overallRisk,
               riskBand: RPT.riskLabel(st.overallRisk), lock: st.lock, verified: st.lock ? st.lock.verified : null,
               blockedAt: st.lock ? st.lock.blockedAt : null, threshold: W.lock },
    counts: { questions: st.totalQuestions, items: st.totalItems, areas: areas.length, naAreas: naAreas.length,
              naAxes: st.naAxisCount, naQuestions: st.naQuestionCount, flagged: st.flaggedCount, pending: st.reviewPending,
              approved: st.reviewApproved, excluded: st.reviewExcluded, overridden: st.reviewOverridden, gates: st.gateCount,
              anomalies: st.anomalies.length },
    weights: W, areas, naAreas, sorted, axes, functions, rungs, regs, gaps, strengths, matrix, notes, qs
  };
}
