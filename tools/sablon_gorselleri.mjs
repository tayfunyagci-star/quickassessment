/* Scale Teknoloji rapor şablonu için kapak bandı ve alt bilgi logosu üretir.
   Kullanım: node tools/sablon_gorselleri.mjs <çıktı klasörü>
   (Kurumsal logo dosyası gelince assets/sablon/ altındaki görseller onunla değiştirilebilir.) */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.resolve(process.argv[2] || path.join(ROOT, "assets", "sablon"));
fs.mkdirSync(out, { recursive: true });
const font = (slug, w) => fs.readFileSync(path.join(ROOT, "node_modules/@fontsource", slug, "files", `${slug}-latin-ext-${w}-normal.woff2`)).toString("base64");
const font2 = (slug, w) => fs.readFileSync(path.join(ROOT, "node_modules/@fontsource", slug, "files", `${slug}-latin-${w}-normal.woff2`)).toString("base64");
const css = `
@font-face{font-family:SG;font-weight:700;src:url(data:font/woff2;base64,${font2("space-grotesk",700)}) format('woff2');unicode-range:U+0000-00FF;}
@font-face{font-family:SG;font-weight:700;src:url(data:font/woff2;base64,${font("space-grotesk",700)}) format('woff2');unicode-range:U+0100-02BA;}
@font-face{font-family:SG;font-weight:500;src:url(data:font/woff2;base64,${font2("space-grotesk",500)}) format('woff2');unicode-range:U+0000-00FF;}
@font-face{font-family:SG;font-weight:500;src:url(data:font/woff2;base64,${font("space-grotesk",500)}) format('woff2');unicode-range:U+0100-02BA;}
@font-face{font-family:PX;font-weight:400;src:url(data:font/woff2;base64,${font2("ibm-plex-sans",400)}) format('woff2');unicode-range:U+0000-00FF;}
@font-face{font-family:PX;font-weight:400;src:url(data:font/woff2;base64,${font("ibm-plex-sans",400)}) format('woff2');unicode-range:U+0100-02BA;}
*{margin:0;padding:0;box-sizing:border-box} body{background:transparent}`;
const icon = (s, stroke) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>`;
const cover = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${css}
.c{width:1868px;height:582px;position:relative;overflow:hidden;background:linear-gradient(120deg,#0E1F3B 0%,#132A4C 48%,#16375C 100%);}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:46px 46px;}
.chart{position:absolute;right:0;bottom:0;width:980px;height:582px;}
.brand{position:absolute;left:120px;top:150px;display:flex;align-items:center;gap:34px;}
.ico{width:132px;height:132px;border-radius:30px;background:linear-gradient(135deg,#1D8F74,#3FB897);display:flex;align-items:center;justify-content:center;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.w{font-family:SG;font-weight:700;color:#fff;font-size:104px;letter-spacing:-.02em;line-height:1}
.w small{display:block;font-family:SG;font-weight:500;font-size:38px;letter-spacing:.01em;color:#9EEBD1;margin-top:14px}
.tag{position:absolute;left:124px;bottom:96px;font-family:PX;font-size:30px;letter-spacing:.22em;text-transform:uppercase;color:rgba(225,231,240,.82)}
</style></head><body><div class="c"><div class="grid"></div>
<svg class="chart" viewBox="0 0 980 582"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FB897" stop-opacity=".38"/><stop offset="1" stop-color="#3FB897" stop-opacity="0"/></linearGradient></defs>
<path d="M60 470 L260 330 L420 400 L640 190 L900 110 L980 80 L980 582 L60 582 Z" fill="url(#g)"/>
<path d="M60 470 L260 330 L420 400 L640 190 L900 110 L980 80" fill="none" stroke="#3FB897" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
${[[260,330],[420,400],[640,190],[900,110]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#0E1F3B" stroke="#9EEBD1" stroke-width="6"/>`).join("")}
</svg>
<div class="brand"><div class="ico">${icon(76, "#fff")}</div><div class="w">Scale Teknoloji<small>Bilgi Güvenliği ve Danışmanlık</small></div></div>
<div class="tag">Uyum · Denetim · Teknik Güvence</div></div></body></html>`;
const logo = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${css}
.l{width:213px;height:144px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.ico{width:58px;height:58px;border-radius:14px;background:linear-gradient(135deg,#132A4C,#24406B);display:flex;align-items:center;justify-content:center}
.w{font-family:SG;font-weight:700;color:#132A4C;font-size:27px;letter-spacing:-.01em;line-height:1;text-align:center}
.w small{display:block;font-family:SG;font-weight:500;font-size:13px;color:#1D8F74;margin-top:5px;letter-spacing:.06em;text-transform:uppercase}
</style></head><body><div class="l"><div class="ico">${icon(32, "#fff")}</div><div class="w">Scale Teknoloji<small>Bilgi Güvenliği</small></div></div></body></html>`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ deviceScaleFactor: 1 });
await p.setViewportSize({ width: 1868, height: 582 }); await p.setContent(cover); await p.waitForTimeout(200);
await p.screenshot({ path: path.join(out, "kapak.jpeg"), type: "jpeg", quality: 88 });
const q = await b.newPage({ deviceScaleFactor: 2 });
await q.setViewportSize({ width: 213, height: 144 }); await q.setContent(logo); await q.waitForTimeout(200);
await q.screenshot({ path: path.join(out, "logo.png"), omitBackground: true });
await b.close();
console.log("ok", out);
