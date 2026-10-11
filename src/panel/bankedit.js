/* =====================================================================
   SORU YÖNETİMİ — soru ekle/düzenle/sil, ön koşullar, kapsam soruları,
   Excel ve JSON ile toplu içe/dışa aktarım
   ---------------------------------------------------------------------
   Excel düzeni repodaki kaynak çalışma kitaplarıyla aynıdır:
     Sorular            ← UCT_Sorular_MevcutDurum_v3.xlsx
     Sablonlar          ← UCT_Cevap_Setleri_v3.xlsx
     Bagimliliklar, Kapsam_Bayraklari, Agirliklar, Olgunluk_Carpanlari
                        ← Unified_Controls_Taxonomy_v2.xlsx
   İçe aktarmada yalnızca «Sorular» zorunludur; diğer sayfalar varsa
   uygulanır. Her değişiklik önce bankanın bir kopyasında doğrulanır.
   ===================================================================== */
const XL_ML = { 1:"Başlangıç", 2:"Tekrarlanabilir", 3:"Tanımlanmış", 4:"Yönetilen", 5:"Optimize" };
const XL_AX = { I:"İnsan (People)", S:"Süreç (Process)", T:"Teknoloji (Technology)" };
const XL_Q_HEAD = ["Soru_ID","Kontrol Alanı (UCT)","NIST CSF Alanı","Kontrol Başlığı","Soru (Mevcut Durum Kipi)",
                   "Önceki Metin (Denetim Kipi)","Kritiklik","Olgunluk Seviyesi","Kontrol Arketipi",
                   "Konu (cevaplara gömülen)","Kapsam Etiketi","Mevzuat Eşlemeleri"];
const CRIT_BY_LABEL = { "düşük":1, "orta":2, "yüksek":3, "kritik":4 };

function bankMsg(html, warn){
  const el = document.getElementById("bankMsg");
  el.innerHTML = html ? '<div class="note' + (warn ? " warn" : "") + '" style="margin:0 0 16px">' + html + '</div>' : "";
}
function renderBankState(){
  const el = document.getElementById("bankState");
  el.innerHTML = bankIsEdited()
    ? '<span class="tag-chip edited">Düzenlenmiş banka</span> Son değişiklik ' + esc(new Date(BANK.editedAt || Date.now()).toLocaleString("tr-TR")) +
      ' · düzenlemeler bu tarayıcıda saklanır; başka bir bilgisayara taşımak için «Yedek İndir» kullanın.'
    : '<span class="tag-chip">Varsayılan banka</span> Build ile gelen soru bankası kullanılıyor (' + esc(BANK_DEFAULT.v) + ').';
}

/* Bankada değişiklik olunca ona bağlı tüm görünümler yenilenir. */
function refreshBankViews(){
  rebuildBankIndex();
  renderBankFilters(); renderBank(); renderMethod(); renderScopes(); renderTaxChoices(); renderPreview();
  renderScopeEdit(); renderBankState();
  document.getElementById("bankPill").textContent = BANK.v;
  document.getElementById("footMeta").textContent = "v" + APP_VERSION + " · " + BANK.v + " · " + BANK.Q.length + " kontrol maddesi";
}

/* Değişikliği bankanın kopyasında yapar; doğrulanırsa etkin bankaya uygular ve kaydeder. */
function commitBank(mutator){
  const nb = cloneBank(BANK);
  mutator(nb);
  const errs = validateBank(nb);
  if(errs.length) throw new Error(errs.slice(0, 6).join(" · ") + (errs.length > 6 ? " · (+" + (errs.length - 6) + " hata)" : ""));
  replaceBank(nb);
  saveBank();
  refreshBankViews();
}

/* ---------------- soru düzenleme ---------------- */
let qEditId = null;
const pad = (n, w) => String(n).padStart(w, "0");
function suggestId(g){
  const prefix = "UCT." + pad(g + 1, 2) + ".";
  const max = BANK.Q.reduce((m, q) => q[F.id].indexOf(prefix) === 0 ? Math.max(m, parseInt(q[F.id].slice(prefix.length), 10) || 0) : m, 0);
  return prefix + pad(max + 1, 3);
}
function opts(list, sel){ return list.map(([v, l]) => '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? " selected" : "") + '>' + esc(l) + '</option>').join(""); }

function openQEditor(id){
  qEditId = id || null;
  const q = id ? Q_BY_ID[id] : ["", 0, -1, "", "", 3, 2, 0, [], "politika", ""];
  const deps = id ? BANK.deps.filter(d => d[0] === id) : [];
  const usedBy = id ? BANK.deps.filter(d => d[1] === id).map(d => d[0]) : [];
  document.getElementById("qEdTitle").textContent = id ? "Soruyu düzenle · " + id : "Yeni soru";
  document.getElementById("btnQDelete").classList.toggle("hidden", !id);
  document.getElementById("qEdErr").textContent = "";
  const archList = Object.keys(BANK.arch).sort((a, b) => BANK.arch[a].localeCompare(BANK.arch[b], "tr")).map(a => [a, BANK.arch[a]]);
  document.getElementById("qEdBody").innerHTML =
    '<div class="q-grid">' +
      '<div class="field"><label for="qeId">Soru kimliği</label><input id="qeId" value="' + esc(id || suggestId(q[F.g])) + '"' + (id ? " readonly" : "") + '></div>' +
      '<div class="field"><label for="qeG">Kontrol alanı (UCT)</label><select id="qeG">' + opts(BANK.uct.map((u, i) => [i, u[1]]), q[F.g]) + '</select></div>' +
      '<div class="field"><label for="qeN">NIST CSF 2.0 alanı</label><select id="qeN">' + opts([[-1, "— eşleme yok —"]].concat(BANK.nist.map((n, i) => [i, n[0] + " · " + n[1]])), q[F.n]) + '</select></div>' +
      '<div class="field"><label for="qeTag">Kapsam etiketi</label><select id="qeTag">' + opts(BANK.tags.map((t, i) => [i, t || "— yok (her kurumda sorulur) —"]), q[F.tag]) + '</select></div>' +
      '<div class="field wide"><label for="qeT">Kontrol başlığı</label><input id="qeT" value="' + esc(q[F.t]) + '"></div>' +
      '<div class="field wide"><label for="qeQ">Soru (mevcut durum kipi)</label><textarea id="qeQ" rows="3">' + esc(q[F.q]) + '</textarea></div>' +
      '<div class="field"><label for="qeW">Kritiklik</label><select id="qeW">' + opts([4,3,2,1].map(k => [k, CRIT_LABEL[k]]), q[F.w]) + '</select></div>' +
      '<div class="field"><label for="qeM">Olgunluk basamağı</label><select id="qeM">' + opts([1,2,3,4,5].map(k => [k, k + " · " + ML_LABEL[k]]), q[F.m]) + '</select></div>' +
      '<div class="field"><label for="qeArch">Kontrol arketipi (cevap şablonu)</label><select id="qeArch">' + opts(archList, q[F.arch]) + '</select></div>' +
      '<div class="field"><label for="qeK">Konu (cevaplara gömülür)</label><input id="qeK" value="' + esc(q[F.k]) + '"></div>' +
      '<div class="field wide"><label for="qeReg">Mevzuat eşlemeleri — her satıra bir çerçeve (ör. ISO27001: A.5.9; A.5.10)</label><textarea id="qeReg" rows="4" class="mono">' + esc((q[F.reg] || []).join("\n")) + '</textarea></div>' +
      '<div class="field wide"><label for="qeDeps">Ön koşullar — her satıra «soru kimliği eşik» (eşik 0–1, ör. UCT.01.001 0.5)</label><textarea id="qeDeps" rows="3" class="mono">' +
        esc(deps.map(d => d[1] + " " + d[2]).join("\n")) + '</textarea>' +
        (usedBy.length ? '<span class="q-hint">Bu soruyu ön koşul alan sorular: ' + esc(usedBy.join(", ")) + '</span>' : '') + '</div>' +
    '</div>' +
    '<details class="drill" style="margin-top:6px"><summary style="padding:8px 12px;font-family:var(--font-display);font-weight:600;font-size:.78rem;color:var(--navy)">' +
      '<span class="chev">▶</span> Seçili arketip ve konuyla katılımcının göreceği cevaplar</summary><div class="drill-body" id="qePreview"></div></details>';
  const preview = () => {
    const arch = document.getElementById("qeArch").value, k = document.getElementById("qeK").value;
    document.getElementById("qePreview").innerHTML = AXES.map(ax => '<div style="margin-bottom:10px"><div class="ab" style="color:' + AXIS_COLOR[ax] +
      ';font-family:var(--font-display);font-weight:700;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">' + AXIS_FULL[ax] + '</div>' +
      [1,2,3,4,5].map(l => '<div class="drill-ax"><span class="av" style="background:' + levelColor(l) + '">' + l + '</span><span class="at">' +
        esc(ansText(arch, ax, l, k)) + '</span></div>').join("") + '</div>').join("");
  };
  ["qeArch","qeK"].forEach(i => document.getElementById(i).addEventListener("input", preview));
  preview();
  if(!id) document.getElementById("qeG").addEventListener("change", e => { document.getElementById("qeId").value = suggestId(Number(e.target.value)); });
  document.getElementById("qEditor").classList.remove("hidden");
  document.getElementById(id ? "qeQ" : "qeT").focus();
}
function closeQEditor(){ document.getElementById("qEditor").classList.add("hidden"); qEditId = null; }

function parseDepsText(text, selfId){
  const out = [];
  String(text || "").split(/\n/).map(s => s.trim()).filter(Boolean).forEach((line, i) => {
    const m = line.match(/^(\S+)(?:\s+([\d.,]+))?$/);
    if(!m) throw new Error("Ön koşul satırı " + (i + 1) + " okunamadı: «" + line + "»");
    const pre = m[1], th = m[2] == null ? 0.5 : Number(m[2].replace(",", "."));
    if(pre === selfId) throw new Error("Soru kendisinin ön koşulu olamaz.");
    if(!Q_BY_ID[pre] && pre.indexOf("SCOPE.") !== 0) throw new Error("Ön koşul bankada yok: " + pre);
    if(!(th >= 0 && th <= 1)) throw new Error("Eşik 0 ile 1 arasında olmalı: " + line);
    out.push([selfId, pre, th]);
  });
  return out;
}

function saveQEditor(){
  const err = document.getElementById("qEdErr");
  try{
    const v = id => document.getElementById(id).value;
    const id = v("qeId").trim();
    if(!id) throw new Error("Soru kimliği boş olamaz.");
    if(!qEditId && Q_BY_ID[id]) throw new Error("Bu kimlikle bir soru zaten var: " + id);
    const row = [id, Number(v("qeG")), Number(v("qeN")), v("qeT").trim(), v("qeQ").trim(), Number(v("qeW")), Number(v("qeM")),
                 Number(v("qeTag")), v("qeReg").split(/\n/).map(s => s.trim()).filter(Boolean), v("qeArch"), v("qeK").trim()];
    if(!row[F.t]) throw new Error("Kontrol başlığı boş olamaz.");
    if(!row[F.q]) throw new Error("Soru metni boş olamaz.");
    const deps = parseDepsText(v("qeDeps"), id);
    commitBank(nb => {
      if(qEditId){ const i = nb.Q.findIndex(q => q[F.id] === qEditId); nb.Q[i] = row; }
      else nb.Q.push(row);
      nb.deps = nb.deps.filter(d => d[0] !== id).concat(deps);
    });
    closeQEditor();
    bankMsg("<b>" + esc(id) + "</b> kaydedildi.");
  }catch(e){ err.textContent = e.message; }
}
function deleteQuestion(){
  const id = qEditId; if(!id) return;
  const usedBy = BANK.deps.filter(d => d[1] === id).length;
  if(!confirm(id + " silinecek" + (usedBy ? "; bu soruyu ön koşul alan " + usedBy + " bağımlılık da kaldırılacak" : "") +
              ". Daha önce üretilmiş anketler bu tarayıcıdaki üretim kayıtlarıyla değerlendirilmeye devam eder. Emin misiniz?")) return;
  try{
    commitBank(nb => { nb.Q = nb.Q.filter(q => q[F.id] !== id); nb.deps = nb.deps.filter(d => d[0] !== id && d[1] !== id); });
    closeQEditor(); bankMsg("<b>" + esc(id) + "</b> silindi.");
  }catch(e){ document.getElementById("qEdErr").textContent = e.message; }
}

/* ---------------- kapsam soruları ---------------- */
function renderScopeEdit(){
  document.getElementById("scopeEdit").innerHTML = BANK.scopes.map((s, i) =>
    '<div class="scope-edit-row" data-i="' + i + '">' +
      '<div class="field"><label>Soru · ' + esc(s[0]) + '</label><input data-f="1" value="' + esc(s[1]) + '"></div>' +
      '<div class="field"><label>Varsayılan</label><select data-f="2">' + opts([[1, "Evet"], [0, "Hayır"]], s[2] ? 1 : 0) + '</select></div>' +
      '<div class="field wide"><label>Açıklama · «Hayır» yanıtında çıkan etiket: ' + esc(BANK.tags[s[3]] || "—") + ' (' +
        BANK.Q.filter(q => q[F.tag] === s[3]).length + ' soru)</label><input data-f="4" value="' + esc(s[4] || "") + '"></div>' +
    '</div>').join("") +
    '<button class="btn btn-ghost" id="btnScopeSave" type="button">Kapsam sorularını kaydet</button>';
  document.getElementById("btnScopeSave").addEventListener("click", () => {
    try{
      commitBank(nb => {
        document.querySelectorAll("#scopeEdit .scope-edit-row").forEach(row => {
          const s = nb.scopes[Number(row.dataset.i)];
          s[1] = row.querySelector('[data-f="1"]').value.trim() || s[1];
          s[2] = Number(row.querySelector('[data-f="2"]').value);
          s[4] = row.querySelector('[data-f="4"]').value.trim();
        });
      });
      bankMsg("Kapsam soruları kaydedildi; yeni üretilecek anketlerde geçerli olur.");
    }catch(e){ bankMsg(esc(e.message), true); }
  });
}

/* ---------------- Excel dışa aktarım ---------------- */
function bankWorkbook(){
  const W = getW(), wb = XLSX.utils.book_new();
  const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  add("Sorular", [XL_Q_HEAD].concat(BANK.Q.map(q => [
    q[F.id], BANK.uct[q[F.g]][1], q[F.n] >= 0 ? BANK.nist[q[F.n]][0] + " · " + BANK.nist[q[F.n]][1] : "", q[F.t], q[F.q], "",
    CRIT_LABEL[q[F.w]], q[F.m] + " · " + XL_ML[q[F.m]], BANK.arch[q[F.arch]] || q[F.arch], q[F.k], BANK.tags[q[F.tag]] || "",
    (q[F.reg] || []).join("\n")])));
  add("Bagimliliklar", [["Kenar_ID","Soru_ID","On_Kosul_ID","Gate_Type","Min_On_Kosul_Skoru","Kaynak","Not"]].concat(BANK.deps.map((d, i) =>
    ["DEP." + pad(i + 1, 4), d[0], d[1], String(d[1]).indexOf("SCOPE.") === 0 ? "na_scope" : "maturity_drop", d[2], "analiz_paneli", ""])));
  const sab = [["Arketip","Ad","Eksen","Seviye","Şablon Metni ({k} = konu)"]];
  Object.keys(BANK.ans).forEach(a => AXES.forEach(ax => BANK.ans[a][ax].forEach((txt, l) => sab.push([a, BANK.arch[a] || a, XL_AX[ax], l + 1, txt]))));
  add("Sablonlar", sab);
  add("Kapsam_Bayraklari", [["Bayrak_ID","Soru_Metni","Varsayilan_Deger","Aciklama","Hedef_Kategori_Etiketi"]].concat(BANK.scopes.map(s =>
    [s[0], s[1], s[2] ? "Evet" : "Hayır", s[4] || "", BANK.tags[s[3]] || ""])));
  add("Agirliklar", [["Kritiklik_Derecesi","Agirlik"]].concat([1,2,3,4].map(k => [CRIT_LABEL[k], W.crit[k]])));
  add("Olgunluk_Carpanlari", [["Olgunluk_Seviyesi","Etiket","Carpan"]].concat([1,2,3,4,5].map(k => [k, ML_LABEL[k], W.ml[k]])));
  add("Ayarlar", [["Anahtar","Deger","Aciklama"], ["basamak_esigi_yuzde", W.lock, "Olgunluk basamağı kilidi eşiği (%)."],
                  ["banka_surumu", BANK.v, "Bilgi amaçlı; içe aktarmada kullanılmaz."]]);
  return wb;
}
function downloadBlob2(blob, name){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---------------- Excel içe aktarım ---------------- */
const norm = s => String(s == null ? "" : s).trim().toLocaleLowerCase("tr").replace(/\s+/g, " ");
function sheetRows(wb, name){
  const ws = wb.Sheets[name];
  if(!ws) return null;
  const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:"" });
  const head = (rows[0] || []).map(norm);
  const col = label => head.indexOf(norm(label));
  return { rows: rows.slice(1).filter(r => r.some(c => String(c).trim() !== "")), col };
}
function parseQuestionSheet(S, nb, tagIdx, problems){
  const c = {}; XL_Q_HEAD.forEach(h => { c[h] = S.col(h); });
  ["Soru_ID","Kontrol Alanı (UCT)","Soru (Mevcut Durum Kipi)","Kritiklik","Olgunluk Seviyesi","Kontrol Arketipi"].forEach(h => {
    if(c[h] < 0) throw new Error("«Sorular» sayfasında «" + h + "» sütunu yok.");
  });
  const uctIdx = {}; nb.uct.forEach((u, i) => { uctIdx[norm(u[1])] = i; uctIdx[norm(u[0])] = i; });
  const nistIdx = {}; nb.nist.forEach((n, i) => { nistIdx[norm(n[0])] = i; });
  const archIdx = {}; Object.keys(nb.arch).forEach(a => { archIdx[norm(a)] = a; archIdx[norm(nb.arch[a])] = a; });
  const cell = (r, h) => c[h] >= 0 ? String(r[c[h]] == null ? "" : r[c[h]]).trim() : "";
  nb.Q = S.rows.map((r, i) => {
    const at = "Sorular satır " + (i + 2);
    const g = uctIdx[norm(cell(r, "Kontrol Alanı (UCT)"))];
    if(g === undefined) problems.push(at + ": UCT alanı tanınmadı");
    const nistCode = cell(r, "NIST CSF Alanı").split("·")[0].trim();
    const n = (!nistCode || /^[—–-]+$/.test(nistCode)) ? -1 : nistIdx[norm(nistCode)];
    if(n === undefined) problems.push(at + ": NIST alanı tanınmadı (" + nistCode + ")");
    const w = CRIT_BY_LABEL[norm(cell(r, "Kritiklik"))] || Number(cell(r, "Kritiklik"));
    const m = parseInt(cell(r, "Olgunluk Seviyesi"), 10);
    const arch = archIdx[norm(cell(r, "Kontrol Arketipi"))];
    if(!arch) problems.push(at + ": arketip tanınmadı (" + cell(r, "Kontrol Arketipi") + ")");
    const tagName = cell(r, "Kapsam Etiketi");
    let tag = tagIdx[norm(tagName)];
    if(tag === undefined){ tag = nb.tags.length; nb.tags.push(tagName); tagIdx[norm(tagName)] = tag; }
    return [cell(r, "Soru_ID"), g === undefined ? -1 : g, n === undefined ? -1 : n, cell(r, "Kontrol Başlığı"), cell(r, "Soru (Mevcut Durum Kipi)"),
            w, m, tag, cell(r, "Mevzuat Eşlemeleri").split(/\n/).map(s => s.trim()).filter(Boolean), arch || "", cell(r, "Konu (cevaplara gömülen)")];
  });
}
function bankFromWorkbook(wb){
  const nb = cloneBank(BANK), problems = [];
  const S = sheetRows(wb, "Sorular");
  const OTHER = ["Sablonlar","Bagimliliklar","Kapsam_Bayraklari","Agirliklar","Olgunluk_Carpanlari","Ayarlar"];
  if(!S && !OTHER.some(n => wb.Sheets[n])) throw new Error("Çalışma kitabında tanınan bir sayfa yok (Sorular, Sablonlar, Bagimliliklar, Kapsam_Bayraklari…).");
  /* Önce şablonlar: yeni arketipler sorularda kullanılabilsin. */
  const T = sheetRows(wb, "Sablonlar");
  if(T){
    const ca = T.col("Arketip"), cn = T.col("Ad"), ce = T.col("Eksen"), cs = T.col("Seviye"), cx = T.col("Şablon Metni ({k} = konu)");
    const axBy = { "insan (people)":"I", "süreç (process)":"S", "teknoloji (technology)":"T", i:"I", s:"S", t:"T" };
    T.rows.forEach((r, i) => {
      const a = String(r[ca]).trim(), ax = axBy[norm(r[ce])], l = Number(r[cs]);
      if(!a || !ax || !(l >= 1 && l <= 5)){ problems.push("Sablonlar satır " + (i + 2) + " okunamadı"); return; }
      if(!nb.ans[a]){ nb.ans[a] = { I:["","","","",""], S:["","","","",""], T:["","","","",""] }; }
      if(cn >= 0 && String(r[cn]).trim()) nb.arch[a] = String(r[cn]).trim();
      nb.ans[a][ax][l - 1] = String(r[cx]).trim();
    });
  }
  const tagIdx = {}; nb.tags.forEach((t, i) => { tagIdx[norm(t)] = i; });
  if(S) parseQuestionSheet(S, nb, tagIdx, problems);
  /* «Sorular» yoksa sorular aynen kalır; yalnızca kitaptaki diğer sayfalar uygulanır. */
  const ids = new Set(nb.Q.map(q => q[F.id]));
  const D = sheetRows(wb, "Bagimliliklar");
  if(D){
    const ci = D.col("Soru_ID"), cp = D.col("On_Kosul_ID"), ct = D.col("Min_On_Kosul_Skoru");
    if(ci < 0 || cp < 0) problems.push("«Bagimliliklar» sayfasında Soru_ID / On_Kosul_ID sütunu yok");
    else nb.deps = D.rows.map(r => [String(r[ci]).trim(), String(r[cp]).trim(), r[ct] === "" || r[ct] == null ? 0.5 : Number(r[ct])]);
  } else nb.deps = nb.deps.filter(d => ids.has(d[0]) && (ids.has(d[1]) || String(d[1]).indexOf("SCOPE.") === 0));
  /* Silinen sorulara ait kenarlar kendiliğinden düşer; geri kalan bilinmeyen kimlikler hatadır. */
  const removed = new Set(BANK.Q.map(q => q[F.id]).filter(id => !ids.has(id)));
  nb.deps = nb.deps.filter(d => !removed.has(d[0]) && !removed.has(d[1]));
  nb.deps.forEach((d, i) => {
    if(!ids.has(d[0])) problems.push("Bağımlılık " + (i + 1) + ": soru bankada yok (" + d[0] + ")");
    else if(!ids.has(d[1]) && String(d[1]).indexOf("SCOPE.") !== 0) problems.push("Bağımlılık " + (i + 1) + ": ön koşul bankada yok (" + d[1] + ")");
  });
  const K = sheetRows(wb, "Kapsam_Bayraklari");
  if(K){
    const ci = K.col("Bayrak_ID"), cq = K.col("Soru_Metni"), cd = K.col("Varsayilan_Deger"), ca = K.col("Aciklama"), ct = K.col("Hedef_Kategori_Etiketi");
    K.rows.forEach(r => {
      const s = nb.scopes.find(x => x[0] === String(r[ci]).trim());
      if(!s){ problems.push("Kapsam_Bayraklari: tanınmayan bayrak " + r[ci] + " (yeni kapsam sorusu eklenemez)"); return; }
      if(String(r[cq]).trim()) s[1] = String(r[cq]).trim();
      s[2] = /^(evet|1|true)$/i.test(String(r[cd]).trim()) ? 1 : 0;
      if(ca >= 0) s[4] = String(r[ca]).trim();
      if(ct >= 0 && tagIdx[norm(r[ct])] !== undefined) s[3] = tagIdx[norm(r[ct])];
    });
  }
  let weights = null;
  const A = sheetRows(wb, "Agirliklar"), O = sheetRows(wb, "Olgunluk_Carpanlari"), Y = sheetRows(wb, "Ayarlar");
  if(A || O || Y){
    weights = getW();
    if(A) A.rows.forEach(r => { const k = CRIT_BY_LABEL[norm(r[A.col("Kritiklik_Derecesi")])]; const v = Number(r[A.col("Agirlik")]); if(k && v >= 0) weights.crit[k] = v; });
    if(O) O.rows.forEach(r => { const k = Number(r[O.col("Olgunluk_Seviyesi")]); const v = Number(r[O.col("Carpan")]); if(k >= 1 && k <= 5 && v >= 0) weights.ml[k] = v; });
    if(Y) Y.rows.forEach(r => { if(String(r[Y.col("Anahtar")]).trim() === "basamak_esigi_yuzde"){ const v = Number(r[Y.col("Deger")]); if(v >= 0 && v <= 100) weights.lock = v; } });
  }
  return { nb, weights, problems };
}
function bankDiff(nb){
  const oldById = {}; BANK.Q.forEach(q => { oldById[q[F.id]] = JSON.stringify(q); });
  const newIds = new Set(nb.Q.map(q => q[F.id]));
  return { added: nb.Q.filter(q => !(q[F.id] in oldById)).length,
           changed: nb.Q.filter(q => q[F.id] in oldById && oldById[q[F.id]] !== JSON.stringify(q)).length,
           removed: BANK.Q.filter(q => !newIds.has(q[F.id])).length };
}
function applyImported(nb, weights, label){
  const errs = validateBank(nb);
  if(errs.length) throw new Error(errs.slice(0, 8).join(" · ") + (errs.length > 8 ? " · (+" + (errs.length - 8) + " hata)" : ""));
  const d = bankDiff(nb);
  if(!confirm(label + ": " + d.added + " soru eklenecek, " + d.changed + " soru değişecek, " + d.removed + " soru silinecek" +
              (weights ? "; ağırlıklar ve basamak eşiği de güncellenecek" : "") + ". Devam edilsin mi?")) return false;
  commitBank(b => { Object.keys(b).forEach(k => delete b[k]); Object.assign(b, cloneBank(nb)); });
  if(weights){ setW(weights); renderMethod(); }
  bankMsg("<b>" + esc(label) + "</b> uygulandı: " + d.added + " eklendi, " + d.changed + " değişti, " + d.removed + " silindi. Toplam " + BANK.Q.length + " soru.");
  return true;
}

/* ---------------- olaylar ---------------- */
document.getElementById("bankList").addEventListener("click", e => {
  const b = e.target.closest("[data-qedit]"); if(b) openQEditor(b.dataset.qedit);
});
document.getElementById("btnQNew").addEventListener("click", () => openQEditor(null));
document.getElementById("btnQSave").addEventListener("click", saveQEditor);
document.getElementById("btnQCancel").addEventListener("click", closeQEditor);
document.getElementById("btnQDelete").addEventListener("click", deleteQuestion);
document.getElementById("qEditor").addEventListener("keydown", e => { if(e.key === "Escape") closeQEditor(); });

document.getElementById("btnBankXlsxOut").addEventListener("click", () => {
  const out = XLSX.write(bankWorkbook(), { bookType:"xlsx", type:"array" });
  downloadBlob2(new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                "Soru_Bankasi_" + new Date().toISOString().slice(0, 10) + ".xlsx");
});
document.getElementById("btnBankXlsxIn").addEventListener("click", () => document.getElementById("bankXlsxFile").click());
document.getElementById("bankXlsxFile").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = "";
  if(!f) return;
  try{
    const wb = XLSX.read(new Uint8Array(await f.arrayBuffer()), { type:"array" });
    const r = bankFromWorkbook(wb);
    if(r.problems.length){ bankMsg("<b>Excel yüklenmedi.</b> " + esc(r.problems.slice(0, 8).join(" · ")) + (r.problems.length > 8 ? " · (+" + (r.problems.length - 8) + ")" : ""), true); return; }
    applyImported(r.nb, r.weights, "Excel (" + f.name + ")");
  }catch(err){ bankMsg("<b>Excel yüklenmedi.</b> " + esc(err.message), true); }
});
document.getElementById("btnBankJsonOut").addEventListener("click", () => {
  const backup = { type:"aoc_bank_backup", appVersion: APP_VERSION, exportedAt: new Date().toISOString(),
                   bank: BANK, weights: getW(), issued: issuedRegistry() };
  downloadBlob2(new Blob([JSON.stringify(backup)], { type:"application/json" }), "Soru_Bankasi_Yedek_" + new Date().toISOString().slice(0, 10) + ".json");
});
document.getElementById("btnBankJsonIn").addEventListener("click", () => document.getElementById("bankJsonFile").click());
document.getElementById("bankJsonFile").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = "";
  if(!f) return;
  try{
    const d = JSON.parse(await f.text());
    if(!d || d.type !== "aoc_bank_backup" || !d.bank) throw new Error("Bu dosya bir soru bankası yedeği değil.");
    if(applyImported(d.bank, d.weights || null, "Yedek (" + f.name + ")") && d.issued){
      const reg = issuedRegistry(); Object.keys(d.issued).forEach(k => { if(!reg[k]) reg[k] = d.issued[k]; }); saveIssued(reg);
    }
  }catch(err){ bankMsg("<b>Yedek yüklenmedi.</b> " + esc(err.message), true); }
});
document.getElementById("btnBankReset").addEventListener("click", () => {
  if(!bankIsEdited()){ bankMsg("Zaten varsayılan banka kullanılıyor."); return; }
  if(!confirm("Bu tarayıcıdaki tüm soru bankası düzenlemeleri silinip build ile gelen bankaya dönülecek. Emin misiniz?")) return;
  resetBank(); refreshBankViews(); bankMsg("Varsayılan soru bankasına dönüldü.");
});

renderScopeEdit();
renderBankState();
