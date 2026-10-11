/* Anket üret → doldur → şifreli cevabı panelde çöz → analiz. */
import { launch, watch, download, completeSurvey, fileUrl, openPanel } from "./lib.mjs";
import { check, done } from "./assert.mjs";

const b = await launch();
const ctx = await b.newContext({ acceptDownloads: true, reducedMotion: "reduce" });
const errs = [];
const p = await ctx.newPage(); watch(p, "PANEL", errs);
await openPanel(p);
check(/^v\d/.test(await p.textContent("#footMeta")), "sürüm alt bilgide görünüyor");

for(const tax of ["uct", "nist"]){
  await p.evaluate(() => switchTab("gen"));
  await p.click('#genNav .gen-step[data-step="1"]');
  await p.click(`#taxChoices .choice[data-tax="${tax}"]`);
  await p.click('#genNav .gen-step[data-step="3"]');
  const sv = await download(p, () => p.click("#btnGenerate"), `t1_anket_${tax}.html`);
  check(sv.suggested.endsWith(".html"), `${tax}: anket indirildi`);
  const s = await ctx.newPage(); watch(s, "ANKET-" + tax, errs);
  await s.goto(fileUrl(sv.path)); await s.waitForTimeout(200);
  const r = await completeSurvey(s, { fileName: `t1_cevap_${tax}.json` });
  check(r.answered >= 12, `${tax}: ${r.answered} kontrol sorusu cevaplandı`);
  check(/^\d{8}$/.test(r.password), `${tax}: 8 haneli açma şifresi üretildi`);
  await s.close();

  await p.evaluate(() => switchTab("hub"));
  await p.setInputFiles("#fileInput", r.file);
  await p.fill("#pwInput", "00000000"); await p.click("#btnDecrypt"); await p.waitForTimeout(400);
  check(/yanlış/i.test(await p.textContent("#decryptErr")), `${tax}: yanlış şifre reddedildi`);
  await p.fill("#pwInput", r.password); await p.click("#btnDecrypt");
  await p.waitForFunction(tx => window.currentSub && window.currentSub.taxonomy === tx && window.currentState, tax, { timeout: 15000 });
  const st = await p.evaluate(() => ({ tax: currentState.tax, n: currentState.totalQuestions, th: currentState.overallTheta, rows: currentState.rows.length }));
  check(st.tax === tax && st.n > 0 && st.th >= 1 && st.th <= 5, `${tax}: analiz üretildi (θ=${st.th && st.th.toFixed(2)}, ${st.n} soru, ${st.rows} alan)`);
}
check(errs.length === 0, "konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await b.close();
done();
