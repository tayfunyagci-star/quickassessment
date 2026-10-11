"""Word rapor şablonunu Scale Teknoloji'ye uyarlar (tek seferlik dönüştürme).

Kaynak : olgunluk-v1.6-guncelleme/template/Template_v2.dotx (stiller, sayfa düzeni,
         içindekiler ve kapak yerleşimi korunur)
Çıktı  : assets/Rapor_Sablonu_Scale.dotx

Yapılanlar
  - Kapak bandı ve alt bilgi logosu assets/sablon/ altındaki Scale görselleriyle değişir.
  - Fikri mülkiyet metni ve alt bilgideki kurum, adres, e-posta, web bağlantısı Scale'e çevrilir;
    adres ve iletişim bilgileri yer tutucudur ("[...]").
  - Şablondaki örnek içerik (7545 rehberi) kaldırılır; kapak + fikri mülkiyet + içindekiler
    + bölüm ayarı kalır. Rapor gövdesi panelde üretilir.
Kullanım: python3 tools/sablon_scale.py
"""
import os, re, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "olgunluk-v1.6-guncelleme", "template", "Template_v2.dotx")
OUT = os.path.join(ROOT, "assets", "Rapor_Sablonu_Scale.dotx")
KURUM = "Scale Teknoloji ve Danışmanlık"
ADRES = "[Ofis adresi eklenecek]"
EPOSTA = "[e-posta adresi]"
WEB = "scaleteknoloji.com"

IP_1 = ("Bu doküman ve içeriğinde yer alan tüm metin, grafik, tasarım, çizim, analiz, tablo, görsel ve diğer "
        "unsurlar ilgili kanunlar kapsamında korunmakta olup, tüm fikri mülkiyet hakları " + KURUM + "’a aittir. "
        "Bu içerikler, eser sahibinin açık yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz, dağıtılamaz, "
        "yayınlanamaz, değiştirilemez veya ticari amaçla kullanılamaz.")


def paragraphs(xml):
    return list(re.finditer(r"<w:p[ >].*?</w:p>", xml, re.S))


def text_of(p):
    return "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p))


def set_text(p, new):
    """Paragrafın tüm koşularını ilk koşunun biçimiyle tek koşuya indirger."""
    runs = list(re.finditer(r"<w:r[ >].*?</w:r>", p, re.S))
    first = runs[0].group(0)
    rpr = re.search(r"<w:rPr>.*?</w:rPr>", first, re.S)
    run = "<w:r>" + (rpr.group(0) if rpr else "") + '<w:t xml:space="preserve">' + new + "</w:t></w:r>"
    return p[:runs[0].start()] + run + p[runs[-1].end():]


def convert_document(xml):
    ps = paragraphs(xml)
    out, pos = [], 0
    for m in ps:
        t = text_of(m.group(0))
        rep = None
        if "fikri mülkiyet hakları" in t:
            rep = set_text(m.group(0), IP_1)
        elif t.strip() == "7545 Sayılı Siber Güvenlik Kanunu;":
            rep = set_text(m.group(0), "Siber Güvenlik Olgunluk Değerlendirmesi")
        elif t.strip() == "Siber Güvenlik Alanında Yeni Dönem, Yeni Sorumluluklar":
            rep = set_text(m.group(0), "Değerlendirme Raporu")
        if rep is not None:
            out.append(xml[pos:m.start()]); out.append(rep); pos = m.end()
    out.append(xml[pos:])
    xml = "".join(out)
    # Örnek gövdeyi çıkar: içindekiler (sdt) bloğundan sonra yalnızca ilk bölüm ayarı paragrafı + gövde sectPr kalır.
    body_open = xml.index("<w:body>") + len("<w:body>")
    body_close = xml.rindex("</w:body>")
    body = xml[body_open:body_close]
    sdt_end = body.index("</w:sdt>") + len("</w:sdt>")
    rest = body[sdt_end:]
    sect_p = next(m.group(0) for m in paragraphs(rest) if "<w:sectPr" in m.group(0))
    final_sect = re.search(r"<w:sectPr[ >](?:(?!<w:sectPr).)*</w:sectPr>\s*$", rest, re.S)
    body = body[:sdt_end] + sect_p + (final_sect.group(0) if final_sect else "")
    # İçindekiler bloğunda örnek başlıklar kalmasın: yalnız «İçindekiler» başlığı kalır (gövde panelde üretilir).
    sdt_s = body.index("<w:sdtContent>") + len("<w:sdtContent>")
    sdt_e = body.index("</w:sdtContent>")
    head = next((m.group(0) for m in paragraphs(body[sdt_s:sdt_e]) if text_of(m.group(0)).strip() == "İçindekiler"), "")
    body = body[:sdt_s] + head + body[sdt_e:]
    return xml[:body_open] + body + xml[body_close:]


def convert_footer(xml):
    repl = {
        "CyberArts Siber Güvenlik ve Danışmanlık A.Ş.": KURUM,
        "Quasar": ADRES,
        " İstanbul Fulya Mah. Büyükdere Cad. No: 76, 34394 Mecidiyeköy Şişli – İSTANBUL": "",
        "info@cyberartspro.com / ": EPOSTA + " / ",
        "www.cyberartspro.com": WEB,
    }
    for a, b in repl.items():
        xml = xml.replace(">" + a + "<", ">" + b + "<")
    return xml


def main():
    zin = zipfile.ZipFile(SRC)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            name = info.filename
            if name == "word/document.xml":
                data = convert_document(data.decode("utf8")).encode("utf8")
            elif name == "word/header2.xml":
                data = data.decode("utf8").replace(">[Type here]<", "><").encode("utf8")
            elif name in ("word/footer1.xml", "word/footer2.xml"):
                data = convert_footer(data.decode("utf8")).encode("utf8")
            elif name.startswith("word/_rels/footer"):
                data = data.decode("utf8").replace("http://www.cyberartspro.com", "https://" + WEB).encode("utf8")
            elif name == "word/media/image1.jpeg":
                data = open(os.path.join(ROOT, "assets", "sablon", "kapak.jpeg"), "rb").read()
            elif name == "word/media/image2.png":
                data = open(os.path.join(ROOT, "assets", "sablon", "logo.png"), "rb").read()
            elif name == "docProps/app.xml":
                data = data.decode("utf8").replace("Template_v2.dotx", "Rapor_Sablonu_Scale.dotx").encode("utf8")
            elif name == "docProps/core.xml":
                s = data.decode("utf8")
                s = re.sub(r"<dc:creator>.*?</dc:creator>", "<dc:creator>" + KURUM + "</dc:creator>", s)
                s = re.sub(r"<cp:lastModifiedBy>.*?</cp:lastModifiedBy>", "<cp:lastModifiedBy>" + KURUM + "</cp:lastModifiedBy>", s)
                data = s.encode("utf8")
            zout.writestr(info, data)
    # denetim: CyberArts izi kalmamalı
    with zipfile.ZipFile(OUT) as z:
        left = [n for n in z.namelist() if n.endswith((".xml", ".rels")) and re.search(rb"(?i)cyber", z.read(n))]
    if left:
        sys.exit("HATA: şablonda CyberArts izi kaldı: " + ", ".join(left))
    print("ok", OUT, os.path.getsize(OUT), "bayt")


if __name__ == "__main__":
    main()
