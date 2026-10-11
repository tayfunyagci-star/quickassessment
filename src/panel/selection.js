/* =====================================================================
   SEÇİM MOTORU — yalnızca panelde çalışır.
   Kapsam filtresi, alan kotası ve olgunluk merdiveni burada kurulur.
   Anket üretilirken her kapsam kombinasyonu için sonuç önceden hesaplanıp
   ankete yalnızca bu planlar gömülür (kota/ağırlık hesabı müşteriye gitmez).
   DOM'a dokunmaz.
   ===================================================================== */
"use strict";

/* Bir alanın havuzunu kapsam bayraklarına göre süzer. */
function filterPool(pool, excludedTags){
  if(!excludedTags || !excludedTags.length) return pool.slice();
  return pool.filter(function(p){ return excludedTags.indexOf(p.tag) === -1; });
}

/* Alan ağırlığı: √(havuz büyüklüğü) × ortalama kritiklik */
function areaWeight(pool){
  if(!pool.length) return 0;
  var s = 0; for(var i=0;i<pool.length;i++) s += pool[i].w;
  return Math.sqrt(pool.length) * (s / pool.length);
}

/* target = sorulacak KONTROL SORUSU sayısı (her biri 3 İ/S/T cevabı üretir). */
function computeQuotas(areas, target){
  var live = areas.filter(function(a){ return a.pool.length > 0; });
  var wt = {}, tw = 0;
  live.forEach(function(a){ wt[a.c] = areaWeight(a.pool); tw += wt[a.c]; });
  var quota = {};
  live.forEach(function(a){
    quota[a.c] = Math.min(a.pool.length, Math.max(2, Math.round(target * wt[a.c] / (tw || 1))));
  });
  var sum = function(){ return live.reduce(function(s,a){ return s + quota[a.c]; }, 0); };
  for(var g=0; g<400 && sum() < target; g++){
    var best = null;
    live.forEach(function(a){
      if(quota[a.c] < a.pool.length &&
         (best === null || (a.pool.length - quota[a.c]) > (best.pool.length - quota[best.c]))) best = a;
    });
    if(best === null) break; quota[best.c]++;
  }
  for(var g2=0; g2<400 && sum() > target; g2++){
    var b2 = null;
    live.forEach(function(a){
      if(quota[a.c] > 2 && (b2 === null || quota[a.c]/wt[a.c] > quota[b2.c]/wt[b2.c])) b2 = a;
    });
    if(b2 === null) break; quota[b2.c]--;
  }
  return quota;
}

/* Havuzu olgunluk basamaklarına bölüp kritikliğe göre çalışma havuzunu kurar. */
function ladder(pool, poolSize){
  var rungs = {1:[],2:[],3:[],4:[],5:[]};
  pool.forEach(function(q){ rungs[q.m].push(q); });
  Object.keys(rungs).forEach(function(k){
    rungs[k].sort(function(a,b){ return (b.w - a.w) || (a.id < b.id ? -1 : 1); });
  });
  var order = [2,1,3,4,5], sel = [];
  order.forEach(function(ml){ if(sel.length < poolSize && rungs[ml].length) sel.push(rungs[ml].shift()); });
  while(sel.length < poolSize){
    var best = null, bestMl = null, bestScore = -1e9;
    order.forEach(function(ml){
      rungs[ml].forEach(function(q){
        var s = q.w * 2 - Math.abs(ml - 2) * 0.4;
        if(s > bestScore){ bestScore = s; best = q; bestMl = ml; }
      });
    });
    if(best === null) break;
    rungs[bestMl].splice(rungs[bestMl].indexOf(best), 1);
    sel.push(best);
  }
  sel.sort(function(a,b){ return (a.m - b.m) || (b.w - a.w) || (a.id < b.id ? -1 : 1); });
  return sel;
}

/* areasIn: [{c,n,f,r,pool:[...]}] (TAM havuz)
   Dönüş: [{c,n,f,r,scopeOut,askMin,askMax,pool:<çalışma havuzu>,fullSize}] */
function resolveAreas(areasIn, excludedTags, target){
  var staged = areasIn.map(function(a){
    return { c:a.c, n:a.n, f:a.f, r:a.r, full:a.pool.length, pool: filterPool(a.pool, excludedTags) };
  });
  var quota = computeQuotas(staged, target);
  return staged.map(function(a){
    if(!a.pool.length){
      return { c:a.c, n:a.n, f:a.f, r:a.r, scopeOut:true, askMin:0, askMax:0, pool:[], fullSize:a.full };
    }
    var qz = quota[a.c];
    var askMax = Math.min(a.pool.length, qz);
    var askMin = Math.min(askMax, Math.max(2, qz - 1));
    var work = ladder(a.pool, Math.min(a.pool.length, qz + 2));
    return { c:a.c, n:a.n, f:a.f, r:a.r, scopeOut:false,
             askMin:askMin, askMax:askMax, pool:work, fullSize:a.full };
  });
}

/* Kapsam cevaplarından dışlanacak etiket indeksleri. scopes: [[id,soru,vars,tagIdx,not]] */
function excludedTagsFrom(scopes, answers){
  var out = [];
  scopes.forEach(function(s){
    var on = answers[s[0]];
    if(on === undefined) on = !!s[2];
    if(!on && s[3] >= 0) out.push(s[3]);
  });
  return out;
}

/* =====================================================================
   OLGUNLUK BASAMAĞI KİLİDİ
   Bir seviyenin «doğrulanmış» sayılması için o basamağın ağırlıklı skoru
   eşiği geçmelidir. İlk BAŞARISIZ basamak merdiveni durdurur — üst
   basamaklar dolu olsa bile seviye orada takılı kalır.
   Ölçülmemiş basamak (n=0) engellemez, ama seviye en yüksek ÖLÇÜLMÜŞ ve
   geçmiş basamakla sınırlıdır; boş merdivenden seviye üretilemez.
   ===================================================================== */
var LOCK_THRESHOLD_DEFAULT = 80;

/* items: [{ml, rEff, ...}] · wOf(it) -> ağırlık · threshold: 0–100 */
function ladderLock(items, wOf, threshold){
  var th = (threshold == null || isNaN(threshold)) ? LOCK_THRESHOLD_DEFAULT : Number(threshold);
  var acc = {}, m;
  for(m = 1; m <= 5; m++) acc[m] = { n:0, num:0, den:0 };
  (items || []).forEach(function(it){
    var r = acc[it.ml]; if(!r) return;
    var w = wOf(it);
    r.n++; r.num += ((it.rEff - 1) / 4) * w; r.den += w;
  });

  var levels = {}, unmeasured = [], verified = 0, blockedAt = null, blockedScore = null, measured = 0;
  for(m = 1; m <= 5; m++){
    var sc = acc[m].den > 0 ? (acc[m].num / acc[m].den) * 100 : null;
    levels[m] = { n: acc[m].n, score: sc, pass: sc == null ? null : sc >= th };
    if(sc == null){ unmeasured.push(m); continue; }
    measured++;
    if(blockedAt !== null) continue;              /* merdiven zaten durdu */
    if(sc >= th) verified = m;                    /* basamak doğrulandı */
    else { blockedAt = m; blockedScore = sc; }    /* ilk başarısız basamak → kilit */
  }
  return { threshold: th, levels: levels, unmeasured: unmeasured, measured: measured,
           verified: measured ? verified : null,
           blockedAt: blockedAt, blockedScore: blockedScore };
}

function lockLabel(lock){
  if(!lock || lock.verified == null) return "Doğrulanmamış";
  if(lock.verified === 0) return "Seviye 0 · Doğrulanmamış";
  return "Seviye " + lock.verified + " · doğrulandı";
}
