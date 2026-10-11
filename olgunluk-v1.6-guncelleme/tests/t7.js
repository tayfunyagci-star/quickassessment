const { chromium } = require('playwright'); const D=__dirname;
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p = await b.newPage({viewport:{width:1280,height:900}}); const errs=[];
  p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,150)); });
  await p.goto('file://'+D+'/report6.html'); await p.addStyleTag({content:'html{scroll-behavior:auto!important}'}); await p.waitForTimeout(600);
  const r = await p.evaluate(()=>{ const ids=new Set([...document.querySelectorAll('[id]')].map(e=>e.id)); const hrefs=[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(Boolean);
    return { links: hrefs.length, broken: [...new Set(hrefs.filter(h=>!ids.has(h)))], qrefs: document.querySelectorAll('a.qref').length, backs: document.querySelectorAll('.backs').length, imgs:[...document.images].map(i=>i.naturalWidth) }; });
  console.log(JSON.stringify(r));
  await p.screenshot({path:D+'/h1.png'});
  for(const [id,f] of [['olgunluk','h2'],['alanlar','h3'],['oncelikler','h4'],['notlar','h5'],['yanitlar','h6']]){ await p.evaluate(i=>document.getElementById(i).scrollIntoView(),id); await p.waitForTimeout(150); await p.screenshot({path:D+'/'+f+'.png'}); }
  await p.click('.qa-filter button[data-f="low"]'); const vis = await p.evaluate(()=>[...document.querySelectorAll('.qa')].filter(q=>q.style.display!=='none').length); console.log('low filter visible', vis);
  await p.click('.pcard .qref'); await p.waitForTimeout(300); console.log('hash after click', await p.evaluate(()=>location.hash));
  console.log('ERRORS', errs); await b.close();
})();
