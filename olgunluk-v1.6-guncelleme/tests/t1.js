const { chromium } = require('playwright');
const fs = require('fs');
const D = __dirname;
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx = await b.newContext({acceptDownloads:true});
  const errs=[]; const log=(...a)=>console.log(...a);
  const page = await ctx.newPage();
  page.on('pageerror', e=>errs.push('FULL: '+e.message));
  page.on('dialog', d=>{ log('dialog:', d.message().slice(0,120)); d.accept(); });
  await page.goto('file://'+D+'/../test.html'); await page.waitForTimeout(500);
  log('badge', await page.textContent('#appVersionBadge'), '| title', await page.title());
  // admin gate
  await page.click('#btnGoAdmin');
  log('after GoAdmin visible gate:', await page.isVisible('#adminGate'), 'admin:', await page.isVisible('#admin'));
  await page.goto('file://'+D+'/../test.html#admin'); await page.waitForTimeout(300);
  log('hash route gate:', await page.isVisible('#adminGate'), 'admin:', await page.isVisible('#admin'));
  await page.fill('#adminPassInput','yanlis'); await page.click('#btnAdminLogin'); await page.waitForTimeout(200);
  log('wrong pw err:', await page.textContent('#gateErr'), 'admin:', await page.isVisible('#admin'));
  await page.fill('#adminPassInput','tayfun2026'); await page.click('#btnAdminLogin'); await page.waitForTimeout(200);
  log('right pw admin:', await page.isVisible('#admin'));
  // export client module
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnAdminExportHtml')]);
  await dl.saveAs(D+'/client.html'); log('client saved', dl.suggestedFilename());
  // client
  const cp = await ctx.newPage();
  cp.on('pageerror', e=>errs.push('CLIENT: '+e.message));
  cp.on('dialog', d=>d.accept());
  await cp.goto('file://'+D+'/client.html#admin'); await cp.waitForTimeout(400);
  log('client title', await cp.title(), '| ids present:', await cp.evaluate(()=>['admin','adminGate','results','internalTools','linkDemo','passwordModal'].map(i=>!!document.getElementById(i)).join(',')));
  log('client visible landing:', await cp.isVisible('#landing'), 'clientInfoPanels:', await cp.isVisible('#clientInfoPanels'), 'QA_FULL:', await cp.evaluate(()=>typeof window.QA_FULL));
  await cp.fill('#orgNameInput','Test Enerji A.Ş.');
  await cp.click('#btnStart');
  // answer: pattern with some NA and some unanswered
  const n = await cp.evaluate(()=>window.QA_CORE.S.questions.length);
  for(let i=0;i<n;i++){
    await cp.evaluate((i)=>{
      const blocks=[...document.querySelectorAll('#qCard .dim-answer-block')];
      blocks.forEach((bl,k)=>{
        if(i===5 && k===2) return;                 // partial
        if(i===9) return;                           // unanswered
        if(i===12 && k===1){ bl.querySelector('.pill-na').click(); return; }
        const lvl = [1,2,3,4,2,3,1,4,5,2,3,2][(i*3+k)%12];
        document.querySelectorAll('#qCard .dim-answer-block')[k].querySelector(`.pill-btn[data-level="${lvl}"]`).click();
      });
    }, i);
    if(i<n-1) await cp.click('#btnNext');
  }
  const [dl2] = await Promise.all([cp.waitForEvent('download'), cp.click('#btnNext')]);
  await dl2.saveAs(D+'/answers.json');
  const pw = await cp.textContent('#submissionPasswordValue');
  log('client done visible', await cp.isVisible('#clientDone'), 'pw', pw, 'file', dl2.suggestedFilename());
  fs.writeFileSync(D+'/pw.txt', pw);
  // import into full
  await page.click('#btnAdminExit'); await page.waitForTimeout(200);
  await page.setInputFiles('#submissionFileInput', D+'/answers.json');
  await page.waitForSelector('#passwordModal:not(.hidden)');
  await page.fill('#passwordModalInput', pw); await page.click('#passwordModalOk');
  await page.waitForSelector('#results:not(.hidden)', {timeout:15000});
  log('results score', await page.textContent('#resultsWrap .score-big'), '| banners:', await page.evaluate(()=>[...document.querySelectorAll('#resultsWrap .info-banner,#resultsWrap .completion-banner')].map(e=>e.textContent.trim().slice(0,90))));
  const [dl3] = await Promise.all([page.waitForEvent('download',{timeout:30000}), page.click('#btnExportDocx')]);
  await dl3.saveAs(D+'/report.docx'); log('docx', dl3.suggestedFilename());
  await page.screenshot({path:D+'/results.png', fullPage:false});
  log('ERRORS', errs);
  await b.close();
})();
