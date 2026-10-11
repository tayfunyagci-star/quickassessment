(function(){
"use strict";
/* =========================================================
   HTML İNFOGRAFİK RAPOR — müşteriye yönelik, tek dosya, çevrimdışı.
   Word raporuyla aynı veriden üretilir; bölümler ve sorular arası
   iç bağlantılar içerir. Dış kaynak yok (CSP: ağ bağlantısı kapalı).
========================================================= */
const C = window.QA_CORE;
const { DIM_KEYS, DIM_LABELS, OUT_OF_SCOPE } = C;
const U = () => window.QA_REPORT.util;

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct = v => v == null ? 0 : Math.max(0, Math.min(100, (v - 1) / 4 * 100));

/* ---------------- SVG bileşenleri ---------------- */
function svgGauge(v, band){
  const { lvlHex, LVL_HEX, f1 } = U();
  const cx = 160, cy = 150, r = 118, w = 26;
  const ang = x => Math.PI * (1 - (x - 1) / 4);           // 1 → 180°, 5 → 0°
  const pt = (x, rr) => [cx + rr * Math.cos(ang(x)), cy - rr * Math.sin(ang(x))];
  const arc = (a, b, col) => {
    const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r);
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none"/>`;
  };
  const bands = [[1,2,1],[2,3,2],[3,4,3],[4,4.5,4],[4.5,5,5]];
  const [tx, ty] = pt(3, r + w/2 + 6), [tx2, ty2] = pt(3, r - w/2 - 6);
  let needle = "";
  if(v != null){ const [nx, ny] = pt(v, r - 8); needle = `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#14213d" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="9" fill="#14213d"/>`; }
  return `<svg viewBox="0 0 320 200" class="gauge" role="img" aria-label="Genel olgunluk puanı ${f1(v)} / 5">
    ${bands.map(([a,b,l]) => arc(a + (a===1?0:.02), b - (b===5?0:.02), LVL_HEX[l])).join("")}
    <line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="#14213d" stroke-width="2.5" stroke-dasharray="4 3"/>
    ${needle}
    <text x="${cx}" y="${cy + 44}" text-anchor="middle" class="g-num">${f1(v)}</text>
    <text x="22" y="${cy + 20}" class="g-tick">1</text><text x="292" y="${cy + 20}" class="g-tick">5</text>
    <text x="${(tx + 4).toFixed(1)}" y="${(ty - 6).toFixed(1)}" class="g-tick">asgari 3,0</text>
  </svg>`;
}
function svgRing(v, label){
  const { lvlHex, f1 } = U();
  const r = 42, c = 2 * Math.PI * r, p = pct(v) / 100;
  return `<svg viewBox="0 0 110 110" class="ring" role="img" aria-label="${esc(label)} ${f1(v)}">
    <circle cx="55" cy="55" r="${r}" fill="none" stroke="#e8ecf2" stroke-width="12"/>
    <circle cx="55" cy="55" r="${r}" fill="none" stroke="${lvlHex(v)}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 55 55)"/>
    <text x="55" y="62" text-anchor="middle" class="r-num">${f1(v)}</text>
  </svg>`;
}
function svgRadar(perDomain, slugOf){
  const { lvlHex, f1 } = U();
  const W = 640, H = 520, cx = W/2, cy = H/2, R = 170, n = perDomain.length;
  const ang = i => -Math.PI/2 + i * 2 * Math.PI / n;
  const P = (i, v) => [cx + R * (v/5) * Math.cos(ang(i)), cy + R * (v/5) * Math.sin(ang(i))];
  const grid = [1,2,3,4,5].map(l => `<polygon points="${perDomain.map((_,i)=>P(i,l).map(x=>x.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${l===3?"#14213d":"#d9dfe7"}" stroke-width="${l===3?1.4:1}" ${l===3?'stroke-dasharray="5 4"':''}/>`).join("");
  const axes = perDomain.map((_,i)=>{ const [x,y]=P(i,5); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d9dfe7"/>`; }).join("");
  const poly = `<polygon points="${perDomain.map((d,i)=>P(i,d.avg||0).map(x=>x.toFixed(1)).join(",")).join(" ")}" fill="rgba(13,148,136,.18)" stroke="#0d9488" stroke-width="2.5"/>`;
  const dots = perDomain.map((d,i)=>{ const [x,y]=P(i,d.avg||0); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${lvlHex(d.avg)}" stroke="#fff" stroke-width="1.5"><title>${esc(d.domain)}: ${f1(d.avg)}</title></circle>`; }).join("");
  const labels = perDomain.map((d,i)=>{
    const a = ang(i), lr = R + 26, x = cx + lr*Math.cos(a), y = cy + lr*Math.sin(a);
    const anchor = Math.cos(a) > .2 ? "start" : Math.cos(a) < -.2 ? "end" : "middle";
    const words = d.domain.split(" "), lines = []; let cur = "";
    words.forEach(w => { const t = cur ? cur + " " + w : w; if(t.length > 18 && cur){ lines.push(cur); cur = w; } else cur = t; }); if(cur) lines.push(cur);
    const y0 = y - (lines.length) * 7 + (Math.sin(a) > .5 ? 8 : Math.sin(a) < -.5 ? -6 : 0);
    return `<a href="#${slugOf(d.domain)}"><text x="${x.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="${anchor}" class="rd-lbl">${lines.map((l,k)=>`<tspan x="${x.toFixed(1)}" dy="${k?14:0}">${esc(l)}</tspan>`).join("")}<tspan x="${x.toFixed(1)}" dy="15" class="rd-val" fill="${lvlHex(d.avg)}">${f1(d.avg)}</tspan></text></a>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="radar" role="img" aria-label="Kontrol alanlarının olgunluk profili">${grid}${axes}${poly}${dots}${labels}</svg>`;
}
function svgDonut(parts){
  const total = parts.reduce((s,p)=>s+p.v,0) || 1, r = 60, c = 2*Math.PI*r; let off = 0;
  const segs = parts.filter(p=>p.v).map(p => { const len = c * p.v / total; const s = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${p.col}" stroke-width="26" stroke-dasharray="${len.toFixed(2)} ${(c-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 80 80)"><title>${esc(p.k)}: ${p.v}</title></circle>`; off += len; return s; }).join("");
  return `<svg viewBox="0 0 160 160" class="donut" role="img" aria-label="Yanıt durumu">${segs}<text x="80" y="86" text-anchor="middle" class="d-num">${total}</text><text x="80" y="104" text-anchor="middle" class="d-lbl">soru</text></svg>`;
}

/* ---------------- Görseller ve fontlar ---------------- */
async function templateImages(){
  try{
    const zip = await JSZip.loadAsync(document.getElementById("tplDotx").textContent.trim(), { base64:true });
    const cover = zip.file("word/media/image1.jpeg"), logo = zip.file("word/media/image2.png");
    return { cover: cover ? "data:image/jpeg;base64," + await cover.async("base64") : null, logo: logo ? "data:image/png;base64," + await logo.async("base64") : null };
  }catch(e){ return { cover:null, logo:null }; }
}
function fontCss(){
  const st = Array.from(document.querySelectorAll("head style")).find(s => s.textContent.includes("@font-face"));
  if(!st) return "";
  const keep = /font-family:'(Space Grotesk)';[^}]*font-weight:(600|700);|font-family:'(IBM Plex Sans)';[^}]*font-weight:(400|600);/;
  return (st.textContent.match(/@font-face\{[^}]*\}/g) || []).filter(r => keep.test(r)).join("");
}

/* ---------------- Rapor gövdesi ---------------- */
function build(A, res, K, img){
  const { f1, trDate, lvlHex, PRIO_HEX } = U();
  const qs = A.questions, ans = A.answers, org = A.orgName || "Kurum";
  const B = K.BAND_LABELS, band = v => v == null ? "—" : B[K.bandOf(v)];
  const qNo = {}; qs.forEach((q,i) => qNo[q.id] = i + 1);
  const domains = res.perDomain.map(d => d.domain);
  const slugOf = d => "alan-" + (domains.indexOf(d) + 1);
  const qLink = q => `<a class="qref" href="#soru-${qNo[q.id]}" title="${esc(q.soru)}">S.${qNo[q.id]}</a>`;
  const dLink = d => `<a class="dref" href="#${slugOf(d)}">${esc(d)}</a>`;
  const lvlChip = v => `<span class="lv" style="--c:${lvlHex(v)}">${f1(v)}</span>`;
  const gaps = res.allGaps, comp = res.completion, notes = res.notes || [];
  const prio = k => gaps.filter(g => g.priority === k);
  const dimAvg = d => (res.perDim.find(x => x.dim === d) || {}).avg;
  const domSorted = [...res.perDomain].filter(d => d.avg != null).sort((a,b) => b.avg - a.avg);
  const regFail = res.perReg.filter(r => r.avg != null && !r.passed);
  // geri bağlantılar: bir sorunun raporda geçtiği yerler
  const back = {};
  const addBack = (q, href, label) => { (back[q.id] = back[q.id] || []).push(`<a href="${href}">${label}</a>`); };
  gaps.forEach((g, i) => addBack(g.q, `#onc-${i+1}`, `${g.priority} listesi`));
  notes.forEach((n, i) => n.nos.forEach(no => { const q = qs[no-1]; if(q) addBack(q, `#not-${i+1}`, `Değerlendirme notu ${i+1}`); }));
  res.perReg.forEach(r => r.gaps.forEach(g => addBack(g.q, `#reg-${r.fw}`, `${K.REG_LABELS_SHORT[r.fw]} eşik altı`)));

  const nav = [["ozet","Özet"],["olgunluk","Boyutlar"],["alanlar","Kontrol Alanları"],["regulasyon","Regülasyon"],["oncelikler","Öncelikler"]]
    .concat(notes.length ? [["notlar","Notlar"]] : []).concat([["yanitlar","Soru / Cevap"],["yontem","Yöntem"],["hakkinda","Hakkında"]]);

  /* ---- Özet ---- */
  const overall = res.overall;
  const kpis = `
    <div class="kpis">
      ${DIM_KEYS.map(d => `<a class="kpi ring-kpi" href="#olgunluk">${svgRing(dimAvg(d), DIM_LABELS[d])}<div><div class="kpi-lbl">${DIM_LABELS[d]}</div><div class="kpi-sub">${band(dimAvg(d))}</div></div></a>`).join("")}
      <a class="kpi" href="#oncelikler" style="--k:#C0334A"><div class="kpi-num">${gaps.length}</div><div class="kpi-lbl">Öncelikli gelişim alanı</div><div class="kpi-sub">${prio(K.P1).length} adet 1. öncelik</div></a>
      <a class="kpi" href="#regulasyon" style="--k:#2563eb"><div class="kpi-num">${res.perReg.length - regFail.length}<small>/${res.perReg.length}</small></div><div class="kpi-lbl">Asgari uyumdaki çerçeve</div><div class="kpi-sub">7545 · BİGR · KVKK · ISO 27001</div></a>
      <a class="kpi" href="#ek2" style="--k:#0d9488"><div class="kpi-num">${comp.fullyAnswered}<small>/${qs.length}</small></div><div class="kpi-lbl">Tam yanıtlanan soru</div><div class="kpi-sub">${comp.partiallyAnswered + comp.fullyUnanswered} eksik yanıt</div></a>
      ${notes.length ? `<a class="kpi" href="#notlar" style="--k:#E07B2E"><div class="kpi-num">${notes.length}</div><div class="kpi-lbl">Değerlendirme notu</div><div class="kpi-sub">Teyit önerilen husus</div></a>` : ""}
    </div>`;
  const strong = domSorted.filter(d => d.avg >= K.TARGET_LEVEL).slice(0,3);
  const weak = [...domSorted].reverse().filter(d => d.avg < K.TARGET_LEVEL).slice(0,4);
  const findings = `
    <div class="cards3">
      <div class="fcard ok"><div class="f-ico">✓</div><h4>Güçlü alanlar</h4>${strong.length ? `<ul>${strong.map(d=>`<li>${dLink(d.domain)} ${lvlChip(d.avg)}</li>`).join("")}</ul>` : `<p>Henüz asgari seviyeye ulaşan kontrol alanı bulunmamaktadır.</p>`}</div>
      <div class="fcard dev"><div class="f-ico">↗</div><h4>Geliştirilmesi önerilen alanlar</h4>${weak.length ? `<ul>${weak.map(d=>`<li>${dLink(d.domain)} ${lvlChip(d.avg)}</li>`).join("")}</ul>` : `<p>Tüm kontrol alanları asgari seviyededir.</p>`}</div>
      <div class="fcard pri"><div class="f-ico">★</div><h4>İlk ele alınması önerilenler</h4>${gaps.length ? `<ul>${gaps.slice(0,4).map(g=>`<li>${qLink(g.q)} ${esc(g.q.soru)}</li>`).join("")}</ul>` : `<p>Asgari seviyenin altında kontrol bulunmamaktadır.</p>`}</div>
    </div>`;

  /* ---- Boyutlar ---- */
  const dimSec = `
    <div class="dims">
      ${res.perDim.map(d => `<div class="dim"><div class="dim-h">${DIM_LABELS[d.dim]}</div>${svgRing(d.avg, DIM_LABELS[d.dim])}<div class="dim-band">${band(d.avg)}</div><div class="dim-sub">${d.below} / ${d.count} soru asgari seviyenin altında</div></div>`).join("")}
    </div>
    <div class="heat-wrap"><table class="heat">
      <thead><tr><th>Kontrol alanı</th><th>İnsan</th><th>Süreç</th><th>Teknoloji</th><th>Genel</th></tr></thead>
      <tbody>${[...res.perDomain].sort((a,b)=>(a.avg??9)-(b.avg??9)).map(d => {
        const vals = DIM_KEYS.map(k => (res.perDomainByMetric[k].find(x=>x.domain===d.domain)||{}).avg);
        return `<tr><th>${dLink(d.domain)}</th>${[...vals, d.avg].map((v,i)=>`<td class="${i===3?"gen":""}" style="--c:${lvlHex(v)}">${f1(v)}</td>`).join("")}</tr>`; }).join("")}</tbody>
    </table></div>`;

  /* ---- Kontrol alanları ---- */
  const domainCards = res.perDomain.map(d => {
    const inD = qs.filter(q => q.domain === d.domain);
    const vals = DIM_KEYS.map(k => (res.perDomainByMetric[k].find(x=>x.domain===d.domain)||{}).avg);
    return `<article class="dcard" id="${slugOf(d.domain)}" style="--c:${lvlHex(d.avg)}">
      <div class="dcard-top"><h3>${esc(d.domain)}</h3><div class="dscore">${f1(d.avg)}</div></div>
      <div class="dband">${band(d.avg)}</div>
      ${DIM_KEYS.map((k,i) => `<div class="mbar"><span>${DIM_LABELS[k]}</span><i><b style="width:${pct(vals[i])}%;background:${lvlHex(vals[i])}"></b></i><em>${f1(vals[i])}</em></div>`).join("")}
      <div class="qchips">${inD.map(q => { const lv = K.effectiveLevel(q, ans[q.id]); return `<a class="qchip" href="#soru-${qNo[q.id]}" style="--c:${lvlHex(lv)}" title="${esc(q.soru)}">S.${qNo[q.id]} <b>${f1(lv)}</b></a>`; }).join("")}</div>
    </article>`; }).join("");

  /* ---- Regülasyon ---- */
  const regSec = res.perReg.length ? res.perReg.map(r => `
    <article class="rcard ${r.passed ? "pass" : "fail"}" id="reg-${r.fw}">
      <div class="r-head"><h3>${esc(K.REG_LABELS[r.fw])}</h3><span class="r-val" style="color:${lvlHex(r.avg)}">${f1(r.avg)}</span></div>
      <div class="rbar"><b style="width:${pct(r.avg)}%;background:${lvlHex(r.avg)}"></b><i class="thr" title="Asgari eşik 3,0"></i></div>
      <div class="r-meta">${r.answered} / ${r.touched} ilgili kontrol · ${r.gaps.length} kontrol eşik altında</div>
      <div class="status">${r.avg == null ? "Veri yok" : (r.passed ? "✓ Asgari uyum sağlanıyor" : "Asgari uyum seviyesine henüz ulaşılmadı")}</div>
      ${r.gaps.length ? `<details><summary>Eşik altındaki kontroller (${r.gaps.length})</summary><ul class="glist">${r.gaps.map(g => `<li>${qLink(g.q)} ${lvlChip(g.level)} <span>${esc(g.q.soru)}</span> <small>Madde: ${esc((g.q.regulatory[r.fw]||[]).join(", "))}</small></li>`).join("")}</ul></details>` : ""}
    </article>`).join("") : `<p>Soru setinde mevzuat eşlemesi bulunmamaktadır.</p>`;

  /* ---- Öncelikler ---- */
  const cols = [["< 2,0", v=>v<2, 1.5],["2,0 – 2,9", v=>v>=2&&v<3, 2.5],["3,0 – 3,9", v=>v>=3&&v<4, 3.5],["≥ 4,0", v=>v>=4, 4.5]];
  const matrix = `<div class="matrix"><div class="mx-corner">Etki ↓ / Puan →</div>${cols.map(c=>`<div class="mx-h">${c[0]}</div>`).join("")}
    ${[...K.IMPACT_LEVELS].reverse().map(imp => `<div class="mx-r">${esc(imp)}</div>${cols.map(([_, t, s]) => { const pr = K.priorityOf(imp, s) || "Kabul"; const n = res.perQuestion.filter(p => p.q.etki === imp && t(p.level)).length; return `<div class="mx-c ${n?"":"zero"}" style="--c:${PRIO_HEX[pr]}"><b>${n}</b><small>${pr === "Kabul" ? "asgari üstü" : pr}</small></div>`; }).join("")}`).join("")}</div>`;
  let ix = 0;
  const lanes = [K.P1, K.P2, K.P3].map(p => `<div class="lane" style="--c:${PRIO_HEX[p]}"><div class="lane-h">${p} <span>${prio(p).length}</span></div>
      ${prio(p).map(g => { const i = gaps.indexOf(g) + 1; const a = ans[g.q.id] || {};
        const wd = DIM_KEYS.filter(d => g.q[d] !== null && a[d] !== OUT_OF_SCOPE && !(typeof a[d] === "number" && a[d] >= K.TARGET_LEVEL)).map(d => `${DIM_LABELS[d]} ${typeof a[d]==="number"?a[d]:"–"}`).join(" · ");
        return `<div class="pcard" id="onc-${i}"><div class="p-top">${qLink(g.q)} ${lvlChip(g.level)} <span class="imp">${esc(g.q.etki)}</span></div><p>${esc(g.q.soru)}</p><div class="p-meta">${dLink(g.q.domain)}${wd ? ` · Geliştirilecek: ${esc(wd)}` : ""}</div></div>`; }).join("") || `<p class="empty">Bu sınıfta kontrol yok.</p>`}
    </div>`).join("");

  /* ---- Notlar ---- */
  const linkNos = t => t.replace(/(\d+)\. soru/g, (m, n) => `<a class="qref" href="#soru-${n}">${n}. soru</a>`);
  const notesSec = notes.length ? notes.map((n, i) => `<div class="ncard" id="not-${i+1}"><span class="nkind">${esc(n.kind)}</span><p>${linkNos(esc(n.text))}</p><p class="ncheck">${esc(n.check)}</p></div>`).join("") : "";

  /* ---- Soru / Cevap ---- */
  const qa = qs.map((q, i) => {
    const a = ans[q.id] || {}, lv = K.effectiveLevel(q, a), st = K.questionStatus(q, a).status;
    return `<article class="qa" id="soru-${i+1}" data-st="${esc(st)}" data-low="${lv != null && lv < K.TARGET_LEVEL ? 1 : 0}">
      <div class="qa-top"><span class="qa-no">S.${i+1}</span>${dLink(q.domain)}<span class="imp">${esc(q.etki)}</span>${lv != null ? lvlChip(lv) : `<span class="lv na">Kapsam dışı</span>`}<span class="qst">${esc(st)}</span></div>
      <h4>${esc(q.soru)}</h4>
      <div class="qa-dims">${DIM_KEYS.map(d => {
        let val, txt = "", v = null;
        if(q[d] === null){ val = "Uygulanamaz"; }
        else if(a[d] === OUT_OF_SCOPE){ val = "Kapsam dışı"; }
        else if(typeof a[d] === "number"){ v = a[d]; val = "Seviye " + a[d]; txt = q[d][a[d]] || ""; }
        else { val = "Yanıtlanmadı"; }
        return `<div class="qd"><div class="qd-h">${DIM_LABELS[d]} <span class="pill" style="--c:${v ? lvlHex(v) : "#A3A9B3"}">${val}</span></div>${txt ? `<p>${esc(txt)}</p>` : ""}</div>`; }).join("")}</div>
      ${back[q.id] ? `<div class="backs">Raporda geçtiği yerler: ${back[q.id].join(" · ")}</div>` : ""}
    </article>`; }).join("");
  const stParts = [{k:"Tam Yanıtlandı",v:comp.fullyAnswered,col:"#1F8F5F"},{k:"Kısmen Yanıtlandı",v:comp.partiallyAnswered,col:"#E3B620"},{k:"Yanıtlanmadı",v:comp.fullyUnanswered,col:"#C0334A"},{k:"Kapsam Dışı",v:comp.outOfScope,col:"#A3A9B3"}];

  const qsetTxt = { match:"Doğrulandı", issued:"Doğrulandı (gönderilen anketin soru seti)", snapshot:"Dosyadaki soru seti kullanıldı", legacy:"Soru numarası üzerinden eşleştirildi", "legacy-mismatch":"Doğrulanamadı" }[(A.meta.qset||{}).status] || "—";

  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<title>Siber Güvenlik Olgunluk Raporu — ${esc(org)}</title>
<style>${fontCss()}
:root{ --ink:#14213d; --ink2:#46536b; --faint:#8592a6; --bg:#f4f6fa; --card:#fff; --line:#e3e8ef; --teal:#0d9488; --blue:#2563eb; --amber:#E07B2E; --red:#C0334A; --green:#1F8F5F;
  --fd:"Space Grotesk","Segoe UI",system-ui,sans-serif; --fb:"IBM Plex Sans","Segoe UI",system-ui,sans-serif; }
*{box-sizing:border-box} html{scroll-behavior:smooth; scroll-padding-top:70px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--fb);font-size:15px;line-height:1.55}
a{color:var(--blue);text-decoration:none} a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:var(--fd);margin:0;letter-spacing:-.01em}
.hero{position:relative;background:var(--ink);color:#fff;overflow:hidden;min-height:230px}
.hero img{position:absolute;right:0;top:0;width:52%;height:100%;object-fit:cover;object-position:left center;-webkit-mask-image:linear-gradient(90deg,transparent,#000 45%);mask-image:linear-gradient(90deg,transparent,#000 45%)}
.hero-in{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:46px 20px 30px}
.hero-in>*{max-width:560px}
.hero .eyebrow{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:#7dd3c8;font-weight:600}
.hero h1{font-size:2.1rem;margin:6px 0 4px}
.hero .meta{color:#cbd5e1;font-size:.9rem}
nav.toc{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
nav.toc .in{max-width:1160px;margin:0 auto;padding:10px 20px;display:flex;gap:6px;overflow-x:auto}
nav.toc a{white-space:nowrap;font-size:.84rem;font-weight:600;color:var(--ink2);padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:#fff}
nav.toc a:hover,nav.toc a.on{background:var(--ink);color:#fff;border-color:var(--ink);text-decoration:none}
main{max-width:1160px;margin:0 auto;padding:20px 20px 60px}
section{margin:34px 0}
.sec-h{display:flex;align-items:baseline;gap:6px 12px;margin-bottom:14px;flex-wrap:wrap}.sec-h h2{white-space:nowrap}.sec-h .lead{flex-basis:100%}
.sec-h h2{font-size:1.5rem}
.sec-h .no{font-family:var(--fd);font-weight:700;color:#fff;background:var(--teal);border-radius:8px;padding:2px 10px;font-size:.95rem}
.sec-h .lead{color:var(--ink2);font-size:.92rem}
.privacy{display:flex;gap:12px;align-items:center;background:#e9f7f5;border:1px solid #b9e5df;border-radius:12px;padding:12px 16px;margin:18px 0 0;font-size:.9rem;color:#0f5f58}
.privacy b{color:#0b4a44}
.summary{display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:stretch}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;box-shadow:0 1px 2px rgba(20,33,61,.04),0 6px 18px -12px rgba(20,33,61,.18)}
.gauge-card{text-align:center}
.gauge{width:100%;max-width:320px}
.g-num{font-family:var(--fd);font-size:46px;font-weight:700;fill:var(--ink)} .g-tick{font-size:11px;fill:var(--faint)}
.band{display:inline-block;margin-top:4px;padding:4px 14px;border-radius:999px;font-weight:700;font-size:.85rem;color:#fff}
.gauge-card p{color:var(--ink2);font-size:.9rem;margin:10px 0 0}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.kpi{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;color:var(--ink);position:relative;overflow:hidden}
.kpi:hover{text-decoration:none;border-color:#c7d0dc;transform:translateY(-1px)}
.kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--k,var(--teal))}
.ring-kpi{display:flex;align-items:center;gap:10px}.ring-kpi::before{display:none}
.ring{width:74px;height:74px;flex:none}.r-num{font-family:var(--fd);font-weight:700;font-size:22px;fill:var(--ink)}
.kpi-num{font-family:var(--fd);font-size:2rem;font-weight:700;line-height:1.1}.kpi-num small{font-size:1rem;color:var(--faint)}
.kpi-lbl{font-weight:600;font-size:.88rem}.kpi-sub{color:var(--faint);font-size:.78rem}
.cards3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:16px}
.fcard{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;border-top:5px solid var(--fc)}
.fcard.ok{--fc:var(--green)} .fcard.dev{--fc:var(--amber)} .fcard.pri{--fc:var(--red)}
.fcard h4{font-size:1rem;margin:4px 0 8px}.f-ico{width:30px;height:30px;border-radius:50%;background:var(--fc);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
.fcard ul{margin:0;padding:0;list-style:none}.fcard li{padding:5px 0;border-top:1px dashed var(--line);font-size:.88rem}.fcard li:first-child{border-top:none}
.lv{display:inline-block;min-width:34px;text-align:center;font-family:var(--fd);font-weight:700;font-size:.8rem;padding:1px 7px;border-radius:6px;background:var(--c);color:#fff;text-shadow:0 0 2px rgba(0,0,0,.25)}
.lv.na{background:#A3A9B3}
.qref{display:inline-block;font-family:var(--fd);font-weight:700;font-size:.78rem;background:#e8efff;color:var(--blue);border-radius:6px;padding:1px 7px}
.dref{font-weight:600}
.dims{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.dim{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;text-align:center}
.dim .ring{width:120px;height:120px}.dim-h{font-family:var(--fd);font-weight:700;font-size:1.1rem}.dim-band{font-weight:600;margin-top:2px}.dim-sub{color:var(--faint);font-size:.8rem}
.heat-wrap{overflow-x:auto;margin-top:16px}
table.heat{width:100%;border-collapse:separate;border-spacing:4px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px}
.heat th{text-align:left;font-size:.84rem;padding:6px 8px;font-weight:600}.heat thead th{font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:var(--faint);text-align:center}.heat thead th:first-child{text-align:left}
.heat td{background:var(--c);color:#fff;text-align:center;font-family:var(--fd);font-weight:700;border-radius:8px;padding:8px 6px;text-shadow:0 0 2px rgba(0,0,0,.3)}.heat td.gen{outline:2px solid var(--ink);outline-offset:-2px}
.radar-card{text-align:center}.radar{width:100%;max-width:640px}.rd-lbl{font-size:12px;fill:var(--ink)}.rd-val{font-family:var(--fd);font-weight:700;font-size:13px}
.dgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-top:16px}
.dcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;border-left:6px solid var(--c);scroll-margin-top:70px}
.dcard:target,.pcard:target,.qa:target,.ncard:target,.rcard:target{box-shadow:0 0 0 3px #93c5fd}
.dcard-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dcard h3{font-size:1rem}
.dscore{font-family:var(--fd);font-weight:700;font-size:1.7rem;color:var(--c);line-height:1}.dband{font-size:.8rem;color:var(--faint);margin-bottom:8px}
.mbar{display:grid;grid-template-columns:72px 1fr 34px;gap:8px;align-items:center;font-size:.8rem;margin:3px 0}.mbar i{height:8px;background:#edf1f6;border-radius:4px;overflow:hidden}.mbar b{display:block;height:100%}.mbar em{font-style:normal;font-weight:700;text-align:right}
.qchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.qchip{font-size:.76rem;border:1px solid var(--line);border-left:4px solid var(--c);border-radius:6px;padding:2px 8px;color:var(--ink)}.qchip b{font-family:var(--fd)}
.rgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.rcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;scroll-margin-top:70px;display:flex;flex-direction:column}
.r-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px;min-height:2.6em}.r-head h3{font-size:1rem;line-height:1.3}
.r-val{font-family:var(--fd);font-weight:700;font-size:1.6rem;line-height:1;flex:none}
.status{margin-top:12px;font-size:.8rem;font-weight:700;padding:8px 12px;border-radius:10px;text-align:center;line-height:1.35}
.rcard.pass .status{background:#dcf3e8;color:#14704a;border:1px solid #a7dfc2}.rcard.fail .status{background:#fde6ea;color:#a3283d;border:1px solid #f5b8c4}
.rbar{position:relative;height:16px;background:#edf1f6;border-radius:8px}.rbar b{display:block;height:100%;border-radius:8px}
.rbar .thr{position:absolute;left:50%;top:-4px;bottom:-4px;width:2px;background:var(--ink)}
.r-meta{color:var(--faint);font-size:.8rem;margin-top:8px}
details summary{cursor:pointer;font-weight:600;font-size:.86rem;margin-top:10px;color:var(--blue)}
.glist{list-style:none;padding:0;margin:8px 0 0}.glist li{padding:7px 0;border-top:1px dashed var(--line);font-size:.84rem}.glist small{display:block;color:var(--faint)}
.matrix{display:grid;grid-template-columns:150px repeat(4,1fr);gap:6px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;max-width:760px}
.mx-corner,.mx-h,.mx-r{font-size:.78rem;font-weight:600;color:var(--ink2);display:flex;align-items:center}.mx-h{justify-content:center}
.mx-c{background:var(--c);color:#fff;border-radius:10px;text-align:center;padding:10px 4px;text-shadow:0 0 2px rgba(0,0,0,.3)}.mx-c b{display:block;font-family:var(--fd);font-size:1.5rem}.mx-c small{font-size:.7rem}.mx-c.zero{opacity:.35}
.lanes{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}
.lane{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;border-top:6px solid var(--c)}
.lane-h{font-family:var(--fd);font-weight:700;margin:2px 4px 10px;display:flex;justify-content:space-between}.lane-h span{background:var(--c);color:#fff;border-radius:999px;padding:0 10px;font-size:.85rem}
.pcard{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fbfcfe;scroll-margin-top:70px}.pcard p{margin:6px 0;font-size:.86rem}
.p-top{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.p-meta{font-size:.76rem;color:var(--faint)}.imp{font-size:.72rem;color:var(--ink2);border:1px solid var(--line);border-radius:999px;padding:0 8px}
.empty{color:var(--faint);font-size:.85rem;margin:4px}
.ncard{background:#fff7ed;border:1px solid #fed7aa;border-left:6px solid var(--amber);border-radius:12px;padding:12px 16px;margin-bottom:10px;scroll-margin-top:70px}
.nkind{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9a4b14}.ncard p{margin:4px 0;font-size:.9rem}.ncheck{color:var(--ink2);font-style:italic}
.qa-filter{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.qa-filter button{font:inherit;font-size:.82rem;font-weight:600;border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 12px;cursor:pointer;color:var(--ink2)}.qa-filter button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.qa{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:10px;scroll-margin-top:70px}
.qa-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.84rem}.qa-no{font-family:var(--fd);font-weight:700;background:var(--ink);color:#fff;border-radius:6px;padding:1px 8px}.qst{margin-left:auto;font-size:.74rem;color:var(--faint)}
.qa h4{font-size:1rem;margin:8px 0}.qa-dims{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.qd{background:#f7f9fc;border-radius:10px;padding:8px 10px}.qd-h{font-size:.78rem;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:6px}.qd p{margin:4px 0 0;font-size:.8rem;color:var(--ink2)}
.pill{background:var(--c);color:#fff;border-radius:999px;padding:0 8px;font-size:.72rem;text-shadow:0 0 2px rgba(0,0,0,.25)}
.backs{margin-top:8px;font-size:.76rem;color:var(--faint)}
.ek2{display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:center}.donut{width:180px}.d-num{font-family:var(--fd);font-weight:700;font-size:30px;fill:var(--ink)}.d-lbl{font-size:12px;fill:var(--faint)}
.legend{list-style:none;padding:0;margin:0}.legend li{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px dashed var(--line)}.legend li:first-child{border-top:none}.legend i{width:14px;height:14px;border-radius:4px;background:var(--c)}.legend b{margin-left:auto;font-family:var(--fd)}
.scale{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.scale div{border-radius:12px;padding:12px;color:#fff;background:var(--c);text-shadow:0 0 2px rgba(0,0,0,.3)}.scale b{font-family:var(--fd);font-size:1.4rem;display:block}.scale small{display:block;font-size:.74rem;opacity:.95}.scale span{font-weight:700;font-size:.86rem}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
dl.def{display:grid;grid-template-columns:170px 1fr;gap:6px 14px;margin:0;font-size:.88rem}dl.def dt{font-weight:600}dl.def dd{margin:0;color:var(--ink2)}
.kv{display:grid;grid-template-columns:200px 1fr;gap:6px 14px;font-size:.9rem}.kv div:nth-child(odd){font-weight:600}
footer{background:var(--ink);color:#cbd5e1;font-size:.8rem;padding:20px}
footer .in{max-width:1160px;margin:0 auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap}footer img{height:38px;background:#fff;border-radius:8px;padding:4px}
.top{position:fixed;right:18px;bottom:18px;background:var(--ink);color:#fff;border-radius:999px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 6px 16px rgba(0,0,0,.2)}
@media(max-width:860px){.summary,.two,.ek2{grid-template-columns:1fr}.dims,.lanes,.qa-dims,.scale{grid-template-columns:1fr}.matrix{grid-template-columns:110px repeat(4,1fr)}.hero h1{font-size:1.5rem}}
@media print{nav.toc,.top,.qa-filter{display:none}body{background:#fff}.card,.qa,.dcard,.pcard,.rcard,.lane{break-inside:avoid;box-shadow:none}details{display:block}details>*{display:block}}
</style></head>
<body>
<header class="hero">${img.cover ? `<img src="${img.cover}" alt="">` : ""}
  <div class="hero-in"><div class="eyebrow">Hızlı Siber Güvenlik Olgunluk Değerlendirmesi</div><h1>${esc(org)}</h1>
  <div class="meta">Değerlendirme Raporu · ${trDate(new Date())} · Yanıt tarihi ${trDate(A.meta.submittedAt)} · v${C.APP_VERSION}</div></div>
</header>
<nav class="toc" aria-label="Bölümler"><div class="in">${nav.map(([id,t]) => `<a href="#${id}">${t}</a>`).join("")}</div></nav>
<main>
  <div class="privacy"><span>🔒</span><div><b>Gizlilik:</b> Yanıtlarınız cihazınızda şifrelenmiş, analiz yalnızca yerel bilgisayarda ve internet bağlantısı olmadan yapılmıştır. Kurumsal bilgiler hiçbir yapay zekâ platformuna aktarılmamış, üçüncü kişilerle paylaşılmamıştır. <a href="#hakkinda">Ayrıntılar</a></div></div>

  <section id="ozet">
    <div class="sec-h"><span class="no">1</span><h2>Yönetici Özeti</h2></div>
    <div class="summary">
      <div class="card gauge-card">${svgGauge(overall)}<div class="band" style="background:${lvlHex(overall)}">${band(overall)}</div>
        <p>Genel olgunluk puanı 5 üzerinden <b>${f1(overall)}</b>; asgari seviye olarak kabul edilen 3,0’ın ${overall != null && overall >= K.TARGET_LEVEL ? "üzerindedir" : "altında kalmaktadır"}.</p></div>
      ${kpis}
    </div>
    ${findings}
  </section>

  <section id="olgunluk">
    <div class="sec-h"><span class="no">2</span><h2>İnsan, Süreç ve Teknoloji</h2><span class="lead">Her soru üç boyutta ayrı ayrı yanıtlandı.</span></div>
    ${dimSec}
  </section>

  <section id="alanlar">
    <div class="sec-h"><span class="no">3</span><h2>Kontrol Alanları</h2><span class="lead">Alan adına veya soru etiketine tıklayarak ayrıntıya geçebilirsiniz.</span></div>
    <div class="card radar-card">${svgRadar(res.perDomain, slugOf)}</div>
    <div class="dgrid">${domainCards}</div>
  </section>

  <section id="regulasyon">
    <div class="sec-h"><span class="no">4</span><h2>Regülasyon Alanları</h2><span class="lead">Yönlendirici gösterge; uyum denetimi veya hukuki görüş yerine geçmez. Dikey çizgi asgari eşiktir (3,0).</span></div>
    <div class="rgrid">${regSec}</div>
  </section>

  <section id="oncelikler">
    <div class="sec-h"><span class="no">5</span><h2>Öncelikli Gelişim Alanları</h2><span class="lead">${gaps.length} kontrolün asgari seviyeye ulaştırılması önerilmektedir.</span></div>
    ${matrix}
    <div class="lanes">${lanes}</div>
  </section>

  ${notes.length ? `<section id="notlar">
    <div class="sec-h"><span class="no">6</span><h2>Değerlendirme Notları</h2></div>
    <p class="lead">Bazı yanıtlar arasında uyumsuzluklar görülmüştür. Bu durum çoğunlukla soruların farklı yorumlanmasından ya da yanıtların farklı birimlerce verilmesinden kaynaklanabilir; puanlar yanıtlarınız esas alınarak hesaplanmıştır. Aşağıdaki hususların birlikte teyit edilmesi önerilir.</p>
    ${notesSec}
  </section>` : ""}

  <section id="yanitlar">
    <div class="sec-h"><span class="no">EK</span><h2>Soru / Cevap</h2><span class="lead">Her sorunun boyut bazında seçilen seviyesi ve ifadesi.</span></div>
    <div class="qa-filter" role="group" aria-label="Süzgeç"><button class="on" data-f="all">Tümü</button><button data-f="low">Asgari seviyenin altı</button><button data-f="miss">Eksik yanıtlı</button></div>
    ${qa}
    <div class="card" id="ek2"><h3>Yanıt durumu</h3><div class="ek2">${svgDonut(stParts)}
      <ul class="legend">${stParts.map(p => `<li style="--c:${p.col}"><i></i>${p.k}<b>${p.v}</b></li>`).join("")}</ul></div></div>
  </section>

  <section id="yontem">
    <div class="sec-h"><span class="no">i</span><h2>Yöntem</h2></div>
    <div class="scale">${[1,2,3,4,5].map(l => `<div style="--c:${U().LVL_HEX[l]}"><b>${l}</b><span>${B[l]}</span><small>${["","1,0 – 1,9","2,0 – 2,9","3,0 – 3,9 · asgari","4,0 – 4,4","4,5 – 5,0"][l]}</small></div>`).join("")}</div>
    <div class="two">
      <div class="card"><h3>Nasıl puanlandı?</h3><p>${qs.length} soru, ${domains.length} kontrol alanına dağılmıştır. Her soru İnsan, Süreç ve Teknoloji boyutlarında 1–5 arasında yanıtlanır; puanlar kontrolün etki seviyesine göre ağırlıklandırılarak alan, boyut, mevzuat ve genel puana dönüştürülür. Yanıtlanmayan boyutlar en düşük seviye (1) kabul edilir; kapsam dışı işaretlenenler hesaba katılmaz.</p></div>
      <div class="card"><h3>Öncelik sınıfları</h3><dl class="def"><dt style="color:${PRIO_HEX[K.P1]}">1. Öncelik</dt><dd>Çok Yüksek veya Yüksek etkili kontrol, puanı 2,0’ın altında.</dd><dt style="color:${PRIO_HEX[K.P2]}">2. Öncelik</dt><dd>Çok Yüksek veya Yüksek etkili kontrol 2,0–2,9; ya da Orta etkili kontrol 2,0’ın altında.</dd><dt style="color:#a07c00">3. Öncelik</dt><dd>Asgari seviyenin altında kalan diğer kontroller.</dd></dl></div>
    </div>
  </section>

  <section id="hakkinda">
    <div class="sec-h"><span class="no">i</span><h2>Doküman Hakkında</h2></div>
    <div class="two">
      <div class="card"><div class="kv"><div>Kurum</div><div>${esc(org)}</div><div>Değerlendirme türü</div><div>Öz değerlendirme (kurum beyanı)</div><div>Yanıt tarihi</div><div>${trDate(A.meta.submittedAt)}</div><div>Rapor tarihi</div><div>${trDate(new Date())}</div><div>Kapsam</div><div>${qs.length} soru · ${domains.length} kontrol alanı · 3 boyut</div><div>Soru seti doğrulaması</div><div>${qsetTxt}</div><div>Sürüm</div><div>Rapor v${C.APP_VERSION} · Yanıt dosyası v${esc(A.meta.fileVersion || "—")}</div></div></div>
      <div class="card"><h3>Veri gizliliği</h3><ul><li>Yanıtlar kurumunuzun cihazında AES-256 ile şifrelenmiş, dosya ve şifresi ayrı kanallarla iletilmiştir.</li><li>Analiz ve raporlama, internet bağlantısı kurmayacak şekilde kısıtlanmış yerel bir uygulama ile yapılmıştır.</li><li>Kurumsal bilgiler hiçbir yapay zekâ platformuna, bulut servisine veya harici sisteme aktarılmamıştır.</li><li>Bilgiler üçüncü kişilerle paylaşılmamış, yalnızca bu raporun hazırlanması amacıyla kullanılmıştır.</li></ul></div>
    </div>
    <div class="card" style="margin-top:14px"><h3>Sorumluluk reddi</h3><p>Bu rapor kurum personelinin öz değerlendirme yanıtlarına dayanır; bağımsız teknik doğrulama, sızma testi veya yerinde denetimle teyit edilmemiştir. Değerlendirme tarihindeki durumu yansıtır ve bir garanti, sertifika veya güvence teşkil etmez. Regülasyon göstergeleri yönlendirici niteliktedir; hukuki görüş ya da denetim sonucu yerine geçmez. Rapor yalnızca adı geçen kurumun iç kullanımı içindir.</p></div>
  </section>
</main>
<footer><div class="in">${img.logo ? `<img src="${img.logo}" alt="">` : ""}<div>CyberArts Siber Güvenlik ve Danışmanlık A.Ş.<br>Quasar İstanbul Fulya Mah. Büyükdere Cad. No: 76, 34394 Mecidiyeköy Şişli – İSTANBUL · info@cyberartspro.com</div><div style="margin-left:auto">Rapor v${C.APP_VERSION} · ${trDate(new Date())}</div></div></footer>
<a class="top" href="#" aria-label="Başa dön">↑</a>
<script>
(function(){
  var bs=document.querySelectorAll('.qa-filter button'), qa=document.querySelectorAll('.qa');
  bs.forEach(function(b){ b.addEventListener('click',function(){ bs.forEach(function(x){x.classList.remove('on')}); b.classList.add('on'); var f=b.getAttribute('data-f');
    qa.forEach(function(q){ var show = f==='all' || (f==='low' && q.getAttribute('data-low')==='1') || (f==='miss' && /Kısmen|Yanıtlanmadı/.test(q.getAttribute('data-st'))); q.style.display = show ? '' : 'none'; }); }); });
  // hedefe gidilirken süzgeç gizlemesin
  window.addEventListener('hashchange',function(){ var t=document.getElementById(location.hash.slice(1)); if(t && t.classList.contains('qa') && t.style.display==='none'){ bs[0].click(); t.scrollIntoView(); } });
  var links=document.querySelectorAll('nav.toc a'), secs=[].map.call(links,function(a){return document.getElementById(a.getAttribute('href').slice(1))});
  function spy(){ var y=window.scrollY+90, k=0; secs.forEach(function(s,i){ if(s && s.offsetTop<=y) k=i; }); links.forEach(function(a,i){ a.classList.toggle('on', i===k); }); }
  window.addEventListener('scroll',spy,{passive:true}); spy();
})();
</script>
</body></html>`;
}

async function generate(A, res, K){
  const img = await templateImages();
  const html = build(A, res, K, img);
  C.downloadBlob(new Blob([html], { type:"text/html" }), `Olgunluk_Raporu_${C.slugForFilename(A.orgName)}_${new Date().toISOString().slice(0,10)}.html`);
  return html;
}
window.QA_HTMLREPORT = { generate, build };
})();
