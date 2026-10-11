/* =====================================================================
   HTML İNFOGRAFİK RAPOR — müşteriye gidecek tek dosya, çevrimdışı
   ---------------------------------------------------------------------
   Word raporuyla aynı rapor modelinden üretilir. Göstergeler, radar,
   ısı haritası, olgunluk merdiveni, kritiklik × olgunluk matrisi,
   öncelik şeritleri; bölümler ve Soru No'lar arası iç bağlantılar;
   EK-1'de soru/cevap süzgeci. Dış kaynak yok (CSP: ağ erişimi kapalı).
   Renk kararları: olgunluk sıralı mavi rampa, İnsan/Süreç/Teknoloji
   kategorik üç renk, durum rozetleri her zaman metinle birlikte.
   ===================================================================== */
const HR = (function(){
const e = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const f1 = RPT.f1, pct = t => t == null ? 0 : Math.max(0, Math.min(100, (t - 1) / 4 * 100));
const qa = no => '<a class="qref" href="#s-' + no + '">' + no + '</a>';
const qaList = nos => nos && nos.length ? nos.map(qa).join(", ") : "—";
const onC = hex => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299*r + 0.587*g + 0.114*b) > 150 ? RPT.INK : "#FFFFFF"; };
const chip = t => { const d = RPT.durum(t); return '<span class="chip" style="--c:' + d.renk + '"><i></i>' + d.ad + '</span>'; };

function ring(theta, size){
  size = size || 180;
  const r = size / 2 - 12, c = 2 * Math.PI * r, p = pct(theta) / 100;
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="Genel olgunluk ' + f1(theta) + ' / 5">' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#E8ECF2" stroke-width="12"/>' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + RPT.ramp(theta) + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' +
    (c * p).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
    '<text x="50%" y="48%" text-anchor="middle" class="ring-num">' + f1(theta) + '</text><text x="50%" y="64%" text-anchor="middle" class="ring-sub">/ 5,0</text></svg>';
}
function radar(list, linkOf){
  const W = 620, H = 500, cx = W / 2, cy = H / 2, R = 165, n = list.length;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const P = (i, v) => [cx + R * (v / 5) * Math.cos(ang(i)), cy + R * (v / 5) * Math.sin(ang(i))];
  let s = [1, 2, 3, 4, 5].map(l => '<polygon points="' + list.map((_, i) => P(i, l).map(x => x.toFixed(1)).join(",")).join(" ") + '" fill="none" stroke="#E2E6EC"/>').join("");
  s += list.map((_, i) => { const [x, y] = P(i, 5); return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E2E6EC"/>'; }).join("");
  s += '<polygon points="' + list.map((d, i) => P(i, d.value || 0).map(x => x.toFixed(1)).join(",")).join(" ") + '" fill="rgba(44,124,176,.15)" stroke="' + RPT.BAR + '" stroke-width="2.4" stroke-linejoin="round"/>';
  s += list.map((d, i) => { const [x, y] = P(i, d.value || 0); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="' + RPT.BAR + '" stroke="#fff" stroke-width="2"><title>' + e(d.label) + ': ' + f1(d.value) + '</title></circle>'; }).join("");
  s += list.map((d, i) => {
    const a = ang(i), lr = R + 26, x = cx + lr * Math.cos(a), y = cy + lr * Math.sin(a);
    const anchor = Math.cos(a) > .2 ? "start" : Math.cos(a) < -.2 ? "end" : "middle";
    const words = d.label.split(" "), lines = []; let cur = "";
    words.forEach(w => { const t = cur ? cur + " " + w : w; if(t.length > 20 && cur){ lines.push(cur); cur = w; } else cur = t; }); if(cur) lines.push(cur);
    const y0 = y - lines.length * 7 + (Math.sin(a) > .5 ? 8 : Math.sin(a) < -.5 ? -6 : 0);
    const txt = '<text x="' + x.toFixed(1) + '" y="' + y0.toFixed(1) + '" text-anchor="' + anchor + '" class="rd-lbl">' +
      lines.map((l, k) => '<tspan x="' + x.toFixed(1) + '" dy="' + (k ? 14 : 0) + '">' + e(l) + '</tspan>').join("") +
      '<tspan x="' + x.toFixed(1) + '" dy="15" class="rd-val">' + f1(d.value) + '</tspan></text>';
    return linkOf ? '<a href="' + linkOf(d) + '">' + txt + '</a>' : txt;
  }).join("");
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="radar" role="img" aria-label="Olgunluk profili">' + s + '</svg>';
}
function bar(label, theta, color, extra, href){
  return '<div class="b-row"><div class="b-lbl">' + (href ? '<a href="' + href + '">' + e(label) + '</a>' : e(label)) + '</div>' +
    '<div class="b-track"><div class="b-fill" style="width:' + pct(theta).toFixed(1) + '%;background:' + (color || RPT.BAR) + '"></div></div>' +
    '<div class="b-val">' + f1(theta) + '</div>' + (extra ? '<div class="b-ex">' + extra + '</div>' : '') + '</div>';
}
function ladder(rungs, threshold){
  return '<div class="ladder">' + rungs.map(r => {
    const h = r.score == null ? 6 : Math.max(6, r.score);
    const bg = r.pass === true ? RPT.RAMP[r.m - 1] : (r.pass === false ? "#DE9A93" : "#E8ECF2");
    return '<div class="rung"><div class="rung-col"><div class="rung-bar" style="height:' + h + '%;background:' + bg + '"></div>' +
      '<div class="rung-th" style="bottom:' + threshold + '%"></div></div><div class="rung-no">Seviye ' + r.m + '</div>' +
      '<div class="rung-sc">' + (r.score == null ? "ölçülmedi" : "%" + Math.round(r.score) + (r.pass ? " · geçti" : " · eşik altı")) + '</div></div>';
  }).join("") + '</div><p class="cap">Kesikli çizgi: doğrulama eşiği %' + threshold + '. Bir seviye, o basamak ve altındaki ölçülmüş tüm basamaklar eşiği geçtiğinde doğrulanmış sayılır.</p>';
}
function heat(rows){
  const cell = v => '<td style="background:' + RPT.ramp(v) + ';color:' + (v == null ? RPT.INK : onC(RPT.ramp(v))) + '">' + f1(v) + '</td>';
  return '<table class="heat"><thead><tr><th>Kontrol alanı</th><th>İnsan</th><th>Süreç</th><th>Teknoloji</th><th>Alan</th></tr></thead><tbody>' +
    rows.map(a => '<tr><th><a href="#a-' + e(a.code) + '">' + e(a.name) + '</a></th>' + cell(a.axis.I) + cell(a.axis.S) + cell(a.axis.T) +
      cell(a.theta).replace("<td ", '<td class="strong" ') + '</tr>').join("") + '</tbody></table>' +
    '<div class="legend"><span>Olgunluk</span>' + RPT.RAMP.map((c, i) => '<span><i style="background:' + c + '"></i>' + (i + 1) + '</span>').join("") + '<span class="mut">1 = tanımsız · 5 = optimize</span></div>';
}
function matrix(M){
  const st = (w, j) => (j === 0 && w >= 3) ? RPT.DURUM.kritik : ((j <= 1 && w >= 2) || j === 0 ? RPT.DURUM.gelisme : RPT.DURUM.guclu);
  return '<table class="mx"><thead><tr><th>Kritiklik \\ Olgunluk</th>' + M.matrix[0].cells.map(c => '<th>' + e(c.lbl) + '</th>').join("") + '</tr></thead><tbody>' +
    M.matrix.map(row => '<tr><th>' + e(row.label) + '</th>' + row.cells.map((c, j) => { const d = st(row.w, j), n = c.qnos.length;
      return '<td style="--c:' + d.renk + '" class="' + (n ? "on" : "off") + '"><b>' + n + '</b><span>' + d.ad + '</span>' +
        (n ? '<div class="mx-q">' + c.qnos.slice(0, 12).map(qa).join(" ") + (n > 12 ? " …" : "") + '</div>' : '') + '</td>'; }).join("") + '</tr>').join("") +
    '</tbody></table>';
}

function css(){
  return ':root{--ink:' + RPT.INK + ';--navy:' + RPT.NAVY + ';--dim:' + RPT.DIM + ';--line:#E2E6EC;--bg:#F5F7FA;--card:#fff;--teal:#1D8F74;--blue:' + RPT.BAR + '}' +
  '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:15px;line-height:1.6}' +
  'h1,h2,h3{font-family:"Space Grotesk","IBM Plex Sans",sans-serif;color:var(--navy);letter-spacing:-.01em;line-height:1.25;margin:0 0 .5em}h2{font-size:1.45rem}h3{font-size:1.05rem}' +
  'a{color:var(--blue)}.wrap{max-width:1080px;margin:0 auto;padding:0 20px}' +
  '.cover{background:#0E1F3B}.cover img{display:block;width:100%;max-height:330px;object-fit:cover}' +
  '.titlebar{background:#fff;border-bottom:1px solid var(--line)}.titlebar .wrap{padding:26px 20px}.titlebar h1{font-size:clamp(1.5rem,3vw,2.2rem);margin:0}' +
  '.titlebar .meta{color:var(--dim);font-size:.92rem;margin-top:6px}.gizli{display:inline-block;font-family:"Space Grotesk";font-weight:700;font-size:.7rem;letter-spacing:.14em;color:#C4523A;border:1px solid #C4523A;border-radius:99px;padding:.15em .7em;margin-bottom:10px}' +
  'nav.toc{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(6px)}nav.toc .wrap{display:flex;gap:4px;overflow-x:auto;padding:8px 20px}' +
  'nav.toc a{white-space:nowrap;text-decoration:none;color:var(--dim);font-family:"Space Grotesk";font-weight:600;font-size:.84rem;padding:6px 12px;border-radius:99px}nav.toc a:hover{background:#EEF3F8;color:var(--navy)}' +
  'section{padding:34px 0 8px}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin-bottom:18px;box-shadow:0 10px 24px -22px rgba(19,42,76,.5)}' +
  '.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}@media(max-width:860px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){.kpis{grid-template-columns:1fr}}' +
  '.kpi{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center}.kpi .n{font-family:"Space Grotesk";font-weight:700;font-size:2rem;color:var(--navy);line-height:1.1}' +
  '.kpi .l{font-family:"Space Grotesk";font-weight:600;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-top:6px}.kpi .s{font-size:.82rem;color:var(--dim)}' +
  '.ring-num{font-family:"Space Grotesk";font-weight:700;font-size:40px;fill:var(--navy)}.ring-sub{font-size:12px;fill:#8A8F9C;font-weight:600}' +
  '.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}@media(max-width:860px){.two{grid-template-columns:1fr}}' +
  'ul.find{margin:0;padding-left:1.1em}ul.find li{margin-bottom:.45em}' +
  '.b-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 10px;align-items:center;margin:10px 0}.b-lbl{grid-row:1;grid-column:1}.b-val{grid-row:1;grid-column:2}.b-ex{grid-row:1;grid-column:3}.b-track{grid-row:2;grid-column:1/-1}.b-lbl{font-size:.9rem}.b-lbl a{color:var(--ink);text-decoration:none}.b-lbl a:hover{color:var(--blue);text-decoration:underline}' +
  '.b-track{height:10px;background:#EEF1F5;border-radius:6px;overflow:hidden}.b-fill{height:100%;border-radius:6px}.b-val{font-family:"Space Grotesk";font-weight:700;text-align:right}' +
  
  '.chip{display:inline-flex;align-items:center;gap:.4em;font-family:"Space Grotesk";font-weight:600;font-size:.72rem;letter-spacing:.04em;color:var(--c);border:1px solid var(--c);border-radius:99px;padding:.15em .65em;white-space:nowrap}.chip i{width:7px;height:7px;border-radius:50%;background:var(--c)}' +
  '.radar{width:100%;max-width:620px;display:block;margin:0 auto}.rd-lbl{font-size:13px;fill:var(--ink)}.rd-val{font-weight:700;fill:var(--navy)}' +
  'table{border-collapse:collapse;width:100%;font-size:.88rem}th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}thead th{font-family:"Space Grotesk";font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}' +
  '.tblw{overflow-x:auto}.heat td{text-align:center;font-weight:600;border:2px solid #fff;min-width:70px}.heat td.strong{font-weight:800}.heat th a{color:var(--ink);text-decoration:none}' +
  '.legend{display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:.8rem;color:var(--dim);margin-top:10px}.legend i{display:inline-block;width:18px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-1px}.mut{color:#8A8F9C}' +
  '.ladder{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:end;height:220px}.rung{display:flex;flex-direction:column;height:100%;text-align:center}.rung-col{position:relative;flex:1;background:#F3F5F8;border-radius:8px;overflow:hidden}' +
  '.rung-bar{position:absolute;left:0;right:0;bottom:0;border-radius:8px 8px 0 0}.rung-th{position:absolute;left:0;right:0;border-top:2px dashed var(--navy)}.rung-no{font-family:"Space Grotesk";font-weight:700;margin-top:6px;font-size:.85rem}.rung-sc{font-size:.78rem;color:var(--dim)}' +
  '.cap{font-size:.8rem;color:var(--dim);margin:.6em 0 0}' +
  '.mx th,.mx td{text-align:center}.mx td{border:3px solid #fff;color:#fff;background:var(--c);min-width:110px}.mx td.off{background:#F3F5F8;color:#8A8F9C}.mx td b{display:block;font-size:1.4rem;font-family:"Space Grotesk"}.mx td span{font-size:.72rem}' +
  '.mx-q{margin-top:4px;font-size:.72rem}.mx-q .qref{color:#fff}.mx td.off .qref{color:var(--blue)}' +
  '.gap{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:start;padding:14px 0;border-bottom:1px solid var(--line)}.gap:last-child{border-bottom:0}' +
  '.gap .rk{font-family:"Space Grotesk";font-weight:700;font-size:1.3rem;color:var(--navy);text-align:center}.gap .q{font-weight:600}.gap .m{font-size:.82rem;color:var(--dim);margin-top:2px}.gap .th{font-family:"Space Grotesk";font-weight:700;font-size:1.2rem;text-align:right}' +
  '.qref{font-family:"Space Grotesk";font-weight:700;text-decoration:none;background:#EEF3F8;border-radius:6px;padding:0 .4em;color:var(--blue);white-space:nowrap}.qref:hover{background:var(--blue);color:#fff}' +
  '.area{border-left:4px solid var(--c);padding-left:16px;margin:16px 0}.area h3{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.area .nums{font-size:.84rem;color:var(--dim)}' +
  '.note{background:#FBF4EC;border:1px solid #EFD9BF;border-left:4px solid #C98A3B;border-radius:10px;padding:12px 16px;font-size:.9rem}' +
  '.filter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.filter button{font:inherit;font-size:.84rem;font-weight:600;border:1px solid var(--line);background:#fff;border-radius:99px;padding:.4em 1em;cursor:pointer;color:var(--dim)}.filter button.on{background:var(--navy);color:#fff;border-color:var(--navy)}' +
  '.qa{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin-bottom:10px;scroll-margin-top:70px}.qa:target{outline:3px solid var(--blue)}' +
  '.qa-h{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.qa-no{font-family:"Space Grotesk";font-weight:700;color:var(--navy)}.qa-q{font-weight:600}.qa-m{font-size:.8rem;color:var(--dim);margin:2px 0 8px}' +
  '.qa-ax{display:grid;grid-template-columns:96px 56px minmax(0,1fr);gap:10px;align-items:start;font-size:.88rem;padding:4px 0;border-top:1px dashed var(--line)}.qa-ax .ab{font-weight:700}.qa-ax .lv{font-family:"Space Grotesk";font-weight:700;text-align:center;border-radius:6px}' +
  '.qa-flag{font-size:.8rem;color:#8A4A1F;background:#FBF4EC;border-radius:8px;padding:6px 10px;margin-top:6px}.back{font-size:.78rem;margin-left:auto}' +
  'footer.ft{background:#0E1F3B;color:#C9D3E1;margin-top:40px}footer.ft .wrap{display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:22px 20px;font-size:.84rem}footer.ft img{height:56px;background:#fff;border-radius:8px;padding:4px}' +
  '.printbtn{font:inherit;font-weight:600;border:1px solid var(--line);background:#fff;border-radius:99px;padding:.45em 1.1em;cursor:pointer;float:right}' +
  '@media print{body{background:#fff;font-size:12px}nav.toc,.printbtn,.filter,.back{display:none!important}.card,.qa{box-shadow:none;break-inside:avoid}section{padding:14px 0 0}.cover img{max-height:200px}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}.qa{display:block!important}}';
}

async function templateImages(){
  try{
    const zip = await JSZip.loadAsync(REPORT_TEMPLATE_B64, { base64: true });
    const c = zip.file("word/media/image1.jpeg"), l = zip.file("word/media/image2.png");
    return { cover: c ? "data:image/jpeg;base64," + await c.async("base64") : "", logo: l ? "data:image/png;base64," + await l.async("base64") : "" };
  }catch(err){ return { cover: "", logo: "" }; }
}

async function build(st, sub){
  const M = buildReportModel(st, sub), O = M.overall, img = await templateImages();
  const fonts = (document.getElementById("qaFonts") || {}).textContent || "";
  const strong = M.sorted.slice().reverse().filter(a => a.theta >= 3.4).slice(0, 3);
  const weak = M.sorted.filter(a => a.theta < 2.6).slice(0, 4);
  const axS = M.axes.filter(a => a.theta != null).sort((a, b) => a.theta - b.theta);
  const nav = [["ozet", "Özet"], ["alanlar", "Kontrol alanları"], ["merdiven", "Olgunluk merdiveni"], ["mevzuat", "Mevzuat"], ["oncelikler", "Öncelikler"]]
    .concat(M.notes.length ? [["notlar", "Değerlendirme notları"]] : []).concat([["yanitlar", "EK-1 Soru / Cevap"], ["hakkinda", "Rapor hakkında"]]);

  let h = '<!DOCTYPE html>\n<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; font-src data:; img-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'">' +
    '<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex"><title>Siber Güvenlik Olgunluk Raporu — ' + e(M.org) + '</title>' +
    '<style>' + fonts + '</style><style>' + css() + '</style></head><body>';
  h += (img.cover ? '<div class="cover"><img src="' + img.cover + '" alt="Scale Teknoloji"></div>' : '');
  h += '<div class="titlebar"><div class="wrap"><button class="printbtn" onclick="window.print()">Yazdır / PDF</button><span class="gizli">GİZLİ · KURUMA ÖZEL</span>' +
    '<h1>Siber Güvenlik Olgunluk Değerlendirmesi</h1><div class="meta"><b>' + e(M.org) + '</b> · ' + e(M.taxName) + ' · Yanıt tarihi ' + e(RPT.trDate(M.submittedAt)) +
    ' · Rapor tarihi ' + e(RPT.trDate(M.reportDate)) + '</div></div></div>';
  h += '<nav class="toc"><div class="wrap">' + nav.map(([id, t]) => '<a href="#' + id + '">' + t + '</a>').join("") + '</div></nav><main class="wrap">';

  /* --- özet --- */
  h += '<section id="ozet"><h2>Yönetici Özeti</h2><div class="kpis">' +
    '<div class="kpi">' + ring(O.theta, 150) + '<div class="l">Ağırlıklı olgunluk</div><div class="s">' + e(O.band) + '</div></div>' +
    '<div class="kpi"><div class="n">' + (O.verified == null ? "—" : O.verified) + '</div><div class="l">Doğrulanmış basamak</div><div class="s">' +
      (O.blockedAt != null ? "Seviye " + O.blockedAt + " basamağında takıldı" : "Eşik %" + O.threshold) + '</div></div>' +
    '<div class="kpi"><div class="n">%' + RPT.f0(O.score) + '</div><div class="l">Ağırlıklı skor</div><div class="s">Kritiklik × olgunluk ağırlıklı</div></div>' +
    '<div class="kpi"><div class="n">' + RPT.f0(O.risk) + '</div><div class="l">Risk göstergesi</div><div class="s">' + e(O.riskBand) + '</div></div></div>';
  h += '<div class="two" style="margin-top:18px"><div class="card"><h3>Öne çıkan bulgular</h3><ul class="find">' +
    '<li><b>Güçlü alanlar:</b> ' + (strong.length ? strong.map(a => '<a href="#a-' + e(a.code) + '">' + e(a.name) + '</a> (' + f1(a.theta) + ')').join(", ") : "Yönetilen seviyeye (3,4) ulaşan kontrol alanı yok.") + '</li>' +
    (weak.length ? '<li><b>Öncelikli alanlar:</b> ' + weak.map(a => '<a href="#a-' + e(a.code) + '">' + e(a.name) + '</a> (' + f1(a.theta) + ')').join(", ") + '</li>' : '') +
    (axS.length > 1 ? '<li><b>Boyutlar:</b> en düşük ' + e(axS[0].name) + ' (' + f1(axS[0].theta) + '), en yüksek ' + e(axS[axS.length - 1].name) + ' (' + f1(axS[axS.length - 1].theta) + ').</li>' : '') +
    (M.gaps.length ? '<li><b>İyileştirme:</b> öncelikli ' + M.gaps.length + ' kontrol <a href="#oncelikler">Öncelikler</a> bölümünde.</li>' : '') +
    (M.notes.length ? '<li><b>Değerlendirme notları:</b> yanıtlar arasında ' + M.notes.length + ' uyumsuzluk görüldü; <a href="#notlar">ayrıntılar</a>.</li>' : '') +
    '</ul></div><div class="card"><h3>İnsan · Süreç · Teknoloji</h3>' + M.axes.map(a => bar(a.full, a.theta, RPT.AXIS[a.ax], chip(a.theta))).join("") +
    '<p class="cap">Kapsam dışı işaretlenen boyutlar skora ve paydaya dâhil edilmez.</p></div></div></section>';

  /* --- alanlar --- */
  h += '<section id="alanlar"><h2>Kontrol Alanları</h2><div class="two"><div class="card"><h3>' + (M.isNist ? "NIST CSF 2.0 fonksiyonları" : "Olgunluk profili") + '</h3>' +
    (M.isNist ? radar(M.functions.map(f => ({ label: f.code + " · " + f.name, value: f.theta }))) : radar(M.areas.map(a => ({ label: a.name, value: a.theta, code: a.code })), d => "#a-" + d.code)) +
    '</div><div class="card"><h3>Alan sıralaması</h3>' + M.sorted.slice().reverse().map(a => bar(a.name, a.theta, RPT.BAR, chip(a.theta), "#a-" + a.code)).join("") +
    (M.naAreas.length ? '<p class="cap">Kapsam dışı: ' + M.naAreas.map(a => e(a.name) + ' (' + e(a.reason) + ')').join(", ") + '.</p>' : '') + '</div></div>' +
    '<div class="card"><h3>Boyut ısı haritası</h3><div class="tblw">' + heat(M.sorted) + '</div></div>' +
    '<div class="card"><h3>Alan değerlendirmeleri</h3>' + M.sorted.map(a => '<div class="area" id="a-' + e(a.code) + '" style="--c:' + a.durum.renk + '"><h3>' + e(a.name) + ' ' + chip(a.theta) + '</h3>' +
      '<div class="nums">Olgunluk ' + f1(a.theta) + ' · İnsan ' + f1(a.axis.I) + ' · Süreç ' + f1(a.axis.S) + ' · Teknoloji ' + f1(a.axis.T) +
      ' · doğrulanmış basamak ' + (a.verified == null ? "—" : a.verified) + ' · ' + a.n + ' kontrol</div><p>' + e(a.advice) + '</p>' +
      '<div class="nums">Sorular: ' + qaList(a.qnos) + '</div></div>').join("") + '</div></section>';

  /* --- merdiven --- */
  h += '<section id="merdiven"><h2>Olgunluk Merdiveni</h2><div class="card">' + ladder(M.rungs, O.threshold) + '</div></section>';

  /* --- mevzuat --- */
  h += '<section id="mevzuat"><h2>Mevzuat ve Standartlar</h2><div class="card">' +
    M.regs.map(r => bar(r.label, r.theta, RPT.BAR, r.theta == null ? '<span class="mut">veri yok</span>' : chip(r.theta))).join("") +
    '<div class="tblw" style="margin-top:14px"><table><thead><tr><th>Çerçeve</th><th>Sorulan kontrol</th><th>Kapsama</th><th>Olgunluk</th><th>İlgili sorular</th></tr></thead><tbody>' +
    M.regs.map(r => '<tr><td>' + e(r.label) + '</td><td>' + r.n + '</td><td>' + (r.coverage == null ? "—" : "%" + RPT.f0(r.coverage)) + '</td><td><b>' + f1(r.theta) + '</b></td><td>' + qaList(r.qnos) + '</td></tr>').join("") +
    '</tbody></table></div><p class="cap">Göstergeler yönlendiricidir: ilgili çerçeveyle eşleşen ve bu değerlendirmede sorulan kontrollerin ağırlıklı olgunluğudur.</p></div></section>';

  /* --- öncelikler --- */
  h += '<section id="oncelikler"><h2>Öncelikli İyileştirme Alanları</h2><div class="card"><h3>Kritiklik × olgunluk</h3><div class="tblw">' + matrix(M) + '</div></div>' +
    '<div class="card"><h3>Öncelik şeridi</h3>' + (M.gaps.length ? M.gaps.map(g => '<div class="gap"><div class="rk">' + g.rank + '</div><div><div class="q">' + e(g.q) + '</div>' +
      '<div class="m">Soru ' + qa(g.no) + ' · ' + e(g.areaName) + ' · ' + e(g.crit) + (g.weak.length ? ' · geliştirilecek: ' + e(g.weak.join(", ")) : '') + '</div></div>' +
      '<div class="th">' + f1(g.theta) + '<div>' + chip(g.theta) + '</div></div></div>').join("") : '<p>Öncelikli iyileştirme gerektiren kontrol bulunmuyor.</p>') + '</div>' +
    (M.strengths.length ? '<div class="card"><h3>Güçlü yanlar</h3>' + M.strengths.map(s => '<div class="gap"><div class="rk">✓</div><div><div class="q">' + e(s.q) + '</div><div class="m">Soru ' + qa(s.no) + ' · ' + e(s.areaName) + '</div></div><div class="th">' + f1(s.theta) + '</div></div>').join("") + '</div>' : '') +
    '</section>';

  /* --- notlar --- */
  if(M.notes.length){
    h += '<section id="notlar"><h2>Değerlendirme Notları</h2><div class="card"><p class="note">Bazı yanıtlar arasında uyumsuzluk görülmüştür. Bu durum çoğunlukla soruların farklı yorumlanmasından ya da yanıtların farklı birimlerce verilmesinden kaynaklanabilir; aşağıdaki hususların birlikte teyit edilmesi önerilir.</p>' +
      '<div class="tblw"><table><thead><tr><th>#</th><th>Tür</th><th>Soru</th><th>Görülen durum</th><th>Değerlendirme</th></tr></thead><tbody>' +
      M.notes.map((n, i) => '<tr><td>' + (i + 1) + '</td><td>' + e(n.kind) + '</td><td>' + (n.nos.length ? qaList(n.nos) : e(n.area || "Genel")) + '</td><td>' + e(n.text) + '</td><td>' + e(n.decision) +
        (n.note ? '<div class="mut">Not: ' + e(n.note) + '</div>' : '') + (n.evidence ? '<div class="mut">Kurumun beyanı: ' + e(n.evidence) + '</div>' : '') + '</td></tr>').join("") +
      '</tbody></table></div></div></section>';
  }

  /* --- EK-1 --- */
  h += '<section id="yanitlar"><h2>EK-1 Soru / Cevap</h2><div class="filter" role="group" aria-label="Süzgeç">' +
    '<button class="on" data-f="all">Tümü (' + M.qs.length + ')</button><button data-f="low">Düşük (≤ 2,0)</button><button data-f="flag">İncelenen</button><button data-f="na">Kapsam dışı içeren</button></div>';
  h += M.qs.map(q => {
    const low = q.rqEff != null && q.rqEff <= 2;
    return '<div class="qa" id="s-' + q.no + '" data-low="' + (low ? 1 : 0) + '" data-flag="' + (q.flagged ? 1 : 0) + '" data-na="' + (q.naAxes ? 1 : 0) + '">' +
      '<div class="qa-h"><span class="qa-no">Soru ' + q.no + '</span><span class="qa-q">' + e(q.q) + '</span><a class="back" href="#ozet">↑ özet</a></div>' +
      '<div class="qa-m">' + e(q.areaName) + ' · ' + e(q.id) + ' · ' + e(q.crit) + ' · olgunluk basamağı ' + q.ml + ' · <a href="#a-' + e(q.area) + '">alan değerlendirmesi</a></div>' +
      q.axes.map(a => '<div class="qa-ax"><span class="ab" style="color:' + RPT.AXIS[a.ax] + '">' + e(a.name) + '</span>' +
        (a.na ? '<span class="lv" style="background:' + RPT.NA + '">—</span>' : '<span class="lv" style="background:' + RPT.ramp(a.orig > 0 ? a.orig : a.v) + ';color:' + onC(RPT.ramp(a.orig > 0 ? a.orig : a.v)) + '">' + (a.orig > 0 ? a.orig : a.v) + '</span>') +
        '<span>' + e(a.text) + (a.eff != null && a.eff < (a.orig > 0 ? a.orig : a.v) ? ' <i class="mut">(ön koşul nedeniyle ' + f1(a.eff) + ' sayıldı)</i>' : '') + '</span></div>').join("") +
      (q.flagged ? '<div class="qa-flag">' + q.contra.map(c => '<b>' + e(c.label) + ':</b> ' + e(c.msg)).join("<br>") + '<br><b>Değerlendirme:</b> ' + e(REVIEW_TXT[q.review] || "—") +
        (q.review === "override" ? ' (' + q.overrideValue + '/5)' : '') + '</div>' : '') + '</div>';
  }).join("") + '</section>';

  /* --- hakkında --- */
  h += '<section id="hakkinda"><h2>Rapor Hakkında</h2><div class="two"><div class="card"><h3>Değerlendirme bilgileri</h3><table><tbody>' +
    [["Kurum", M.org], ["Değerlendirme türü", "Öz değerlendirme (kurum beyanı) · uyarlanabilir anket"], ["Kontrol çerçevesi", M.taxName],
     ["Kapsam", M.counts.areas + " alan · " + M.counts.questions + " kontrol · " + M.counts.items + " cevap"],
     ["Kapsam soruları", M.scope.map(s => s.q + " → " + (s.yes ? "Evet" : "Hayır")).join(" · ")], ["Soru seti", M.qsetTxt],
     ["Sürüm", "Analiz Paneli v" + M.appVersion + " · " + M.bankVersion]].map(([k, v]) => '<tr><th>' + e(k) + '</th><td>' + e(v) + '</td></tr>').join("") +
    '</tbody></table></div><div class="card"><h3>Veri gizliliği</h3><ul class="find">' +
    '<li><b>Şifreli iletim:</b> yanıtlar kurumunuzun cihazında AES-256-GCM ile şifrelendi; dosya ve şifre ayrı kanallardan iletildi.</li>' +
    '<li><b>Yerel işleme:</b> analiz ve raporlama ağ erişimi kapalı, yalnızca danışmanın bilgisayarında çalışan bir uygulamayla yapıldı.</li>' +
    '<li><b>Yapay zekâ platformları:</b> kurumsal bilgiler hiçbir yapay zekâ platformuna, bulut analiz servisine veya harici sisteme aktarılmadı.</li>' +
    '<li><b>Üçüncü kişiler:</b> bilgiler üçüncü kişilerle paylaşılmadı.</li></ul>' +
    '<h3 style="margin-top:16px">Yöntem ve sorumluluk reddi</h3><p style="font-size:.88rem">Olgunluk θ = 1 + 4 × (Σ kazanılan puan / Σ ağırlık); ağırlık = kritiklik × olgunluk basamağı çarpanı. ' +
    'Ön koşulu karşılanmayan kontrollerin puanı ön koşul seviyesiyle sınırlanır; doğrulanmış seviye olgunluk merdiveniyle (eşik %' + O.threshold + ') belirlenir. ' +
    'Rapor kurum beyanına dayanır; bağımsız denetim veya teknik doğrulama yerine geçmez ve değerlendirme tarihindeki durumu yansıtır.</p></div></div></section>';

  h += '</main><footer class="ft"><div class="wrap">' + (img.logo ? '<img src="' + img.logo + '" alt="Scale Teknoloji">' : '') +
    '<div><b>' + e(RPT.KURUM) + '</b><br>' + e(RPT.ADRES) + '<br>' + e(RPT.EPOSTA) + ' · ' + e(RPT.WEB) + '</div>' +
    '<div style="margin-left:auto;font-size:.78rem">Bu rapor ' + e(M.org) + ' için hazırlanmıştır; içerik kuruma özeldir.<br>Analiz Paneli v' + e(M.appVersion) + '</div></div></footer>';
  h += '<script>(function(){var bs=document.querySelectorAll(".filter button"),qs=document.querySelectorAll(".qa");' +
    'bs.forEach(function(b){b.addEventListener("click",function(){bs.forEach(function(x){x.classList.toggle("on",x===b)});var f=b.getAttribute("data-f");' +
    'qs.forEach(function(q){q.style.display=(f==="all"||q.getAttribute("data-"+f)==="1")?"":"none"})})});' +
    'document.addEventListener("click",function(ev){var a=ev.target.closest&&ev.target.closest("a.qref");if(!a)return;var t=document.querySelector(a.getAttribute("href"));' +
    'if(t&&t.style.display==="none"){bs[0].click();}});})();<\/script></body></html>';
  return { html: h, model: M };
}

async function download(st, sub){
  const r = await build(st, sub);
  const name = "Olgunluk_Raporu_" + slug(r.model.org) + "_" + new Date().toISOString().slice(0, 10) + ".html";
  const blob = new Blob([r.html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return { name, size: blob.size };
}
return { build, download };
})();
