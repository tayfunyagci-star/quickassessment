const { chromium } = require('playwright'); const D=__dirname; const fs=require('fs');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({acceptDownloads:true}); await ctx.grantPermissions(['clipboard-read','clipboard-write']);
  const errs=[]; const L=(...a)=>console.log(...a);
  const au = await ctx.newPage(); au.on('pageerror',e=>errs.push('AUTH '+e.message)); au.on('dialog',d=>d.accept());
  await au.goto('file://'+D+'/../auth_test.html'); await au.waitForTimeout(300);
  L('auth setup visible', await au.isVisible('#scrSetup'), 'ver', await au.textContent('#ver'));
  await au.fill('#setupPw','kasaParola1'); await au.fill('#setupPw2','kasaParola1'); await au.click('#btnSetup'); await au.waitForSelector('#scrMain:not(.hidden)');
  L('vault stored encrypted:', await au.evaluate(()=>{const v=localStorage.getItem('qa_authenticator_vault_v1'); return v.includes('ct') && !v.includes('secret');}));
  // main app
  const ap = await ctx.newPage(); ap.on('pageerror',e=>errs.push('APP '+e.message)); ap.on('dialog',d=>d.accept());
  await ap.goto('file://'+D+'/../test.html#admin'); await ap.waitForTimeout(300);
  L('otp field hidden (no vault):', !(await ap.isVisible('#adminOtpInput')));
  await ap.fill('#adminPassInput','tayfun2026'); await ap.click('#btnAdminLogin'); await ap.waitForSelector('#admin:not(.hidden)');
  L('banner:', (await ap.textContent('#admin2faBanner')).slice(0,60));
  await ap.click('#btnAdmin2fa'); await ap.waitForSelector('#tfaUri');
  const uri = await ap.textContent('#tfaUri'); L('qr svg:', await ap.evaluate(()=>!!document.querySelector('.tfa-qr svg')), uri.slice(0,70));
  // add to authenticator
  await au.click('#btnAdd'); await au.fill('#addUri', uri); await au.waitForTimeout(300);
  L('preview:', await au.textContent('#addPreview')); await au.click('#btnAddSave'); await au.waitForTimeout(400);
  const codeOf = async()=> (await au.textContent('.acct-code')).replace(/\s/g,'');
  let code = await codeOf(); L('auth code', code);
  await ap.fill('#tfaPw','tayfun2026'); await ap.fill('#tfaCode','123456'); await ap.click('#btnTfaEnable'); await ap.waitForTimeout(300);
  L('wrong code err:', await ap.textContent('#tfaErr'));
  await ap.fill('#tfaCode', code);
  const [dl] = await Promise.all([ap.waitForEvent('download'), ap.click('#btnTfaEnable')]);
  await dl.saveAs(D+'/app2fa.html'); L('2fa file:', dl.suggestedFilename(), '| banner:', (await ap.textContent('#admin2faBanner')).slice(0,50));
  const src = fs.readFileSync(D+'/app2fa.html','utf8'); const m = src.match(/const TOTP_VAULT = (.*?);\/\*@END_TOTP\*\//); 
  L('vault embedded, secret not plaintext:', m[1].length>50, !src.includes(uri.match(/secret=([A-Z2-7]+)/)[1]));
  // new file login
  const p2 = await ctx.newPage(); p2.on('pageerror',e=>errs.push('APP2 '+e.message)); p2.on('dialog',d=>d.accept());
  await p2.goto('file://'+D+'/app2fa.html#admin'); await p2.waitForTimeout(300);
  L('otp field visible:', await p2.isVisible('#adminOtpInput'), '| hint:', await p2.textContent('#gateHint'));
  const tryLogin = async(pw, c)=>{ await p2.fill('#adminPassInput',pw); await p2.fill('#adminOtpInput',c); await p2.click('#btnAdminLogin'); await p2.waitForTimeout(700); return [await p2.isVisible('#admin'), await p2.textContent('#gateErr')]; };
  L('pw only:', await tryLogin('tayfun2026',''));
  L('replay enrol code:', await tryLogin('tayfun2026', code));
  // wait for next step
  const waitNext = async(prev)=>{ for(let i=0;i<40;i++){ const c=await codeOf(); if(c!==prev) return c; await au.waitForTimeout(1000);} };
  code = await waitNext(code); L('next code', code);
  L('wrong pw + right code:', await tryLogin('yanlis', code));
  L('right:', await tryLogin('tayfun2026', code));
  // client export from 2fa app has no vault/qr
  const [dl2] = await Promise.all([p2.waitForEvent('download'), p2.click('#btnAdminExportHtml')]); await dl2.saveAs(D+'/client2.html');
  const cs = fs.readFileSync(D+'/client2.html','utf8'); L('client leaks:', ['TOTP_VAULT','qrcode','QA_TOTP','ADMIN_HASH'].filter(t=>cs.includes(t)));
  // lockout
  const p3 = await ctx.newPage(); await p3.goto('file://'+D+'/app2fa.html#admin'); await p3.waitForTimeout(300);
  for(let i=0;i<5;i++){ await p3.fill('#adminPassInput','x'); await p3.fill('#adminOtpInput','000000'); await p3.click('#btnAdminLogin'); await p3.waitForTimeout(150); }
  await p3.fill('#adminPassInput','tayfun2026'); await p3.fill('#adminOtpInput', await codeOf()); await p3.click('#btnAdminLogin'); await p3.waitForTimeout(300);
  L('after 5 fails:', await p3.textContent('#gateErr'), 'admin:', await p3.isVisible('#admin'));
  // authenticator lock/unlock + backup
  await au.click('#btnLock'); L('locked', await au.isVisible('#scrLock'));
  await au.fill('#lockPw','yanlis'); await au.click('#btnUnlock'); await au.waitForTimeout(800); L('bad unlock:', await au.textContent('#lockErr'));
  await au.fill('#lockPw','kasaParola1'); await au.click('#btnUnlock'); await au.waitForSelector('#scrMain:not(.hidden)'); L('unlocked accounts:', await au.locator('.acct').count());
  await au.click('#btnSettings'); const [bk] = await Promise.all([au.waitForEvent('download'), au.click('#btnExport')]); L('backup', bk.suggestedFilename());
  await au.click('#btnSettingsClose'); await au.screenshot({path:D+'/auth.png'}); 
  await p2.click('#btnAdmin2fa'); await p2.waitForTimeout(200); await p2.screenshot({path:D+'/admin2fa.png', fullPage:true});
  L('ERRORS', errs); await b.close();
})();
