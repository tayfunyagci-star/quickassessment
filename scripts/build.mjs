/* =====================================================================
   Siber Olgunluk Analiz Paneli — build
   ---------------------------------------------------------------------
   Kaynak (src/) + sabit sürümlü bağımlılıklar (node_modules/) → tek
   dosyalık, çevrimdışı çalışan HTML çıktıları (_build/).
     npm ci
     QA_ADMIN_PASSWORD='…' npm run build
   Ortam değişkenleri:
     QA_ADMIN_PASSWORD  panel parolası (zorunlu, en az 12 karakter). Panel
                        içeriği bu parolayla şifrelenir; parola çıktıda
                        hiçbir biçimde bulunmaz.
     QA_BUILD_OUT       çıktı klasörü (varsayılan: _build)
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import zlib from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(ROOT, process.env.QA_BUILD_OUT || "_build");
const PASSWORD = process.env.QA_ADMIN_PASSWORD || "";
if(PASSWORD.length < 12){
  console.error("HATA: QA_ADMIN_PASSWORD ortam değişkeni tanımlı değil ya da 12 karakterden kısa.\n" +
                "Örnek: QA_ADMIN_PASSWORD='uzun-ve-tahmin-edilemez-parola' npm run build");
  process.exit(1);
}
const KDF_ITER = 600000;
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

function head(title, extraMeta, themeJs, css, fontsCss){
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
${fontsCss}
</style>
<style>
${css}
</style>
</head>`;
}

/* ---------- müşteri anketi şablonu ---------- */
function buildSurveyTemplate(){
  const html = `${head("Hızlı Değerlendirme | Siber Güvenlik Olgunluk Anketi — Scale Bilgi Güvenliği ve Danışmanlık",
    `<meta name="description" content="Kurumunuzun siber güvenlik olgunluğunu ölçen, cevaplarınıza göre uyarlanan kısa bir öz-değerlendirme anketi.">\n`,
    rd("src/survey/theme.js"), rd("src/survey/survey.css"), FONTS_MARKER)}
<body>
${rd("src/survey/body.html")}
<script>
${scriptSafe(rd("src/survey/survey.js"))}
${scriptSafe(rd("src/shared/rules.js"))}
${scriptSafe(rd("src/survey/delivery.js"))}
</script>
<script>
${scriptSafe(rd("src/survey/toggle.js"))}
</script>
</body>
</html>
`;
  if(!html.includes("/*__SURVEY__*/null/*__/SURVEY__*/")) throw new Error("anket şablonunda SURVEY işaretçisi yok");
  /* Yazı tipleri panelde zaten gömülü; anket üretilirken panel kendi #qaFonts içeriğini buraya koyar. */
  if(!html.includes(FONTS_MARKER)) throw new Error("anket şablonunda yazı tipi işaretçisi yok");
  return html;
}

/* ---------- analiz paneli: şifreli içerik ---------- */
function buildPayload(surveyTemplate){
  const bank = JSON.parse(rd("src/data/bank.json"));
  const script = [
    "\"use strict\";",
    "/* VERİ — master soru bankası ve anket şablonu (build sırasında gömülür) */",
    `const BANK_DEFAULT = ${jsonForScript(bank)};`,
    `const SURVEY_TEMPLATE = ${jsonForScript(surveyTemplate)};`,
    rd("src/panel/bankstore.js"),
    rd("src/panel/selection.js"),
    rd("src/shared/rules.js"),
    rd("src/panel/panel.js"),
    rd("src/panel/bankedit.js"),
    rd("src/panel/security.js"),
  ].join("\n");
  return { body: rd("src/panel/body.html"), script };
}
function encryptPayload(obj){
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify(obj), "utf8"), { level: 9 });
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(PASSWORD, salt, KDF_ITER, 32, "sha256");
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]);   /* WebCrypto: şifreli metin || etiket */
  return { v:1, alg:"PBKDF2-SHA256/AES-256-GCM", iter: KDF_ITER, gz: true,
           salt: salt.toString("base64"), iv: iv.toString("base64"), ct: ct.toString("base64") };
}

/* ---------- analiz paneli: dış kabuk (giriş kapısı) ---------- */
function buildPanel(payload){
  const gate = rd("src/panel/gate.js").replace("/*@PAYLOAD*/null/*@END_PAYLOAD*/", () => `/*@PAYLOAD*/${jsonForScript(payload)}/*@END_PAYLOAD*/`);
  return `${head("Siber Güvenlik Olgunluk — Analiz Paneli | Scale Teknoloji", "", rd("src/panel/theme.js"), rd("src/panel/panel.css"), FONTS)}
<body>
${rd("src/panel/gate.html")}
<script id="libJszip">${scriptSafe(fs.readFileSync(nm("jszip/dist/jszip.min.js"), "utf8"))}</script>
<script id="libXlsx">${scriptSafe(fs.readFileSync(nm("xlsx/dist/xlsx.mini.min.js"), "utf8"))}</script>
<script id="libQr">${scriptSafe(fs.readFileSync(nm("qrcode-generator/qrcode.js"), "utf8"))}</script>
<script id="qaVersion">
${scriptSafe(rd("src/panel/version.js"))}
</script>
<script id="qaTotp">
${scriptSafe(rd("src/shared/totp.js"))}
</script>
<script id="qaGate">
${scriptSafe(gate)}
</script>
<script id="qaCapture">window.__QA_PRISTINE = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML; GATE.init();</script>
</body>
</html>
`;
}

/* ---------- Kimlik Doğrulayıcı ---------- */
function buildAuth(){
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex">
<title>Kimlik Doğrulayıcı — Scale Analiz Paneli</title>
<style>
${rd("src/auth/auth.css")}
</style>
</head>
<body>
${rd("src/auth/body.html")}
<script>
${scriptSafe(rd("src/shared/totp.js"))}
</script>
<script>
${scriptSafe(rd("src/auth/auth.js"))}
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
const FONTS_MARKER = "/*@FONTS@*/";
const FONTS = fontFaces();
const survey = buildSurveyTemplate();
syntaxCheck("anket", survey.replace("/*__SURVEY__*/null/*__/SURVEY__*/", "{}"));
forbid("anket", survey, NETWORK_TOKENS.concat(["otp-servisi", "GONDERIM"]));

const payload = buildPayload(survey);
syntaxCheck("panel içeriği", `<script>${payload.script}</script>`);
const panel = buildPanel(encryptPayload(payload));
syntaxCheck("panel", panel);
forbid("panel", panel, NETWORK_TOKENS);
/* Dış kabukta (şifresiz kısım) panelin iç bilgisi ve parola bulunmamalı. */
forbid("panel kabuğu", panel, [PASSWORD, "computeResults", "CONTRA_RULES", "SURVEY_TEMPLATE", "BANK_DEFAULT", "UCT.01.001", "REG_DEFS", "ladderLock"]);

const auth = buildAuth();
syntaxCheck("kimlik doğrulayıcı", auth);
forbid("kimlik doğrulayıcı", auth, NETWORK_TOKENS);

fs.mkdirSync(OUT, { recursive: true });
const kb = n => (n / 1024).toFixed(0) + " KB";
for(const [name, html] of [["Siber_Olgunluk_Analiz_Paneli.html", panel], ["Kimlik_Dogrulayici.html", auth]]){
  const out = path.join(OUT, name);
  fs.writeFileSync(out, html, "utf8");
  console.log(`ok  ${path.relative(ROOT, out)}  ${kb(Buffer.byteLength(html))}`);
}
console.log(`    (anket şablonu ${kb(Buffer.byteLength(survey))} + panelin yazı tipleri; içerik PBKDF2 ${KDF_ITER} tur / AES-256-GCM)`);
