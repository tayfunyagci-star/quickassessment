import fs from 'fs';
globalThis.btoa ??= s=>Buffer.from(s,'binary').toString('base64'); 
eval(fs.readFileSync(process.argv[2],'utf8'));
const T = globalThis.QA_TOTP;
// RFC 6238 test vectors (8 digits)
const k1 = T.base32Encode(new TextEncoder().encode("12345678901234567890"));
const k256 = T.base32Encode(new TextEncoder().encode("12345678901234567890123456789012"));
const k512 = T.base32Encode(new TextEncoder().encode("1234567890123456789012345678901234567890123456789012345678901234"));
const cases = [[59,"94287082","46119246","90693936"],[1111111109,"07081804","68084774","25091201"],[1234567890,"89005924","91819424","93441116"],[20000000000,"65353130","77737706","47863826"]];
let ok = true;
for(const [t,a,b,c] of cases){
  const r = [await T.totp(k1,{time:t*1000,digits:8}), await T.totp(k256,{time:t*1000,digits:8,algorithm:"SHA256"}), await T.totp(k512,{time:t*1000,digits:8,algorithm:"SHA512"})];
  const pass = r[0]===a && r[1]===b && r[2]===c; ok = ok && pass; console.log(t, r.join(" "), pass?"OK":"FAIL");
}
const s = T.randomSecret(); const code = await T.totp(s); console.log('verify now:', await T.verify(s, code) === T.stepAt(), 'wrong:', await T.verify(s, "000000"));
const u = T.buildOtpauth({issuer:"Olgunluk Yönetim", account:"admin", secret:s}); const p = T.parseOtpauth(u); console.log(u.slice(0,60), p.issuer, p.account, p.secret===s);
const box = await T.sealText(s, "pw"); console.log('seal/open', await T.openText(box,"pw")===s); try{ await T.openText(box,"x"); }catch(e){ console.log('bad pw ->', e.message); }
console.log(ok ? "RFC6238 ALL OK" : "RFC FAIL");
