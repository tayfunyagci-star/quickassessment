/* Müşteriye giden anket temiz mi, cevap dosyası yalnız gerekeni mi taşıyor,
   puanlama dosyadaki değerlere değil banka/üretim kaydına mı dayanıyor? */
import fs from "node:fs";
import { launch, watch, openPanel, generateSurvey, completeSurvey, decryptInPanel, openEnvelope, sealEnvelope, fileUrl, TMP } from "./lib.mjs";
import { check, done } from "./assert.mjs";

const b = await launch();
const ctx = await b.newContext({ acceptDownloads: true, reducedMotion: "reduce" });
const errs = [];
const p = await ctx.newPage(); watch(p, "PANEL", errs);
await openPanel(p);

/* --- 1) anket dosyası --- */
const sv = await generateSurvey(p, { tax: "uct", name: "t4_anket.html" });
const html = fs.readFileSync(sv, "utf8");
const htmlNoFonts = html.replace(/<style id="qaFonts">[\s\S]*?<\/style>/, "");   /* base64 yazı tiplerinde rastlantısal eşleşme olmasın */
const data = JSON.parse(html.match(/const SURVEY = (\{.*\});\n/)[1]);
check(/connect-src 'none'/.test(html), "anket CSP ile ağ erişimini kapatıyor");
check(data.v === 5 && data.items.length < 200, `ankete bankanın tamamı değil ${data.items.length} soru gömüldü (bankada 440)`);
check(Object.keys(data.plans).length === 16, "16 kapsam kombinasyonunun planı önceden hesaplandı");
const itemKeys = Array.from(new Set(data.items.flatMap(x => Object.keys(x)))).sort().join(",");
check(itemKeys === "arch,id,k,m,p,q,t", "soru kaydında yalnız metin + akış bilgisi var (kritiklik/mevzuat/kapsam etiketi yok)", itemKeys);
const leaks = ["ISO27001:", "KVK.M", "7545:", "BİGR:", "CIS:", "computeResults", "computeQuotas", "resolveAreas", "ladderLock", "REG_DEFS", "deps", "Bagimlilik", "bankVersion", "BANK"]
  .filter(tok => htmlNoFonts.includes(tok));
check(leaks.length === 0, "ankette mevzuat eşlemesi, puanlama/seçim kodu veya banka izi yok", leaks);
check(!("note" in data.meta) && /^[0-9a-f]{64}$/.test(data.meta.qset), "iç dosya etiketi yok; soru seti parmak izi var");

/* --- 2) anket doldurma ve gönderi içeriği --- */
const s = await ctx.newPage(); watch(s, "ANKET", errs);
await s.goto(fileUrl(sv)); await s.waitForTimeout(150);
check(!(await s.$(".axis-pill.crit-1, .axis-pill.crit-2, .axis-pill.crit-3, .axis-pill.crit-4, .axis-pill.ml")), "soru kartında kritiklik/olgunluk etiketi yok");
const r = await completeSurvey(s, { fileName: "t4_cevap.json" });
const sub = await openEnvelope(r.file, r.password);
const subKeys = Array.from(new Set(Object.values(sub.results).flatMap(x => (x.items || []).flatMap(i => Object.keys(i))))).sort().join(",");
check(sub.type === "aoc_submission_v5" && sub.qset === data.meta.qset, "gönderi v5 ve anketin parmak izini taşıyor");
check(/^(cf,)?(ev,)?id,q,r,t$/.test(subKeys), "gönderide soru başına yalnız kimlik, metin ve cevap var", subKeys);

/* --- 3) panel: üretim kaydıyla eşleşme --- */
await decryptInPanel(p, r.file, r.password);
const st1 = await p.evaluate(() => ({ src: currentSub.__qset.source, th: currentState.overallTheta, sc: currentState.overallScore }));
check(st1.src === "issued", "puanlama anketin üretim kaydından yapıldı");
check(/üretim kaydıyla eşleşti/.test(await p.textContent("#resultsWrap")), "sonuç ekranında soru seti notu var");

/* --- 4) değiştirilmiş eski (v4) dosya: kritiklik/olgunluk dosyadan alınmaz --- */
const tampered = JSON.parse(JSON.stringify(sub));
tampered.type = "aoc_submission_v4"; delete tampered.qset; tampered.surveyId = "eski-anket";
Object.values(tampered.results).forEach(a => (a.items || []).forEach(i => { i.w = 1; i.ml = 1; i.arch = "politika"; }));
const tf = await sealEnvelope(tampered, "12345678", TMP + "/t4_degistirilmis.json");
await decryptInPanel(p, tf, "12345678");
const st2 = await p.evaluate(() => ({ src: currentSub.__qset.source, legacy: currentSub.__qset.legacy, diff: currentSub.__qset.valueDiff.length, sc: currentState.overallScore }));
check(st2.legacy && st2.src === "bank" && st2.diff > 0, `eski dosyada farklı değerler tespit edildi (${st2.diff} soru), banka değerleri kullanıldı`);
check(Math.abs(st2.sc - st1.sc) < 1e-9, "dosyadaki ağırlık oynaması skoru değiştirmedi", { orijinal: st1.sc, degistirilmis: st2.sc });
check(/banka değerleri kullanıldı/.test(await p.textContent("#resultsWrap")), "kullanıcıya uyarı gösterildi");

/* --- 5) kayıt yoksa güncel banka --- */
await p.evaluate(() => localStorage.removeItem("aoc_issued_v1"));
await decryptInPanel(p, r.file, r.password);
const st3 = await p.evaluate(() => ({ src: currentSub.__qset.source, sc: currentState.overallScore }));
check(st3.src === "bank" && Math.abs(st3.sc - st1.sc) < 1e-9, "üretim kaydı silinince güncel bankadan aynı skor üretildi");

check(errs.length === 0, "konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await b.close();
done();
