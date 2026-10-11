/* TOTP kitaplığı: RFC 6238 test vektörleri (SHA1/256/512) + Kimlik Doğrulayıcı uygulaması
   ile panelin aynı kodu ürettiğinin doğrulanması. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT, AUTH, launch, watch, fileUrl } from "./lib.mjs";
import { check, done } from "./assert.mjs";

/* --- 1) RFC 6238 vektörleri (Node) --- */
const sandbox = { crypto: globalThis.crypto, TextEncoder, TextDecoder, btoa, atob, URL, URLSearchParams, Uint8Array, Math, String, Error, RegExp };
sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "src/shared/totp.js"), "utf8"), sandbox);
const T = sandbox.QA_TOTP;
const enc = s => T.base32Encode(new TextEncoder().encode(s));
const k1 = enc("12345678901234567890"), k256 = enc("12345678901234567890123456789012"),
      k512 = enc("1234567890123456789012345678901234567890123456789012345678901234");
const cases = [[59,"94287082","46119246","90693936"],[1111111109,"07081804","68084774","25091201"],
               [1234567890,"89005924","91819424","93441116"],[20000000000,"65353130","77737706","47863826"]];
for(const [t, a, b2, c] of cases){
  const r = [await T.totp(k1, { time:t*1000, digits:8 }), await T.totp(k256, { time:t*1000, digits:8, algorithm:"SHA256" }),
             await T.totp(k512, { time:t*1000, digits:8, algorithm:"SHA512" })];
  check(r[0] === a && r[1] === b2 && r[2] === c, `RFC 6238 t=${t}: SHA1/256/512`, r);
}
const s = T.randomSecret(20), code = await T.totp(s);
check(await T.verify(s, code) === T.stepAt(), "güncel kod doğrulanıyor");
check(await T.verify(s, "000000") === null || code === "000000", "yanlış kod reddediliyor");
const u = T.buildOtpauth({ issuer:"Scale Analiz Paneli", account:"Danışman", secret:s });
const pu = T.parseOtpauth(u);
check(pu.issuer === "Scale Analiz Paneli" && pu.account === "Danışman" && pu.secret === s, "otpauth bağlantısı gidiş-dönüş");
const box = await T.sealText(s, "kasa-parola");
let bad = false; try{ await T.openText(box, "yanlis"); }catch(e){ bad = true; }
check(await T.openText(box, "kasa-parola") === s && bad, "kasa şifreleme: doğru parola açar, yanlış açamaz");

/* --- 2) Kimlik Doğrulayıcı uygulaması --- */
const br = await launch(); const errs = [];
const ctx = await br.newContext();
const au = await ctx.newPage(); watch(au, "KIMLIK", errs); au.__acceptDialogs = true;
await au.goto(fileUrl(AUTH)); await au.waitForSelector("#scrSetup:not(.hidden)");
await au.fill("#setupPw", "kasaParola1"); await au.fill("#setupPw2", "kasaParola1"); await au.click("#btnSetup");
await au.waitForSelector("#scrMain:not(.hidden)");
check(await au.evaluate(() => { const v = localStorage.getItem("qa_authenticator_vault_v1"); return !!v && v.includes("ct") && !v.includes("secret"); }), "kasa tarayıcıda şifreli saklanıyor");
await au.click("#btnAdd"); await au.fill("#addUri", u); await au.waitForTimeout(200); await au.click("#btnAddSave"); await au.waitForTimeout(300);
const shown = (await au.textContent(".acct-code")).replace(/\s/g, "");
const expect = await T.totp(s);
check(shown === expect || shown === await T.totp(s, { time: Date.now() - 1500 }), "uygulamanın gösterdiği kod panelin beklediği kodla aynı", { shown, expect });
check(errs.length === 0, "konsol hatası, CSP ihlali veya ağ isteği yok", errs);
await br.close();
done();
