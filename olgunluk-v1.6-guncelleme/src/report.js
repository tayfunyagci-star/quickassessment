(function(){
"use strict";
/* =========================================================
   WORD (DOCX) RAPOR — dahili modül.
   Gömülü Template_v2.dotx şablonu açılır; kapak, fikri mülkiyet
   sayfası, üst/alt bilgi ve stiller korunur, gövde yeniden yazılır.
   Grafikler renkli (kritiklik renkleri), tablo ve metin siyah-beyaz.
========================================================= */
const C = window.QA_CORE;
const { DIM_KEYS, DIM_LABELS, OUT_OF_SCOPE } = C;

/* ---------------- Ortak biçimleyiciler ---------------- */
const f1 = v => v == null ? "—" : v.toFixed(1).replace(".", ",");
const trDate = d => d ? new Date(d).toLocaleDateString("tr-TR", { year:"numeric", month:"long", day:"numeric" }) : "—";
const LVL_HEX = { 1:"#C0334A", 2:"#E07B2E", 3:"#E3B620", 4:"#6FA83A", 5:"#1F8F5F" };
const NA_HEX = "#A3A9B3";
function lvlHex(v){ if(v == null) return NA_HEX; if(v < 2) return LVL_HEX[1]; if(v < 3) return LVL_HEX[2]; if(v < 4) return LVL_HEX[3]; if(v < 4.5) return LVL_HEX[4]; return LVL_HEX[5]; }
const PRIO_HEX = { "1. Öncelik":"#C0334A", "2. Öncelik":"#E07B2E", "3. Öncelik":"#E3B620", "Kabul":"#6FA83A" };

/* =========================================================
   GRAFİKLER (canvas → PNG)
========================================================= */
const RF = "Calibri, Carlito, 'Segoe UI', Arial, sans-serif";
const INK = "#1A2230", DIM_INK = "#4D5867", GRID = "#D5DAE1";
function mk(w, h){
  const k = 2, c = document.createElement("canvas");
  c.width = Math.round(w*k); c.height = Math.round(h*k);
  const g = c.getContext("2d"); g.scale(k,k);
  g.fillStyle = "#FFFFFF"; g.fillRect(0,0,w,h);
  g.textBaseline = "middle";
  return { c, g, w, h };
}
function font(g, size, bold){ g.font = `${bold ? "bold " : ""}${size}px ${RF}`; }
function png(cv){ return { b64: cv.c.toDataURL("image/png").split(",")[1], w: cv.w, h: cv.h }; }
function wrap(g, text, maxW){
  const words = String(text).split(" "), lines = []; let cur = "";
  words.forEach(w => { const t = cur ? cur + " " + w : w; if(g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; });
  if(cur) lines.push(cur);
  return lines;
}
function textOn(hex){ const n = parseInt(hex.slice(1),16), r=n>>16, gg=(n>>8)&255, b=n&255; return (0.299*r+0.587*gg+0.114*b) > 150 ? INK : "#FFFFFF"; }
function roundRect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

/* Genel puan ölçeği: 5 renkli bant + işaretçi + asgari çizgisi */
function chartScale(score, bandLabels){
  const cv = mk(760, 130), g = cv.g, x0 = 30, x1 = 730, y = 62, h = 26;
  const X = v => x0 + (v-1)/4*(x1-x0);
  const bands = [[1,2,1],[2,3,2],[3,4,3],[4,4.5,4],[4.5,5,5]];
  const short = { 1:"Geliştirilmesi Gereken", 2:"Başlangıç", 3:"Yeterli", 4:"İyi", 5:"Örnek" };
  bands.forEach(([a,b,l]) => { g.fillStyle = LVL_HEX[l]; g.fillRect(X(a), y, X(b)-X(a), h); });
  font(g, 11, false); g.fillStyle = DIM_INK; g.textAlign = "center";
  [1,2,3,4,5].forEach(v => g.fillText(String(v), X(v), y+h+12));
  font(g, 10.5, true);
  bands.forEach(([a,b,l]) => { g.fillStyle = textOn(LVL_HEX[l]); g.fillText(short[l], (X(a)+X(b))/2, y+h/2); });
  // asgari seviye
  g.strokeStyle = INK; g.lineWidth = 2; g.setLineDash([5,3]);
  g.beginPath(); g.moveTo(X(3), y-6); g.lineTo(X(3), y+h+4); g.stroke(); g.setLineDash([]);
  font(g, 10.5, true); g.fillStyle = INK; g.textAlign = "center"; g.fillText("Asgari seviye 3,0", X(3), y+h+30);
  if(score != null){
    const sx = X(score);
    g.fillStyle = INK; g.beginPath(); g.moveTo(sx, y-2); g.lineTo(sx-9, y-16); g.lineTo(sx+9, y-16); g.closePath(); g.fill();
    font(g, 17, true); g.fillStyle = INK; g.fillText(`Genel Puan: ${f1(score)}`, Math.min(Math.max(sx, x0+70), x1-70), y-32);
  }
  return png(cv);
}

/* Yatay çubuk grafik (1–5 ölçek, asgari çizgisi) */
function chartBars(items, opts){
  opts = opts || {};
  const rowH = opts.rowH || 30, labelW = opts.labelW || 250, top = 34, bottom = 30;
  const h = top + items.length*rowH + bottom;
  const cv = mk(760, h), g = cv.g, x0 = labelW + 16, x1 = 700;
  const X = v => x0 + (v-1)/4*(x1-x0);
  font(g, 10.5, false); g.fillStyle = DIM_INK; g.textAlign = "center";
  [1,2,3,4,5].forEach(v => {
    g.strokeStyle = GRID; g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), top-6); g.lineTo(X(v), top + items.length*rowH); g.stroke();
    g.fillText(String(v), X(v), top + items.length*rowH + 13);
  });
  items.forEach((it, i) => {
    const cy = top + i*rowH + rowH/2;
    font(g, 11.5, false); g.fillStyle = INK; g.textAlign = "right";
    const lines = wrap(g, it.label, labelW - 4);
    lines.slice(0,2).forEach((ln, li) => g.fillText(ln, labelW, cy + (li - (Math.min(lines.length,2)-1)/2)*13));
    if(it.value == null){
      font(g, 11, false); g.fillStyle = DIM_INK; g.textAlign = "left"; g.fillText("veri yok", x0 + 6, cy); return;
    }
    const bw = Math.max(3, X(it.value) - x0);
    g.fillStyle = it.color || lvlHex(it.value);
    roundRect(g, x0, cy - rowH*0.32, bw, rowH*0.64, 3); g.fill();
    font(g, 11.5, true); g.fillStyle = INK; g.textAlign = "left";
    g.fillText(f1(it.value) + (it.suffix ? "  " + it.suffix : ""), x0 + bw + 6, cy);
  });
  if(opts.threshold){
    const tx = X(opts.threshold);
    g.strokeStyle = INK; g.lineWidth = 1.6; g.setLineDash([5,3]);
    g.beginPath(); g.moveTo(tx, top-12); g.lineTo(tx, top + items.length*rowH); g.stroke(); g.setLineDash([]);
    font(g, 10.5, true); g.fillStyle = INK; g.textAlign = "center"; g.fillText("Asgari seviye 3,0", tx, top-20);
  }
  return png(cv);
}

/* Radar — kontrol alanları */
function chartRadar(perDomain){
  const W = 760, H = 600, cv = mk(W, H), g = cv.g, cx = W/2, cy = H/2 + 6, r = 190, n = perDomain.length;
  const ang = i => -Math.PI/2 + i*2*Math.PI/n;
  const P = (i, v) => [cx + r*(v/5)*Math.cos(ang(i)), cy + r*(v/5)*Math.sin(ang(i))];
  // asgari bölge (3) hafif vurgulu
  [1,2,3,4,5].forEach(l => {
    g.beginPath(); perDomain.forEach((_,i)=>{ const [x,y] = P(i,l); i ? g.lineTo(x,y) : g.moveTo(x,y); }); g.closePath();
    g.strokeStyle = l === 3 ? INK : GRID; g.lineWidth = l === 3 ? 1.4 : 1; if(l === 3) g.setLineDash([5,3]); g.stroke(); g.setLineDash([]);
  });
  perDomain.forEach((_,i)=>{ const [x,y] = P(i,5); g.strokeStyle = GRID; g.beginPath(); g.moveTo(cx,cy); g.lineTo(x,y); g.stroke(); });
  font(g, 9.5, false); g.fillStyle = DIM_INK; g.textAlign = "left";
  [1,2,3,4,5].forEach(l => g.fillText(String(l), cx + 3, cy - r*l/5 + 7));
  g.beginPath(); perDomain.forEach((d,i)=>{ const [x,y] = P(i, d.avg || 0); i ? g.lineTo(x,y) : g.moveTo(x,y); }); g.closePath();
  g.fillStyle = "rgba(13,148,136,0.18)"; g.fill(); g.strokeStyle = "#0D9488"; g.lineWidth = 2.4; g.stroke();
  perDomain.forEach((d,i)=>{ const [x,y] = P(i, d.avg || 0); g.beginPath(); g.arc(x,y,5,0,2*Math.PI); g.fillStyle = lvlHex(d.avg); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.stroke(); });
  perDomain.forEach((d,i)=>{
    const a = ang(i), lr = r + 30, x = cx + lr*Math.cos(a), y = cy + lr*Math.sin(a);
    g.textAlign = Math.cos(a) > 0.2 ? "left" : Math.cos(a) < -0.2 ? "right" : "center";
    font(g, 11, false);
    const lines = wrap(g, d.domain, 150);
    const lh = 13, total = lines.length + 1, startY = y - (total-1)*lh/2 + (Math.sin(a) > 0.5 ? 8 : Math.sin(a) < -0.5 ? -8 : 0);
    g.fillStyle = INK; lines.forEach((ln, li) => g.fillText(ln, x, startY + li*lh));
    font(g, 11, true); g.fillStyle = lvlHex(d.avg) === LVL_HEX[3] ? "#9C7A00" : lvlHex(d.avg);
    g.fillText(f1(d.avg), x, startY + lines.length*lh);
  });
  return png(cv);
}

/* Isı haritası — kontrol alanı × boyut */
function chartHeatmap(rows, cols){
  const labelW = 270, cellW = (760 - labelW - 10) / cols.length, rowH = 28, top = 34;
  const cv = mk(760, top + rows.length*rowH + 10), g = cv.g;
  font(g, 11.5, true); g.fillStyle = INK; g.textAlign = "center";
  cols.forEach((c, j) => g.fillText(c, labelW + j*cellW + cellW/2, top/2 + 2));
  rows.forEach((r, i) => {
    const y = top + i*rowH;
    font(g, 11, false); g.fillStyle = INK; g.textAlign = "right";
    const lines = wrap(g, r.label, labelW - 12);
    lines.slice(0,2).forEach((ln, li) => g.fillText(ln, labelW - 10, y + rowH/2 + (li - (Math.min(lines.length,2)-1)/2)*12));
    r.values.forEach((v, j) => {
      const x = labelW + j*cellW, hex = lvlHex(v);
      g.fillStyle = hex; g.fillRect(x + 2, y + 2, cellW - 4, rowH - 4);
      font(g, 12, true); g.fillStyle = v == null ? "#FFFFFF" : textOn(hex); g.textAlign = "center";
      g.fillText(v == null ? "—" : f1(v), x + cellW/2, y + rowH/2);
    });
  });
  return png(cv);
}

/* Risk matrisi — etki × olgunluk */
function chartRiskMatrix(perQuestion, impactLevels, priorityOf){
  const colsDef = [["< 2,0", v => v < 2], ["2,0 – 2,9", v => v >= 2 && v < 3], ["3,0 – 3,9", v => v >= 3 && v < 4], ["≥ 4,0", v => v >= 4]];
  const colSample = [1.5, 2.5, 3.5, 4.5];
  const rowsDef = [...impactLevels].reverse(); // en yüksek etki üstte
  const labelW = 150, top = 46, rowH = 58, cellW = (760 - labelW - 20) / colsDef.length;
  const cv = mk(760, top + rowsDef.length*rowH + 52), g = cv.g;
  font(g, 11.5, true); g.fillStyle = INK; g.textAlign = "center";
  g.fillText("Olgunluk puanı (soru bazında)", labelW + cellW*colsDef.length/2, 12);
  colsDef.forEach(([c], j) => { font(g, 11, true); g.fillText(c, labelW + j*cellW + cellW/2, top - 14); });
  rowsDef.forEach((imp, i) => {
    const y = top + i*rowH;
    font(g, 11.5, true); g.fillStyle = INK; g.textAlign = "right"; g.fillText(imp, labelW - 10, y + rowH/2);
    colsDef.forEach(([_, test], j) => {
      const x = labelW + j*cellW;
      const pr = priorityOf(imp, colSample[j]) || "Kabul";
      const hex = PRIO_HEX[pr];
      const count = perQuestion.filter(p => p.q.etki === imp && test(p.level)).length;
      g.fillStyle = hex; g.globalAlpha = count ? 1 : 0.35; g.fillRect(x + 3, y + 3, cellW - 6, rowH - 6); g.globalAlpha = 1;
      g.fillStyle = textOn(hex); g.textAlign = "center";
      font(g, 20, true); g.fillText(String(count), x + cellW/2, y + rowH/2 - 6);
      font(g, 10, false); g.fillText(pr === "Kabul" ? "Asgari üstü" : pr, x + cellW/2, y + rowH/2 + 14);
    });
  });
  g.save(); g.translate(16, top + rowsDef.length*rowH/2); g.rotate(-Math.PI/2); font(g, 11.5, true); g.fillStyle = INK; g.textAlign = "center"; g.fillText("Etki seviyesi", 0, 0); g.restore();
  // açıklama
  const ly = top + rowsDef.length*rowH + 26; let lx = labelW;
  [["1. Öncelik","1. Öncelik"],["2. Öncelik","2. Öncelik"],["3. Öncelik","3. Öncelik"],["Kabul","Asgari seviye ve üstü"]].forEach(([k, t]) => {
    g.fillStyle = PRIO_HEX[k]; g.fillRect(lx, ly - 7, 14, 14); font(g, 11, false); g.fillStyle = INK; g.textAlign = "left";
    g.fillText(t, lx + 20, ly); lx += 30 + g.measureText(t).width + 26;
  });
  return png(cv);
}

/* Yanıt durumu — halka grafik */
function chartStatusDonut(counts){
  const parts = [["Tam Yanıtlandı","#1F8F5F"],["Kısmen Yanıtlandı","#E3B620"],["Yanıtlanmadı","#C0334A"],["Kapsam Dışı","#A3A9B3"]];
  const total = parts.reduce((s,[k]) => s + (counts[k]||0), 0) || 1;
  const cv = mk(760, 260), g = cv.g, cx = 190, cy = 130, R = 105, r0 = 62;
  let a = -Math.PI/2;
  parts.forEach(([k, col]) => {
    const v = counts[k] || 0; if(!v) return;
    const a2 = a + v/total*2*Math.PI;
    g.beginPath(); g.arc(cx, cy, R, a, a2); g.arc(cx, cy, r0, a2, a, true); g.closePath(); g.fillStyle = col; g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke(); a = a2;
  });
  font(g, 26, true); g.fillStyle = INK; g.textAlign = "center"; g.fillText(String(total), cx, cy - 6);
  font(g, 11, false); g.fillStyle = DIM_INK; g.fillText("soru", cx, cy + 16);
  parts.forEach(([k, col], i) => {
    const y = 70 + i*36;
    g.fillStyle = col; g.fillRect(360, y - 9, 18, 18);
    font(g, 13, false); g.fillStyle = INK; g.textAlign = "left"; g.fillText(k, 388, y);
    font(g, 13, true); g.textAlign = "right"; g.fillText(`${counts[k]||0}  (%${Math.round((counts[k]||0)/total*100)})`, 700, y);
  });
  return png(cv);
}

/* =========================================================
   WordprocessingML üreticileri
========================================================= */
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const TEXT_W = 9072; // A4, 2,5 cm kenar boşlukları (twip)
function xe(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function runs(content, base){
  base = base || {};
  const segs = Array.isArray(content) ? content : [{ t: content }];
  return segs.map(s => {
    if(typeof s === "string") s = { t: s };
    const b = s.b ?? base.b, i = s.i ?? base.i, sz = s.sz ?? base.sz;
    const rPr = (b ? "<w:b/><w:bCs/>" : "") + (i ? "<w:i/><w:iCs/>" : "") + (sz ? `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>` : "");
    const parts = String(s.t == null ? "" : s.t).split("\n");
    return parts.map((t, k) => `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ""}${k ? "<w:br/>" : ""}<w:t xml:space="preserve">${xe(t)}</w:t></w:r>`).join("");
  }).join("");
}
function P(content, o){
  o = o || {};
  let pPr = "";
  if(o.style) pPr += `<w:pStyle w:val="${o.style}"/>`;
  if(o.keepNext) pPr += "<w:keepNext/>";
  if(o.pageBreakBefore) pPr += "<w:pageBreakBefore/>";
  if(o.noNum) pPr += `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="0"/></w:numPr>`;
  if(o.spacing) pPr += `<w:spacing ${o.spacing}/>`;
  if(o.jc) pPr += `<w:jc w:val="${o.jc}"/>`;
  return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ""}${runs(content, o)}</w:p>`;
}
const H1 = (t, o) => P(t, Object.assign({ style:"Heading1" }, o||{}));
const H2 = (t, o) => P(t, Object.assign({ style:"Heading2" }, o||{}));
const H3 = (t, o) => P(t, Object.assign({ style:"Heading3" }, o||{}));
const BUL = t => P(t, { style:"Bullet" });
const CAP = t => P(t, { style:"Caption", keepNext:true });
const CAP_BELOW = t => P(t, { style:"Caption", jc:"center" });

/* Tablo: siyah-beyaz, Table Grid, başlık satırı D9D9D9 + kalın + tekrar */
function TABLE(widths, header, rows, o){
  o = o || {};
  const total = widths.reduce((a,b)=>a+b,0);
  const sz = o.sz || 18;
  const cell = (c, w, isHead) => {
    if(c == null || typeof c !== "object" || Array.isArray(c)) c = { c };
    let tcPr = `<w:tcW w:w="${c.span ? c.spanW : w}" w:type="dxa"/>`;
    if(c.span) tcPr += `<w:gridSpan w:val="${c.span}"/>`;
    if(c.vMerge) tcPr += c.vMerge === "restart" ? `<w:vMerge w:val="restart"/>` : `<w:vMerge/>`;
    if(isHead) tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>`;
    tcPr += `<w:vAlign w:val="${c.vTop ? "top" : "center"}"/>`;
    const content = c.c == null ? "" : c.c;
    const paras = (Array.isArray(content) && content.length && Array.isArray(content[0])) ? content : [content];
    const ps = paras.map(pc => `<w:p><w:pPr><w:spacing w:before="20" w:after="20"/><w:jc w:val="${c.jc || "left"}"/></w:pPr>${runs(pc, { b: isHead || c.b, sz, i: c.i })}</w:p>`).join("");
    return `<w:tc><w:tcPr>${tcPr}</w:tcPr>${ps}</w:tc>`;
  };
  const tr = (cells, isHead) => {
    let wi = 0, out = "";
    cells.forEach(c => {
      const span = (c && typeof c === "object" && c.span) ? c.span : 1;
      const w = widths.slice(wi, wi+span).reduce((a,b)=>a+b,0);
      if(span > 1) c.spanW = w;
      out += cell(c, w, isHead); wi += span;
    });
    return `<w:tr><w:trPr><w:cantSplit/>${isHead ? "<w:tblHeader/>" : ""}</w:trPr>${out}</w:tr>`;
  };
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="${total}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="85" w:type="dxa"/><w:right w:w="85" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>`
    + `<w:tblGrid>${widths.map(w=>`<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>`
    + (header ? tr(header, true) : "") + rows.map(r => tr(r, false)).join("") + `</w:tbl>` + P("", { spacing:'w:before="0" w:after="60"', sz: 8 });
}

/* Görsel yöneticisi */
function ImageBag(){
  const items = []; let docPr = 100;
  return {
    items,
    add(img, widthCm){
      const idx = items.length + 1, rId = "rIdQaImg" + idx, name = `qa_chart${idx}.png`;
      items.push({ rId, name, b64: img.b64 });
      const cx = Math.round(widthCm * 360000), cy = Math.round(cx * img.h / img.w), id = ++docPr;
      return `<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="Grafik ${idx}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
    },
  };
}

/* İçindekiler (alan kodu; Word açılışta günceller) */
function tocBlock(entries){
  const cached = entries.map(e => `<w:p><w:pPr><w:pStyle w:val="TOC${e.level}"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="${TEXT_W}"/></w:tabs></w:pPr>${runs(e.text)}</w:p>`).join("");
  return `<w:sdt><w:sdtPr><w:docPartObj><w:docPartGallery w:val="Table of Contents"/><w:docPartUnique/></w:docPartObj></w:sdtPr><w:sdtContent>`
    + `<w:p><w:pPr><w:pStyle w:val="TOCHeading"/><w:pageBreakBefore/></w:pPr>${runs("İçindekiler")}</w:p>`
    + `<w:p><w:pPr><w:pStyle w:val="TOC1"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="${TEXT_W}"/></w:tabs></w:pPr><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r></w:p>`
    + cached
    + `<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`
    + `</w:sdtContent></w:sdt>`;
}

/* =========================================================
   RAPOR İÇERİĞİ
========================================================= */
function buildBody(A, res, K, imgs){
  const qs = A.questions, ans = A.answers;
  const qNo = {}; qs.forEach((q, i) => { qNo[q.id] = i + 1; });   // EK-1 numaralandırması
  const org = A.orgName || "Kurum";
  const B = K.BAND_LABELS;
  const bandTxt = v => v == null ? "—" : B[K.bandOf(v)];
  const out = [], toc = [];
  let h1n = 0, h2n = 0, fig = 0, tab = 0;
  const h1 = (t, o) => { h1n++; h2n = 0; toc.push({ level:1, text:`${h1n}. ${t}` }); out.push(H1(t, o)); };
  const h1ek = (t) => { toc.push({ level:1, text:t }); out.push(H1(t, { noNum:true, pageBreakBefore:true })); };
  const h2 = (t) => { h2n++; toc.push({ level:2, text:`${h1n}.${h2n}. ${t}` }); out.push(H2(t)); };
  const p = (c, o) => out.push(P(c, o));
  const figure = (img, title, cm) => { fig++; out.push(imgs.add(img, cm || 16)); out.push(CAP_BELOW(`Şekil ${fig} – ${title}`)); };
  const table = (title, widths, header, rows, o) => { tab++; out.push(CAP(`Tablo ${tab} – ${title}`)); out.push(TABLE(widths, header, rows, o)); };

  const nDomains = new Set(qs.map(q=>q.domain)).size;
  const comp = res.completion;
  const statusCounts = { "Tam Yanıtlandı":comp.fullyAnswered, "Kısmen Yanıtlandı":comp.partiallyAnswered, "Yanıtlanmadı":comp.fullyUnanswered, "Kapsam Dışı":comp.outOfScope };
  const incomplete = comp.partiallyAnswered + comp.fullyUnanswered > 0;
  const gaps = res.allGaps;
  const prioCount = k => gaps.filter(g => g.priority === k).length;
  const dimAvg = d => (res.perDim.find(x=>x.dim===d)||{}).avg;
  const domSorted = [...res.perDomain].filter(d=>d.avg!=null).sort((a,b)=>b.avg-a.avg);
  const regFail = res.perReg.filter(r => r.avg != null && !r.passed), regPass = res.perReg.filter(r => r.passed);

  /* ---------- 1. Doküman Hakkında ve Sorumluluk Reddi ---------- */
  h1("Doküman Hakkında ve Sorumluluk Reddi", { pageBreakBefore:true });
  h2("Doküman Hakkında");
  p(`Bu rapor, ${org} tarafından doldurulan Hızlı Siber Güvenlik Olgunluk Değerlendirmesi anketinin sonuçlarını özetler. Değerlendirme ${qs.length} soru ve ${nDomains} kontrol alanından oluşur; her soru İnsan, Süreç ve Teknoloji boyutlarında ayrı ayrı yanıtlanmıştır.`);
  const qsetTxt = { match:"Doğrulandı — güncel soru setiyle birebir aynı", issued:"Doğrulandı — gönderilen müşteri modülünün kayıtlı soru seti", snapshot:"Dosyadaki soru seti kullanıldı; mevzuat eşlemesi kısmi", legacy:"v1.0 dosyası — soru numarası üzerinden eşleştirildi", "legacy-mismatch":"Doğrulanamadı — soru seti uyuşmazlığı" }[(A.meta.qset||{}).status] || "—";
  table("Değerlendirme bilgileri", [3000, 6072], null, [
    [{c:"Kurum", b:true}, org],
    [{c:"Değerlendirme türü", b:true}, "Öz değerlendirme (kurum beyanı)"],
    [{c:"Yanıt tarihi", b:true}, trDate(A.meta.submittedAt)],
    [{c:"Rapor tarihi", b:true}, trDate(new Date())],
    [{c:"Kapsam", b:true}, `${qs.length} soru · ${nDomains} kontrol alanı · 3 boyut (İnsan, Süreç, Teknoloji)`],
    [{c:"Yanıt durumu", b:true}, `${comp.fullyAnswered} tam, ${comp.partiallyAnswered} kısmen, ${comp.fullyUnanswered} yanıtlanmamış, ${comp.outOfScope} kapsam dışı soru`],
    [{c:"Soru seti doğrulaması", b:true}, qsetTxt],
    [{c:"Uygulama sürümü", b:true}, `Rapor: v${C.APP_VERSION} · Yanıt dosyası: v${A.meta.fileVersion || "—"}`],
  ], { sz: 20 });
  h2("Veri Gizliliği");
  p("Bu değerlendirme kapsamında kurumunuz tarafından paylaşılan yanıtlar ve kurumsal bilgiler gizlilik esasıyla ele alınmıştır:");
  out.push(BUL([{t:"Şifreli iletim: ", b:true}, "Yanıtlar kurumunuzun kendi cihazında AES-256 algoritmasıyla şifrelenmiş; dosya ve şifresi birbirinden ayrı kanallarla iletilmiştir."]));
  out.push(BUL([{t:"Yerel işleme: ", b:true}, "Analiz ve raporlama, internet bağlantısı kurmayacak şekilde kısıtlanmış ve yalnızca yerel bilgisayarda çalışan bir uygulama ile gerçekleştirilmiştir."]));
  out.push(BUL([{t:"Yapay zekâ platformları: ", b:true}, "Kurumsal bilgiler hiçbir yapay zekâ platformuna, bulut tabanlı analiz servisine veya harici sisteme aktarılmamıştır."]));
  out.push(BUL([{t:"Üçüncü kişiler: ", b:true}, "Bilgiler üçüncü kişilerle paylaşılmamış; yalnızca bu raporun hazırlanması amacıyla kullanılmıştır."]));
  h2("Sorumluluk Reddi");
  p("Bu rapor, kurum personeli tarafından verilen öz değerlendirme yanıtlarına dayanır. Yanıtlar bağımsız teknik doğrulama, sızma testi, kanıt incelemesi veya yerinde denetimle teyit edilmemiştir. Bulgu ve puanların doğruluğu, kurumun beyan ettiği bilgilerin doğruluğu ve güncelliği ile sınırlıdır.");
  p("Rapor, değerlendirmenin yapıldığı tarihteki durumu yansıtır ve kurumun siber güvenlik durumuna ilişkin bir garanti, sertifika veya güvence teşkil etmez. Regülatif uyum bölümünde yer alan göstergeler yönlendirici niteliktedir; ilgili mevzuat veya standarda uyum konusunda hukuki görüş ya da denetim sonucu yerine geçmez.");
  p("Rapor yalnızca adı geçen kurumun iç kullanımı için hazırlanmıştır. Nihai yatırım ve önceliklendirme kararlarından önce kapsamlı bir bağımsız değerlendirme yapılması önerilir.");

  /* ---------- 2. Yönetici Özeti ---------- */
  h1("Yönetici Özeti", { pageBreakBefore:true });
  const overall = res.overall;
  p([ `${org} için hesaplanan genel siber güvenlik olgunluk puanı 5 üzerinden `, { t:f1(overall), b:true }, ` olup “${bandTxt(overall)}” bandındadır. Bu değer, asgari seviye olarak kabul edilen 3,0’ın `,
      { t: overall == null ? "—" : (overall >= K.TARGET_LEVEL ? "üzerindedir" : "altında kalmaktadır"), b:true }, "." ]);
  figure(chartScale(overall, B), "Genel olgunluk puanının ölçekteki yeri");
  table("Özet göstergeler", [4272, 1600, 3200], ["Gösterge", "Değer", "Seviye / Durum"], [
    ["Genel olgunluk puanı", {c:f1(overall), jc:"center", b:true}, bandTxt(overall)],
    ...DIM_KEYS.map(d => [`${DIM_LABELS[d]} boyutu`, {c:f1(dimAvg(d)), jc:"center"}, bandTxt(dimAvg(d))]),
    ["Asgari seviyenin (3,0) altındaki kontrol sayısı", {c:String(gaps.length), jc:"center"}, `${res.perQuestion.length} değerlendirilen kontrolden`],
    ["1. / 2. öncelikli gelişim alanı", {c:`${prioCount(K.P1)} / ${prioCount(K.P2)}`, jc:"center"}, "Bkz. Bölüm 5"],
    ["Asgari uyum sinyali sağlanan mevzuat", {c:`${regPass.length} / ${res.perReg.length}`, jc:"center"}, regFail.length ? `Geliştirilecek: ${regFail.map(r=>K.REG_LABELS_SHORT[r.fw]).join(", ")}` : "Tümü sağlanıyor"],
  ], { sz: 20 });
  p("Öne çıkan bulgular", { b:true, keepNext:true, spacing:'w:before="120" w:after="60"' });
  const strong = domSorted.filter(d => d.avg >= K.TARGET_LEVEL).slice(0,3);
  out.push(BUL(strong.length ? [ {t:"Güçlü alanlar: ", b:true}, strong.map(d=>`${d.domain} (${f1(d.avg)})`).join(", ") + "." ]
                             : [ {t:"Güçlü alanlar: ", b:true}, "Asgari seviyeye ulaşan kontrol alanı bulunmamaktadır." ]));
  const weak = [...domSorted].reverse().filter(d => d.avg < K.TARGET_LEVEL);
  if(weak.length) out.push(BUL([ {t:"Geliştirilmesi önerilen alanlar: ", b:true}, `${weak.length} kontrol alanı henüz asgari seviyeye ulaşmamıştır; öncelikle ele alınabilecek alanlar ` + weak.slice(0,4).map(d=>`${d.domain} (${f1(d.avg)})`).join(", ") + "." ]));
  const dimList = DIM_KEYS.map(d => ({ d, v: dimAvg(d) })).filter(x => x.v != null).sort((a,b)=>a.v-b.v);
  if(dimList.length){
    const lo = dimList[0], hi = dimList[dimList.length-1];
    out.push(BUL([ {t:"Boyutlar: ", b:true}, `En düşük olgunluk ${DIM_LABELS[lo.d]} (${f1(lo.v)}), en yüksek ${DIM_LABELS[hi.d]} (${f1(hi.v)}) boyutundadır.` + (hi.v - lo.v >= 0.5 ? ` Aradaki ${f1(hi.v-lo.v)} puanlık fark, ${DIM_LABELS[lo.d].toLocaleLowerCase("tr-TR")} boyutunda yapılacak iyileştirmelerin diğer boyutlardaki kazanımları güçlendireceğini göstermektedir.` : " Boyutlar birbirine yakın seyretmektedir.") ]));
  }
  if(res.perReg.length) out.push(BUL([ {t:"Regülasyon: ", b:true}, regFail.length ? `Değerlendirilen ${res.perReg.length} çerçeveden ${regFail.length} tanesinde asgari uyum seviyesine henüz ulaşılmamıştır (${regFail.map(r=>`${K.REG_LABELS_SHORT[r.fw]}: ${f1(r.avg)}, ${r.gaps.length} kontrol eşik altında`).join("; ")}).` : "Tüm çerçevelerde asgari uyum sinyali sağlanmaktadır." ]));
  out.push(BUL([ {t:"Öncelikli gelişim alanları: ", b:true}, gaps.length ? `${gaps.length} kontrolün asgari seviyeye ulaştırılması önerilmektedir; 1. öncelik sınıfında ${prioCount(K.P1)}, 2. öncelik sınıfında ${prioCount(K.P2)} kontrol bulunmaktadır. İlk ele alınması önerilenler: ` + gaps.slice(0,3).map(g => `${g.q.domain} – ${g.q.soru.replace(/\?$/,"")} (${qNo[g.q.id]}. soru)`).join("; ") + "." : "Asgari seviyenin altında kontrol bulunmamaktadır." ]));
  if(res.notes && res.notes.length) out.push(BUL([ {t:"Değerlendirme notları: ", b:true}, `Bazı yanıtlar arasında uyumsuzluklar görülmüştür (${res.notes.length} not). Bu hususların kurumunuzla birlikte teyit edilmesi, sonuçların doğruluğunu artıracaktır (Bölüm 6).` ]));
  if(incomplete) out.push(BUL([ {t:"Yanıtlanmayan sorular: ", b:true}, `${comp.partiallyAnswered} soru kısmen yanıtlanmış, ${comp.fullyUnanswered} soru yanıtlanmamıştır. Yanıtlanmayan boyutlar en düşük seviye (1) kabul edildiğinden puanlar gerçek durumdan düşük olabilir (EK-2).` ]));

  /* ---------- 3. Metodoloji ---------- */
  h1("Metodoloji", { pageBreakBefore:true });
  h2("Değerlendirme Yaklaşımı");
  p(`Değerlendirme, ${nDomains} kontrol alanına dağılmış ${qs.length} sorudan oluşan bir öz değerlendirmedir. Her soru, kontrolün kurumdaki karşılığını üç bağımsız boyutta ölçer: İnsan (farkındalık, sahiplik, yetkinlik), Süreç (tanımlı ve uygulanan prosedürler) ve Teknoloji (destekleyen teknik araç ve yapılandırmalar). Yanıt veren, her boyut için kurumu bugün en iyi tanımlayan ifadeyi 1–5 arasındaki seviyelerden seçer.`);
  p("Soru puanları, kontrolün etki seviyesine göre ağırlıklandırılarak boyut, kontrol alanı, mevzuat ve genel puana dönüştürülür. Böylece yüksek etkili bir kontroldeki eksiklik sonuca daha fazla yansır.");
  h2("Olgunluk Seviyeleri");
  table("Olgunluk seviyeleri ve anlamları", [900, 1300, 1900, 4972], ["Seviye", "Puan aralığı", "Tanım", "Anlamı"], [
    [{c:"1", jc:"center", b:true}, {c:"1,0 – 1,9", jc:"center"}, B[1], "Kontrol tanımlı değildir ya da kişilere bağlı, plansız ve tekrarlanamaz biçimde uygulanır."],
    [{c:"2", jc:"center", b:true}, {c:"2,0 – 2,9", jc:"center"}, B[2], "İhtiyaç bilinmektedir; uygulama kısmi ve gayriresmidir, dokümantasyon ve sahiplik eksiktir."],
    [{c:"3", jc:"center", b:true}, {c:"3,0 – 3,9", jc:"center"}, B[3], "Kontrol tanımlı, dokümante edilmiş ve kurum genelinde uygulanmaktadır. Asgari beklenen seviyedir."],
    [{c:"4", jc:"center", b:true}, {c:"4,0 – 4,4", jc:"center"}, B[4], "Kontrolün etkinliği düzenli olarak ölçülür, izlenir ve yönetime raporlanır."],
    [{c:"5", jc:"center", b:true}, {c:"4,5 – 5,0", jc:"center"}, B[5], "Kontrol sürekli iyileştirilir, otomasyonla desteklenir ve iyi uygulamalarla uyumludur."],
  ], { sz: 20 });
  h2("Asgari Seviye ve Regülatif Uyum Sinyali");
  p([ {t:"Asgari seviye 3,0’dır (Yeterli Seviye). ", b:true}, "Bu seviye, kontrolün tanımlı ve kurum genelinde uygulanır olduğunu ifade eder. Puanı 3,0’ın altında kalan her kontrol bir gelişim alanı olarak değerlendirilir ve bir öncelik sınıfına atanır." ]);
  p([ "Sorular, ilgili oldukları mevzuat ve standart maddeleriyle (7545 Sayılı Siber Güvenlik Kanunu, BİGR, KVKK, ISO/IEC 27001) eşleştirilmiştir. Bir çerçeve için ", {t:"“Asgari Uyum Sağlanıyor”", b:true}, " sonucu, o çerçeveyle ilişkili kontrollerin hem ortalamasının hem de her birinin ayrı ayrı 3,0 ve üzerinde olmasını gerektirir. Bu sonuç yönlendirici bir sinyaldir; uyum denetimi veya hukuki görüş yerine geçmez." ]);
  h2("Etki Seviyeleri ve Önceliklendirme");
  table("Etki seviyeleri", [2300, 6772], ["Etki seviyesi", "Anlamı"], [
    ["Çok Yüksek Etki", "Kontroldeki bir eksiklik, kurumun temel faaliyetlerini veya yasal yükümlülüklerini doğrudan etkileyebilir."],
    ["Yüksek Etki", "Operasyonel, finansal veya itibari açıdan önemli sonuçlar doğurabilir."],
    ["Orta Etki", "Sınırlı ve yönetilebilir düzeyde etki doğurur."],
    ["Düşük Etki", "Kurum üzerindeki etkisi düşüktür."],
  ], { sz: 20 });
  table("Öncelik sınıfları", [1500, 7572], ["Öncelik", "Ölçüt (yalnızca puanı 3,0’ın altında kalan kontroller)"], [
    [{c:"1. Öncelik", b:true}, "Çok Yüksek veya Yüksek etkili kontrol, puanı 2,0’ın altında."],
    [{c:"2. Öncelik", b:true}, "Çok Yüksek veya Yüksek etkili kontrol, puanı 2,0 – 2,9 aralığında; ya da Orta etkili kontrol, puanı 2,0’ın altında."],
    [{c:"3. Öncelik", b:true}, "Asgari seviyenin altında kalan diğer kontroller."],
  ], { sz: 20 });
  h2("Tanımlar");
  table("Tanımlar", [2300, 6772], ["Terim", "Tanım"], [
    ["Kontrol alanı", "Benzer güvenlik hedeflerine hizmet eden kontrollerin gruplandığı alan (ör. Kimlik ve Erişim Yönetimi)."],
    ["Boyut", "Bir kontrolün İnsan, Süreç veya Teknoloji açısından olgunluğu. Boyutlar birbirinden bağımsız yanıtlanır."],
    ["Olgunluk puanı", "1–5 arası, etki seviyesine göre ağırlıklandırılmış ortalama. Ondalıklı puan, Tablo 3’teki puan aralıklarına göre bir seviyeye karşılık gelir."],
    ["Kapsam Dışı", "Yanıt verenin kurum için geçerli olmadığını belirttiği boyut. Hesaplamalara dahil edilmez."],
    ["Yanıtlanmamış", "Seviye seçilmemiş boyut. İhtiyatlılık gereği en düşük seviye (1) kabul edilir."],
    ["Uygulanamaz", "Soru tasarımı gereği ilgili boyutu bulunmayan durum."],
    ["Öncelikli gelişim alanı", "Puanı asgari seviyenin altında kalan kontrol; etki seviyesine göre 1., 2. veya 3. öncelik sınıfına atanır."],
    ["Değerlendirme notu", "Yanıtlar arasında görülen ve kurumla birlikte teyit edilmesi önerilen uyumsuzluk (ör. bir konunun kapsam dışı belirtilip ilgili başka bir soruda uygulandığının belirtilmesi)."],
    ["Regülatif uyum sinyali", "Bir mevzuat veya standartla ilişkili kontrollerin asgari seviyeyi sağlayıp sağlamadığına dair yönlendirici gösterge."],
  ], { sz: 20 });

  /* ---------- 4. Olgunluk Değerlendirmesi ---------- */
  h1("Olgunluk Değerlendirmesi", { pageBreakBefore:true });
  h2("İnsan, Süreç ve Teknoloji Boyutları");
  if(dimList.length){
    const lo = dimList[0], hi = dimList[dimList.length-1];
    p(`Boyut bazında en yüksek olgunluk ${DIM_LABELS[hi.d]} (${f1(hi.v)}), en düşük olgunluk ${DIM_LABELS[lo.d]} (${f1(lo.v)}) boyutundadır. ${res.perDim.filter(d=>d.avg!=null && d.avg < K.TARGET_LEVEL).length ? "Asgari seviyenin altında kalan boyutlar, kontrollerin kurum geneline yaygınlaştırılmasında gelişim alanı bulunduğunu göstermektedir." : "Tüm boyutlar asgari seviyenin üzerindedir."}`);
  }
  figure(chartBars(DIM_KEYS.map(d => ({ label: DIM_LABELS[d], value: dimAvg(d) })), { threshold: K.TARGET_LEVEL, rowH: 40, labelW: 150 }), "Boyut bazında olgunluk puanları");
  table("Boyut bazında sonuçlar", [2272, 1400, 2700, 2700], ["Boyut", "Puan", "Seviye", "Asgari altı soru"], res.perDim.map(d => [
    DIM_LABELS[d.dim], {c:f1(d.avg), jc:"center", b:true}, bandTxt(d.avg), {c:`${d.below} / ${d.count}`, jc:"center"},
  ]), { sz: 20 });

  h2("Kontrol Alanları");
  p(`${res.perDomain.length} kontrol alanından ${res.perDomain.filter(d=>d.avg!=null && d.avg >= K.TARGET_LEVEL).length} tanesi asgari seviyede veya üzerindedir.` + (domSorted.length ? ` En yüksek puan ${domSorted[0].domain} (${f1(domSorted[0].avg)}), en düşük puan ${domSorted[domSorted.length-1].domain} (${f1(domSorted[domSorted.length-1].avg)}) alanındadır.` : "") + " Kesikli çizgi asgari seviyeyi (3,0) gösterir.");
  figure(chartRadar(res.perDomain), "Kontrol alanlarının olgunluk profili", 15);
  const heatRows = [...res.perDomain].sort((a,b)=>(a.avg??9)-(b.avg??9)).map(d => ({
    label: d.domain, values: [...DIM_KEYS.map(k => (res.perDomainByMetric[k].find(x=>x.domain===d.domain)||{}).avg), d.avg],
  }));
  figure(chartHeatmap(heatRows, ["İnsan", "Süreç", "Teknoloji", "Genel"]), "Kontrol alanı × boyut ısı haritası (düşükten yükseğe)");
  table("Kontrol alanı bazında sonuçlar", [3172, 900, 1000, 1000, 1000, 900, 1100], ["Kontrol alanı", "Soru", "İnsan", "Süreç", "Teknoloji", "Genel", "Seviye"],
    heatRows.map(r => { const d = res.perDomain.find(x=>x.domain===r.label); return [r.label, {c:String(d.total), jc:"center"}, ...r.values.slice(0,3).map(v=>({c:f1(v), jc:"center"})), {c:f1(r.values[3]), jc:"center", b:true}, bandTxt(r.values[3])]; }),
    { sz: 18 });

  h2("Regülasyon Alanları");
  if(!res.perReg.length){
    p("Soru setinde mevzuat eşlemesi bulunmadığından regülatif değerlendirme yapılamamıştır.");
  } else {
    p("Aşağıdaki göstergeler, ilgili çerçeveyle eşleştirilmiş kontrollerin ağırlıklı ortalamasını ve asgari eşiğin altında kalan kontrol sayısını gösterir.");
    figure(chartBars(res.perReg.map(r => ({ label: K.REG_LABELS[r.fw], value: r.avg })), { threshold: K.TARGET_LEVEL, rowH: 38, labelW: 280 }), "Mevzuat / standart bazında olgunluk");
    table("Regülatif uyum sinyali", [3172, 1300, 1000, 1300, 2300], ["Mevzuat / standart", "İlgili kontrol", "Puan", "Eşik altı", "Durum"], res.perReg.map(r => [
      K.REG_LABELS[r.fw], {c:`${r.answered} / ${r.touched}`, jc:"center"}, {c:f1(r.avg), jc:"center", b:true}, {c:String(r.gaps.length), jc:"center"},
      {c: r.avg == null ? "Veri yok" : (r.passed ? "Asgari uyum sağlanıyor" : "Asgari uyum seviyesine henüz ulaşılmadı"), b:true},
    ]), { sz: 20 });
    const fws = res.perReg.map(r => r.fw);
    const regGapQs = gaps.filter(g => g.q.regulatory && fws.some(fw => g.q.regulatory[fw]));
    if(regGapQs.length){
      p(`Asgari eşiğin altında kalan ve en az bir çerçeveyle ilişkili ${regGapQs.length} kontrol, ilgili maddeleriyle birlikte aşağıda listelenmiştir. Bu kontrollerde yapılacak iyileştirmeler birden fazla çerçevedeki uyum seviyesini aynı anda yükseltecektir.`);
      const fwW = Math.floor(3672 / fws.length);
      table("Mevzuat ile ilişkili asgari eşik altı kontroller", [600, 1350, 2850, 600, ...fws.map((_,i)=> i === fws.length-1 ? 3672 - fwW*(fws.length-1) : fwW)],
        ["Soru No", "Kontrol alanı", "Kontrol", "Puan", ...fws.map(fw => K.REG_LABELS_SHORT[fw])],
        regGapQs.map(g => [ {c:String(qNo[g.q.id]), jc:"center", b:true}, g.q.domain, g.q.soru, {c:f1(g.level), jc:"center", b:true}, ...fws.map(fw => ({ c:(g.q.regulatory[fw]||[]).join(", ") || "—", jc:"center" })) ]),
        { sz: 16 });
      p("Soru No, EK-1 Soru / Cevap Tablosu’ndaki numaralandırmayı esas alır.", { i:true, sz: 18 });
    }
  }

  /* ---------- 5. Öncelikli Risk Alanları ---------- */
  h1("Öncelikli Risk Alanları", { pageBreakBefore:true });
  p(`Puanı asgari seviyenin (3,0) altında kalan ${gaps.length} kontrol, etki seviyesi ve olgunluk düzeyi birlikte dikkate alınarak önceliklendirilmiştir: ${prioCount(K.P1)} kontrol 1. öncelik, ${prioCount(K.P2)} kontrol 2. öncelik, ${prioCount(K.P3)} kontrol 3. öncelik sınıfındadır. Risk matrisinde her hücre, ilgili etki seviyesi ve puan aralığındaki kontrol sayısını gösterir.`);
  figure(chartRiskMatrix(res.perQuestion, K.IMPACT_LEVELS, K.priorityOf), "Etki × olgunluk risk matrisi");
  if(gaps.length){
    const weakDims = (g) => {
      const a = ans[g.q.id] || {};
      return DIM_KEYS.filter(d => g.q[d] !== null && a[d] !== OUT_OF_SCOPE).map(d => ({ d, v: typeof a[d] === "number" ? a[d] : null }))
        .filter(x => x.v == null || x.v < K.TARGET_LEVEL).map(x => `${DIM_LABELS[x.d]}: ${x.v == null ? "yanıtlanmadı" : x.v}`).join("\n");
    };
    table("Öncelikli risk alanları", [450, 850, 600, 1450, 2800, 900, 600, 1422], ["Sıra", "Öncelik", "Soru No", "Kontrol alanı", "Kontrol", "Etki", "Puan", "Geliştirilecek boyut"],
      gaps.map((g, i) => [ {c:String(i+1), jc:"center"}, {c:g.priority, b:true}, {c:String(qNo[g.q.id]), jc:"center", b:true}, g.q.domain, g.q.soru, g.q.etki.replace(" Etki",""), {c:f1(g.level), jc:"center", b:true}, weakDims(g) ]),
      { sz: 17 });
    p("Soru No, EK-1 Soru / Cevap Tablosu’ndaki numaralandırmayı esas alır; ilgili sorunun tüm yanıtları orada yer alır.", { i:true, sz: 18 });
  } else {
    p("Asgari seviyenin altında kontrol bulunmamaktadır.");
  }

  /* ---------- 6. Değerlendirme Notları (yalnızca tespit varsa) ---------- */
  if(res.notes && res.notes.length){
    h1("Değerlendirme Notları", { pageBreakBefore:true });
    p("Değerlendirme sırasında bazı yanıtlar arasında uyumsuzluklar görülmüştür. Bu durum çoğunlukla soruların farklı yorumlanmasından ya da yanıtların farklı birimlerce verilmesinden kaynaklanabilir. Puanlar kurumunuzun yanıtları esas alınarak hesaplanmış, yanıtlarda herhangi bir değişiklik yapılmamıştır. Aşağıdaki hususların kurumunuzla birlikte teyit edilmesi, sonuçların doğruluğunu artıracaktır.");
    table("Yanıtlar arasında görülen uyumsuzluklar", [450, 1150, 950, 3800, 2722], ["No", "Tür", "Soru No", "Görülen durum", "Teyit önerisi"],
      res.notes.map((n, i) => [ {c:String(i+1), jc:"center"}, n.kind, {c: n.nos.length ? n.nos.join(", ") : "Genel", jc:"center"}, n.text, n.check ]),
      { sz: 17 });
    p("Soru No, EK-1 Soru / Cevap Tablosu’ndaki numaralandırmayı esas alır.", { i:true, sz: 18 });
  }

  /* ---------- EK-1 Soru / Cevap Tablosu ---------- */
  h1ek("EK-1 Soru / Cevap Tablosu");
  p("Her soru için boyut bazında seçilen seviye ve bu seviyeye karşılık gelen ifade aşağıda verilmiştir. “Yanıtlanmadı” olarak görünen boyutlar hesaplamalarda en düşük seviye (1) kabul edilmiştir.");
  const qaRows = [];
  qs.forEach((q, i) => {
    const a = ans[q.id] || {};
    DIM_KEYS.forEach((d, k) => {
      let lvl, txt;
      if(q[d] === null){ lvl = "Uygulanamaz"; txt = "—"; }
      else if(a[d] === OUT_OF_SCOPE){ lvl = "Kapsam Dışı"; txt = "—"; }
      else if(typeof a[d] === "number"){ lvl = String(a[d]); txt = q[d][a[d]] || "—"; }
      else { lvl = "Yanıtlanmadı"; txt = "—"; }
      const first = k === 0;
      qaRows.push([
        { c: first ? String(i+1) : "", jc:"center", vMerge: first ? "restart" : "continue", vTop:true },
        { c: first ? [[{t:q.domain, b:true}], q.soru, [{t:`Etki: ${q.etki}`, i:true}]] : "", vMerge: first ? "restart" : "continue", vTop:true },
        DIM_LABELS[d], { c:lvl, jc:"center", b: /^\d$/.test(lvl) }, txt,
      ]);
    });
  });
  out.push(CAP(`Tablo ${++tab} – Soru ve cevaplar`));
  out.push(TABLE([450, 3100, 1050, 1100, 3372], ["Soru No", "Kontrol alanı / Soru", "Boyut", "Seviye", "Seçilen ifade"], qaRows, { sz: 16 }));

  /* ---------- EK-2 Cevap Verilen / Verilmeyen Sorular ---------- */
  h1ek("EK-2 Cevap Verilen / Verilmeyen Sorular");
  p(`Toplam ${qs.length} sorudan ${comp.fullyAnswered} tanesi tüm boyutlarıyla yanıtlanmıştır. Kısmen yanıtlanan ve yanıtlanmayan sorularda eksik boyutlar en düşük seviye (1) kabul edilir; tümüyle kapsam dışı işaretlenen sorular hesaplamaya katılmaz.`);
  figure(chartStatusDonut(statusCounts), "Soruların yanıt durumu", 14);
  table("Yanıt durumu özeti", [3000, 1600, 4472], ["Durum", "Soru sayısı", "Açıklama"], [
    ["Tam Yanıtlandı", {c:String(comp.fullyAnswered), jc:"center"}, "Geçerli tüm boyutlar için seviye seçilmiş."],
    ["Kısmen Yanıtlandı", {c:String(comp.partiallyAnswered), jc:"center"}, "En az bir boyut yanıtsız; yanıtsız boyut 1 kabul edilir."],
    ["Yanıtlanmadı", {c:String(comp.fullyUnanswered), jc:"center"}, "Hiçbir boyut yanıtlanmamış; soru 1 kabul edilir."],
    ["Kapsam Dışı", {c:String(comp.outOfScope), jc:"center"}, "Tüm boyutlar kapsam dışı; hesaplamaya katılmaz."],
  ], { sz: 20 });
  table("Soru bazında yanıt durumu", [600, 2100, 3722, 1350, 1300], ["Soru No", "Kontrol alanı", "Soru", "Durum", "Not"], qs.map((q, i) => {
    const st = K.questionStatus(q, ans[q.id]);
    const notes = [];
    if(st.missing.length && st.status !== "Yanıtlanmadı") notes.push("Yanıtsız: " + st.missing.map(d=>DIM_LABELS[d]).join(", "));
    if(st.na.length && st.status !== "Kapsam Dışı") notes.push("Kapsam dışı: " + st.na.map(d=>DIM_LABELS[d]).join(", "));
    return [ {c:String(i+1), jc:"center"}, q.domain, q.soru, {c:st.status, b: st.status !== "Tam Yanıtlandı"}, notes.join("\n") || "—" ];
  }), { sz: 17 });

  return { xml: out.join(""), toc };
}

/* =========================================================
   Şablonu aç, gövdeyi yaz, paketle
========================================================= */
async function generate(A, res, K){
  if(typeof JSZip === "undefined") throw new Error("ZIP kütüphanesi yüklenemedi");
  const tplEl = document.getElementById("tplDotx");
  if(!tplEl) throw new Error("rapor şablonu bulunamadı");
  const zip = await JSZip.loadAsync(tplEl.textContent.trim(), { base64:true });
  const docXml = await zip.file("word/document.xml").async("string");

  const xdoc = new DOMParser().parseFromString(docXml, "application/xml");
  const body = xdoc.getElementsByTagNameNS(W_NS, "body")[0];
  const kids = Array.from(body.childNodes).filter(n => n.nodeType === 1);
  const ser = new XMLSerializer();
  const textOf = n => Array.from(n.getElementsByTagNameNS(W_NS, "t")).map(t=>t.textContent).join("");
  const styleOf = n => { const s = n.getElementsByTagNameNS(W_NS, "pStyle")[0]; return s ? s.getAttributeNS(W_NS, "val") || s.getAttribute("w:val") : ""; };

  // Şablon parçaları: kapak görseli + kapak başlıkları + fikri mülkiyet metni + ilk bölüm ayarı
  const titleIdx = kids.map((n,i)=>({n,i})).filter(x => x.n.localName === "p" && styleOf(x.n) === "Title" && textOf(x.n).trim()).map(x=>x.i);
  const ipIdx = kids.findIndex(n => textOf(n).trim() === "Fikri Mülkiyet Hakkı");
  const tocIdx = kids.findIndex(n => n.localName === "sdt");
  const sectIdx = kids.findIndex(n => n.localName === "p" && n.getElementsByTagNameNS(W_NS, "sectPr").length);
  if(!titleIdx.length || ipIdx < 0 || tocIdx < 0 || sectIdx < 0) throw new Error("şablon yapısı beklenenden farklı");
  const firstSect = ser.serializeToString(kids[sectIdx].getElementsByTagNameNS(W_NS, "sectPr")[0]);

  const org = A.orgName || "";
  const titleTexts = ["Hızlı Siber Güvenlik Olgunluk Değerlendirmesi", org ? `${org} — Değerlendirme Raporu` : "Değerlendirme Raporu"];
  const parts = [];
  for(let i = 0; i < titleIdx[0]; i++) parts.push(ser.serializeToString(kids[i]));
  titleTexts.forEach(t => parts.push(P(t, { style:"Title" })));
  parts.push(P(`${trDate(new Date())} · v${C.APP_VERSION}`, { jc:"center", sz: 22 }));
  const afterTitles = titleIdx[titleIdx.length-1] + 1;
  for(let i = afterTitles + 1; i < ipIdx; i++) parts.push(ser.serializeToString(kids[i])); // bir boş satır tarih satırına verildi
  for(let i = ipIdx; i < tocIdx; i++) parts.push(ser.serializeToString(kids[i]));

  const imgs = ImageBag();
  const built = buildBody(A, res, K, imgs);
  parts.push(tocBlock(built.toc));
  parts.push(built.xml);
  parts.push(firstSect); // tek bölüm: kapakta özel üst/alt bilgi (titlePg), sonrasında standart alt bilgi

  const bodyOpen = docXml.indexOf("<w:body>") + "<w:body>".length;
  const bodyClose = docXml.lastIndexOf("</w:body>");
  zip.file("word/document.xml", docXml.slice(0, bodyOpen) + parts.join("") + docXml.slice(bodyClose));

  // görseller ve ilişkiler
  let rels = await zip.file("word/_rels/document.xml.rels").async("string");
  imgs.items.forEach(it => {
    zip.file(`word/media/${it.name}`, it.b64, { base64:true, createFolders:false });
    rels = rels.replace("</Relationships>", `<Relationship Id="${it.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${it.name}"/></Relationships>`);
  });
  zip.file("word/_rels/document.xml.rels", rels);

  // şablon → belge
  let ct = await zip.file("[Content_Types].xml").async("string");
  ct = ct.replace("application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml");
  zip.file("[Content_Types].xml", ct);

  // açılışta alanları (içindekiler) güncelle
  let settings = await zip.file("word/settings.xml").async("string");
  if(!/<w:updateFields\b/.test(settings)){
    const anchor = settings.match(/<w:(hdrShapeDefaults|footnotePr|endnotePr|compat|docVars|rsids|mathPr|attachedSchema|themeFontLang|clrSchemeMapping|doNotIncludeSubdocsInStats|doNotAutoCompressPictures|forceUpgrade|captions|readModeInkLockDown|smartTagType|schemaLibrary|shapeDefaults|doNotEmbedSmartTags|decimalSymbol|listSeparator)\b/);
    settings = anchor ? settings.replace(anchor[0], `<w:updateFields w:val="true"/>${anchor[0]}`) : settings.replace("</w:settings>", `<w:updateFields w:val="true"/></w:settings>`);
  }
  settings = settings.replace(/<w:attachedTemplate [^>]*\/>/, "");
  zip.file("word/settings.xml", settings);

  // belge özellikleri
  const core = zip.file("docProps/core.xml");
  if(core){
    let cx = await core.async("string");
    const title = `Hızlı Siber Güvenlik Olgunluk Değerlendirmesi${org ? " — " + org : ""}`;
    cx = /<dc:title>[\s\S]*?<\/dc:title>/.test(cx) ? cx.replace(/<dc:title>[\s\S]*?<\/dc:title>/, `<dc:title>${xe(title)}</dc:title>`) : cx.replace("</cp:coreProperties>", `<dc:title>${xe(title)}</dc:title></cp:coreProperties>`);
    zip.file("docProps/core.xml", cx);
  }

  const blob = await zip.generateAsync({ type:"blob", compression:"DEFLATE", mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  C.downloadBlob(blob, `Olgunluk_Raporu_${C.slugForFilename(org)}_${new Date().toISOString().slice(0,10)}.docx`);
  return blob;
}

window.QA_REPORT = { generate, util:{ f1, trDate, LVL_HEX, NA_HEX, lvlHex, PRIO_HEX } };
})();
