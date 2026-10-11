/* =====================================================================
   ORTAK SEÇİM MOTORU — hem panele hem ankete gömülür (build.py).
   Kapsam filtresi, alan kotası ve olgunluk merdiveni burada kurulur.
   DOM'a dokunmaz; jsdom testlerinde doğrudan çağrılabilir.
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

/* =====================================================================
   ANOMALİ TESPİTİ — ankette anlık uyarı, panelde rapor için ortak kurallar
   ===================================================================== */
var AXES_ = ["I","S","T"];
var ANOMALY_DEFS = {
  NA_SPIKE:   { sev:"high", label:"Kapsam dışı sıçraması" },
  AXIS_SPREAD:{ sev:"med",  label:"Boyutlar arası aşırı fark" },
  LADDER_INV: { sev:"high", label:"Basamak tersliği" },
  DEP_VIOL:   { sev:"high", label:"Ön koşul karşılanmadan üst kontrol" },
  FLATLINE:   { sev:"med",  label:"Düz çizgi cevaplama" },
  NA_HEAVY:   { sev:"med",  label:"Kapsam dışı yoğunluğu" }
};

/* Tek kontrol sorusu — raw: {I,S,T} (0 = kapsam dışı) */
function questionAnomalies(raw){
  if(!raw) return [];
  var live = AXES_.filter(function(a){ return raw[a] > 0; });
  var na   = AXES_.filter(function(a){ return raw[a] === 0; });
  var out = [];
  if(na.length > 0 && na.length < 3){
    var hi = live.filter(function(a){ return raw[a] >= 4; });
    if(hi.length >= 2) out.push({
      code:"NA_SPIKE", sev:"high", axes:na, high:hi,
      msg:"İki boyutta üst seviye (" + hi.length + " boyut ≥ 4/5) beyan edilirken kalan boyut kapsam dışı işaretlendi. " +
          "Bir kontrol üç boyutta da bu kadar ayrışıyorsa, kapsam dışı gerekçesinin gözden geçirilmesi beklenir."
    });
  }
  if(live.length >= 2){
    var v = live.map(function(a){ return raw[a]; });
    var spread = Math.max.apply(null, v) - Math.min.apply(null, v);
    if(spread >= 3) out.push({
      code:"AXIS_SPREAD", sev:"med", spread:spread,
      msg:"Aynı kontrolün boyutları arasında " + spread + " seviyelik fark var. " +
          "Bu kadar büyük bir ayrışma olağandışıdır; cevapların aynı kontrolü tarif ettiğinden emin olun."
    });
  }
  return out;
}

/* Bir kontrol alanının cevapları — list: [{ml, raw:{I,S,T}, mean}] */
function areaAnomalies(list){
  list = (list || []).filter(function(x){ return x && x.raw; });
  var out = [];
  if(!list.length) return out;

  var mean = function(xs){ return xs.reduce(function(a,b){ return a + b; }, 0) / xs.length; };
  var scored = list.filter(function(x){ return x.mean != null; });

  var low  = scored.filter(function(x){ return x.ml <= 2; });
  var high = scored.filter(function(x){ return x.ml >= 4; });
  if(low.length && high.length){
    var lo = mean(low.map(function(x){ return x.mean; }));
    var hi = mean(high.map(function(x){ return x.mean; }));
    if(lo <= 2.5 && hi - lo >= 1.5) out.push({
      code:"LADDER_INV", sev:"high", lowAvg:lo, highAvg:hi,
      msg:"Temel basamak (olgunluk 1–2) ortalaması " + lo.toFixed(1) + "/5 iken üst basamak (4–5) ortalaması " +
          hi.toFixed(1) + "/5. Alt basamak kurulmadan üst basamağın bu düzeyde işlemesi olağandışıdır."
    });
  }

  var all = [];
  scored.forEach(function(x){ AXES_.forEach(function(a){ if(x.raw[a] > 0) all.push(x.raw[a]); }); });
  if(all.length >= 6 && all[0] >= 4 && all.every(function(v){ return v === all[0]; })) out.push({
    code:"FLATLINE", sev:"med", value:all[0], n:all.length,
    msg:"Bu alandaki " + all.length + " cevabın tamamı " + all[0] + "/5. Tek düze üst seviye beyanı, " +
        "kontrollerin ayrı ayrı değerlendirilmediğine işaret edebilir."
  });

  var naAx = 0, tot = 0;
  list.forEach(function(x){ AXES_.forEach(function(a){ tot++; if(x.raw[a] === 0) naAx++; }); });
  if(tot >= 6 && naAx / tot > 0.5) out.push({
    code:"NA_HEAVY", sev:"med", ratio: naAx / tot, na:naAx, total:tot,
    msg:"Bu alanda " + tot + " boyut cevabının " + naAx + "'i (%" + Math.round(naAx / tot * 100) +
        ") kapsam dışı. Alanın gerçekten kapsam dışı olup olmadığı değerlendirilmelidir."
  });
  return out;
}

/* =====================================================================
   BAĞLAMSAL ÇELİŞKİ KURALLARI
   Kurallar kontrol ARKETİPİ üzerinden tanımlıdır; her soru taksonomiden
   bağımsız olarak bir arketip taşıdığı için tek set hem UCT hem NIST
   çıktısında çalışır. Mantık: bir ön koşul yeteneği yokken ona dayanan
   yeteneğin üst düzeyde beyan edilmesi olağandışıdır → kanıt istenir.
   pre  = ön koşul arketipleri (ortalaması preMax'ın altındaysa «yok» sayılır)
   dep  = bağımlı arketipler   (ortalaması depMin'in üstündeyse «var» sayılır)
   Bulgu, BAĞIMLI sorulara iliştirilir; kanıt yüksek iddiadan istenir.
   ===================================================================== */
var CONTRA_PRE_MAX = 2.0;   /* ön koşul «yok» eşiği (1–5 ortalaması) */
var CONTRA_DEP_MIN = 4.0;   /* bağımlı «var» eşiği  (1–5 ortalaması) */

var CONTRA_RULES = [
  /* --- envanter: her şeyin temeli --- */
  { id:"ENV_RISK", pre:["envanter"], dep:["risk"], label:"Envantersiz risk yönetimi",
    msg:"Varlık envanteri ve sınıflandırması bulunmadığı beyan edilirken risk yönetimi süreçlerinin üst düzeyde işletildiği belirtilmiş. Neyin korunduğu bilinmeden risklerin sistematik değerlendirilmesi beklenmez." },
  { id:"ENV_ZAF", pre:["envanter"], dep:["zafiyet"], label:"Envantersiz zafiyet yönetimi",
    msg:"Varlık envanteri yokken zafiyet ve yama yönetiminin olgun biçimde yürütüldüğü beyan edilmiş. Kapsamı bilinmeyen bir ortamda tarama bütünlüğü doğrulanamaz." },
  { id:"ENV_YAP", pre:["envanter"], dep:["yapilandirma"], label:"Envantersiz yapılandırma yönetimi",
    msg:"Varlık envanteri yokken yapılandırma ve değişiklik yönetiminin üst düzeyde olduğu beyan edilmiş. Hangi sistemin hangi temel yapılandırmaya tabi olduğu envantersiz izlenemez." },
  { id:"ENV_IMHA", pre:["envanter"], dep:["imha"], label:"Envantersiz veri imhası",
    msg:"Varlık ve veri envanteri yokken ortam/veri imha süreçlerinin olgun olduğu beyan edilmiş. İmha edilecek verinin nerede tutulduğu bilinmeden süreç doğrulanamaz." },
  { id:"ENV_KRIPTO", pre:["envanter"], dep:["kripto"], label:"Sınıflandırmasız şifreleme programı",
    msg:"Veri sınıflandırması yokken şifrelemenin kurum genelinde olgun biçimde uygulandığı beyan edilmiş. Hangi verinin şifrelenmesi gerektiği sınıflandırma olmadan belirlenemez." },

  /* --- log/izleme: tespit ve müdahalenin temeli --- */
  { id:"LOG_OLAY", pre:["log"], dep:["olay"], label:"Kayıtsız olay müdahalesi",
    msg:"Log ve izleme yetenekleri yokken olay müdahale kapasitesinin üst düzeyde olduğu beyan edilmiş. Tespit edilemeyen bir olaya müdahale edilemez." },
  { id:"LOG_DEN", pre:["log"], dep:["denetim"], label:"Kayıtsız denetim",
    msg:"Log kayıtları tutulmazken denetim ve gözden geçirme süreçlerinin olgun olduğu beyan edilmiş. Denetim kanıtı büyük ölçüde kayıtlardan üretilir." },
  { id:"LOG_AG", pre:["log"], dep:["ag"], label:"Görünürlüksüz ağ güvenliği",
    msg:"İzleme yetenekleri yokken ağ güvenliğinin üst düzeyde yönetildiği beyan edilmiş. Trafiği görünmeyen bir ağda kontrollerin etkinliği doğrulanamaz." },

  /* --- veri koruma → uç nokta / zararlı yazılım --- */
  { id:"KRIPTO_MAL", pre:["kripto","imha"], dep:["malware"], label:"Veri koruması yokken uç nokta mükemmelliği",
    msg:"Veri şifreleme ve imha tedbirleri bulunmazken uç nokta / zararlı yazılım korumasının üst düzeyde olduğu beyan edilmiş. Uç noktadaki veriyi koruyan tedbirler yokken bu düzeyde bir koruma olgunluğu beklenmez." },
  { id:"KVKK_IMHA", pre:["kvkk"], dep:["imha"], label:"Kişisel veri yönetimi olmadan imha olgunluğu",
    msg:"Kişisel veri yönetimi süreçleri yokken veri imha ve ortam yönetiminin olgun olduğu beyan edilmiş. Saklama süreleri tanımlanmadan imha süreci işletilemez." },
  { id:"KRIPTO_ANAHTAR", pre:["kripto"], dep:["anahtar"], label:"Şifreleme yokken anahtar yönetimi",
    msg:"Şifreleme uygulanmazken anahtar yönetiminin üst düzeyde olduğu beyan edilmiş. Yönetilecek bir anahtar olmadan bu olgunluk doğrulanamaz." },
  { id:"ENV_KVKK", pre:["envanter"], dep:["kvkk"], label:"Veri envanteri olmadan kişisel veri uyumu",
    msg:"Veri envanteri ve sınıflandırması yokken kişisel veri süreçlerinin üst düzeyde yönetildiği beyan edilmiş. Kişisel verinin nerede işlendiği bilinmeden uyum sağlanamaz." },

  /* --- yönetişim: politika ve risk --- */
  { id:"POL_DEN", pre:["politika"], dep:["denetim"], label:"Politikasız denetim",
    msg:"Yazılı politika ve doküman altyapısı yokken denetim/gözden geçirme süreçlerinin olgun olduğu beyan edilmiş. Denetim, uyulup uyulmadığı ölçülecek bir kurala dayanır." },
  { id:"POL_IK", pre:["politika"], dep:["ik"], label:"Politikasız İK güvenliği",
    msg:"Yazılı politika yokken insan kaynakları güvenlik süreçlerinin üst düzeyde işlediği beyan edilmiş. İşe alım ve ayrılış kontrolleri politikaya dayanır." },
  { id:"POL_RISK", pre:["politika"], dep:["risk"], label:"Politikasız risk yönetimi",
    msg:"Politika altyapısı yokken risk yönetiminin olgun olduğu beyan edilmiş. Risk iştahı ve kabul kriterleri yazılı olarak tanımlanmadan risk yönetilemez." },
  { id:"RISK_TED", pre:["risk"], dep:["tedarikci"], label:"Risk yönetimi olmadan tedarikçi risk yönetimi",
    msg:"Kurumsal risk yönetimi yokken tedarikçi risk yönetiminin üst düzeyde olduğu beyan edilmiş. Tedarikçi riski, kurumsal risk çerçevesinin bir uzantısıdır." },
  { id:"RISK_SUR", pre:["risk"], dep:["sureklilik"], label:"Risk analizi olmadan iş sürekliliği",
    msg:"Risk yönetimi yokken iş sürekliliğinin olgun olduğu beyan edilmiş. Süreklilik planı, etki ve risk analizinin çıktısıdır." },
  { id:"DEN_OLAY", pre:["denetim"], dep:["olay"], label:"Gözden geçirmesiz olay yönetimi",
    msg:"Denetim ve gözden geçirme yokken olay müdahale olgunluğunun üst düzeyde olduğu beyan edilmiş. Müdahale kalitesi düzenli gözden geçirmeyle sürdürülür." },

  /* --- kimlik ve erişim --- */
  { id:"ERISIM_KVKK", pre:["erisim"], dep:["kvkk"], label:"Erişim kontrolü olmadan kişisel veri koruması",
    msg:"Kimlik ve erişim kontrolleri yokken kişisel veri korumasının üst düzeyde olduğu beyan edilmiş. Yetkisiz erişim engellenmeden veri koruması sağlanamaz." },
  { id:"ERISIM_AG", pre:["erisim"], dep:["ag"], label:"Kimlik yönetimi olmadan ağ güvenliği",
    msg:"Kimlik ve erişim yönetimi yokken ağ güvenliğinin üst düzeyde olduğu beyan edilmiş. Ağ erişim kontrolleri kimliğe dayanır." },
  { id:"ERISIM_UYG", pre:["erisim"], dep:["gelistirme"], label:"Erişim kontrolü olmadan güvenli geliştirme",
    msg:"Erişim kontrolleri yokken güvenli geliştirme süreçlerinin olgun olduğu beyan edilmiş. Kaynak kod ve ortam ayrımı erişim kontrolüne dayanır." },
  { id:"ERISIM_FIZ", pre:["fiziksel"], dep:["erisim"], label:"Fiziksel kontrol olmadan mantıksal erişim güvenliği",
    msg:"Fiziksel erişim kontrolleri yokken mantıksal erişim güvenliğinin üst düzeyde olduğu beyan edilmiş. Cihaza fiziksel erişimi olan kişi mantıksal kontrollerin çoğunu aşabilir." },

  /* --- süreklilik --- */
  { id:"YEDEK_SUR", pre:["yedek"], dep:["sureklilik"], label:"Yedeksiz iş sürekliliği",
    msg:"Yedekleme yetenekleri yokken iş sürekliliği ve kurtarma kapasitesinin üst düzeyde olduğu beyan edilmiş. Kurtarma, test edilmiş yedeğe dayanır." },
  { id:"SUR_OLAY", pre:["sureklilik"], dep:["olay"], label:"Sürekliliksiz olay kurtarma",
    msg:"İş sürekliliği yetenekleri yokken olay müdahale ve kurtarma olgunluğunun üst düzeyde olduğu beyan edilmiş." },

  /* --- insan --- */
  { id:"EGT_IK", pre:["egitim"], dep:["ik"], label:"Eğitimsiz İK güvenliği",
    msg:"Eğitim ve farkındalık programı yokken insan kaynakları güvenlik süreçlerinin olgun olduğu beyan edilmiş." },
  { id:"EGT_OLAY", pre:["egitim"], dep:["olay"], label:"Farkındalıksız olay bildirimi",
    msg:"Farkındalık eğitimi yokken olay müdahale olgunluğunun üst düzeyde olduğu beyan edilmiş. Olayların büyük kısmı kullanıcı bildirimiyle başlar." },

  /* --- teknik zincir --- */
  { id:"ZAF_YAP", pre:["zafiyet"], dep:["yapilandirma"], label:"Zafiyet yönetimi olmadan yapılandırma sertleştirme",
    msg:"Zafiyet ve yama yönetimi yokken yapılandırma sertleştirmesinin üst düzeyde olduğu beyan edilmiş. Sertleştirmenin etkinliği zafiyet taramasıyla doğrulanır." },
  { id:"ZAF_GEL", pre:["zafiyet"], dep:["gelistirme"], label:"Zafiyet yönetimi olmadan güvenli geliştirme",
    msg:"Zafiyet yönetimi yokken güvenli geliştirme süreçlerinin olgun olduğu beyan edilmiş. Güvenli geliştirme, bulunan zafiyetlerin geri beslenmesiyle olgunlaşır." },
  { id:"YAP_MAL", pre:["yapilandirma"], dep:["malware"], label:"Yapılandırma yönetimi olmadan zararlı yazılım koruması",
    msg:"Yapılandırma yönetimi yokken zararlı yazılım korumasının kurum genelinde üst düzeyde olduğu beyan edilmiş. Koruma yazılımının tüm uç noktalarda tutarlı kurulumu yapılandırma yönetimine dayanır." },
  { id:"AG_MAL", pre:["ag"], dep:["malware"], label:"Ağ güvenliği olmadan uç nokta mükemmelliği",
    msg:"Ağ güvenliği kontrolleri yokken zararlı yazılım korumasının üst düzeyde olduğu beyan edilmiş." },
  { id:"TED_GEL", pre:["tedarikci"], dep:["gelistirme"], label:"Tedarikçi yönetimi olmadan güvenli geliştirme",
    msg:"Tedarikçi ve üçüncü taraf yönetimi yokken güvenli geliştirmenin olgun olduğu beyan edilmiş. Üçüncü taraf bileşen ve kütüphane riski tedarikçi yönetiminin parçasıdır." }
];

/* answers: [{id, area, arch, mean}] — mean: kapsam içi eksenlerin ortalaması (1–5)
   Dönüş: [{rule, preAvg, depAvg, preIds, depIds}] */
function contradictions(answers, opts){
  opts = opts || {};
  var preMax = opts.preMax == null ? CONTRA_PRE_MAX : opts.preMax;
  var depMin = opts.depMin == null ? CONTRA_DEP_MIN : opts.depMin;
  var list = (answers || []).filter(function(a){ return a && a.mean != null; });
  if(!list.length) return [];

  var byArch = {};
  list.forEach(function(a){ (byArch[a.arch] = byArch[a.arch] || []).push(a); });
  var pick = function(archs){
    var out = [];
    archs.forEach(function(x){ (byArch[x] || []).forEach(function(a){ out.push(a); }); });
    return out;
  };
  var avg = function(xs){ return xs.reduce(function(s,a){ return s + a.mean; }, 0) / xs.length; };

  var out = [];
  CONTRA_RULES.forEach(function(rule){
    var pre = pick(rule.pre), dep = pick(rule.dep);
    if(!pre.length || !dep.length) return;
    var pa = avg(pre), da = avg(dep);
    if(pa > preMax || da < depMin) return;
    out.push({ id:rule.id, label:rule.label, msg:rule.msg, preAvg:pa, depAvg:da,
               preArch:rule.pre.slice(), depArch:rule.dep.slice(),
               preIds: pre.map(function(a){ return a.id; }),
               depIds: dep.filter(function(a){ return a.mean >= depMin; }).map(function(a){ return a.id; }) });
  });
  return out;
}

/* Bulguları soru kimliğine indirger: {soruId: [bulgu, ...]} */
function contradictionsByQuestion(answers, opts){
  var map = {};
  contradictions(answers, opts).forEach(function(c){
    c.depIds.forEach(function(id){ (map[id] = map[id] || []).push(c); });
  });
  return map;
}

if(typeof module !== "undefined" && module.exports){
  module.exports = { filterPool:filterPool, areaWeight:areaWeight, computeQuotas:computeQuotas,
                     ladder:ladder, resolveAreas:resolveAreas, excludedTagsFrom:excludedTagsFrom,
                     ladderLock:ladderLock, lockLabel:lockLabel, LOCK_THRESHOLD_DEFAULT:LOCK_THRESHOLD_DEFAULT,
                     ANOMALY_DEFS:ANOMALY_DEFS, questionAnomalies:questionAnomalies, areaAnomalies:areaAnomalies,
                     CONTRA_RULES:CONTRA_RULES, contradictions:contradictions,
                     contradictionsByQuestion:contradictionsByQuestion };
}
