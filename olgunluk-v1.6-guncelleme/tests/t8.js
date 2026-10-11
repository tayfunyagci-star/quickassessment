const { chromium } = require('playwright'); const D=__dirname;
(async()=>{ const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const w of [1280, 820, 420]){ const p=await b.newPage({viewport:{width:w,height:900}}); await p.goto('file://'+D+'/report6.html'); await p.waitForTimeout(400);
  const el=await p.$('#regulasyon'); await el.screenshot({path:D+`/reg_${w}.png`}); await p.close(); }
 await b.close(); })();
