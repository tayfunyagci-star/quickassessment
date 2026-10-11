/* Tüm testleri sırayla çalıştırır: node tests/run.mjs [filtre]
   Önce build alınmış olmalıdır (npm run build). */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib.mjs";

const filter = process.argv[2] || "";
const dir = path.join(ROOT, "tests");
const files = fs.readdirSync(dir).filter(f => /^t\d+_.*\.mjs$/.test(f) && f.includes(filter)).sort();
let failed = 0;
for(const f of files){
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(dir, f)], { stdio: "inherit", env: process.env });
  const ok = r.status === 0;
  if(!ok) failed++;
  console.log(`${ok ? "GEÇTİ " : "KALDI "} ${f} (${((Date.now() - t0) / 1000).toFixed(1)} sn)\n`);
}
console.log(failed ? `${failed}/${files.length} test başarısız` : `${files.length} testin tamamı geçti`);
process.exit(failed ? 1 : 0);
