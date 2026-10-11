const { chromium } = require('playwright'); const D=__dirname; const fs=require('fs');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({acceptDownloads:true, viewport:{width:1360,height:900}}); const errs=[]; const L=(...a)=>console.log(...a);
  const watch=(p,t)=>{ p.on('pageerror',e=>errs.push(t+' '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(t+' '+m.text().slice(0,140)); }); p.on('dialog',d=>{ errs.push(t+' dialog '+d.message().slice(0,80)); d.accept(); }); };
  const page = await ctx.newPage(); watch(page,'FULL');
  await page.goto('file://'+D+'/../test.html'); await page.waitForTimeout(500);
  L('hero hidden:', !(await page.isVisible('.landing-hero')), 'hub:', await page.isVisible('#toolHub'), 'theme:', await page.evaluate(()=>document.documentElement.dataset.theme), 'font:', await page.evaluate(()=>getComputedStyle(document.body).fontFamily));
  await page.screenshot({path:D+'/s_hub_dark.png'});
  await page.click('#themeToggle'); await page.waitForTimeout(150); await page.screenshot({path:D+'/s_hub_light.png'});
  // drop answers3.json (from previous test) onto dropzone
  const data = fs.readFileSync(D+'/answers3.json','utf8');
  await page.evaluate((txt)=>{ const dt=new DataTransfer(); dt.items.add(new File([txt],'cevap.json',{type:'application/json'}));
    const dz=document.getElementById('dropZone'); ['dragenter','dragover','drop'].forEach(t=>dz.dispatchEvent(new DragEvent(t,{dataTransfer:dt,bubbles:true,cancelable:true}))); }, data);
  await page.waitForSelector('#passwordModal:not(.hidden)'); L('drop -> password modal ok');
  await page.screenshot({path:D+'/s_pw_light.png'});
  // password unknown for answers3 (old run) — read from t4? skip: cancel
  await page.click('#passwordModalCancel');
  // hub export -> login -> export
  await page.click('#btnHubExport'); await page.waitForSelector('#adminGate:not(.hidden)');
  await page.screenshot({path:D+'/s_gate_light.png'});
  await page.fill('#adminPassInput','tayfun2026');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnAdminLogin')]); await dl.saveAs(D+'/client5.html');
  L('export after login:', dl.suggestedFilename(), 'admin visible:', await page.isVisible('#admin'));
  await page.screenshot({path:D+'/s_admin_light.png'});
  await page.click('#btnAdminExit'); await page.waitForTimeout(200); L('metrics:', await page.textContent('#hubMetrics').then(t=>t.replace(/\s+/g,' ').slice(0,200)));
  // client
  const cp = await ctx.newPage(); watch(cp,'CLIENT'); await cp.goto('file://'+D+'/client5.html'); await cp.waitForTimeout(400);
  L('client hero:', await cp.isVisible('.landing-hero'), 'hub present:', await cp.evaluate(()=>!!document.getElementById('toolHub')), 'marka:', await cp.textContent('#markaAlt'));
  await cp.screenshot({path:D+'/s_client_landing.png', fullPage:false});
  await cp.click('#btnStart'); await cp.waitForTimeout(200);
  await cp.click('.dim-answer-block[data-dim="insan"] .pill-btn[data-level="2"]'); await cp.click('.dim-answer-block[data-dim="surec"] .pill-btn[data-level="5"]');
  await cp.screenshot({path:D+'/s_client_q.png'});
  // results with demo answers via full page self path
  await page.evaluate(()=>{ const S=QA_CORE.S; S.questions.forEach((q,i)=>{ S.answers[q.id]={insan:[1,2,3,4,5][i%5], surec:[2,3,1,4,3][i%5], teknoloji: q.teknoloji?[3,4,5,2,1][i%5]:null}; }); QA_FULL.finishAssessment(); });
  await page.waitForTimeout(300); await page.screenshot({path:D+'/s_results_light.png', fullPage:true});
  await page.evaluate(()=>document.documentElement.dataset.theme='dark'); await page.waitForTimeout(150); await page.screenshot({path:D+'/s_results_dark.png', fullPage:true});
  L('ERRORS', errs); await b.close();
})();
