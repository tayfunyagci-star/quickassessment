/* Küçük doğrulama yardımcıları — başarısız kontrol süreci 1 ile bitirir. */
let fails = 0;
export function check(cond, msg, detail){
  if(cond) console.log("  ✓ " + msg);
  else { fails++; console.log("  ✗ " + msg + (detail !== undefined ? " → " + (typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 600) : "")); }
}
export function done(){ if(fails){ console.log(`  ${fails} kontrol başarısız`); process.exit(1); } }
