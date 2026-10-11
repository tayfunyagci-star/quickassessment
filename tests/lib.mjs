/* Uçtan uca testler için ortak yardımcılar (Playwright). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BUILD = path.join(ROOT, "_build");
export const PANEL = path.join(BUILD, "Siber_Olgunluk_Analiz_Paneli.html");
export const TMP = path.join(ROOT, "_build", "test-tmp");
fs.mkdirSync(TMP, { recursive: true });

export async function launch(){
  const opts = {};
  if(process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  return chromium.launch(opts);
}

/* Sayfa hatalarını, konsol hatalarını ve CSP ihlallerini toplar. */
export function watch(page, tag, errs){
  page.on("pageerror", e => errs.push(`${tag} pageerror: ${e.message}`));
  page.on("console", m => {
    const t = m.text();
    if(m.type() === "error" || /Content Security Policy|Refused to/i.test(t)) errs.push(`${tag} console: ${t.slice(0, 200)}`);
  });
  page.on("requestfailed", r => { if(!r.url().startsWith("data:") && !r.url().startsWith("blob:")) errs.push(`${tag} request: ${r.url().slice(0, 120)}`); });
  page.on("request", r => { const u = r.url(); if(/^https?:/.test(u)) errs.push(`${tag} network request: ${u.slice(0, 120)}`); });
  page.on("dialog", d => { errs.push(`${tag} dialog: ${d.message().slice(0, 120)}`); d.dismiss().catch(() => {}); });
}

export const fileUrl = p => "file://" + p;

/* İndirmeyi bekler, TMP altına kaydeder ve yolunu döndürür. */
export async function download(page, clickFn, name){
  const [d] = await Promise.all([page.waitForEvent("download"), clickFn()]);
  const out = path.join(TMP, name || d.suggestedFilename());
  await d.saveAs(out);
  return { path: out, suggested: d.suggestedFilename() };
}

/* Deterministik cevap: soru kimliği + eksenden 1..5 (bazı eksenlerde kapsam dışı = 0). */
export function defaultAnswer(id, axis, salt = 0){
  let h = 2166136261 ^ salt;
  for(const ch of id + "|" + axis){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const v = h % 23;
  if(v === 0) return 0;          /* ~%4 kapsam dışı */
  return 1 + (v % 5);
}

/* Açık olan anket sayfasını baştan sona doldurur ve şifreli dosyayı indirir.
   Dönüş: { file, password, answered } */
export async function completeSurvey(page, { org = "Test Kurumu A.Ş.", answer = defaultAnswer, scope = null, fileName = "cevap.json" } = {}){
  await page.fill("#orgNameInput", org);
  await page.click("#btnStart");
  await page.waitForSelector("#scopeScreen:not(.hidden)");
  if(scope){
    await page.evaluate(sc => { Object.assign(state.scope, sc); renderScopeScreen(); }, scope);
  }
  await page.click("#btnScopeNext");
  await page.waitForSelector("#assessment:not(.hidden)");
  let answered = 0;
  for(let guard = 0; guard < 400; guard++){
    if(await page.isVisible("#clientDone:not(.hidden)")) break;
    const fin = await page.$("#slideCard #btnFinish");
    if(fin){ await fin.click(); await page.waitForSelector("#clientDone:not(.hidden)"); break; }
    const cur = await page.evaluate(() => {
      const d = deriveStateFromHistory(state.history);
      const area = d.areas[d.areaPtr]; if(!area) return null;
      const ni = nextItemIndex(area, d.current); if(ni === -1) return null;
      return area.pool[ni].id;
    });
    if(!cur){ await page.waitForTimeout(50); continue; }
    for(const ax of ["I", "S", "T"]){
      const r = answer(cur, ax);
      let btn = await page.$(`#slideCard .reply-opt[data-ax="${ax}"][data-r="${r}"]`);
      if(!btn){ await page.click(`#slideCard .axis-head[data-toggle="${ax}"]`); btn = await page.$(`#slideCard .reply-opt[data-ax="${ax}"][data-r="${r}"]`); }
      await btn.click();
    }
    await page.click("#slideCard #btnForward");
    answered++;
    await page.waitForFunction(n => state.history.length >= n, answered);
    await page.waitForTimeout(30);
  }
  await page.fill("#cEmail", "bilgi@test-kurumu.com.tr");
  await page.fill("#cPhone", "0212 555 44 33");
  await page.check("#cConsent");
  /* v2 anketinde #btnEncrypt; v1 (eski) çevrimdışı ankette aynı işi #btnSendCode yapar. */
  const btn = (await page.$("#btnEncrypt")) ? "#btnEncrypt" : "#btnSendCode";
  const dl = await download(page, () => page.click(btn), fileName);
  await page.waitForSelector("#doneFinal:not(.hidden)");
  const password = (await page.textContent("#clientPasswordOut")).trim();
  return { file: dl.path, password, answered };
}
