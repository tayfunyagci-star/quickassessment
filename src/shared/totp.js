/* TOTP (RFC 6238) / HOTP (RFC 4226) — WebCrypto tabanlı, harici bağımlılık yok.
   Google/Microsoft Authenticator ile uyumlu: Base32 gizli anahtar, SHA-1, 6 hane, 30 sn. */
(function(root){
"use strict";
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Decode(str){
  const s = String(str || "").toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  if(!s || /[^A-Z2-7]/.test(s)) throw new Error("Geçersiz Base32 anahtar");
  let bits = 0, val = 0; const out = [];
  for(const ch of s){
    val = (val << 5) | B32.indexOf(ch); bits += 5;
    if(bits >= 8){ out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}
function base32Encode(bytes){
  let bits = 0, val = 0, out = "";
  for(const b of bytes){
    val = (val << 8) | b; bits += 8;
    while(bits >= 5){ out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if(bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function randomSecret(nBytes){ return base32Encode(crypto.getRandomValues(new Uint8Array(nBytes || 20))); }
const ALG = { SHA1:"SHA-1", "SHA-1":"SHA-1", SHA256:"SHA-256", "SHA-256":"SHA-256", SHA512:"SHA-512", "SHA-512":"SHA-512" };
async function hotp(keyBytes, counter, digits, algorithm){
  digits = digits || 6;
  const key = await crypto.subtle.importKey("raw", keyBytes, { name:"HMAC", hash: ALG[algorithm || "SHA1"] || "SHA-1" }, false, ["sign"]);
  const msg = new Uint8Array(8); let c = counter;
  for(let i = 7; i >= 0; i--){ msg[i] = c & 255; c = Math.floor(c / 256); }
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const off = h[h.length - 1] & 15;
  const bin = ((h[off] & 127) << 24) | (h[off+1] << 16) | (h[off+2] << 8) | h[off+3];
  return String(bin % Math.pow(10, digits)).padStart(digits, "0");
}
function stepAt(timeMs, period){ return Math.floor((timeMs == null ? Date.now() : timeMs) / 1000 / (period || 30)); }
async function totp(secretB32, opts){
  opts = opts || {};
  return hotp(base32Decode(secretB32), stepAt(opts.time, opts.period), opts.digits, opts.algorithm);
}
/* Doğrulama: ±window adım tolerans. Eşleşen adımı döndürür (tekrar kullanım kontrolü için), yoksa null. */
async function verify(secretB32, code, opts){
  opts = opts || {};
  const c = String(code || "").replace(/\s/g, "");
  const digits = opts.digits || 6;
  if(!new RegExp(`^\\d{${digits}}$`).test(c)) return null;
  const key = base32Decode(secretB32), now = stepAt(opts.time, opts.period), w = opts.window == null ? 1 : opts.window;
  for(let d = -w; d <= w; d++){
    if(await hotp(key, now + d, digits, opts.algorithm) === c) return now + d;
  }
  return null;
}
function parseOtpauth(uri){
  const u = new URL(uri.trim());
  if(u.protocol !== "otpauth:") throw new Error("otpauth:// bağlantısı bekleniyor");
  if(u.host.toLowerCase() !== "totp") throw new Error("Yalnızca TOTP desteklenir");
  const label = decodeURIComponent(u.pathname.replace(/^\//, ""));
  const p = u.searchParams;
  let issuer = p.get("issuer") || "", account = label;
  if(label.includes(":")){ const i = label.indexOf(":"); issuer = issuer || label.slice(0, i); account = label.slice(i + 1); }
  const secret = (p.get("secret") || "").toUpperCase().replace(/\s/g, "");
  base32Decode(secret);
  return { issuer: issuer.trim(), account: account.trim(), secret,
    digits: parseInt(p.get("digits") || "6", 10), period: parseInt(p.get("period") || "30", 10),
    algorithm: (p.get("algorithm") || "SHA1").toUpperCase().replace("-", "") };
}
function buildOtpauth(o){
  const label = encodeURIComponent(`${o.issuer}:${o.account}`);
  const q = new URLSearchParams({ secret:o.secret, issuer:o.issuer, algorithm:o.algorithm || "SHA1", digits:String(o.digits || 6), period:String(o.period || 30) });
  return `otpauth://totp/${label}?${q.toString()}`;
}
/* Parola tabanlı şifreleme (PBKDF2-SHA256 → AES-256-GCM) */
function b64(buf){ let s = ""; new Uint8Array(buf).forEach(b => s += String.fromCharCode(b)); return btoa(s); }
function unb64(str){ const s = atob(str); const a = new Uint8Array(s.length); for(let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
async function pwKey(password, salt, iter){
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name:"PBKDF2", salt, iterations: iter, hash:"SHA-256" }, km, { name:"AES-GCM", length:256 }, false, ["encrypt","decrypt"]);
}
async function sealText(text, password, iter){
  iter = iter || 250000;
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, await pwKey(password, salt, iter), new TextEncoder().encode(text));
  return { v:1, kdf:"PBKDF2-SHA256", iter, salt:b64(salt), iv:b64(iv), ct:b64(ct) };
}
async function openText(box, password){
  try{
    const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv:unb64(box.iv) }, await pwKey(password, unb64(box.salt), box.iter || 250000), unb64(box.ct));
    return new TextDecoder().decode(pt);
  }catch(e){ throw new Error("Parola hatalı veya veri bozuk"); }
}
root.QA_TOTP = { base32Decode, base32Encode, randomSecret, hotp, totp, verify, stepAt, parseOtpauth, buildOtpauth, sealText, openText };
})(typeof window !== "undefined" ? window : globalThis);
