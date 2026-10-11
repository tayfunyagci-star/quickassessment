/* Tutarsızlık analizi: aynı konuda çelişkili beyan (ör. «envanter yok» ↔ «varlık sahipleri
   atanmış»), mevcut arketipler arası kurallar ve kanıt incelemesi akışı. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT, TMP, launch, watch, openPanel, decryptInPanel, sealEnvelope, generateSurvey, fileUrl } from "./lib.mjs";
import { check, done } from "./assert.mjs";

/* --- 1) kural birim testleri (Node) --- */
const sb = { module: { exports: {} } }; sb.globalThis = sb;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "src/shared/rules.js"), "utf8"), sb);
const R = sb.module.exports;
const A = (id, r, ml, area = "VARLIK_YAPILANDIRMA", arch = "envanter") => {
  const live = ["I","S","T"].filter(k => r[k] > 0);
  return { id, area, arch, r, ml, q: id + " sorusu", mean: live.reduce((s, k) => s + r[k], 0) / live.length };
};
let hits = R.topicContradictions([A("UCT.01.001", { I:1, S:1, T:1 }, 1), A("UCT.01.004", { I:3, S:2, T:2 }, 2)]);
check(hits.length === 1 && hits[0].depIds[0] === "UCT.01.004" && hits[0].mode === "absent", "envanter yok ↔ varlık sahipleri atanmış (İnsan 3/5) yakalandı", hits.map(h => h.msg));
hits = R.topicContradictions([A("a", { I:3, S:1, T:3 }, 2), A("b", { I:3, S:4, T:3 }, 2)]);
check(hits.length === 1 && hits[0].mode === "axis" && hits[0].axes.join() === "S", "aynı boyutta 1/5 ↔ 4/5 yakalandı");
check(R.topicContradictions([A("a", { I:1, S:1, T:1 }, 3), A("b", { I:4, S:4, T:4 }, 2)]).length === 0, "üst basamak yokken alt basamağın var olması çelişki sayılmadı");
check(R.topicContradictions([A("a", { I:1, S:1, T:1 }, 1), A("b", { I:4, S:4, T:4 }, 2, "IAM")]).length === 0, "farklı alanlardaki sorular karşılaştırılmadı");
check(R.topicContradictions([A("a", { I:1, S:1, T:1 }, 1), A("b", { I:4, S:4, T:4 }, 2, undefined, "risk")]).length === 0, "farklı konudaki (arketip) sorular karşılaştırılmadı");
check(R.topicContradictions([A("a", { I:2, S:2, T:2 }, 1), A("b", { I:4, S:4, T:4 }, 2)]).length === 0, "«yok» beyanı yoksa (2/5) bulgu üretilmedi");
check(R.topicContradictions([A("a", { I:1, S:0, T:0 }, 1), A("b", { I:3, S:3, T:3 }, 2)]).length === 1, "kapsam dışı boyutlar hesaba katılmadı");
const both = R.contradictionsByQuestion([A("UCT.01.001", { I:1, S:1, T:1 }, 1), A("UCT.01.004", { I:3, S:2, T:2 }, 2),
                                         Object.assign(A("UCT.01.020", { I:5, S:5, T:5 }, 2, "VARLIK_YAPILANDIRMA", "risk"))]);
check(both["UCT.01.004"] && both["UCT.01.020"] && both["UCT.01.020"].some(c => c.id === "ENV_RISK"), "aynı konu ve arketipler arası kurallar birlikte çalışıyor");

/* --- 2) panelde analiz ve kanıt incelemesi --- */
const b = await launch(); const errs = [];
const ctx = await b.newContext({ acceptDownloads: true, reducedMotion: "reduce" });
const p = await ctx.newPage(); watch(p, "PANEL", errs);
await openPanel(p);
const Q = await p.evaluate(ids => Object.fromEntries(ids.map(id => [id, Q_BY_ID[id]])), ["UCT.01.001","UCT.01.004","UCT.02.001","UCT.02.002"]);
const item = (id, r) => ({ id, q: Q[id][4], t: Q[id][3], r });
const sub = { type:"aoc_submission_v5", orgName:"Tutarsızlık Testi A.Ş.", submittedAt:new Date().toISOString(), taxonomy:"uct",
  taxonomyName:"UCT Kontrol Taksonomisi", surveyId:"t6-yok", qset:"-", scope:{}, areaNames:{},
  results: {
    VARLIK_YAPILANDIRMA: { na:false, items:[ item("UCT.01.001", { I:1, S:1, T:1 }), item("UCT.01.004", { I:3, S:2, T:2 }) ] },
    IAM: { na:false, items:[ item("UCT.02.001", { I:3, S:3, T:3 }), item("UCT.02.002", { I:3, S:2, T:3 }) ] }
  } };
const f = await sealEnvelope(sub, "87654321", path.join(TMP, "t6_cevap.json"));
await decryptInPanel(p, f, "87654321");
const st = await p.evaluate(() => {
  const q = currentState.allQuestions.find(x => x.id === "UCT.01.004");
  return { flags: q.flags, review: q.review, scored: q.scored, pending: currentState.reviewPending, tab: !document.getElementById("tabReview").classList.contains("hidden") };
});
check(st.flags.includes("KONU") && st.review === "pending" && !st.scored, "UCT.01.004 kanıt incelemesine düştü ve karar verilene kadar skora girmedi", st);
check(st.tab, "bekleyen bulgu olduğu için analiz Kanıt İncelemesi ekranında açıldı");
const rv = await p.textContent("#reviewWrap");
check(/Aynı konuda çelişkili beyan/.test(rv) && /Kuruluş bilgilerini/.test(rv), "inceleme ekranında bulgu ve karşılaştırılan soru metni görünüyor");
check(await p.evaluate(() => !currentState.allQuestions.find(x => x.id === "UCT.02.002").flagged), "çelişki olmayan soru işaretlenmedi");

/* --- 3) ankette anlık uyarı kodu mevcut --- */
const sv = await generateSurvey(p, { tax: "uct", name: "t6_anket.html" });
const s = await ctx.newPage(); watch(s, "ANKET", errs);
await s.goto(fileUrl(sv)); await s.waitForTimeout(150);
check(await s.evaluate(() => typeof topicContradictions === "function" && typeof contradictionsByQuestion === "function"), "ankette aynı konu kuralı anlık uyarı için yüklü");

check(errs.length === 0, "konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await b.close();
done();
