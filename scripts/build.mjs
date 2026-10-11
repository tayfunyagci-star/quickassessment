/* =====================================================================
   Siber Olgunluk Analiz Paneli — build
   ---------------------------------------------------------------------
   Kaynak (src/) + sabit sürümlü bağımlılıklar (node_modules/) → tek
   dosyalık, çevrimdışı çalışan HTML çıktıları (_build/).
     npm ci && npm run build
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_build");
const rd = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const nm = rel => path.join(ROOT, "node_modules", rel);
const b64 = abs => fs.readFileSync(abs).toString("base64");

/* </script ve <!-- dizileri satır içi betiği erken kapatmasın. */
const scriptSafe = js => js.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
/* JSON'u satır içi betiğe güvenle gömmek için '<' kaçışlanır. */
const jsonForScript = obj => JSON.stringify(obj).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

/* ---------- gömülü yazı tipleri (latin + latin-ext) ---------- */
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATEXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const FONT_SET = [
  ["Space Grotesk", "space-grotesk", [[500, "normal"], [600, "normal"], [700, "normal"]]],
  ["IBM Plex Sans", "ibm-plex-sans", [[400, "normal"], [500, "normal"], [600, "normal"], [700, "normal"], [400, "italic"]]],
  ["IBM Plex Mono", "ibm-plex-mono", [[400, "normal"], [600, "normal"]]],
];
function fontFaces(){
  const out = [];
  for(const [family, slug, variants] of FONT_SET){
    for(const [weight, style] of variants){
      for(const [subset, range] of [["latin", LAT], ["latin-ext", LATEXT]]){
        const file = nm(`@fontsource/${slug}/files/${slug}-${subset}-${weight}-${style}.woff2`);
        out.push(`@font-face{font-family:'${family}';font-style:${style};font-display:swap;font-weight:${weight};` +
                 `src:url(data:font/woff2;base64,${b64(file)}) format('woff2');unicode-range:${range};}`);
      }
    }
  }
  return out.join("\n");
}

/* Ağ erişimi tamamen kapalı: hiçbir istek, form gönderimi veya dış kaynak yok. */
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; " +
            "img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; object-src 'none'";

function head(title, extraMeta, themeJs, css){
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex">
${extraMeta}<title>${title}</title>
<script>${scriptSafe(themeJs.trim())}</script>
<style id="qaFonts">
${FONTS}
</style>
<style>
${css}
</style>
</head>`;
}

/* ---------- müşteri anketi şablonu ---------- */
function buildSurveyTemplate(){
  const engine = rd("src/shared/engine.js");
  const html = `${head("Hızlı Değerlendirme | Siber Güvenlik Olgunluk Anketi — Scale Bilgi Güvenliği ve Danışmanlık",
    `<meta name="description" content="Kurumunuzun siber güvenlik olgunluğunu ölçen, cevaplarınıza göre uyarlanan kısa bir öz-değerlendirme anketi.">\n`,
    rd("src/survey/theme.js"), rd("src/survey/survey.css"))}
<body>
${rd("src/survey/body.html")}
<script>
${scriptSafe(rd("src/survey/survey.js"))}
${scriptSafe(engine)}
${scriptSafe(rd("src/survey/delivery.js"))}
</script>
<script>
${scriptSafe(rd("src/survey/toggle.js"))}
</script>
</body>
</html>
`;
  if(!html.includes("/*__SURVEY__*/null/*__/SURVEY__*/")) throw new Error("anket şablonunda SURVEY işaretçisi yok");
  return html;
}

/* ---------- analiz paneli ---------- */
function buildPanel(surveyTemplate){
  const bank = JSON.parse(rd("src/data/bank.json"));
  return `${head("Siber Güvenlik Olgunluk — Analiz Paneli | Scale Teknoloji", "", rd("src/panel/theme.js"), rd("src/panel/panel.css"))}
<body>
${rd("src/panel/body.html")}
<script>
"use strict";
${scriptSafe(rd("src/panel/version.js"))}
/* =====================================================================
   VERİ — master soru bankası ve anket şablonu (build sırasında gömülür)
   ===================================================================== */
const BANK = ${jsonForScript(bank)};
const SURVEY_TEMPLATE = ${jsonForScript(surveyTemplate)};
${scriptSafe(rd("src/shared/engine.js"))}
${scriptSafe(rd("src/panel/panel.js"))}
</script>
</body>
</html>
`;
}

/* ---------- doğrulamalar ---------- */
function inlineScripts(html){
  return [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
}
function syntaxCheck(name, html){
  inlineScripts(html).forEach((code, i) => {
    try{ new vm.Script(code, { filename: `${name}#script${i}` }); }
    catch(e){ throw new Error(`${name}: ${i}. betikte sözdizimi hatası — ${e.message}`); }
  });
}
function forbid(name, html, tokens){
  const hit = tokens.filter(t => html.includes(t));
  if(hit.length) throw new Error(`${name}: yasak içerik bulundu → ${hit.join(", ")}`);
}
const NETWORK_TOKENS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.", "unpkg.com", "jsdelivr", "fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket("];

/* ---------- çalıştır ---------- */
const FONTS = fontFaces();
const survey = buildSurveyTemplate();
syntaxCheck("anket", survey.replace("/*__SURVEY__*/null/*__/SURVEY__*/", "{}"));
forbid("anket", survey, NETWORK_TOKENS.concat(["otp-servisi", "GONDERIM"]));

const panel = buildPanel(survey);
syntaxCheck("panel", panel);
forbid("panel", panel, NETWORK_TOKENS);

fs.mkdirSync(OUT, { recursive: true });
const outPanel = path.join(OUT, "Siber_Olgunluk_Analiz_Paneli.html");
fs.writeFileSync(outPanel, panel, "utf8");
const kb = n => (n / 1024).toFixed(0) + " KB";
console.log(`ok  ${path.relative(ROOT, outPanel)}  ${kb(Buffer.byteLength(panel))}  (anket şablonu ${kb(Buffer.byteLength(survey))})`);
