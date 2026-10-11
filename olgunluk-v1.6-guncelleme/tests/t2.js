const { chromium } = require('playwright'); const fs=require('fs'); const D=__dirname;
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({acceptDownloads:true}); const page = await ctx.newPage(); const errs=[];
  page.on('pageerror', e=>errs.push(e.message)); page.on('dialog', d=>d.accept());
  await page.goto('file://'+D+'/../test.html'); await page.waitForTimeout(300);
  // 1) Export client (registers issued set), then change bank: edit question text
  await page.click('#btnGoAdmin'); await page.fill('#adminPassInput','tayfun2026'); await page.click('#btnAdminLogin');
  const [d1] = await Promise.all([page.waitForEvent('download'), page.click('#btnAdminExportHtml')]);
  console.log('client filename:', d1.suggestedFilename());
  await page.click('[data-edit="1"]'); await page.fill('#f_soru','Değiştirilmiş soru metni?'); await page.click('#btnSaveQuestion');
  await page.click('#btnAdminExit');
  const imp = async (file, pw)=>{
    await page.setInputFiles('#submissionFileInput', file);
    if(pw){ await page.waitForSelector('#passwordModal:not(.hidden)'); await page.fill('#passwordModalInput', pw); await page.click('#passwordModalOk'); }
    await page.waitForSelector('#results:not(.hidden)'); await page.waitForTimeout(200);
    return page.evaluate(()=>[...document.querySelectorAll('#resultsWrap .info-banner,#resultsWrap .completion-banner')].map(e=>e.textContent.trim().slice(0,110)));
  };
  // answers.json was produced from the earlier client of the ORIGINAL default set; issued registry is per context (fresh) -> now contains the set just exported (= original)
  console.log('A (issued):', await imp(D+'/answers.json', fs.readFileSync(D+'/pw.txt','utf8')));
  // 2) legacy plaintext v1.0-style payload (no questions)
  fs.writeFileSync(D+'/legacy.json', JSON.stringify({type:'quickassess_submission',orgName:'Eski',questionCount:31,answers:{"1":{insan:3,surec:2,teknoloji:4},"999":{insan:1}}}));
  await page.click('#btnResultsHome');
  console.log('B (legacy):', await imp(D+'/legacy.json'));
  // 3) reset bank, wrong password
  await page.click('#btnResultsHome');
  await page.setInputFiles('#submissionFileInput', D+'/answers.json');
  await page.waitForSelector('#passwordModal:not(.hidden)'); await page.fill('#passwordModalInput','00000000'); await page.click('#passwordModalOk'); await page.waitForTimeout(1500);
  // demo + docx filename
  console.log('errors', errs); await b.close();
})();
