/* =====================================================================
   WORD (DOCX) RAPOR
   ---------------------------------------------------------------------
   Gömülü Scale rapor şablonu (assets/Rapor_Sablonu_Scale.dotx) açılır;
   kapak, fikri mülkiyet sayfası, üst/alt bilgi ve stiller korunur, gövde
   rapor modelinden yeniden yazılır. Grafikler renkli (canvas → PNG),
   tablolar siyah-beyazdır. Soru No, EK-1 Soru / Cevap tablosunu esas alır.
   ===================================================================== */
const WR = (function(){
const f1 = RPT.f1;
const CF = "'IBM Plex Sans', Calibri, Carlito, 'Segoe UI', Arial, sans-serif";

/* ---------------- grafikler (canvas) ---------------- */
function mk(w, h){
  const k = 2, c = document.createElement("canvas");
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  const g = c.getContext("2d"); g.scale(k, k);
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h); g.textBaseline = "middle";
  return { c, g, w, h };
}
function font(g, size, bold){ g.font = (bold ? "600 " : "400 ") + size + "px " + CF; }
function png(cv){ return { b64: cv.c.toDataURL("image/png").split(",")[1], w: cv.w, h: cv.h }; }
function wrap(g, text, maxW){
  const words = String(text).split(" "), lines = []; let cur = "";
  words.forEach(w => { const t = cur ? cur + " " + w : w; if(g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; });
  if(cur) lines.push(cur);
  return lines;
}
function onColor(hex){ const n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; return (0.299*r + 0.587*gg + 0.114*b) > 150 ? RPT.INK : "#FFFFFF"; }
function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x+r, y); g.arcTo(x+w, y, x+w, y+h, r); g.arcTo(x+w, y+h, x, y+h, r); g.arcTo(x, y+h, x, y, r); g.arcTo(x, y, x+w, y, r); g.closePath(); }

/* Genel olgunluk ölçeği: beş seviye bandı + işaretçi */
function chartScale(theta){
  const cv = mk(760, 140), g = cv.g, x0 = 30, x1 = 730, y = 66, h = 26;
  const X = v => x0 + (v - 1) / 4 * (x1 - x0);
  const bands = [[1, 1.8, 1, "Başlangıç öncesi"], [1.8, 2.6, 2, "Tekrarlanabilir"], [2.6, 3.4, 3, "Tanımlanmış"], [3.4, 4.2, 4, "Yönetilen"], [4.2, 5, 5, "Optimize"]];
  bands.forEach(([a, b, l, t]) => {
    g.fillStyle = RPT.RAMP[l - 1]; g.fillRect(X(a), y, X(b) - X(a) - 2, h);
    font(g, 10.5, true); g.fillStyle = onColor(RPT.RAMP[l - 1]); g.textAlign = "center"; g.fillText(t, (X(a) + X(b)) / 2, y + h / 2);
  });
  font(g, 11, false); g.fillStyle = RPT.DIM; g.textAlign = "center";
  [1, 2, 3, 4, 5].forEach(v => g.fillText(String(v), X(v), y + h + 14));
  if(theta != null){
    const sx = X(theta);
    g.fillStyle = RPT.NAVY; g.beginPath(); g.moveTo(sx, y - 2); g.lineTo(sx - 9, y - 16); g.lineTo(sx + 9, y - 16); g.closePath(); g.fill();
    font(g, 17, true); g.fillText("Genel olgunluk: " + f1(theta) + " / 5", Math.min(Math.max(sx, x0 + 110), x1 - 110), y - 32);
  }
  return png(cv);
}

/* Yatay çubuklar (1–5). Tek serili grafikte tüm çubuklar tek renk; renk değere bağlanmaz. */
function chartBars(items, opts){
  opts = opts || {};
  const rowH = opts.rowH || 30, labelW = opts.labelW || 260, top = 26, bottom = 28;
  const cv = mk(760, top + items.length * rowH + bottom), g = cv.g, x0 = labelW + 16, x1 = 690;
  const X = v => x0 + (v - 1) / 4 * (x1 - x0);
  font(g, 10.5, false); g.textAlign = "center";
  [1, 2, 3, 4, 5].forEach(v => {
    g.strokeStyle = RPT.GRID; g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), top - 6); g.lineTo(X(v), top + items.length * rowH); g.stroke();
    g.fillStyle = RPT.DIM; g.fillText(String(v), X(v), top + items.length * rowH + 13);
  });
  items.forEach((it, i) => {
    const cy = top + i * rowH + rowH / 2;
    font(g, 11.5, false); g.fillStyle = RPT.INK; g.textAlign = "right";
    const lines = wrap(g, it.label, labelW - 4);
    lines.slice(0, 2).forEach((ln, li) => g.fillText(ln, labelW, cy + (li - (Math.min(lines.length, 2) - 1) / 2) * 13));
    if(it.value == null){ font(g, 11, false); g.fillStyle = RPT.DIM; g.textAlign = "left"; g.fillText("ölçülmedi", x0 + 6, cy); return; }
    const bw = Math.max(3, X(it.value) - x0);
    g.fillStyle = it.color || RPT.BAR; rr(g, x0, cy - rowH * 0.3, bw, rowH * 0.6, 3); g.fill();
    font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "left"; g.fillText(f1(it.value), x0 + bw + 6, cy);
  });
  return png(cv);
}

/* Radar (alanlar veya NIST fonksiyonları) */
function chartRadar(list){
  const W = 760, H = 560, cv = mk(W, H), g = cv.g, cx = W / 2, cy = H / 2 + 4, R = 180, n = list.length;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const P = (i, v) => [cx + R * (v / 5) * Math.cos(ang(i)), cy + R * (v / 5) * Math.sin(ang(i))];
  [1, 2, 3, 4, 5].forEach(l => {
    g.beginPath(); list.forEach((_, i) => { const [x, y] = P(i, l); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
    g.strokeStyle = RPT.GRID; g.lineWidth = 1; g.stroke();
  });
  list.forEach((_, i) => { const [x, y] = P(i, 5); g.strokeStyle = RPT.GRID; g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); });
  font(g, 9.5, false); g.fillStyle = RPT.DIM; g.textAlign = "left";
  [1, 2, 3, 4, 5].forEach(l => g.fillText(String(l), cx + 3, cy - R * l / 5 + 7));
  g.beginPath(); list.forEach((d, i) => { const [x, y] = P(i, d.value || 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
  g.fillStyle = "rgba(44,124,176,.16)"; g.fill(); g.strokeStyle = RPT.BAR; g.lineWidth = 2.4; g.stroke();
  list.forEach((d, i) => { const [x, y] = P(i, d.value || 0); g.beginPath(); g.arc(x, y, 4.5, 0, 2 * Math.PI); g.fillStyle = RPT.BAR; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke(); });
  list.forEach((d, i) => {
    const a = ang(i), lr = R + 28, x = cx + lr * Math.cos(a), y = cy + lr * Math.sin(a);
    g.textAlign = Math.cos(a) > 0.2 ? "left" : Math.cos(a) < -0.2 ? "right" : "center";
    font(g, 11, false);
    const lines = wrap(g, d.label, 150), lh = 13, total = lines.length + 1;
    const y0 = y - (total - 1) * lh / 2 + (Math.sin(a) > 0.5 ? 8 : Math.sin(a) < -0.5 ? -8 : 0);
    g.fillStyle = RPT.INK; lines.forEach((ln, li) => g.fillText(ln, x, y0 + li * lh));
    font(g, 11, true); g.fillStyle = RPT.NAVY; g.fillText(f1(d.value), x, y0 + lines.length * lh);
  });
  return png(cv);
}

/* Isı haritası — kontrol alanı × boyut (sıralı mavi rampa, hücrede değer yazılı) */
function chartHeatmap(rows){
  const cols = ["İnsan", "Süreç", "Teknoloji", "Alan"], labelW = 290, cellW = (760 - labelW - 10) / cols.length, rowH = 28, top = 30;
  const cv = mk(760, top + rows.length * rowH + 40), g = cv.g;
  font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "center";
  cols.forEach((c, j) => g.fillText(c, labelW + j * cellW + cellW / 2, top / 2 + 2));
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    font(g, 11, false); g.fillStyle = RPT.INK; g.textAlign = "right";
    const lines = wrap(g, r.label, labelW - 12);
    lines.slice(0, 2).forEach((ln, li) => g.fillText(ln, labelW - 10, y + rowH / 2 + (li - (Math.min(lines.length, 2) - 1) / 2) * 12));
    r.values.forEach((v, j) => {
      const x = labelW + j * cellW, hex = RPT.ramp(v);
      g.fillStyle = hex; g.fillRect(x + 2, y + 2, cellW - 4, rowH - 4);
      font(g, 12, j === 3); g.fillStyle = v == null ? RPT.INK : onColor(hex); g.textAlign = "center";
      g.fillText(v == null ? "—" : f1(v), x + cellW / 2, y + rowH / 2);
    });
  });
  const ly = top + rows.length * rowH + 22; let lx = labelW;
  font(g, 10.5, false); g.fillStyle = RPT.DIM; g.textAlign = "left"; g.fillText("Olgunluk:", lx - 70, ly);
  RPT.RAMP.forEach((c, i) => { g.fillStyle = c; g.fillRect(lx, ly - 7, 26, 14); g.fillStyle = RPT.INK; g.fillText(String(i + 1), lx + 31, ly); lx += 52; });
  return png(cv);
}

/* Risk matrisi — kritiklik × olgunluk; hücrede soru sayısı */
function chartMatrix(matrix){
  const labelW = 120, top = 46, rowH = 56, cellW = (760 - labelW - 20) / 4;
  const cv = mk(760, top + matrix.length * rowH + 50), g = cv.g;
  font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "center";
  g.fillText("Kontrol olgunluğu (soru bazında, ön koşul sınırı uygulanmış)", labelW + cellW * 2, 12);
  matrix[0].cells.forEach((c, j) => { font(g, 11, true); g.fillText(c.lbl, labelW + j * cellW + cellW / 2, top - 14); });
  const statusOf = (w, j) => (j === 0 && w >= 3) ? RPT.DURUM.kritik : ((j <= 1 && w >= 2) || (j === 0) ? RPT.DURUM.gelisme : RPT.DURUM.guclu);
  matrix.forEach((row, i) => {
    const y = top + i * rowH;
    font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "right"; g.fillText(row.label, labelW - 10, y + rowH / 2);
    row.cells.forEach((c, j) => {
      const x = labelW + j * cellW, d = statusOf(row.w, j), n = c.qnos.length;
      g.fillStyle = d.renk; g.globalAlpha = n ? 1 : 0.25; g.fillRect(x + 3, y + 3, cellW - 6, rowH - 6); g.globalAlpha = 1;
      g.fillStyle = n ? "#FFFFFF" : RPT.INK; g.textAlign = "center";
      font(g, 20, true); g.fillText(String(n), x + cellW / 2, y + rowH / 2 - 6);
      font(g, 10, false); g.fillText(d.ad, x + cellW / 2, y + rowH / 2 + 14);
    });
  });
  g.save(); g.translate(14, top + matrix.length * rowH / 2); g.rotate(-Math.PI / 2); font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "center"; g.fillText("Kritiklik", 0, 0); g.restore();
  return png(cv);
}

/* Olgunluk merdiveni — basamak skorları ve kilit eşiği */
function chartRungs(rungs, threshold){
  const labelW = 210, top = 28, rowH = 34, x0 = labelW + 16, x1 = 690;
  const cv = mk(760, top + rungs.length * rowH + 34), g = cv.g;
  const X = v => x0 + v / 100 * (x1 - x0);
  font(g, 10.5, false); g.textAlign = "center";
  [0, 20, 40, 60, 80, 100].forEach(v => { g.strokeStyle = RPT.GRID; g.beginPath(); g.moveTo(X(v), top - 6); g.lineTo(X(v), top + rungs.length * rowH); g.stroke(); g.fillStyle = RPT.DIM; g.fillText("%" + v, X(v), top + rungs.length * rowH + 13); });
  rungs.forEach((r, i) => {
    const cy = top + i * rowH + rowH / 2;
    font(g, 11.5, false); g.fillStyle = RPT.INK; g.textAlign = "right"; g.fillText("Seviye " + r.m + " · " + r.label, labelW, cy);
    if(r.score == null){ font(g, 11, false); g.fillStyle = RPT.DIM; g.textAlign = "left"; g.fillText("ölçülmedi", x0 + 6, cy); return; }
    const bw = Math.max(3, X(r.score) - x0);
    g.fillStyle = r.pass ? RPT.RAMP[r.m - 1] : "#DE9A93"; rr(g, x0, cy - rowH * 0.3, bw, rowH * 0.6, 3); g.fill();
    font(g, 11.5, true); g.fillStyle = RPT.INK; g.textAlign = "left"; g.fillText("%" + Math.round(r.score) + (r.pass ? "  geçti" : "  eşik altı"), x0 + bw + 6, cy);
  });
  const tx = X(threshold); g.strokeStyle = RPT.NAVY; g.lineWidth = 1.6; g.setLineDash([5, 3]);
  g.beginPath(); g.moveTo(tx, top - 10); g.lineTo(tx, top + rungs.length * rowH); g.stroke(); g.setLineDash([]);
  font(g, 10.5, true); g.fillStyle = RPT.NAVY; g.textAlign = "center"; g.fillText("Eşik %" + threshold, tx, top - 16);
  return png(cv);
}

/* ---------------- WordprocessingML ---------------- */
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const TEXT_W = 9072;
const xe = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function runs(content, base){
  base = base || {};
  const segs = Array.isArray(content) ? content : [{ t: content }];
  return segs.map(s => {
    if(typeof s === "string") s = { t: s };
    const b = s.b != null ? s.b : base.b, i = s.i != null ? s.i : base.i, sz = s.sz != null ? s.sz : base.sz;
    const rPr = (b ? "<w:b/><w:bCs/>" : "") + (i ? "<w:i/><w:iCs/>" : "") + (sz ? '<w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/>' : "");
    return String(s.t == null ? "" : s.t).split("\n").map((t, k) => "<w:r>" + (rPr ? "<w:rPr>" + rPr + "</w:rPr>" : "") + (k ? "<w:br/>" : "") +
      '<w:t xml:space="preserve">' + xe(t) + "</w:t></w:r>").join("");
  }).join("");
}
function P(content, o){
  o = o || {};
  let pPr = "";
  if(o.style) pPr += '<w:pStyle w:val="' + o.style + '"/>';
  if(o.keepNext) pPr += "<w:keepNext/>";
  if(o.pageBreakBefore) pPr += "<w:pageBreakBefore/>";
  if(o.noNum) pPr += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="0"/></w:numPr>';
  if(o.spacing) pPr += "<w:spacing " + o.spacing + "/>";
  if(o.jc) pPr += '<w:jc w:val="' + o.jc + '"/>';
  return "<w:p>" + (pPr ? "<w:pPr>" + pPr + "</w:pPr>" : "") + runs(content, o) + "</w:p>";
}
const BUL = t => P(t, { style: "Bullet" });
const CAP = t => P(t, { style: "Caption", keepNext: true });
const CAP_BELOW = t => P(t, { style: "Caption", jc: "center" });
function TABLE(widths, header, rows, o){
  o = o || {};
  const total = widths.reduce((a, b) => a + b, 0), sz = o.sz || 18;
  const cell = (c, w, head) => {
    if(c == null || typeof c !== "object" || Array.isArray(c)) c = { c };
    let tcPr = '<w:tcW w:w="' + (c.span ? c.spanW : w) + '" w:type="dxa"/>';
    if(c.span) tcPr += '<w:gridSpan w:val="' + c.span + '"/>';
    if(c.vMerge) tcPr += c.vMerge === "restart" ? '<w:vMerge w:val="restart"/>' : "<w:vMerge/>";
    if(head) tcPr += '<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>';
    tcPr += '<w:vAlign w:val="' + (c.vTop ? "top" : "center") + '"/>';
    const content = c.c == null ? "" : c.c;
    const paras = (Array.isArray(content) && content.length && Array.isArray(content[0])) ? content : [content];
    return "<w:tc><w:tcPr>" + tcPr + "</w:tcPr>" + paras.map(pc => '<w:p><w:pPr><w:spacing w:before="20" w:after="20"/><w:jc w:val="' + (c.jc || "left") + '"/></w:pPr>' +
      runs(pc, { b: head || c.b, sz, i: c.i }) + "</w:p>").join("") + "</w:tc>";
  };
  const tr = (cells, head) => {
    let wi = 0, out = "";
    cells.forEach(c => {
      const span = (c && typeof c === "object" && c.span) ? c.span : 1;
      const w = widths.slice(wi, wi + span).reduce((a, b) => a + b, 0);
      if(span > 1) c.spanW = w;
      out += cell(c, w, head); wi += span;
    });
    return "<w:tr><w:trPr><w:cantSplit/>" + (head ? "<w:tblHeader/>" : "") + "</w:trPr>" + out + "</w:tr>";
  };
  return '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="' + total + '" w:type="dxa"/><w:tblLayout w:type="fixed"/>' +
    '<w:tblCellMar><w:left w:w="85" w:type="dxa"/><w:right w:w="85" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>' +
    "<w:tblGrid>" + widths.map(w => '<w:gridCol w:w="' + w + '"/>').join("") + "</w:tblGrid>" +
    (header ? tr(header, true) : "") + rows.map(r => tr(r, false)).join("") + "</w:tbl>" + P("", { spacing: 'w:before="0" w:after="60"', sz: 8 });
}
function ImageBag(){
  const items = []; let docPr = 100;
  return { items, add(img, widthCm){
    const idx = items.length + 1, rId = "rIdScImg" + idx, name = "sc_grafik" + idx + ".png";
    items.push({ rId, name, b64: img.b64 });
    const cx = Math.round(widthCm * 360000), cy = Math.round(cx * img.h / img.w), id = ++docPr;
    return '<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">' +
      '<wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="' + id + '" name="Grafik ' + idx + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:nvPicPr><pic:cNvPr id="' + id + '" name="' + name + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rId + '" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
  } };
}
function tocBlock(entries){
  const cached = entries.map(e => '<w:p><w:pPr><w:pStyle w:val="TOC' + e.level + '"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' + TEXT_W + '"/></w:tabs></w:pPr>' + runs(e.text) + "</w:p>").join("");
  return '<w:sdt><w:sdtPr><w:docPartObj><w:docPartGallery w:val="Table of Contents"/><w:docPartUnique/></w:docPartObj></w:sdtPr><w:sdtContent>' +
    '<w:p><w:pPr><w:pStyle w:val="TOCHeading"/><w:pageBreakBefore/></w:pPr>' + runs("İçindekiler") + "</w:p>" +
    '<w:p><w:pPr><w:pStyle w:val="TOC1"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' + TEXT_W + '"/></w:tabs></w:pPr><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r></w:p>' +
    cached + '<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:sdtContent></w:sdt>';
}

/* ---------------- rapor gövdesi ---------------- */
function buildBody(M, imgs){
  const out = [], toc = [];
  let h1n = 0, h2n = 0, fig = 0, tab = 0;
  const h1 = (t, o) => { h1n++; h2n = 0; toc.push({ level: 1, text: h1n + ". " + t }); out.push(P(t, Object.assign({ style: "Heading1" }, o || {}))); };
  const h1ek = t => { toc.push({ level: 1, text: t }); out.push(P(t, { style: "Heading1", noNum: true, pageBreakBefore: true })); };
  const h2 = t => { h2n++; toc.push({ level: 2, text: h1n + "." + h2n + ". " + t }); out.push(P(t, { style: "Heading2" })); };
  const p = (c, o) => out.push(P(c, o));
  const figure = (img, title, cm) => { fig++; out.push(imgs.add(img, cm || 16)); out.push(CAP_BELOW("Şekil " + fig + " – " + title)); };
  const table = (title, widths, header, rows, o) => { tab++; out.push(CAP("Tablo " + tab + " – " + title)); out.push(TABLE(widths, header, rows, o)); };
  const noRef = () => p("Soru No, EK-1 Soru / Cevap Tablosu’ndaki numaralandırmayı esas alır.", { i: true, sz: 18 });
  const O = M.overall, org = M.org;
  const strong = M.sorted.slice().reverse().filter(a => a.theta >= 3.4).slice(0, 3);
  const weak = M.sorted.filter(a => a.theta < 2.6).slice(0, 4);
  const axSorted = M.axes.filter(a => a.theta != null).sort((a, b) => a.theta - b.theta);

  /* 1. Doküman hakkında */
  h1("Doküman Hakkında ve Sorumluluk Reddi", { pageBreakBefore: true });
  h2("Doküman Hakkında");
  p("Bu rapor, " + org + " tarafından doldurulan Hızlı Siber Güvenlik Olgunluk Değerlendirmesi anketinin sonuçlarını özetler. " +
    "Anket " + M.taxName + " çerçevesindeki kontrol alanlarından, kurumun cevaplarına göre uyarlanarak seçilen kontrol sorularından oluşur; " +
    "her kontrol İnsan, Süreç ve Teknoloji boyutlarında ayrı ayrı değerlendirilmiştir.");
  table("Değerlendirme bilgileri", [3000, 6072], null, [
    [{ c: "Kurum", b: true }, org],
    [{ c: "Değerlendirme türü", b: true }, "Öz değerlendirme (kurum beyanı) · uyarlanabilir anket"],
    [{ c: "Kontrol çerçevesi", b: true }, M.taxName],
    [{ c: "Yanıt tarihi", b: true }, RPT.trDate(M.submittedAt)],
    [{ c: "Rapor tarihi", b: true }, RPT.trDate(M.reportDate)],
    [{ c: "Kapsam", b: true }, M.counts.areas + " kontrol alanı · " + M.counts.questions + " skorlanan kontrol sorusu · " + M.counts.items + " İnsan/Süreç/Teknoloji cevabı" +
      (M.counts.naAreas ? " · " + M.counts.naAreas + " alan kapsam dışı" : "")],
    [{ c: "Kapsam soruları", b: true }, M.scope.map(s => s.q + " " + (s.yes ? "Evet" : "Hayır")).join("\n")],
    [{ c: "Soru seti doğrulaması", b: true }, M.qsetTxt],
    [{ c: "Sürüm", b: true }, "Analiz Paneli v" + M.appVersion + " · Soru bankası: " + M.bankVersion]
  ], { sz: 19 });
  h2("Veri Gizliliği");
  p("Bu değerlendirme kapsamında kurumunuz tarafından paylaşılan yanıtlar ve kurumsal bilgiler gizlilik esasıyla ele alınmıştır:");
  out.push(BUL([{ t: "Şifreli iletim: ", b: true }, "Yanıtlar kurumunuzun kendi cihazında AES-256-GCM ile şifrelenmiş; dosya ve açma şifresi birbirinden ayrı kanallarla iletilmiştir."]));
  out.push(BUL([{ t: "Yerel işleme: ", b: true }, "Analiz ve raporlama, ağ erişimi tamamen kapatılmış ve yalnızca danışmanın bilgisayarında çalışan bir uygulamayla yapılmıştır."]));
  out.push(BUL([{ t: "Yapay zekâ platformları: ", b: true }, "Kurumsal bilgiler hiçbir yapay zekâ platformuna, bulut tabanlı analiz servisine veya harici sisteme aktarılmamıştır."]));
  out.push(BUL([{ t: "Üçüncü kişiler: ", b: true }, "Bilgiler üçüncü kişilerle paylaşılmamış; yalnızca bu raporun hazırlanması amacıyla kullanılmıştır."]));
  h2("Sorumluluk Reddi");
  p("Bu rapor, kurum personeli tarafından verilen öz değerlendirme yanıtlarına dayanır. Yanıtlar bağımsız teknik doğrulama, sızma testi veya yerinde denetimle teyit edilmemiştir" +
    (M.notes.length ? "; çelişkili görünen beyanlar «Değerlendirme Notları» bölümünde ayrıca listelenmiştir. " : ". ") +
    "Rapor, değerlendirmenin yapıldığı tarihteki durumu yansıtır ve bir garanti, sertifika veya güvence teşkil etmez. " +
    "Mevzuat bölümündeki göstergeler yönlendirici niteliktedir.");

  /* 2. Yönetici özeti */
  h1("Yönetici Özeti", { pageBreakBefore: true });
  p([org + " için hesaplanan ağırlıklı siber güvenlik olgunluğu 5 üzerinden ", { t: RPT.f1(O.theta), b: true }, " olup «" + O.band + "» bandındadır. " +
     "Olgunluk merdiveni yöntemine göre doğrulanmış seviye ", { t: O.verified == null ? "hesaplanamadı" : (O.verified === 0 ? "0 (doğrulanmış basamak yok)" : String(O.verified)), b: true },
     O.blockedAt != null ? "; merdiven Seviye " + O.blockedAt + " basamağında eşiğin altında kaldığı için üst basamaklar seviyeye yansımamıştır." : "."]);
  figure(chartScale(O.theta), "Genel olgunluğun ölçekteki yeri");
  table("Özet göstergeler", [4572, 1500, 3000], ["Gösterge", "Değer", "Açıklama"], [
    ["Ağırlıklı olgunluk (θ)", { c: RPT.f1(O.theta), jc: "center", b: true }, O.band],
    ["Doğrulanmış olgunluk basamağı", { c: O.verified == null ? "—" : String(O.verified), jc: "center", b: true }, "Basamak eşiği %" + O.threshold],
    ["Ağırlıklı skor", { c: "%" + RPT.f0(O.score), jc: "center" }, "Kritiklik × olgunluk ağırlıklı"],
    ["Risk göstergesi", { c: RPT.f0(O.risk), jc: "center" }, O.riskBand],
    ...M.axes.map(a => [a.name + " boyutu", { c: RPT.f1(a.theta), jc: "center" }, RPT.bandLabel(a.theta)]),
    ["Kontrol alanı (kapsam içi / dışı)", { c: M.counts.areas + " / " + M.counts.naAreas, jc: "center" }, ""],
    ["Değerlendirme notu", { c: String(M.notes.length), jc: "center" }, M.counts.flagged ? M.counts.flagged + " soru kanıt incelemesinde" : "Çelişki tespit edilmedi"]
  ], { sz: 19 });
  p("Öne çıkan bulgular", { b: true, keepNext: true, spacing: 'w:before="120" w:after="60"' });
  out.push(BUL([{ t: "Güçlü alanlar: ", b: true }, strong.length ? strong.map(a => a.name + " (" + RPT.f1(a.theta) + ")").join(", ") + "." : "Yönetilen seviyeye (3,4) ulaşan kontrol alanı bulunmamaktadır."]));
  if(weak.length) out.push(BUL([{ t: "Öncelikli alanlar: ", b: true }, weak.map(a => a.name + " (" + RPT.f1(a.theta) + ")").join(", ") + " alanları kritik düzeydedir."]));
  if(axSorted.length > 1) out.push(BUL([{ t: "Boyutlar: ", b: true }, "En düşük olgunluk " + axSorted[0].name + " (" + RPT.f1(axSorted[0].theta) + "), en yüksek " +
    axSorted[axSorted.length - 1].name + " (" + RPT.f1(axSorted[axSorted.length - 1].theta) + ") boyutundadır."]));
  const regLow = M.regs.filter(r => r.theta != null && r.theta < 2.6);
  if(M.regs.some(r => r.theta != null)) out.push(BUL([{ t: "Mevzuat: ", b: true }, regLow.length ? regLow.map(r => r.label + " (" + RPT.f1(r.theta) + ")").join(", ") + " ile ilişkili kontrollerde olgunluk kritik düzeydedir."
    : "Eşlenen çerçevelerin hiçbirinde ilişkili kontrollerin ortalaması kritik düzeyde değildir."]));
  if(M.gaps.length) out.push(BUL([{ t: "İyileştirme: ", b: true }, "Kritiklik ve olgunluk açığına göre öncelikli " + M.gaps.length + " kontrol Bölüm 5’te listelenmiştir."]));
  if(M.notes.length) out.push(BUL([{ t: "Değerlendirme notları: ", b: true }, "Bazı yanıtlar arasında uyumsuzluk görülmüştür (" + M.notes.length + " not). Bu hususların kurumunuzla birlikte teyit edilmesi sonuçların doğruluğunu artıracaktır."]));

  /* 3. Metodoloji */
  h1("Metodoloji", { pageBreakBefore: true });
  h2("Değerlendirme Yaklaşımı");
  p("Anket uyarlanabilir yapıdadır: her kontrol alanında sorulacak kontrol, önceki cevaba göre olgunluk merdiveninde bir üst ya da alt basamaktan seçilir. " +
    "Her kontrol İnsan (sahiplik, yetkinlik), Süreç (tanım, işletim) ve Teknoloji (araç, otomasyon) boyutlarında 1–5 arası ayrı ayrı yanıtlanır; kurumda karşılığı olmayan boyutlar «kapsam dışı» işaretlenebilir ve hesaba katılmaz.");
  h2("Puanlama");
  table("Puanlama formülü", [3000, 6072], ["Bileşen", "Tanım"], [
    ["Madde ağırlığı", "Wᵢ = Kritiklik ağırlığı (Düşük " + M.weights.crit[1] + " · Orta " + M.weights.crit[2] + " · Yüksek " + M.weights.crit[3] + " · Kritik " + M.weights.crit[4] + ") × Olgunluk basamağı çarpanı"],
    ["Kazanılan puan", "Pᵢ = (cevap − 1) / 4 × Wᵢ"],
    ["Skor ve olgunluk", "Skor = ΣPᵢ / ΣWᵢ × 100 · Olgunluk θ = 1 + 4 × Skor / 100"],
    ["Ön koşul kapısı", "Ön koşulu olan bir kontrol, ön koşulunun seviyesinden yüksek puan alamaz."],
    ["Olgunluk merdiveni", "Bir seviye, o basamağın ve altındaki ölçülmüş tüm basamakların ağırlıklı skoru en az %" + M.weights.lock + " olduğunda doğrulanmış sayılır."]
  ], { sz: 19 });
  table("Olgunluk seviyeleri", [1500, 1300, 6272], ["Aralık", "Seviye", "Anlamı"], [
    ["θ < 1,8", { c: "1", jc: "center", b: true }, "Başlangıç öncesi — kontroller tanımsız, kişiye bağlı."],
    ["1,8 – 2,6", { c: "2", jc: "center", b: true }, "Tekrarlanabilir — uygulama var ancak dokümante ve tutarlı değil."],
    ["2,6 – 3,4", { c: "3", jc: "center", b: true }, "Tanımlanmış — yazılı, onaylı ve genel olarak uygulanıyor."],
    ["3,4 – 4,2", { c: "4", jc: "center", b: true }, "Yönetilen — ölçülüyor, izleniyor, periyodik gözden geçiriliyor."],
    ["θ ≥ 4,2", { c: "5", jc: "center", b: true }, "Optimize — otomatize, entegre ve sürekli iyileştiriliyor."]
  ], { sz: 19 });
  h2("Tutarlılık Kontrolleri");
  p("Yanıtlar kendi aralarında çapraz kontrol edilir: aynı konuda bir yeteneğin yok beyan edilip başka bir soruda işlediğinin beyan edilmesi, bir ön koşul yeteneği yokken ona dayanan yeteneğin üst düzeyde beyan edilmesi ve olağandışı yanıt örüntüleri tespit edilir. " +
    "Çelişkili bulunan sorular danışman incelemesinde kanıta göre değerlendirilir; karar verilmeyen veya reddedilen beyanlar skora alınmaz.");

  /* 4. Olgunluk değerlendirmesi */
  h1("Olgunluk Değerlendirmesi", { pageBreakBefore: true });
  h2("İnsan, Süreç ve Teknoloji");
  if(axSorted.length) p("Boyut bazında en yüksek olgunluk " + axSorted[axSorted.length - 1].name + " (" + RPT.f1(axSorted[axSorted.length - 1].theta) + "), en düşük olgunluk " + axSorted[0].name + " (" + RPT.f1(axSorted[0].theta) + ") boyutundadır.");
  figure(chartBars(M.axes.map(a => ({ label: a.full, value: a.theta, color: RPT.AXIS[a.ax] })), { rowH: 42, labelW: 200 }), "Boyut bazında olgunluk");
  table("Boyut bazında sonuçlar", [3072, 1500, 2700, 1800], ["Boyut", "θ", "Seviye", "Cevap / kapsam dışı"], M.axes.map(a =>
    [a.full, { c: RPT.f1(a.theta), jc: "center", b: true }, RPT.bandLabel(a.theta), { c: a.n + " / " + a.na, jc: "center" }]), { sz: 19 });
  h2("Kontrol Alanları");
  if(M.sorted.length) p(M.areas.length + " kontrol alanından " + M.areas.filter(a => a.theta >= 3.4).length + " tanesi yönetilen seviyede veya üzerindedir. En yüksek olgunluk " +
    M.sorted[M.sorted.length - 1].name + " (" + RPT.f1(M.sorted[M.sorted.length - 1].theta) + "), en düşük " + M.sorted[0].name + " (" + RPT.f1(M.sorted[0].theta) + ") alanındadır.");
  if(M.isNist && M.functions.length) figure(chartRadar(M.functions.map(f => ({ label: f.code + " · " + f.name, value: f.theta }))), "NIST CSF 2.0 fonksiyonlarının olgunluk profili", 14);
  else if(M.areas.length >= 3) figure(chartRadar(M.areas.map(a => ({ label: a.name, value: a.theta }))), "Kontrol alanlarının olgunluk profili", 15);
  figure(chartHeatmap(M.sorted.map(a => ({ label: a.name, values: [a.axis.I, a.axis.S, a.axis.T, a.theta] }))), "Kontrol alanı × boyut ısı haritası (düşükten yükseğe)");
  table("Kontrol alanı bazında sonuçlar", [3072, 700, 900, 900, 1000, 900, 1600], ["Kontrol alanı", "Soru", "İnsan", "Süreç", "Teknoloji", "Alan", "Doğrulanmış basamak"],
    M.sorted.map(a => [a.name, { c: String(a.n), jc: "center" }, { c: RPT.f1(a.axis.I), jc: "center" }, { c: RPT.f1(a.axis.S), jc: "center" }, { c: RPT.f1(a.axis.T), jc: "center" },
      { c: RPT.f1(a.theta), jc: "center", b: true }, { c: a.verified == null ? "—" : String(a.verified) + (a.blockedAt != null ? " (S" + a.blockedAt + "’te takıldı)" : ""), jc: "center" }]), { sz: 18 });
  if(M.naAreas.length) p("Kapsam dışı alanlar: " + M.naAreas.map(a => a.name + " (" + a.reason + ")").join(", ") + ".", { i: true, sz: 19 });
  table("Alan bazında değerlendirme", [3072, 6000], ["Kontrol alanı", "Değerlendirme"], M.sorted.map(a => [{ c: a.name + "\n" + RPT.f1(a.theta) + " · " + a.durum.ad, b: true }, a.advice]), { sz: 18 });
  h2("Olgunluk Basamakları");
  p("Olgunluk seviyesi düz ortalamayla değil, merdiven mantığıyla doğrulanır. Doğrulanmış seviye: " + (O.verified == null ? "—" : O.verified) +
    (O.blockedAt != null ? "; merdiven Seviye " + O.blockedAt + " basamağında %" + RPT.f0(O.lock.blockedScore) + " skorla eşiğin altında kaldı." : "."));
  figure(chartRungs(M.rungs, M.weights.lock), "Basamak bazında ağırlıklı skor ve doğrulama eşiği");
  h2("Mevzuat ve Standartlar");
  p("Kontroller, ilgili oldukları mevzuat ve standart maddeleriyle eşleştirilmiştir. Göstergeler, ilgili çerçeveyle eşleşen ve bu değerlendirmede sorulan kontrollerin ağırlıklı olgunluğunu gösterir; kapsama oranı sorulan kontrol sayısının bankadaki eşleşen kontrollere oranıdır.");
  figure(chartBars(M.regs.map(r => ({ label: r.label, value: r.theta })), { rowH: 38, labelW: 300 }), "Mevzuat / standart bazında olgunluk");
  table("Mevzuat bazında sonuçlar", [3472, 1300, 1300, 1000, 2000], ["Mevzuat / standart", "Sorulan kontrol", "Kapsama", "θ", "Durum"], M.regs.map(r => [
    r.label, { c: String(r.n), jc: "center" }, { c: r.coverage == null ? "—" : "%" + RPT.f0(r.coverage), jc: "center" }, { c: RPT.f1(r.theta), jc: "center", b: true },
    r.theta == null ? "Veri yok" : RPT.durum(r.theta).ad]), { sz: 19 });

  /* 5. Öncelikli iyileştirme alanları */
  h1("Öncelikli İyileştirme Alanları", { pageBreakBefore: true });
  p("Kontroller, kritiklik ağırlığı ile olgunluk açığının çarpımına göre sıralanmıştır. Aşağıdaki matris, puanlanan tüm kontrollerin kritiklik ve olgunluk dağılımını gösterir.");
  figure(chartMatrix(M.matrix), "Kritiklik × olgunluk matrisi");
  if(M.gaps.length){
    table("Öncelikli iyileştirme alanları", [450, 700, 1500, 3422, 900, 700, 1400], ["Sıra", "Soru No", "Kontrol alanı", "Kontrol", "Kritiklik", "θ", "Geliştirilecek boyut"],
      M.gaps.map(g => [{ c: String(g.rank), jc: "center" }, { c: String(g.no), jc: "center", b: true }, g.areaName, g.q, g.crit, { c: RPT.f1(g.theta), jc: "center", b: true }, g.weak.join("\n") || "—"]), { sz: 17 });
    noRef();
  } else p("Öncelikli iyileştirme gerektiren kontrol bulunmamaktadır.");
  if(M.strengths.length){
    table("Güçlü yanlar", [700, 2000, 5372, 1000], ["Soru No", "Kontrol alanı", "Kontrol", "θ"],
      M.strengths.map(s => [{ c: String(s.no), jc: "center", b: true }, s.areaName, s.q, { c: RPT.f1(s.theta), jc: "center", b: true }]), { sz: 17 });
  }

  /* 6. Değerlendirme notları (yalnız tespit varsa) */
  if(M.notes.length){
    h1("Değerlendirme Notları", { pageBreakBefore: true });
    p("Değerlendirme sırasında bazı yanıtlar arasında uyumsuzluklar görülmüştür. Bu durum çoğunlukla soruların farklı yorumlanmasından ya da yanıtların farklı birimlerce verilmesinden kaynaklanabilir. " +
      "Aşağıdaki hususların kurumunuzla birlikte teyit edilmesi önerilir.");
    table("Yanıtlar arasında görülen uyumsuzluklar", [450, 1500, 900, 4422, 1800], ["No", "Tür", "Soru No", "Görülen durum", "Değerlendirme"],
      M.notes.map((n, i) => [{ c: String(i + 1), jc: "center" }, n.kind, { c: n.nos.length ? n.nos.join(", ") : (n.area || "Genel"), jc: "center" }, n.text,
        n.decision + (n.note ? "\nNot: " + n.note : "") + (n.evidence ? "\nKurumun beyanı: " + n.evidence : "")]), { sz: 17 });
    noRef();
  }

  /* EK-1 */
  h1ek("EK-1 Soru / Cevap Tablosu");
  p("Her kontrol için boyut bazında seçilen seviye ve bu seviyeye karşılık gelen ifade aşağıda verilmiştir. «Kapsam dışı» boyutlar hesaplamaya katılmaz.");
  const rows = [];
  M.qs.forEach(q => q.axes.forEach((a, k) => {
    const first = k === 0;
    let lvl = a.na ? "Kapsam dışı" : String(a.orig > 0 ? a.orig : a.v);
    if(!a.na && a.eff != null && a.eff < (a.orig > 0 ? a.orig : a.v)) lvl += "\n(sınır " + RPT.f1(a.eff) + ")";
    const meta = [q.id + " · " + q.crit + " · Basamak " + q.ml];
    if(q.flagged) meta.push("İnceleme: " + (REVIEW_TXT[q.review] || "—") + (q.review === "override" ? " (" + q.overrideValue + "/5)" : ""));
    rows.push([
      { c: first ? String(q.no) : "", jc: "center", vMerge: first ? "restart" : "continue", vTop: true },
      { c: first ? [[{ t: q.areaName, b: true }], q.q, [{ t: meta.join("\n"), i: true }]] : "", vMerge: first ? "restart" : "continue", vTop: true },
      a.name, { c: lvl, jc: "center", b: !a.na }, a.text
    ]);
  }));
  out.push(CAP("Tablo " + (++tab) + " – Soru ve cevaplar"));
  out.push(TABLE([600, 3000, 1050, 1000, 3422], ["Soru No", "Kontrol alanı / Soru", "Boyut", "Seviye", "Seçilen ifade"], rows, { sz: 16 }));
  return { xml: out.join(""), toc };
}

/* ---------------- şablonu aç, gövdeyi yaz, paketle ---------------- */
async function generate(st, sub){
  if(typeof JSZip === "undefined") throw new Error("ZIP kütüphanesi yüklenemedi");
  try{ await Promise.all(["400", "600"].map(w => document.fonts.load(w + " 12px 'IBM Plex Sans'"))); }catch(e){}
  const M = buildReportModel(st, sub);
  const zip = await JSZip.loadAsync(REPORT_TEMPLATE_B64, { base64: true });
  const docXml = await zip.file("word/document.xml").async("string");
  const xdoc = new DOMParser().parseFromString(docXml, "application/xml");
  const body = xdoc.getElementsByTagNameNS(W_NS, "body")[0];
  const kids = Array.from(body.childNodes).filter(n => n.nodeType === 1);
  const ser = new XMLSerializer();
  const textOf = n => Array.from(n.getElementsByTagNameNS(W_NS, "t")).map(t => t.textContent).join("");
  const styleOf = n => { const s = n.getElementsByTagNameNS(W_NS, "pStyle")[0]; return s ? (s.getAttributeNS(W_NS, "val") || s.getAttribute("w:val")) : ""; };
  const titleIdx = kids.map((n, i) => ({ n, i })).filter(x => x.n.localName === "p" && styleOf(x.n) === "Title" && textOf(x.n).trim()).map(x => x.i);
  const ipIdx = kids.findIndex(n => textOf(n).trim() === "Fikri Mülkiyet Hakkı");
  const tocIdx = kids.findIndex(n => n.localName === "sdt");
  const sectIdx = kids.findIndex(n => n.localName === "p" && n.getElementsByTagNameNS(W_NS, "sectPr").length);
  if(!titleIdx.length || ipIdx < 0 || tocIdx < 0 || sectIdx < 0) throw new Error("rapor şablonunun yapısı beklenenden farklı");
  const firstSect = ser.serializeToString(kids[sectIdx].getElementsByTagNameNS(W_NS, "sectPr")[0]);
  const parts = [];
  for(let i = 0; i < titleIdx[0]; i++) parts.push(ser.serializeToString(kids[i]));
  ["Siber Güvenlik Olgunluk Değerlendirmesi", M.org + " — Değerlendirme Raporu"].forEach(t => parts.push(P(t, { style: "Title" })));
  parts.push(P(RPT.trDate(M.reportDate) + " · " + M.taxName, { jc: "center", sz: 22 }));
  for(let i = titleIdx[titleIdx.length - 1] + 2; i < ipIdx; i++) parts.push(ser.serializeToString(kids[i]));
  for(let i = ipIdx; i < tocIdx; i++) parts.push(ser.serializeToString(kids[i]));
  const imgs = ImageBag();
  const built = buildBody(M, imgs);
  parts.push(tocBlock(built.toc)); parts.push(built.xml); parts.push(firstSect);
  const bo = docXml.indexOf("<w:body>") + "<w:body>".length, bc = docXml.lastIndexOf("</w:body>");
  zip.file("word/document.xml", docXml.slice(0, bo) + parts.join("") + docXml.slice(bc));
  let rels = await zip.file("word/_rels/document.xml.rels").async("string");
  imgs.items.forEach(it => {
    zip.file("word/media/" + it.name, it.b64, { base64: true, createFolders: false });
    rels = rels.replace("</Relationships>", '<Relationship Id="' + it.rId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + it.name + '"/></Relationships>');
  });
  zip.file("word/_rels/document.xml.rels", rels);
  let ct = await zip.file("[Content_Types].xml").async("string");
  ct = ct.replace("application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");
  if(!/Extension="png"/i.test(ct)) ct = ct.replace("<Types ", "<Types ").replace(/(<Types[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>');
  zip.file("[Content_Types].xml", ct);
  let settings = await zip.file("word/settings.xml").async("string");
  if(!/<w:updateFields\b/.test(settings)){
    const anchor = settings.match(/<w:(hdrShapeDefaults|footnotePr|endnotePr|compat|docVars|rsids|mathPr|themeFontLang|clrSchemeMapping|doNotIncludeSubdocsInStats|shapeDefaults|decimalSymbol|listSeparator)\b/);
    settings = anchor ? settings.replace(anchor[0], '<w:updateFields w:val="true"/>' + anchor[0]) : settings.replace("</w:settings>", '<w:updateFields w:val="true"/></w:settings>');
  }
  zip.file("word/settings.xml", settings.replace(/<w:attachedTemplate [^>]*\/>/, ""));
  const core = zip.file("docProps/core.xml");
  if(core){
    let cx = await core.async("string");
    const title = "Siber Güvenlik Olgunluk Değerlendirmesi — " + M.org;
    cx = /<dc:title>[\s\S]*?<\/dc:title>/.test(cx) ? cx.replace(/<dc:title>[\s\S]*?<\/dc:title>/, "<dc:title>" + xe(title) + "</dc:title>") : cx.replace("</cp:coreProperties>", "<dc:title>" + xe(title) + "</dc:title></cp:coreProperties>");
    zip.file("docProps/core.xml", cx);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const name = "Olgunluk_Raporu_" + slug(M.org) + "_" + new Date().toISOString().slice(0, 10) + ".docx";
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return { name, size: blob.size, tables: (built.xml.match(/<w:tbl>/g) || []).length };
}

return { generate };
})();
