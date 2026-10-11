import os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(D, p), encoding="utf8").read()
ss = lambda js: re.sub(r"</(script)", r"<\\/\1", js, flags=re.I)
html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
<title>Kimlik Doğrulayıcı</title>
<style>
{rd("auth.css")}
</style>
</head>
<body>
{rd("auth_body.html")}
<script>
{ss(rd("totp.js"))}
</script>
<script>
{ss(rd("auth.js"))}
</script>
</body>
</html>
"""
open(sys.argv[1], "w", encoding="utf8").write(html); print("ok", len(html))
