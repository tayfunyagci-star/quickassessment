import base64, hashlib, json, re, sys, os
D = os.path.dirname(os.path.abspath(__file__))
L = os.path.join(D, "..", "libs")
out_path = sys.argv[1]

def rd(p, mode="r"):
    with open(p, mode, **({} if "b" in mode else {"encoding": "utf8"})) as f:
        return f.read()

def b64(p):
    return base64.b64encode(rd(p, "rb")).decode()

def script_safe(js):
    return re.sub(r"</(script)", r"<\\/\1", js, flags=re.I)

questions = json.loads(rd(os.path.join(D, "questions.json")))
qjson = json.dumps(questions, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
core = rd(os.path.join(D, "core.js")).replace("__QUESTIONS__", qjson)
admin_hash = hashlib.sha256("qa-admin|tayfun2026".encode()).hexdigest()
full = rd(os.path.join(D, "full.js")).replace("__ADMIN_HASH__", admin_hash)
report = rd(os.path.join(D, "report.js"))
assert "regulatory" not in rd(os.path.join(D, "core.js"))

LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATEXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
import glob as _g
def pkgdir(name): return _g.glob(os.path.join(L, name + "-*", "package", "files"))[0]
fonts = []
for fam, pkg, slug, weights in [("Space Grotesk", "fontsource-space-grotesk", "space-grotesk", [500, 600, 700]),
                                ("IBM Plex Sans", "fontsource-ibm-plex-sans", "ibm-plex-sans", [400, 500, 600, 700]),
                                ("IBM Plex Mono", "fontsource-ibm-plex-mono", "ibm-plex-mono", [400, 500, 600])]:
    d = pkgdir(pkg)
    for w in weights:
        for sub, rng in (("latin", LAT), ("latin-ext", LATEXT)):
            fonts.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-display:swap;font-weight:{w};src:url(data:font/woff2;base64,{b64(os.path.join(d, f'{slug}-{sub}-{w}-normal.woff2'))}) format('woff2');unicode-range:{rng};}}")
TEMA_JS = rd(os.path.join(D, "tema.js"))

jszip = script_safe(rd(os.path.join(L, "jszip-3.10.1/package/dist/jszip.min.js")))
xlsx = script_safe(rd(os.path.join(L, "xlsx-0.18.5/package/dist/xlsx.mini.min.js")))
tpl = b64(sys.argv[2])

html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; object-src 'none'">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="dark light">
<title>Hızlı Siber Güvenlik Olgunluk Değerlendirmesi</title>
<script id="qaTema">{TEMA_JS}</script>
<style>{''.join(fonts)}</style>
<style>
{rd(os.path.join(D, "tokens.css"))}
{rd(os.path.join(D, "app.css"))}
</style>
</head>
<body>
{rd(os.path.join(D, "body.html"))}
<script id="qaCore">
{script_safe(core)}
</script>
<script data-full id="libJszip">{jszip}</script>
<script data-full id="libXlsx">{xlsx}</script>
<script data-full type="application/octet-stream" id="tplDotx">{tpl}</script>
<script data-full id="libQr">{script_safe(rd(os.path.join(L, "qr/package/qrcode.js")))}</script>
<script data-full id="qaTotp">
{script_safe(rd(os.path.join(D, "totp.js")))}
</script>
<script data-full id="qaFull">
{script_safe(full)}
</script>
<script data-full id="qaReport">
{script_safe(report)}
</script>
<script data-full id="qaHtmlReport">
{script_safe(rd(os.path.join(D, "htmlreport.js")))}
</script>
<script data-full id="qaCapture">window.__QA_PRISTINE = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML;</script>
</body>
</html>
"""
with open(out_path, "w", encoding="utf8") as f:
    f.write(html)
print("ok", len(html))
