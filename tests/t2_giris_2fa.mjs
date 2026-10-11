/* Giriş kapısı: yanlış/doğru parola, şifresiz kabukta iç bilgi yok, 5 hatada kilit,
   2FA kurulumu → yeni dosyada parola + kod, aynı kodun tekrarı, 2FA kapatma. */
import fs from "node:fs";
import { launch, watch, download, fileUrl, openPanel, PANEL, TEST_PASSWORD } from "./lib.mjs";
import { check, done } from "./assert.mjs";

const b = await launch();
const errs = [];
const newCtx = async () => { const c = await b.newContext({ acceptDownloads: true }); await c.clock.install(); return c; };

/* --- 1) parola kapısı --- */
let ctx = await newCtx();
let p = await ctx.newPage(); watch(p, "KAPI", errs);
await p.goto(fileUrl(PANEL)); await p.waitForSelector("#gatePw");
const shellText = await p.evaluate(() => document.documentElement.outerHTML);
check(!/UCT\.01\.001|computeResults|CONTRA_RULES/.test(shellText), "girişten önce sayfada soru bankası / iç mantık yok");
check(!shellText.includes(TEST_PASSWORD), "parola dosyada yok");
check(await p.isHidden("#gateOtp"), "2FA kurulu değilken kod alanı gizli");
await p.fill("#gatePw", "yanlis-parola-0000"); await p.click("#btnGate");
await p.waitForFunction(() => /hatalı/.test(document.getElementById("gateErr").textContent));
check(await p.isVisible("#gate") && !(await p.$("#tabHub")), "yanlış parolayla panel açılmadı");
for(let i = 0; i < 4; i++){ await p.fill("#gatePw", "yanlis-" + i + "-xxxxxxx"); await p.click("#btnGate"); await p.waitForFunction(n => !document.getElementById("btnGate").disabled, i); await p.waitForTimeout(50); }
check(/kilitlendi/.test(await p.textContent("#gateErr")), "5 hatalı denemede giriş kilitlendi", await p.textContent("#gateErr"));
await p.fill("#gatePw", TEST_PASSWORD); await p.click("#btnGate"); await p.waitForTimeout(200);
check(/kilitli/.test(await p.textContent("#gateErr")), "kilit süresince doğru parola da reddediliyor");
await p.clock.fastForward(5 * 60 * 1000 + 1000);
await p.fill("#gatePw", TEST_PASSWORD); await p.click("#btnGate");
await p.waitForSelector("#tabHub", { timeout: 20000 });
check(await p.isVisible("#tabHub") && await p.isHidden("#tabsBar"), "kilit bitince doğru parolayla Değerlendirme Merkezi açıldı");
check(await p.isHidden("#gate").catch(() => true), "giriş ekranı kaldırıldı");
check(await p.$$eval(".hub-card[data-goto]", els => els.length) >= 2 && await p.isVisible("#uploadBox"), "merkezde analiz alanı + Anket Üretimi + Soru Yönetimi");
await p.click('.hub-card[data-goto="gen"]');
check(await p.isVisible("#tabGen") && await p.isVisible('#tabsBar .tab-btn[data-tab="gen"]') && await p.isHidden('#tabsBar .tab-btn[data-tab="bank"]'), "Anket Üretimi açıldı, yalnız kendi sekmesi görünüyor");
await p.click('#tabsBar .tab-home');
await p.click('.hub-card[data-goto="bank"]');
check(await p.isVisible("#tabBank") && await p.isVisible('#tabsBar .tab-btn[data-tab="method"]'), "Soru Yönetimi açıldı (banka + metodoloji)");

/* --- 2) 2FA kurulumu --- */
await p.click("#btnSecurity");
await p.waitForSelector("#btnTfaEnable");
const secret = await p.evaluate(() => tfaDraftSecret);
const code1 = await p.evaluate(s => QA_TOTP.totp(s), secret);
await p.fill("#tfaPw", "yanlis-parola-0000"); await p.fill("#tfaCode", code1); await p.click("#btnTfaEnable");
await p.waitForFunction(() => /hatalı/.test(document.getElementById("tfaErr").textContent));
check(true, "2FA kurulumunda yanlış parola reddedildi");
await p.fill("#tfaPw", TEST_PASSWORD); await p.fill("#tfaCode", code1);
const d = await download(p, () => p.click("#btnTfaEnable"), "t2_panel_2fa.html");
const html2 = fs.readFileSync(d.path, "utf8");
check(/const TOTP_VAULT = \{/.test(html2) && !html2.includes(secret), "yeni dosyada şifreli kasa var, gizli anahtar açıkta değil");
check(await p.isVisible("#tfaBanner") && /etkinleştirildi/.test(await p.textContent("#tfaBanner")), "kurulum sonrası uyarı gösterildi");

/* --- 3) yeni dosyada giriş --- */
const p2 = await ctx.newPage(); watch(p2, "2FA", errs);
await p2.goto(fileUrl(d.path)); await p2.waitForSelector("#gatePw");
check(await p2.isVisible("#gateOtp"), "2FA'lı dosyada kod alanı görünüyor");
await p2.fill("#gatePw", TEST_PASSWORD); await p2.click("#btnGate"); await p2.waitForTimeout(150);
check(/6 haneli kodu/.test(await p2.textContent("#gateErr")), "kodsuz giriş engellendi");
await p2.fill("#gatePw", TEST_PASSWORD); await p2.fill("#gateOtp", code1); await p2.click("#btnGate");
await p2.waitForFunction(() => /zaten kullanıldı/.test(document.getElementById("gateErr").textContent), null, { timeout: 15000 });
check(true, "kurulumda kullanılan kod tekrar kullanılamıyor");
await p2.fill("#gatePw", TEST_PASSWORD); await p2.fill("#gateOtp", "000000"); await p2.click("#btnGate");
await p2.waitForFunction(() => /hatalı/.test(document.getElementById("gateErr").textContent), null, { timeout: 15000 });
check(true, "yanlış kod reddedildi");
await p2.clock.fastForward(31 * 1000);
const code2 = await p2.evaluate(s => QA_TOTP.totp(s), secret);
await p2.fill("#gatePw", TEST_PASSWORD); await p2.fill("#gateOtp", code2); await p2.click("#btnGate");
await p2.waitForSelector("#tabHub", { timeout: 20000 });
check(true, "parola + yeni kodla giriş yapıldı");

/* --- 4) 2FA kapatma --- */
p2.__acceptDialogs = true;
await p2.click("#btnSecurity");
await p2.waitForSelector("#btnTfaDisable");
await p2.clock.fastForward(31 * 1000);
const code3 = await p2.evaluate(s => QA_TOTP.totp(s), secret);
await p2.fill("#tfaPw", TEST_PASSWORD); await p2.fill("#tfaCode", code3);
const d2 = await download(p2, () => p2.click("#btnTfaDisable"), "t2_panel_2fa_kapali.html");
check(/const TOTP_VAULT = null;/.test(fs.readFileSync(d2.path, "utf8")), "2FA kapatılınca kasasız dosya indirildi");

check(errs.length === 0, "konsol hatası, CSP ihlali, beklenmeyen diyalog veya ağ isteği yok", errs);
await b.close();
done();
