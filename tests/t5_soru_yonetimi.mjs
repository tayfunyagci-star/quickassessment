/* Soru Yönetimi: ekle/düzenle/sil, doğrulama, ön koşul, kapsam soruları, Excel ve JSON
   gidiş-dönüş, repodaki UCT çalışma kitabıyla uyum, kalıcılık ve varsayılana dönüş. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { ROOT, TMP, launch, watch, openPanel, download, generateSurvey } from "./lib.mjs";
import { check, done } from "./assert.mjs";
const XLSX = createRequire(import.meta.url)("xlsx");

const b = await launch();
const ctx = await b.newContext({ acceptDownloads: true, reducedMotion: "reduce" });
const errs = [];
const p = await ctx.newPage(); watch(p, "PANEL", errs); p.__acceptDialogs = true;
await openPanel(p);
const st = () => p.evaluate(() => ({ n: BANK.Q.length, deps: BANK.deps.length, edited: bankIsEdited(), v: BANK.v }));
await p.click('.hub-card[data-goto="bank"]');
let s0 = await st();
check(s0.n === 440 && !s0.edited && /Varsayılan banka/.test(await p.textContent("#bankState")), "başlangıçta varsayılan banka (440 soru)");

/* --- yeni soru --- */
await p.click("#btnQNew");
await p.selectOption("#qeG", "0");
const newId = await p.inputValue("#qeId");
check(/^UCT\.01\.\d{3}$/.test(newId), "yeni soru için kimlik önerildi: " + newId);
await p.click("#btnQSave");
check(/başlığı boş/.test(await p.textContent("#qEdErr")), "boş başlıkla kayıt reddedildi");
await p.fill("#qeT", "Test kontrol başlığı");
await p.fill("#qeQ", "Kurum test amaçlı yeni bir kontrolü işletmekte midir?");
await p.selectOption("#qeW", "4"); await p.selectOption("#qeM", "3"); await p.selectOption("#qeArch", "envanter");
await p.fill("#qeK", "test varlıkları");
await p.fill("#qeReg", "ISO27001: A.5.9\nKVKK: KVK.M.9");
await p.fill("#qeDeps", "YOK.999 0.5");
await p.click("#btnQSave");
check(/bankada yok/.test(await p.textContent("#qEdErr")), "bankada olmayan ön koşul reddedildi");
await p.fill("#qeDeps", "UCT.01.001 0.6");
await p.click("#btnQSave");
await p.waitForSelector("#qEditor.hidden", { state: "attached" });
let s1 = await st();
const row = await p.evaluate(id => Q_BY_ID[id], newId);
check(s1.n === 441 && s1.edited && row && row[5] === 4 && row[6] === 3 && row[9] === "envanter", "yeni soru eklendi ve kaydedildi");
check(await p.evaluate(id => BANK.deps.some(d => d[0] === id && d[1] === "UCT.01.001" && d[2] === 0.6), newId), "ön koşul bağımlılığı eklendi");
check(/düzenlendi/.test(await p.textContent("#bankPill")) && /Düzenlenmiş banka/.test(await p.textContent("#bankState")), "banka sürümü ve durum etiketi güncellendi");

/* --- mevcut soruyu düzenle (anket üretimine yansıması) --- */
await p.fill("#fltText", "UCT.01.002"); await p.waitForTimeout(100);
await p.click('[data-qedit="UCT.01.002"]');
check(await p.getAttribute("#qeId", "readonly") !== null, "mevcut sorunun kimliği değiştirilemez");
const yeniMetin = "Dokümantasyon (düzenlenmiş metin) envanterlerde tutulmakta mıdır?";
await p.fill("#qeQ", yeniMetin); await p.click("#btnQSave");
await p.waitForSelector("#qEditor.hidden", { state: "attached" });
check(await p.evaluate(() => Q_BY_ID["UCT.01.002"][4]) === yeniMetin, "soru metni güncellendi");
const sv = await generateSurvey(p, { tax: "uct", name: "t5_anket.html" });
const shtml = fs.readFileSync(sv, "utf8");
const sdata = JSON.parse(shtml.match(/const SURVEY = (\{.*\});\n/)[1]);
const inPlan = sdata.items.find(x => x.id === "UCT.01.002");
check(!inPlan || inPlan.q === yeniMetin, "üretilen ankette düzenlenmiş metin kullanıldı" + (inPlan ? "" : " (soru planda yok)"));

/* --- kalıcılık: çıkış + yeniden giriş --- */
const p2 = await ctx.newPage(); watch(p2, "PANEL2", errs);
await openPanel(p2);
check(await p2.evaluate(id => !!Q_BY_ID[id] && BANK.Q.length === 441, newId), "düzenlemeler yeniden girişte korunuyor");
await p2.close();

/* --- Excel gidiş-dönüş --- */
await p.evaluate(() => switchTab("bank"));
const x1 = await download(p, () => p.click("#btnBankXlsxOut"), "t5_banka.xlsx");
const wb = XLSX.read(fs.readFileSync(x1.path));
check(["Sorular","Bagimliliklar","Sablonlar","Kapsam_Bayraklari","Agirliklar","Olgunluk_Carpanlari","Ayarlar"].every(s => wb.SheetNames.includes(s)), "Excel'de tüm sayfalar var");
const rows = XLSX.utils.sheet_to_json(wb.Sheets["Sorular"], { header: 1 });
check(rows.length - 1 === 441 && rows[0][0] === "Soru_ID" && rows[0][4] === "Soru (Mevcut Durum Kipi)", "Sorular sayfası 441 satır, repo düzeniyle aynı başlıklar");
/* Excel'de değişiklik: bir sorunun kritikliği, bir soru silinir, ağırlık değişir */
const iEdit = rows.findIndex(r => r[0] === "UCT.02.001"); rows[iEdit][6] = "Düşük";
const iDel = rows.findIndex(r => r[0] === newId); rows.splice(iDel, 1);
wb.Sheets["Sorular"] = XLSX.utils.aoa_to_sheet(rows);
const ag = XLSX.utils.sheet_to_json(wb.Sheets["Agirliklar"], { header: 1 }); ag[4][1] = 5; wb.Sheets["Agirliklar"] = XLSX.utils.aoa_to_sheet(ag);
const x2 = path.join(TMP, "t5_banka_degisik.xlsx"); XLSX.writeFile(wb, x2);
await p.setInputFiles("#bankXlsxFile", x2);
await p.waitForFunction(() => /uygulandı|yüklenmedi/.test(document.getElementById("bankMsg").textContent));
const msg = await p.textContent("#bankMsg");
check(/0 eklendi, 1 değişti, 1 silindi/.test(msg), "Excel yüklendi: 1 değişiklik, 1 silme", msg);
check(await p.evaluate(id => Q_BY_ID["UCT.02.001"][5] === 1 && !Q_BY_ID[id] && !BANK.deps.some(d => d[0] === id) && getW().crit[4] === 5, newId),
      "kritiklik, silme ve ağırlık uygulandı");
/* hatalı Excel */
const bad = XLSX.read(fs.readFileSync(x2)); const br = XLSX.utils.sheet_to_json(bad.Sheets["Sorular"], { header: 1 });
br[1][1] = "Olmayan Alan"; bad.Sheets["Sorular"] = XLSX.utils.aoa_to_sheet(br);
const x3 = path.join(TMP, "t5_banka_hatali.xlsx"); XLSX.writeFile(bad, x3);
const before = await st();
await p.setInputFiles("#bankXlsxFile", x3);
await p.waitForFunction(() => /yüklenmedi/.test(document.getElementById("bankMsg").textContent));
check(JSON.stringify(await st()) === JSON.stringify(before), "hatalı Excel reddedildi, banka değişmedi");

/* --- JSON yedek gidiş-dönüş --- */
const j1 = await download(p, () => p.click("#btnBankJsonOut"), "t5_yedek.json");
await p.click("#btnBankReset");
check((await st()).n === 440 && !(await st()).edited, "varsayılana dönüldü");
await p.setInputFiles("#bankJsonFile", j1.path);
await p.waitForFunction(() => /uygulandı|yüklenmedi/.test(document.getElementById("bankMsg").textContent));
check(await p.evaluate(() => Q_BY_ID["UCT.02.001"][5] === 1 && Q_BY_ID["UCT.01.002"][4].includes("düzenlenmiş")), "yedekten geri yüklendi");

/* --- repodaki kaynak çalışma kitabıyla uyum --- */
await p.click("#btnBankReset");
await p.setInputFiles("#bankXlsxFile", path.join(ROOT, "UCT_Sorular_MevcutDurum_v3.xlsx"));
await p.waitForFunction(() => /uygulandı|yüklenmedi/.test(document.getElementById("bankMsg").textContent));
check(/0 eklendi, 0 değişti, 0 silindi/.test(await p.textContent("#bankMsg")), "UCT_Sorular_MevcutDurum_v3.xlsx sıfır farkla içe aktarıldı", await p.textContent("#bankMsg"));
check(await p.evaluate(() => JSON.stringify(BANK.Q) === JSON.stringify(BANK_DEFAULT.Q) && JSON.stringify(BANK.deps) === JSON.stringify(BANK_DEFAULT.deps)), "soru ve bağımlılık içeriği varsayılanla aynı");

/* --- yalnız şablon içeren kitap (UCT_Cevap_Setleri_v3.xlsx): sorular korunur --- */
await p.click("#btnBankReset");
await p.setInputFiles("#bankXlsxFile", path.join(ROOT, "UCT_Cevap_Setleri_v3.xlsx"));
await p.waitForFunction(() => /uygulandı|yüklenmedi|Zaten/.test(document.getElementById("bankMsg").textContent));
check(/0 eklendi, 0 değişti, 0 silindi/.test(await p.textContent("#bankMsg")) &&
      await p.evaluate(() => JSON.stringify(BANK.ans) === JSON.stringify(BANK_DEFAULT.ans) && BANK.Q.length === 440),
      "UCT_Cevap_Setleri_v3.xlsx: şablonlar uygulandı, sorular korundu", await p.textContent("#bankMsg"));

/* --- kapsam sorusu düzenleme --- */
await p.click("#btnBankReset");
await p.fill('#scopeEdit .scope-edit-row[data-i="0"] [data-f="1"]', "Kurumunuz yazılım geliştiriyor mu? (düzenlendi)");
await p.selectOption('#scopeEdit .scope-edit-row[data-i="0"] [data-f="2"]', "0");
await p.click("#btnScopeSave");
check(await p.evaluate(() => BANK.scopes[0][1].includes("düzenlendi") && BANK.scopes[0][2] === 0), "kapsam sorusu metni ve varsayılanı kaydedildi");
await p.click("#btnBankReset");
check(!(await st()).edited, "temizlik: varsayılan banka");

check(errs.length === 0, "konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await b.close();
done();
