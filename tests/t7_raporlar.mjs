/* Word ve HTML raporları: üretim, içerik, CyberArts izi yok, LibreOffice ile PDF'e dönüşüm,
   HTML'de kırık iç bağlantı yok, süzgeç çalışıyor, ağ isteği/CSP ihlali yok. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { TMP, launch, watch, openPanel, generateSurvey, completeSurvey, decryptInPanel, sealEnvelope, download, fileUrl } from "./lib.mjs";
import { check, done } from "./assert.mjs";
const JSZip = createRequire(import.meta.url)("jszip");

const b = await launch(); const errs = [];
const ctx = await b.newContext({ acceptDownloads: true, reducedMotion: "reduce", viewport: { width: 1300, height: 900 } });
const p = await ctx.newPage(); watch(p, "PANEL", errs); p.__acceptDialogs = true;
await openPanel(p);

async function checkWord(file, tag, expectNotes){
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const doc = await zip.file("word/document.xml").async("string");
  const all = (await Promise.all(Object.keys(zip.files).filter(n => /\.(xml|rels)$/.test(n)).map(n => zip.file(n).async("string")))).join("\n");
  const imgs = Object.keys(zip.files).filter(n => /^word\/media\/sc_grafik\d+\.png$/.test(n)).length;
  check(/Siber Güvenlik Olgunluk Değerlendirmesi/.test(doc) && /EK-1 Soru \/ Cevap Tablosu/.test(doc) && /Soru No/.test(doc), tag + ": Word gövdesi, EK-1 ve Soru No var");
  check(imgs >= 6, tag + ": " + imgs + " grafik gömüldü");
  check(!/cyberarts/i.test(all), tag + ": Word raporunda CyberArts izi yok");
  check(/Scale Teknoloji/.test(all) && /Fikri Mülkiyet Hakkı/.test(doc), tag + ": Scale künyesi ve fikri mülkiyet sayfası var");
  const hasNotesHeading = /<w:p><w:pPr><w:pStyle w:val="Heading1"\/>(?:(?!<\/w:p>).)*Değerlendirme Notları/.test(doc);
  check(hasNotesHeading === expectNotes, tag + ": Değerlendirme Notları " + (expectNotes ? "var" : "yok (tespit yok)"));
  const dir = path.dirname(file);
  const r = spawnSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", dir, file], { timeout: 180000 });
  const pdf = file.replace(/\.docx$/, ".pdf");
  const ok = r.status === 0 && fs.existsSync(pdf);
  const pages = ok ? (fs.readFileSync(pdf, "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length : 0;
  check(ok && pages >= 8, tag + ": LibreOffice ile PDF'e dönüştü (" + pages + " sayfa)");
}
async function checkHtml(file, tag, expectNotes){
  const h = await ctx.newPage(); const herr = []; watch(h, "HTMLRAPOR-" + tag, herr);
  await h.goto(fileUrl(file)); await h.waitForTimeout(400);
  const r = await h.evaluate(() => {
    const ids = new Set([...document.querySelectorAll("[id]")].map(e => e.id));
    const hrefs = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute("href").slice(1)).filter(Boolean);
    return { links: hrefs.length, broken: [...new Set(hrefs.filter(x => !ids.has(x)))], qrefs: document.querySelectorAll("a.qref").length,
             qa: document.querySelectorAll(".qa").length, low: document.querySelectorAll('.qa[data-low="1"]').length,
             notes: !!document.getElementById("notlar"), imgs: [...document.images].filter(i => i.naturalWidth > 0).length,
             csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'), text: document.body.innerText };
  });
  check(r.links > 20 && r.broken.length === 0, tag + ": HTML'de " + r.links + " iç bağlantı, kırık bağlantı 0", r.broken);
  check(r.qrefs > 0 && r.qa > 0, tag + ": " + r.qa + " soru kartı, " + r.qrefs + " Soru No bağlantısı");
  check(r.imgs >= 2 && r.csp, tag + ": kapak ve logo görselleri yüklendi, CSP var");
  check(r.notes === expectNotes, tag + ": Değerlendirme Notları " + (expectNotes ? "var" : "yok"));
  check(!/cyberarts/i.test(r.text), tag + ": HTML raporda CyberArts izi yok");
  await h.click('.filter button[data-f="low"]');
  const vis = await h.evaluate(() => [...document.querySelectorAll(".qa")].filter(q => q.style.display !== "none").length);
  check(vis === r.low, tag + ": «Düşük» süzgeci " + vis + " soruyu gösteriyor");
  await h.screenshot({ path: TMP + "/t7_" + tag + "_html.png" });
  check(herr.length === 0, tag + ": HTML raporda konsol hatası, CSP ihlali veya ağ isteği yok", herr);
  await h.close();
}

/* --- 1) gerçek anket döngüsü (UCT), bekleyen incelemeler onaylanır --- */
for(const tax of ["uct", "nist"]){
  const sv = await generateSurvey(p, { tax, name: "t7_anket_" + tax + ".html" });
  const s = await ctx.newPage(); watch(s, "ANKET", errs);
  await s.goto(fileUrl(sv)); await s.waitForTimeout(150);
  const r = await completeSurvey(s, { org: "Rapor Testi " + tax.toUpperCase() + " A.Ş.", fileName: "t7_cevap_" + tax + ".json" });
  await s.close();
  await decryptInPanel(p, r.file, r.password);
  const pending = await p.evaluate(() => currentState.reviewPending);
  const notes = await p.evaluate(() => buildReportModel(currentState, currentSub).notes.length);
  await p.evaluate(() => switchTab("results"));
  const w = await download(p, () => p.click("#btnWord"), "t7_" + tax + ".docx");
  await checkWord(w.path, tax, notes > 0);
  const hfile = await download(p, () => p.click("#btnHtml"), "t7_" + tax + ".html");
  await checkHtml(hfile.path, tax, notes > 0);
  check(pending === 0 || /indirildi/.test(await p.textContent("#reportMsg")), tax + ": bekleyen inceleme varken onayla rapor üretildi (" + pending + " bekleyen)");
}

/* --- 2) çelişkisiz küçük gönderi: notlar bölümü olmamalı --- */
const Q = await p.evaluate(ids => Object.fromEntries(ids.map(id => [id, Q_BY_ID[id]])), ["UCT.01.001", "UCT.01.002", "UCT.02.001", "UCT.02.002"]);
const it = (id, r) => ({ id, q: Q[id][4], t: Q[id][3], r });
const sub = { type: "aoc_submission_v5", orgName: "Notsuz Kurum", submittedAt: new Date().toISOString(), taxonomy: "uct", taxonomyName: "UCT Kontrol Taksonomisi",
  surveyId: "t7-yok", qset: "-", scope: {}, areaNames: {}, results: {
    VARLIK_YAPILANDIRMA: { na: false, items: [it("UCT.01.001", { I: 3, S: 3, T: 2 }), it("UCT.01.002", { I: 3, S: 2, T: 3 })] },
    IAM: { na: false, items: [it("UCT.02.001", { I: 2, S: 3, T: 3 }), it("UCT.02.002", { I: 3, S: 3, T: 2 })] } } };
const f = await sealEnvelope(sub, "11223344", path.join(TMP, "t7_notsuz.json"));
await decryptInPanel(p, f, "11223344");
const nn = await p.evaluate(() => buildReportModel(currentState, currentSub).notes.length);
if(nn === 0){
  await p.evaluate(() => switchTab("results"));
  const w2 = await download(p, () => p.click("#btnWord"), "t7_notsuz.docx");
  const doc = await (await JSZip.loadAsync(fs.readFileSync(w2.path))).file("word/document.xml").async("string");
  check(!/Değerlendirme Notları/.test(doc), "tespit yokken Değerlendirme Notları bölümü ve atfı yok");
} else check(false, "küçük gönderide beklenmeyen not çıktı (" + nn + ")");

check(errs.length === 0, "panelde konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await b.close();
done();
