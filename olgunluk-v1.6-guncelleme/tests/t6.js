const { chromium } = require('playwright'); const D=__dirname; const fs=require('fs');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({acceptDownloads:true}); const errs=[]; const L=(...a)=>console.log(...a);
  const watch = (p,tag)=>{ p.on('pageerror',e=>errs.push(tag+' '+e.message)); p.on('console',m=>{ if(m.type()==='error'||/Content Security Policy/i.test(m.text())) errs.push(tag+' console: '+m.text().slice(0,160)); }); p.on('dialog',d=>d.accept()); };
  const page = await ctx.newPage(); watch(page,'FULL');
  await page.goto('file://'+D+'/../test.html'); await page.waitForTimeout(400);
  L('badge', await page.textContent('#appVersionBadge'));
  // demo
  await page.click('#btnGoAdmin'); await page.fill('#adminPassInput','tayfun2026'); await page.click('#btnAdminLogin'); await page.waitForSelector('#admin:not(.hidden)');
  // excel roundtrip under CSP
  const [x] = await Promise.all([page.waitForEvent('download'), page.click('#btnAdminExportXlsx')]); await x.saveAs(D+'/bank.xlsx');
  await page.setInputFiles('#adminImportXlsxFile', D+'/bank.xlsx'); await page.waitForTimeout(500);
  L('impacts after xlsx:', await page.evaluate(()=>[...new Set(QA_CORE.S.questions.map(q=>q.etki))].join(' | ')));
  await page.click('#btnAdmin2fa'); await page.waitForTimeout(200); L('qr ok:', await page.evaluate(()=>!!document.querySelector('.tfa-qr svg')));
  await page.click('#btnTfaCancel');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnAdminExportHtml')]); await dl.saveAs(D+'/client3.html');
  const cs = fs.readFileSync(D+'/client3.html','utf8'); L('client CSP:', cs.includes("connect-src 'none'"), 'leaks:', ['TOTP_VAULT','ADMIN_HASH','computeResults','regulatory'].filter(t=>cs.includes(t)));
  // client fills with designed inconsistencies
  const cp = await ctx.newPage(); watch(cp,'CLIENT');
  await cp.goto('file://'+D+'/client3.html'); await cp.waitForTimeout(300);
  L('client impact badge sample:', await cp.evaluate(()=>QA_CORE.S.questions.map(q=>q.etki).slice(0,3).join(',')));
  await cp.fill('#orgNameInput','Örnek Lojistik A.Ş.'); await cp.click('#btnStart');
  const spec = i => { // [insan, surec, teknoloji]
    if(i===28) return ['na','na',null];          // Q29 tedarikçi sözleşme: kapsam dışı
    if(i===29) return [3,3,3];                    // Q30 tedarikçi erişimi: var
    if(i===23) return [1,2,1];                    // Q24 yedek/restore düşük
    if(i===24) return [4,5,4];                    // Q25 izole yedek yüksek
    if(i===13) return [1,1,5];                    // Q14 boyut farkı
    if(i===27) return [5,4,4];                    // Q28 SOC yüksek
    if(i===26) return [2,1,2];                    // Q27 log düşük
    const base=[2,3,2,4,3,2,3,1,3,2][i%10]; return [base, Math.max(1,base-1), Math.min(5,base+1)];
  };
  const n = await cp.evaluate(()=>QA_CORE.S.questions.length);
  for(let i=0;i<n;i++){
    await cp.evaluate((sp)=>{ const blocks=[...document.querySelectorAll('#qCard .dim-answer-block')];
      blocks.forEach(bl=>{ const k=['insan','surec','teknoloji'].indexOf(bl.dataset.dim); const v=sp[k]; if(v==null) return;
        const sel = v==='na' ? '.pill-na' : `.pill-btn[data-level="${v}"]`; document.querySelector(`#qCard .dim-answer-block[data-dim="${bl.dataset.dim}"] ${sel}`).click(); }); }, spec(i));
    if(i<n-1) await cp.click('#btnNext');
  }
  const [d2] = await Promise.all([cp.waitForEvent('download'), cp.click('#btnNext')]); await d2.saveAs(D+'/answers3.json');
  const pw = await cp.textContent('#submissionPasswordValue');
  await page.click('#btnAdminExit');
  await page.setInputFiles('#submissionFileInput', D+'/answers3.json'); await page.waitForSelector('#passwordModal:not(.hidden)');
  await page.fill('#passwordModalInput', pw); await page.click('#passwordModalOk'); await page.waitForSelector('#results:not(.hidden)');
  L('notes on screen:', await page.evaluate(()=>[...document.querySelectorAll('#resultsWrap .gaps-section')].filter(s=>s.textContent.includes('Değerlendirme Notları')).map(s=>[...s.querySelectorAll('.gap-row')].map(r=>r.textContent.trim().slice(0,150)))));
  const [d3] = await Promise.all([page.waitForEvent('download',{timeout:30000}), page.click('#btnExportDocx')]); await d3.saveAs(D+'/report6.docx'); const [d4] = await Promise.all([page.waitForEvent('download',{timeout:30000}), page.click('#btnExportHtml')]); await d4.saveAs(D+'/report6.html'); L('html', d4.suggestedFilename());
  L('docx', d3.suggestedFilename()); L('ERRORS', errs); await b.close();
})();
