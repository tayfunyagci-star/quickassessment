"use strict";
/* =====================================================================
   ORTAK KURALLAR — panelde analiz, ankette anlık uyarı için kullanılır.
   DOM'a dokunmaz.
   ===================================================================== */

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

/* =====================================================================
   AYNI KONU ÇELİŞKİSİ
   Aynı kontrol alanında aynı arketipteki (aynı konu ailesindeki) iki soru
   karşılaştırılır. Temel soruda (olgunluk basamağı diğerinden yüksek
   olmayan) bir yetenek «yok» beyan edilirken diğer soruda aynı yeteneğin
   işlediği beyan edilirse bulgu yüksek beyanlı soruya iliştirilir:
     · aynı boyut   : temelde boyut = 1/5, diğerinde aynı boyut ≥ 4/5
     · genel yokluk : temelin kapsam içi ortalaması ≤ 1,5 iken diğerinde
                      herhangi bir boyut ≥ 3/5
   Örnek: «envanter oluşturulmamış» (Süreç 1/5) ↔ «varlık sahipleri yazılı
   olarak atanmış» (İnsan 3/5).
   answers: [{id, area, arch, mean, r:{I,S,T}, ml, q}]
   ===================================================================== */
var TOPIC_AXIS_HIGH = 4, TOPIC_ABSENT_MEAN = 1.5, TOPIC_CROSS_HIGH = 3;
var AXIS_TR_ = { I:"İnsan", S:"Süreç", T:"Teknoloji" };
function shortQ_(s){ s = String(s || ""); return s.length > 90 ? s.slice(0, 88) + "…" : s; }
function topicContradictions(answers){
  var list = (answers || []).filter(function(a){ return a && a.r && a.mean != null && a.arch; });
  var groups = {}, out = [];
  list.forEach(function(a){ var k = a.area + "|" + a.arch; (groups[k] = groups[k] || []).push(a); });
  Object.keys(groups).forEach(function(k){
    var g = groups[k];
    g.forEach(function(a){
      g.forEach(function(b){
        if(a === b || a.id === b.id || (a.ml || 0) > (b.ml || 0)) return;
        var same = AXES_.filter(function(ax){ return a.r[ax] === 1 && b.r[ax] >= TOPIC_AXIS_HIGH; });
        var absent = a.mean <= TOPIC_ABSENT_MEAN;
        var cross = (!same.length && absent) ? AXES_.filter(function(ax){ return b.r[ax] >= TOPIC_CROSS_HIGH; }) : [];
        if(!same.length && !cross.length) return;
        var msg = same.length
          ? "«" + shortQ_(a.q || a.id) + "» sorusunda " + same.map(function(ax){ return AXIS_TR_[ax]; }).join(", ") +
            " boyutunda yetenek «yok» (1/5) beyan edilmişken, aynı konudaki bu soruda aynı boyut " +
            same.map(function(ax){ return b.r[ax] + "/5"; }).join(", ") + " beyan edilmiş. Temeli bulunmayan bir yeteneğin bu düzeyde işlemesi beklenmez."
          : "«" + shortQ_(a.q || a.id) + "» sorusunda bu konudaki yetenek genel olarak «yok» beyan edilmişken (ortalama " +
            a.mean.toFixed(1).replace(".", ",") + "/5), aynı konudaki bu soruda " +
            cross.map(function(ax){ return AXIS_TR_[ax] + " " + b.r[ax] + "/5"; }).join(", ") +
            " beyan edilmiş. Var olmayan bir yeteneğin sahiplik, süreç veya araç düzeyinde işlemesi beklenmez.";
        out.push({ id:"KONU", kind:"topic", label:"Aynı konuda çelişkili beyan", msg:msg,
                   preAvg:a.mean, depAvg:b.mean, preArch:[a.arch], depArch:[b.arch],
                   preIds:[a.id], depIds:[b.id], axes: same.length ? same : cross, mode: same.length ? "axis" : "absent" });
      });
    });
  });
  return out;
}

/* Bulguları soru kimliğine indirger: {soruId: [bulgu, ...]} */
function contradictionsByQuestion(answers, opts){
  var map = {};
  contradictions(answers, opts).concat(topicContradictions(answers)).forEach(function(c){
    c.depIds.forEach(function(id){ (map[id] = map[id] || []).push(c); });
  });
  return map;
}

if(typeof module !== "undefined" && module.exports){
  module.exports = { ANOMALY_DEFS:ANOMALY_DEFS, questionAnomalies:questionAnomalies, areaAnomalies:areaAnomalies,
                     CONTRA_RULES:CONTRA_RULES, contradictions:contradictions,
                     topicContradictions:topicContradictions, contradictionsByQuestion:contradictionsByQuestion };
}
