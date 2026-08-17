"use strict";
/* =====================================================================
   Scale Bilgi Güvenliği — Hızlı Değerlendirme anket motoru (site sürümü)
   BU DOSYA OTOMATİK ÜRETİLMİŞTİR — elle düzenlemeyin.
   Kaynak: Siber_Olgunluk_Analiz_Paneli.html · "Site İçin Üret ve İndir"
   Üretim: 2026-08-17
   ===================================================================== */

"use strict";
/* =====================================================================
   ANKET VERİSİ — Analiz Paneli tarafından üretilir.
   ===================================================================== */
const SURVEY = {"meta":{"id":"smsww0ih1","tax":"nist","taxName":"NIST CSF 2.0","bankVersion":"UCT v3 · 440 kontrol · eksen-nötr · 2026-08","generatedAt":"2026-08-17T07:03:24.805Z","orgName":"Örnek Enerji A.Ş.","note":"","target":20},"scopes":[["SCOPE.YAZILIM_GELISTIRME","Kurumunuz kendi bünyesinde (veya kontrolünde) yazılım geliştiriyor mu?",1,2,"Hayır ise, güvenli yazılım geliştirme yaşam döngüsü maddeleri kapsam dışıdır."],["SCOPE.TEDARIKCI","Kurumunuzun kritik süreçlerde dışarıdan tedarikçi/üçüncü taraf hizmeti kullanımı var mı?",1,8,"Hayır ise, tedarikçi güvenliği maddeleri kapsam dışıdır."],["SCOPE.FIZIKSEL_TESIS","Kurumunuz kendi işlettiği fiziksel bir tesis/ofis/veri merkezi alanına sahip mi?",1,1,"Hayır ise (tamamen bulut/uzaktan çalışma), fiziksel güvenlik maddeleri kapsam dışıdır."],["SCOPE.KISISEL_VERI","Kurumunuz kişisel veri işliyor mu (müşteri, çalışan, aday vb.)?",1,4,"Hayır ise, kişisel veri yönetimi maddeleri kapsam dışıdır."]],"arch":{"ag":"Ağ Güvenliği","anahtar":"Anahtar Yönetimi","denetim":"Denetim ve Gözden Geçirme","egitim":"Eğitim ve Farkındalık","envanter":"Envanter ve Sınıflandırma","erisim":"Kimlik ve Erişim","fiziksel":"Fiziksel Güvenlik","gelistirme":"Güvenli Geliştirme","ik":"İnsan Kaynakları","imha":"Veri İmha ve Ortam","kripto":"Şifreleme","kvkk":"Kişisel Veri","log":"Log ve İzleme","malware":"Zararlı Yazılım Koruması","olay":"Olay Müdahale","politika":"Politika ve Doküman","risk":"Risk Yönetimi","sureklilik":"İş Sürekliliği","tedarikci":"Tedarikçi Yönetimi","yapilandirma":"Yapılandırma ve Değişiklik","yedek":"Yedekleme","zafiyet":"Zafiyet ve Yama"},"ans":{"ag":{"I":["«{k}» kapsamında ağ güvenliği kurallarından sorumlu tanımlı bir kişi bulunmamaktadır.","Ağ değişikliklerini teknik ekip kendi insiyatifiyle yapmaktadır; kural sahipliği ve onay mercii tanımlı değildir.","«{k}» için ağ kural sahipliği, değişiklik onayı ve gözden geçirme sorumlulukları yazılı olarak atanmıştır.","Sorumlular tanımlıdır; sahibi olmayan kural sayısı, gözden geçirme tamamlanma oranı ve onaysız değişiklik sayısı düzenli raporlanmaktadır.","Ağ güvenliği yetkinliği düzenli geliştirilmekte; mimari kararlar gözden geçirme kurulunda karar kaydıyla ele alınmakta, kural sadeleştirmenin etkisi ölçülüp raporlanmaktadır."],"S":["«{k}» kapsamında ağ erişimi, segmentasyon ve kural yönetimine ilişkin tanımlı bir süreç bulunmamaktadır.","Ağ kuralları ihtiyaç doğdukça eklenmektedir; gerekçe, süre ve gözden geçirme kuralı yazılı değildir, eski kurallar birikmektedir.","«{k}» için ağ segmentasyon ilkeleri, kural talep/onay akışı ve varsayılan reddet yaklaşımı yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Ağ kuralları periyodik gözden geçirilmekte; gereksiz/çakışan kural sayısı, açık port envanteri ve segmentasyon uyumu metrik olarak izlenip kayıt altına alınmaktadır.","Segmentasyon etkinliği düzenli test edilmekte (yanal hareket testi); kural setleri otomatik analizle sadeleştirilip süreç sürekli iyileştirilmektedir."],"T":["«{k}» kapsamında ağ trafiğini kısıtlayan bir kontrol (güvenlik duvarı, segment vb.) bulunmamaktadır.","Bir güvenlik duvarı mevcuttur ancak ağ düz yapıdadır; iç ağda sistemler birbirine kısıtsız erişebilmektedir.","«{k}» için ağ segmentlere ayrılmış, segmentler arası trafik güvenlik duvarı kurallarıyla kısıtlanmakta ve uzaktan erişim kontrollü kanaldan sağlanmaktadır.","Ağ kuralları ve trafiği merkezî olarak izlenmekte; kural kullanım istatistikleri, engellenen trafik ve topoloji uyumu raporlanmakta, değişiklikler kayıt altındadır.","Ağ erişimi kimlik temelli ve mikro segmentasyonla uygulanmakta; kural değişiklikleri otomatik doğrulanmakta ve sapmalar anında engellenmektedir."]},"anahtar":{"I":["«{k}» kapsamında kriptografik anahtarların kimin sorumluluğunda olduğu tanımlı değildir; anahtarlar kişisel dosyalarda tutulabilmektedir.","Anahtarlardan bazı sistem yöneticilerimiz sorumludur; ancak görev ayrılığı ve yedek sorumlu tanımı yazılı değildir.","«{k}» için anahtar sahipliği, saklama ve yetkilendirme sorumlulukları yazılı olarak atanmış ve görev ayrılığı gözetilmiştir.","Anahtar sorumluları tanımlıdır; anahtar erişim yetkileri periyodik gözden geçirilmekte, gözden geçirme kaydı tutulmakta ve fazla yetkili hesap sayısı ölçülüp raporlanmaktadır.","Anahtar yönetimi ikili kontrol/bilgi bölme ile yürütülmekte, yetkinlik ve tatbikat düzenli olarak sınanıp iyileştirilmektedir."],"S":["«{k}» için anahtar üretimi, dağıtımı, saklanması, değiştirilmesi ve imhasını tanımlayan bir süreç bulunmamaktadır.","Anahtarlar ihtiyaç oldukça üretilip paylaşılmaktadır; yaşam döngüsü adımları ve geçerlilik süreleri yazılı değildir.","«{k}» kapsamında anahtar yaşam döngüsünün tüm adımları (üretim, dağıtım, saklama, yenileme, iptal, imha) yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Anahtar yenileme takvimi izlenmekte; süresi geçmiş anahtar sayısı, zamanında yenilenme oranı ve iptal (revoke) süresi metrik olarak raporlanmaktadır.","Anahtar yaşam döngüsü otomatik yürütülmekte, tehlikeye düşme senaryosu için acil yenileme tatbikatı yapılmakta ve süreç bulgulara göre iyileştirilmektedir."],"T":["«{k}» için anahtarlar korumasız ortamlarda (dosya, kod, elektronik tablo) tutulmaktadır.","Anahtarlar sunucu üzerinde parola korumalı dosyalarda saklanmaktadır; merkezî bir anahtar kasası kullanılmamaktadır.","«{k}» kapsamındaki anahtarlar merkezî bir anahtar yönetim sistemi veya parola kasasında saklanmakta ve erişimi kısıtlanmaktadır.","Anahtar yönetim sistemi erişim kayıtlarını tutmakta; anahtar kullanımı ve yenileme durumu raporlanmakta, anormal erişim alarm üretmektedir.","Anahtarlar HSM/donanım destekli kasada üretilip saklanmakta, uygulamalara kısa ömürlü kimlik bilgisiyle otomatik dağıtılmakta ve rotasyon otomatiktir."]},"denetim":{"I":["«{k}» kapsamında kontrollerin çalışıp çalışmadığını gözden geçirecek tanımlı bir sorumlu bulunmamaktadır.","Gözden geçirme, ilgili kişilerin kendi insiyatifiyle ve düzensiz olarak yapılmaktadır; bağımsızlık gözetilmemektedir.","«{k}» için gözden geçirme/denetim sorumluluğu yazılı olarak atanmış ve denetlenen faaliyetten bağımsız olması sağlanmıştır.","Sorumlular tanımlıdır; planlanan denetimlerin gerçekleşme oranı, bulgu sayısı ve bulgu kapatma süresi ölçülüp yönetime raporlanmaktadır.","Denetim yetkinliği düzenli geliştirilmekte; bulgular yönetim gözden geçirmesinde ele alınarak kontrol tasarımı sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında düzenli bir denetim veya gözden geçirme süreci bulunmamaktadır.","Gözden geçirme yalnızca dış talep geldiğinde (müşteri, denetçi) yapılmaktadır; plan, kapsam ve takip yazılı değildir.","«{k}» için denetim planı, kapsamı, sıklığı ve bulgu takip mekanizması yazılı olarak tanımlanmış ve uygulanmaktadır.","Denetimler plana göre yürütülmekte; denetim raporları, bulgu sayısı, kritiklik dağılımı, kapatma süresi ve tekrarlayan bulgu oranı kayıt altına alınıp izlenmektedir.","Denetim bulguları kök nedene inilerek kapatılmakta; sonuçlar risk değerlendirmesine ve kontrol tasarımına geri beslenerek süreç sürekli iyileştirilmektedir."],"T":["«{k}» kapsamında denetim veya gözden geçirme kanıtlarını tutan bir araç bulunmamaktadır.","Bulgular elektronik tablo veya e-posta üzerinden takip edilmektedir; durum takibi ve hatırlatma elle yapılmaktadır.","«{k}» için denetim bulguları ve aksiyonları merkezî bir araçta kayıt altına alınıp takip edilmektedir.","Araç üzerinden bulgu durumu, sorumlu ve termin otomatik izlenmekte; gecikmeler hatırlatma üretmekte ve gösterge panosunda raporlanmaktadır.","Kontrollerin çalıştığına dair kanıtlar sistemlerden otomatik toplanmakta (sürekli kontrol izleme); sapmalar anında bulguya dönüşmektedir."]},"egitim":{"I":["«{k}» konusunda çalışanlarımıza yönelik herhangi bir bilgilendirme veya eğitim yapılmamaktadır.","Konu hakkında zaman zaman sözlü bilgilendirme yapılmaktadır; planlı, kayıtlı ve herkesi kapsayan bir eğitim yoktur.","«{k}» kapsamında işe girişte ve yılda en az bir kez tüm ilgili personele eğitim verilmekte, katılım kayıt altına alınmaktadır.","Eğitimin etkinliği ölçülmektedir: katılım oranı, sınav/başarı puanı ve oltalama tatbikatı tıklama oranı gibi metrikler izlenip yönetime raporlanmaktadır.","Eğitim içeriği rol bazlı ve gerçek olay/tatbikat bulgularına göre sürekli güncellenmekte; davranış değişimi ölçülüp zayıf gruplara hedefli tekrar uygulanmaktadır."],"S":["«{k}» için eğitim ihtiyacını belirleyen ve eğitimi planlayan tanımlı bir süreç bulunmamaktadır.","Eğitimler ihtiyaç hissedildiğinde düzenlenmektedir; program, kapsam ve tekrar sıklığı yazılı değildir.","«{k}» kapsamında yıllık eğitim planı, hedef kitle, içerik ve tekrar sıklığı yazılı olarak tanımlanmış ve uygulanmaktadır.","Eğitim planına uyum takip edilmekte; tamamlanma oranı, gecikmiş personel sayısı ve eğitim sonrası değerlendirme sonuçları kayıt altında tutulup raporlanmaktadır.","Eğitim programı olay istatistikleri ve risk değerlendirmesiyle beslenerek sürekli iyileştirilmekte, etkinliği bağımsız olarak doğrulanmaktadır."],"T":["«{k}» ile ilgili eğitimlerin takibi için herhangi bir araç kullanılmamaktadır.","Katılım kayıtları elektronik tablo veya imza listesiyle tutulmaktadır; hatırlatma ve takip elle yapılmaktadır.","«{k}» eğitimleri bir öğrenme yönetim sistemi (LMS) veya benzeri araç üzerinden atanmakta ve tamamlanma durumu kayıt altına alınmaktadır.","LMS üzerinden otomatik atama ve hatırlatma çalışmakta; tamamlanma oranı, sınav sonuçları ve tatbikat verileri gösterge panosunda izlenmektedir.","Eğitim platformu İK sistemleriyle entegredir; içerik risk ve tatbikat verisine göre otomatik kişiselleştirilip zayıf alanlara hedefli tekrar atanmaktadır."]},"envanter":{"I":["«{k}» kapsamındaki varlıkların sahibi belirlenmemiştir; hangi varlıktan kimin sorumlu olduğu kurumumuzda bilinmemektedir.","Bazı ekiplerimiz kendi varlık listesini tutmaktadır; ancak varlık sahipliği resmî olarak atanmamış, kişilerin inisiyatifine bırakılmıştır.","«{k}» için varlık sahipleri yazılı olarak atanmış; envanteri güncel tutma ve sınıflandırma sorumluluğu görev tanımlarına işlenmiştir.","Varlık sahipleri atanmıştır; sahibi belirsiz varlık oranı ve envanter güncelleme gecikmesi sahip bazında ölçülüp yönetime raporlanmaktadır.","Sahiplik değişiklikleri İK ve organizasyon süreçlerinden otomatik tetiklenmekte; sahiplik kalitesi metrikleri düzenli gözden geçirilip iyileştirme aksiyonuna dönüştürülmektedir."],"S":["«{k}» için envanter oluşturma ve güncelleme konusunda tanımlı bir süreç işletilmemektedir.","Envanter yalnızca ihtiyaç doğdukça (denetim, olay vb.) elle çıkarılmaktadır; kapsamı, güncelleme sıklığı ve sınıflandırma kuralı yazılı değildir.","«{k}» için envanterin kapsamı, zorunlu alanları, sınıflandırma kuralı ve güncelleme sıklığı yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Envanter periyodik olarak doğrulanmakta; kapsam dışı kalan varlık sayısı, kayıt eksiklik oranı ve son doğrulama tarihi metrik olarak izlenmekte, gözden geçirme kayıtları saklanmaktadır.","Envanter ile sahadaki gerçek durum farkı sürekli kapatılmakta, keşif bulguları otomatik iş emrine dönüşmekte ve süreç bağımsız denetim bulgularıyla düzenli iyileştirilmektedir."],"T":["«{k}» için envanter tutan bir araç bulunmamaktadır; bilgi dağınık dosyalarda ya da hiç kayıtlı değildir.","Envanter elektronik tablo veya manuel liste üzerinde tutulmaktadır; otomatik keşif yoktur ve kayıtlar hızla eskimektedir.","Merkezî bir envanter/CMDB aracı kurulmuş; «{k}» kapsamındaki varlıklar tanımlı alanlarıyla bu araçta tutulmaktadır.","Otomatik varlık keşfi çalışmakta; envanter ile sahadaki gerçek durum farkı araç tarafından raporlanmakta ve kapsama oranı gösterge panosunda izlenmektedir.","Envanter; ağ keşfi, uç nokta ajanı, bulut API'leri ve satın alma sistemleriyle entegre çalışmakta, kayıtlar gerçek zamanlı güncellenip sapmalar otomatik alarm üretmektedir."]},"erisim":{"I":["«{k}» konusunda kimin hangi yetkiyi onaylayacağı belirsizdir; erişim talepleri tanıdık üzerinden sözlü olarak karşılanmaktadır.","Erişim onayı çoğunlukla BT ekibinin insiyatifindedir; veri/sistem sahibinin onayı her zaman aranmamaktadır.","«{k}» için erişim talep, onay ve iptal rolleri (talep eden, sistem sahibi, uygulayan) yazılı olarak tanımlanmış ve ilgili personele duyurulmuştur.","Yetki onaylayıcıları tanımlıdır; sahipler periyodik erişim gözden geçirmelerini imzalı olarak tamamlamakta, gecikmiş gözden geçirme sayısı raporlanmaktadır.","Erişim sahipliği kurum kültürüne yerleşmiş; en az yetki ilkesine uyum sahip bazında ölçülmekte, sapmalar yöneticilere geri bildirilerek sürekli iyileştirilmektedir."],"S":["«{k}» için erişim verme, değiştirme ve kaldırma adımlarını tanımlayan bir süreç bulunmamaktadır.","Erişim işlemleri e-posta veya sözlü talepler üzerine yapılmaktadır; kayıt tutulmakla birlikte standart bir onay akışı ve iptal kuralı yoktur.","«{k}» kapsamında en az yetki ve görevler ayrılığı ilkeleri yazılı erişim prosedüründe tanımlanmış; işe giriş, görev değişikliği ve ayrılışta yetkiler bu prosedüre göre işlenmektedir.","Erişim hakları en az altı ayda bir gözden geçirilmekte; gözden geçirme kayıtları, kaldırılan fazla yetki sayısı ve ayrılan personelde ortalama hesap kapatma süresi metrik olarak izlenmektedir.","Yetki yaşam döngüsü İK olaylarıyla tetiklenip uçtan uca otomatik işlemekte; artık yetki birikimi (yetki şişmesi) sürekli ölçülüp otomatik olarak geri alınmaktadır."],"T":["«{k}» için erişimi teknik olarak kısıtlayan bir kontrol bulunmamakta; yetkiler sistem üzerinde serbestçe verilmektedir.","Yetkiler her sistemde ayrı ayrı, elle tanımlanmaktadır; merkezî bir dizin/kimlik yönetimi ve rol modeli yoktur.","Merkezî kimlik yönetimi (dizin hizmeti) üzerinden rol tabanlı yetkilendirme uygulanmakta; «{k}» kapsamındaki erişimler bu yapı üzerinden verilmektedir.","Ayrıcalıklı erişimler kasa/PAM çözümüyle yönetilmekte, oturumlar kayıt altına alınmakta; yetki envanteri ve anormal yetki artışları düzenli raporlanmaktadır.","Kimlik yönetimi otomatik sağlama/geri alma, çok faktörlü doğrulama ve risk temelli erişim kararlarıyla entegre çalışmakta; politika sapmaları gerçek zamanlı engellenmektedir."]},"fiziksel":{"I":["«{k}» kapsamındaki alanların fiziksel güvenliğinden sorumlu tanımlı bir kişi bulunmamaktadır.","Fiziksel güvenlik idari işler tarafından genel olarak yürütülmektedir; bilgi güvenliği açısından beklentiler tanımlı değildir.","«{k}» için fiziksel güvenlik sorumluluğu yazılı olarak atanmış; ziyaretçi eşliği, temiz masa ve alan kuralları personele duyurulmuştur.","Sorumlular tanımlıdır; yetkisiz giriş denemesi, refakatsiz ziyaretçi ve temiz masa denetim bulguları düzenli olarak ölçülüp raporlanmaktadır.","Fiziksel güvenlik farkındalığı tatbikatlarla (izinsiz giriş denemesi vb.) sınanmakta ve bulgular eğitim ile süreç iyileştirmesine dönüştürülmektedir."],"S":["«{k}» kapsamında fiziksel erişim, ziyaretçi ve alan kullanımına ilişkin tanımlı bir süreç bulunmamaktadır.","Girişler genel olarak kontrol edilmektedir; yetkilendirme, ziyaretçi kaydı ve alan sınıflandırması yazılı kurala bağlanmamıştır.","«{k}» için güvenli alanlar tanımlanmış; giriş yetkilendirme, ziyaretçi kayıt/refakat ve alan içi kurallar yazılı prosedürde tanımlanıp uygulanmaktadır.","Fiziksel erişim yetkileri periyodik gözden geçirilmekte; gözden geçirme kayıtları, aktif kart sayısı, iade edilmeyen kart ve kayıt dışı giriş sayısı metrik olarak izlenmektedir.","Fiziksel güvenlik kontrolleri düzenli test edilmekte (sızma denemesi, çevresel sistem testi); bulgular otomatik aksiyona bağlanıp süreç sürekli iyileştirilmektedir."],"T":["«{k}» kapsamındaki alanlarda kartlı geçiş, kamera veya benzeri bir fiziksel kontrol bulunmamaktadır.","Alanlar mekanik kilitle korunmaktadır; giriş kayıtları tutulmamakta veya elle deftere yazılmaktadır.","«{k}» için kartlı geçiş sistemi ve/veya kamera kurulmuş; giriş kayıtları elektronik olarak tutulmaktadır.","Geçiş ve kamera sistemleri merkezî olarak izlenmekte, kayıtlar tanımlı süre saklanmakta; anormal geçişler alarm üretmekte ve raporlanmaktadır.","Fiziksel erişim sistemi kimlik yönetimiyle entegre çalışmakta; yetkiler otomatik sağlanıp geri alınmakta, çevresel izleme (yangın, sıcaklık, güç) otomatik alarmlarla desteklenmektedir."]},"gelistirme":{"I":["«{k}» kapsamında geliştirme ekibimizde güvenlik sorumluluğu tanımlı değildir; güvenlik geliştiricinin bilgisine kalmıştır.","Bazı geliştiricilerimiz güvenli kodlama konusunda bilgilidir; sorumluluk ve gözden geçirme rolü resmî olarak tanımlanmamıştır.","«{k}» için güvenli kodlama sorumlulukları ve kod gözden geçirme rolleri yazılı olarak tanımlanmış, geliştiricilere duyurulmuştur.","Roller tanımlıdır; güvenli kodlama eğitimi tamamlama oranı, gözden geçirilen kod oranı ve gözden geçirmede yakalanan bulgu sayısı ölçülüp raporlanmaktadır.","Güvenlik geliştirme kültürüne yerleşmiş (güvenlik elçileri, tehdit modelleme); yetkinlik düzenli tatbikat ve testlerle ölçülüp sonuçları raporlanarak sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında güvenli yazılım geliştirme yaşam döngüsüne ilişkin tanımlı bir süreç bulunmamaktadır.","Geliştirme yapılmakta, testler işlevsel odaklıdır; güvenlik gereksinimleri, kod gözden geçirme ve ortam ayrımı yazılı kurala bağlanmamıştır.","«{k}» için güvenlik gereksinimlerinin belirlenmesi, kod gözden geçirme, güvenlik testi ve geliştirme/test/canlı ortam ayrımı yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Sürüm öncesi güvenlik testleri zorunludur; test kayıtları, bulunan/kapatılan açık sayısı, kritik açıkla canlıya çıkma sayısı ve test kapsama oranı metrik olarak izlenmektedir.","Güvenlik testleri geliştirme hattına gömülmüş, kritik bulgu sürümü otomatik durdurmakta; tehdit modelleme ve bulgu geri bildirimiyle süreç sürekli iyileştirilmektedir."],"T":["«{k}» kapsamında güvenlik testi yapan veya kaynak kodu koruyan bir araç kullanılmamaktadır.","Sürüm kontrol sistemi kullanılmaktadır; otomatik güvenlik taraması ve bağımlılık kontrolü yoktur.","«{k}» için statik kod analizi ve/veya bağımlılık taraması araçları kurulmuş ve tanımlı kapsamda çalışmaktadır.","Güvenlik taramaları yapı hattında (CI) otomatik çalışmakta; bulgu sayısı, kapsama oranı ve düzeltme süresi gösterge panosunda raporlanmaktadır.","Statik, dinamik ve bağımlılık taramaları ile gizli bilgi (secret) taraması hattın her aşamasında otomatik çalışmakta ve eşik aşımı sürümü otomatik engellemektedir."]},"ik":{"I":["«{k}» kapsamında personelin güvenlik yükümlülükleri tanımlı değildir; işe alım ve ayrılışta güvenlik adımı bulunmamaktadır.","İşe alımda genel bir bilgilendirme yapılmaktadır; güvenlik yükümlülükleri ve ayrılış adımları kişiden kişiye değişmektedir.","«{k}» için personelin güvenlik sorumlulukları görev tanımlarında ve sözleşmelerde yazılı olarak tanımlanmış, işe girişte tebliğ edilmektedir.","Yükümlülükler tanımlıdır; gizlilik taahhüdü imzalama oranı, ayrılışta varlık iadesi ve yetki kapatma süresi ölçülüp düzenli raporlanmaktadır.","Personel güvenliği süreçleri İK ile bütünleşik yürütülmekte; uyum düzeyi ölçülüp bulgulara göre süreç ve eğitimler sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında işe alım, görev değişikliği ve ayrılış için tanımlı bir güvenlik süreci bulunmamaktadır.","Ayrılışlarda genel bir çıkış işlemi yapılmaktadır; yetki kapatma, varlık iadesi ve gizlilik hatırlatması yazılı kontrol listesine bağlanmamıştır.","«{k}» için işe giriş (özgeçmiş/referans doğrulama, gizlilik taahhüdü), görev değişikliği ve ayrılış adımları yazılı prosedür ve kontrol listesiyle yürütülmektedir.","Süreç kayıtları tutulmakta; ayrılışta ortalama yetki kapatma süresi, iade edilmeyen varlık sayısı ve tamamlanmamış çıkış işlemi sayısı metrik olarak izlenmektedir.","İK olayları güvenlik süreçlerini otomatik tetiklemekte; disiplin ve uyum sonuçları geri beslenerek süreç ve kontroller sürekli iyileştirilmektedir."],"T":["«{k}» kapsamında personel yaşam döngüsünü takip eden bir sistem bulunmamaktadır.","İşe giriş/çıkış bilgileri İK sisteminde tutulmaktadır; yetki ve varlık işlemleri bu bilgiyle elle eşleştirilmektedir.","«{k}» için işe giriş/çıkış işlemleri bir talep sistemi üzerinden yürütülmekte ve yetki/varlık adımları kayıt altına alınmaktadır.","İK ve kimlik sistemleri arasında düzenli eşleştirme yapılmakta; hesabı kapatılmamış ayrılan personel sayısı otomatik raporlanmaktadır.","İK sistemi kimlik yönetimiyle entegredir; işe giriş, görev değişikliği ve ayrılışta yetkiler otomatik sağlanmakta ve geri alınmaktadır."]},"imha":{"I":["«{k}» kapsamında verinin/ortamın ne zaman ve kim tarafından imha edileceği tanımlı değildir.","İmha ihtiyaç görüldüğünde ilgili kişinin kararıyla yapılmaktadır; sorumluluk ve tanık/onay kuralı yazılı değildir.","«{k}» için imha kararı verme, uygulama ve doğrulama sorumlulukları yazılı olarak atanmış, ilgili personel bilgilendirilmiştir.","Sorumlular tanımlıdır; süresi dolduğu hâlde imha edilmemiş kayıt sayısı ve imha tutanaklarının tamamlanma oranı düzenli raporlanmaktadır.","İmha sorumluluğu saklama planıyla bütünleşmiş; uygulama düzenli denetlenip bulgulara göre yetkinlik ve süreç iyileştirilmektedir."],"S":["«{k}» kapsamında saklama süresi ve güvenli imhaya ilişkin tanımlı bir süreç bulunmamaktadır.","Eski veri ve ortamlar zaman zaman silinmekte/atılmaktadır; saklama süresi, imha yöntemi ve tutanak zorunluluğu yazılı değildir.","«{k}» için veri türü bazında saklama süreleri, onaylı imha yöntemleri (güvenli silme, manyetik temizleme, fiziksel imha) ve tutanak zorunluluğu yazılı politikada tanımlanmış ve uygulanmaktadır.","İmha işlemleri tutanakla kayıt altına alınmakta; periyodik imha takvimine uyum oranı, imha edilen kayıt sayısı ve gecikmiş imhalar metrik olarak izlenmektedir.","Saklama süresi dolan veri otomatik tespit edilip imha akışına alınmakta; imha kanıtları merkezî olarak saklanıp süreç düzenli denetimle iyileştirilmektedir."],"T":["«{k}» kapsamında güvenli silme veya imha için herhangi bir araç/yöntem kullanılmamaktadır; ortamlar sıradan biçimde atılmaktadır.","Silme işletim sisteminin normal silme komutuyla yapılmaktadır; verinin geri getirilemeyeceğini garanti eden bir yöntem yoktur.","«{k}» için onaylı güvenli silme aracı veya fiziksel imha yöntemi kullanılmakta ve imha edilen ortamlar kayıt altına alınmaktadır.","İmha araçları doğrulama raporu üretmekte; imha kanıtları saklanmakta ve saklama süresi dolan veriler sistem üzerinden raporlanmaktadır.","Saklama ve imha kuralları sistemlerde otomatik uygulanmakta (yaşam döngüsü politikaları); imha doğrulaması otomatik kaydedilip izlenmektedir."]},"kripto":{"I":["«{k}» kapsamında hangi verinin şifrelenmesi gerektiğini bilen ve bundan sorumlu olan bir kişi kurumumuzda tanımlı değildir.","Şifreleme ihtiyacını bazı teknik personelimiz bilmektedir; ancak sorumluluk yazılı değildir ve uygulama kişiye göre değişmektedir.","«{k}» için şifreleme gereksinimlerini belirleme ve uygulama sorumluluğu yazılı olarak atanmış, ilgili ekiplere duyurulmuştur.","Sorumlular tanımlıdır; şifrelenmesi gereken varlıklarda kapsama oranı ölçülmekte ve istisnalar gerekçesiyle birlikte yönetime raporlanmaktadır.","Kriptografi yetkinliği düzenli geliştirilmekte; algoritma/anahtar uzunluğu değişiklikleri sorumlularca proaktif izlenip kuruma yansıtılmakta, uyum düzeyi ölçülerek raporlanmaktadır."],"S":["«{k}» için şifreleme kullanımına ilişkin tanımlı bir kural veya süreç bulunmamaktadır.","Bazı sistemlerde şifreleme kullanılmaktadır; hangi veride hangi algoritmanın zorunlu olduğu yazılı değildir, kararlar duruma göre verilmektedir.","«{k}» kapsamında bekleyen ve aktarılan veri için zorunlu algoritma, anahtar uzunluğu ve istisna onay yolu kriptografi politikasında tanımlanmış ve uygulanmaktadır.","Şifreleme kapsamı periyodik denetlenmekte; şifrelenmemiş hassas veri bulgu sayısı, zayıf algoritma kullanım oranı ve kapatma süresi metrik olarak izlenmektedir.","Şifreleme politikası standartlardaki değişikliklere göre düzenli güncellenmekte, uyumsuz yapılandırmalar otomatik tespit edilip düzeltilmektedir."],"T":["«{k}» kapsamındaki veriler şifrelenmeden saklanmakta ve/veya açık kanaldan aktarılmaktadır.","Şifreleme yalnızca bazı noktalarda (ör. yalnızca web trafiğinde) kullanılmakta, kapsam sınırlı ve tutarsızdır.","«{k}» için bekleyen veride disk/veritabanı şifrelemesi, aktarımda güncel TLS gibi standart kontroller kurulmuş ve tanımlı kapsamda çalışmaktadır.","Şifreleme yapılandırmaları merkezî olarak izlenmekte; zayıf şifre paketleri, süresi dolan sertifikalar ve şifresiz uç noktalar araçla tespit edilip raporlanmaktadır.","Şifreleme uçtan uca ve varsayılan olarak zorlanmakta; yapılandırma sapmaları otomatik engellenip düzeltilmekte, kripto çeviklik (algoritma değişimi) test edilmektedir."]},"kvkk":{"I":["«{k}» kapsamında kişisel veri sorumluluğunun kimde olduğu tanımlı değildir; çalışanlarımız yükümlülükleri bilmemektedir.","Konuyla ilgili bazı çalışanlarımız bilgi sahibidir; irtibat kişisi/veri sorumlusu rolleri resmî olarak tanımlanmamıştır.","«{k}» için veri sorumlusu, irtibat kişisi ve süreç sahipleri yazılı olarak belirlenmiş; kişisel veri işleyen personel bilgilendirilmiştir.","Roller tanımlıdır; ilgili kişi başvurularının süresinde yanıtlanma oranı ve personelin kişisel veri eğitimini tamamlama oranı ölçülüp yönetime raporlanmaktadır.","Kişisel veri farkındalığı süreç tasarımına yerleşmiş; yeni işleme faaliyetleri başlamadan önce sorumlularca değerlendirilmekte, değerlendirme kayıtları tutulup uyum düzeyi ölçülerek raporlanmaktadır."],"S":["«{k}» kapsamında kişisel verinin hangi hukuki sebeple işlendiği ve nasıl yönetileceği tanımlı değildir.","Kişisel veri işlenmekte, bazı bilgilendirmeler yapılmaktadır; işleme envanteri, hukuki sebep eşlemesi ve saklama süreleri yazılı değildir.","«{k}» için kişisel veri işleme envanteri, hukuki sebepler, aydınlatma metinleri, saklama/imha süreleri ve ilgili kişi başvuru süreci yazılı olarak tanımlanmış ve uygulanmaktadır.","İşleme envanteri düzenli güncellenmekte; ilgili kişi başvuru sayısı ve ortalama yanıt süresi, aydınlatma kapsama oranı ve ihlal bildirim süresine uyum metrik olarak izlenmektedir.","Kişisel veri süreçleri mevzuat değişikliği ve denetim bulgularıyla sürekli güncellenmekte; yeni işleme faaliyetleri için etki değerlendirmesi zorunlu tutulup doğrulanmaktadır."],"T":["«{k}» kapsamında kişisel verilerin nerede tutulduğunu gösteren veya erişimi kısıtlayan bir teknik kontrol bulunmamaktadır.","Kişisel veriler farklı sistemlerde tutulmaktadır; envanter elle çıkarılmakta, erişim kısıtı ve maskeleme sınırlıdır.","«{k}» için kişisel veri barındıran sistemler tanımlanmış; erişim kısıtlaması, şifreleme ve kayıt tutma bu sistemlerde uygulanmaktadır.","Kişisel veri erişimleri kayıt altına alınıp izlenmekte; veri keşfi ile envanter doğrulanmakta ve başvuru/imha talepleri sistem üzerinden takip edilip raporlanmaktadır.","Kişisel veri keşfi, sınıflandırma, maskeleme ve saklama süresi otomasyonu entegre çalışmakta; kural dışı erişim ve aktarımlar gerçek zamanlı engellenip engelleme etkinliği düzenli test edilerek raporlanmaktadır."]},"log":{"I":["«{k}» kapsamında üretilen kayıtları inceleyecek tanımlı bir sorumlu bulunmamaktadır; loglara yalnızca sorun çıktığında bakılmaktadır.","Bazı sistem yöneticilerimiz logları kendi insiyatifiyle incelemektedir; izleme sorumluluğu ve vardiya düzeni tanımlı değildir.","«{k}» için log inceleme ve alarm değerlendirme sorumluluğu yazılı olarak atanmış, devir ve eskalasyon yolu tanımlanmıştır.","İzleme ekibinin performansı ölçülmektedir: alarm başına ortalama inceleme süresi, yanlış pozitif oranı ve kapatılan alarm sayısı düzenli raporlanmaktadır.","İzleme yetkinliği tatbikatlarla (mor takım, senaryo testleri) sınanmakta; bulgulara göre içerik ve personel yetkinliği sürekli geliştirilmektedir."],"S":["«{k}» için hangi olayların kaydedileceğini, ne kadar saklanacağını ve nasıl inceleneceğini tanımlayan bir süreç bulunmamaktadır.","Sistemlerin varsayılan logları açıktır; saklama süresi, kapsam ve inceleme sıklığı yazılı olarak tanımlanmamıştır.","«{k}» kapsamında kaydedilecek olay tipleri, saklama süresi, erişim kuralı ve periyodik inceleme yükümlülüğü yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Log kapsamı ve bütünlüğü düzenli doğrulanmakta; log göndermeyen kaynak sayısı, ortalama tespit süresi (MTTD) ve inceleme kayıtları metrik olarak izlenmektedir.","Tespit kuralları tehdit senaryolarına göre sürekli güncellenmekte, kapsam boşlukları otomatik raporlanıp kapatılmakta ve süreç düzenli olarak sınanmaktadır."],"T":["«{k}» kapsamında merkezî bir log toplama veya izleme aracı kullanılmamaktadır.","Loglar sistemler üzerinde yerel olarak tutulmaktadır; merkezî toplama, korelasyon ve alarm üretimi yoktur.","«{k}» için loglar merkezî bir log yönetimi/SIEM çözümünde toplanmakta ve tanımlı kurallarla alarm üretilmektedir.","SIEM üzerinde korelasyon kuralları çalışmakta; kaynak kapsama oranı, alarm hacmi ve kural etkinliği gösterge panosunda ölçülüp raporlanmakta, saat senkronizasyonu ve log bütünlüğü doğrulanmaktadır.","İzleme; tehdit istihbaratı, davranış analitiği ve otomatik müdahale (SOAR) ile entegre çalışmakta, tespit kuralları sürekli test edilip otomatik ayarlanmaktadır."]},"malware":{"I":["«{k}» kapsamında zararlı yazılım riskine karşı çalışanlarımızın ne yapması gerektiği tanımlı değildir.","Şüpheli dosya/e-posta durumunda çalışanlarımız kendi insiyatifiyle davranmaktadır; bildirim yolu resmî olarak tanımlanmamıştır.","«{k}» için şüpheli içerik bildirim yolu tanımlanmış, çalışanlara duyurulmuş ve müdahale sorumluluğu yazılı olarak atanmıştır.","Bildirim davranışı ölçülmektedir: bildirilen şüpheli e-posta sayısı, oltalama tatbikatı bildirme oranı ve müdahale süresi düzenli raporlanmaktadır.","Kullanıcı bildirimi tespit zincirinin parçası hâline gelmiş; tatbikat sonuçlarına göre hedefli eğitim uygulanıp davranış sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında zararlı yazılım korumasına ilişkin tanımlı bir kural veya süreç bulunmamaktadır.","Uç noktalarda antivirüs kuruludur; kapsam, imza/motor güncelliği ve bulgu yönetimi yazılı kurala bağlanmamıştır.","«{k}» için koruma kapsamı, güncelleme sıklığı, tarama planı ve bulaşma durumunda izlenecek adımlar yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Koruma etkinliği ölçülmektedir: korumasız uç nokta sayısı, güncel olmayan istemci oranı, tespit edilen zararlı sayısı ve temizleme süresi metrik olarak raporlanmaktadır.","Koruma yapılandırması tehdit gelişimine göre sürekli ayarlanmakta; tespit kabiliyeti test edilip (kontrollü örnek/tatbikat) sonuçlara göre iyileştirilmektedir."],"T":["«{k}» kapsamındaki sistemlerde zararlı yazılım koruması bulunmamaktadır.","Uç noktaların bir kısmında imza tabanlı antivirüs vardır; merkezî yönetim ve raporlama yoktur.","«{k}» için merkezî olarak yönetilen uç nokta koruma çözümü kurulmuş ve tanımlı kapsamda çalışmaktadır.","Uç nokta koruması merkezî konsolla izlenmekte; kapsama oranı, imza güncelliği ve tespit olayları raporlanmakta, alarmlar izleme sistemine aktarılmaktadır.","Davranış tabanlı tespit ve yanıt (EDR/XDR) çalışmakta; şüpheli uç nokta otomatik izole edilmekte ve tespit kuralları sürekli güncellenmektedir."]},"olay":{"I":["«{k}» kapsamında bir güvenlik olayında kime haber verileceği ve kimin karar vereceği belirsizdir.","Olay durumunda genelde BT sorumlusuna haber verilmektedir; müdahale ekibi, roller ve nöbet düzeni tanımlı değildir.","«{k}» için olay müdahale ekibi kurulmuş; roller, eskalasyon yolu ve iletişim listesi yazılı olarak tanımlanıp duyurulmuştur.","Müdahale ekibinin performansı ölçülmektedir: ortalama müdahale süresi (MTTR), eskalasyon uyumu ve tatbikat sonuçları düzenli raporlanmaktadır.","Ekip düzenli masa başı ve teknik tatbikatlarla sınanmakta; her olaydan çıkarılan dersler rollere ve eğitimlere geri beslenmektedir."],"S":["«{k}» kapsamında olayların nasıl bildirileceği, sınıflandırılacağı ve yönetileceğine ilişkin bir süreç bulunmamaktadır.","Olaylar duruma göre çözülmektedir; bildirim kanalı, sınıflandırma ölçeği ve kayıt tutma zorunluluğu yazılı değildir.","«{k}» için olay bildirim kanalı, sınıflandırma/önceliklendirme ölçeği, müdahale adımları ve yasal bildirim yükümlülükleri yazılı planda tanımlanmış ve uygulanmaktadır.","Olaylar kayıt altına alınmakta; olay sayısı, kategori dağılımı, tespit ve kapatma süreleri ile yasal bildirim süresine uyum metrik olarak izlenip raporlanmaktadır.","Olay sonrası kök neden analizi zorunludur; çıkarılan dersler kontrollere ve tespit kurallarına otomatik yansıtılmakta, plan düzenli tatbikatla doğrulanmaktadır."],"T":["«{k}» kapsamında olay kaydı tutmak için bir araç kullanılmamaktadır.","Olaylar e-posta veya elektronik tablo üzerinden takip edilmektedir; delil toplama ve zaman çizelgesi oluşturma elle yapılmaktadır.","«{k}» için olaylar bir talep/olay yönetim sisteminde kayıt altına alınmakta ve durumu takip edilmektedir.","Olay kayıtları izleme sistemleriyle ilişkilendirilmekte; süre metrikleri otomatik hesaplanıp gösterge panosunda raporlanmakta, delil bütünlüğü korunmaktadır.","Müdahale adımları otomasyonla (SOAR) yürütülmekte; izolasyon, delil toplama ve bildirim akışları otomatik tetiklenip sürekli iyileştirilmektedir."]},"politika":{"I":["«{k}» konusunda kurumumuzda yazılı bir kural olmadığı için çalışanlarımızdan ne beklendiği de tanımlı değildir.","Konuyla ilgili beklentiler sözlü kültürle aktarılmaktadır; kimin onaylayacağı ve kimin uygulayacağı kişiye göre değişmektedir.","«{k}» için politika/prosedür yönetim tarafından onaylanmış, rol ve sorumluluklar tanımlanmış ve ilgili personele duyurulmuştur.","Politikanın okunduğu ve anlaşıldığı kayıt altına alınmakta; duyuru kapsama oranı ve uyum sorumlusu bazında ihlal sayısı yönetime raporlanmaktadır.","Politika sahipliği kurum kültürüne yerleşmiş; uyum düzeyi düzenli ölçülüp geri bildirimlerle politika ve rol tanımları sürekli iyileştirilmektedir."],"S":["«{k}» konusunda yazılı bir politika, prosedür veya talimat bulunmamaktadır.","Konuyla ilgili taslak veya dağınık dokümanlar mevcuttur; onaylanmamış, güncellenmemiş ve kurum geneline yayılmamıştır.","«{k}» için kapsam, kurallar ve istisna yönetimi yazılı olarak tanımlanmış, yönetimce onaylanmış ve yürürlüktedir.","Doküman en az yılda bir veya önemli değişikliklerde gözden geçirilmekte; gözden geçirme kaydı, versiyon geçmişi ve uyum ölçüm sonuçları saklanmaktadır.","Politika seti; mevzuat değişiklikleri, denetim bulguları ve olay dersleriyle sürekli güncellenmekte, etkinliği bağımsız olarak doğrulanmaktadır."],"T":["«{k}» ile ilgili dokümanlar için tanımlı bir saklama veya yayınlama ortamı bulunmamaktadır.","Dokümanlar paylaşılan klasörlerde veya e-posta eklerinde tutulmaktadır; sürüm karmaşası yaşanmakta, güncel kopya belirsizdir.","«{k}» dokümanları merkezî bir doküman/portal ortamında sürüm kontrollü olarak yayımlanmakta ve tüm personelin erişimine açıktır.","Doküman platformu okundu bilgisi, onay akışı ve gözden geçirme hatırlatmalarını otomatik yürütmekte; güncelliği geçmiş doküman sayısı raporlanmaktadır.","Politika kuralları teknik kontrollere bağlanmış (politika-kod eşleşmesi); uyumsuzluklar otomatik tespit edilip ilgili sahibine yönlendirilmektedir."]},"risk":{"I":["«{k}» kapsamında riskleri değerlendirecek ve sahiplenecek tanımlı bir rol bulunmamaktadır.","Riskler teknik ekiplerin gündeminde yer almaktadır; risk sahipliği ve kabul yetkisi resmî olarak tanımlanmamıştır.","«{k}» için risk sahipleri ve risk kabul yetkisi yazılı olarak tanımlanmış; üst yönetimin gözetim sorumluluğu belirlenmiştir.","Risk sahipleri tanımlıdır; risklerin gözden geçirilme oranı, kabul edilen risk sayısı ve aksiyon gecikmeleri yönetim kuruluna düzenli raporlanmaktadır.","Risk sahipliği yönetişim yapısına yerleşmiş; risk iştahına uyum düzenli ölçülüp kararlar ve yetkinlikler sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında tanımlı bir risk değerlendirme veya işleme süreci bulunmamaktadır.","Riskler gündeme geldikçe konuşulmaktadır; yöntem, ölçek, kayıt ve tekrar sıklığı yazılı değildir.","«{k}» için risk tanımlama, analiz, değerlendirme ve işleme adımları ile risk kabul kriterleri yazılı metodolojide tanımlanmış ve uygulanmaktadır.","Risk kaydı düzenli güncellenmekte; risk sayısı, artık risk seviyesi, aksiyon tamamlanma oranı ve gözden geçirme kayıtları metrik olarak izlenmektedir.","Risk değerlendirmesi olay verisi, tehdit istihbaratı ve denetim bulgularıyla sürekli beslenmekte; yöntem etkinliği düzenli olarak sınanıp iyileştirilmektedir."],"T":["«{k}» kapsamındaki riskleri kaydeden bir araç veya kayıt ortamı bulunmamaktadır.","Risk kaydı elektronik tabloda tutulmaktadır; güncellik ve izlenebilirlik sınırlıdır.","«{k}» için riskler merkezî bir risk kayıt aracında tutulmakta, sahip ve aksiyonlarıyla birlikte izlenmektedir.","Risk aracı aksiyon terminlerini takip etmekte; risk ısı haritası ve trendler gösterge panosunda raporlanmaktadır.","Risk verisi zafiyet, olay ve varlık sistemleriyle entegre şekilde otomatik güncellenmekte; eşik aşımları otomatik uyarı üretmektedir."]},"sureklilik":{"I":["«{k}» kapsamında bir kesinti anında kimin ne yapacağı tanımlı değildir.","Kesinti durumunda deneyimli personelin bilgisine güvenilmektedir; kriz rolleri ve yedekleri yazılı değildir.","«{k}» için süreklilik/kriz rolleri, karar yetkileri ve iletişim listesi yazılı olarak tanımlanmış ve ilgili personele duyurulmuştur.","Roller tanımlıdır; tatbikat katılımı, rol başına hazırlık durumu ve tatbikat sonuç raporları düzenli olarak kayıt altına alınıp raporlanmaktadır.","Kriz ekipleri düzenli tatbikatlarla sınanmakta; tatbikat bulguları rol tanımlarına, eğitimlere ve planlara sürekli geri beslenmektedir."],"S":["«{k}» kapsamında iş sürekliliği veya kurtarma için tanımlı bir plan bulunmamaktadır.","Bazı senaryolar için gayri resmî hazırlıklar vardır; kritik süreçler, etki analizi ve kurtarma hedefleri yazılı değildir.","«{k}» için iş etki analizi yapılmış; kritik süreçler, kurtarma hedefleri (RTO/RPO) ve alternatif işletim adımları yazılı planda tanımlanmış ve yürürlüktedir.","Plan periyodik olarak test edilmekte; tatbikat kayıtları, gerçekleşen kurtarma süresi ile hedef arasındaki sapma ve açık aksiyonlar metrik olarak izlenmektedir.","Süreklilik planları değişen iş ve altyapıya göre sürekli güncellenmekte; tatbikat sonuçları ve gerçek olay dersleriyle otomatik gözden geçirme tetiklenmektedir."],"T":["«{k}» kapsamında yedeklilik veya alternatif işletim için teknik bir hazırlık bulunmamaktadır.","Bazı bileşenlerde yedeklilik vardır; kapsam parçalıdır ve devreye alma elle yapılmaktadır.","«{k}» için kritik bileşenlerde yedeklilik kurulmuş ve alternatif işletim ortamı tanımlı kapsamda hazırdır.","Yedeklilik ve kapasite sürekli izlenmekte; devreye alma süreleri ölçülmekte, kapasite eşikleri alarm üretmekte ve test sonuçları raporlanmaktadır.","Devreye alma otomatik gerçekleşmekte (otomatik yük devretme); kurtarma senaryoları düzenli otomatik test edilip sonuçlarına göre iyileştirilmektedir."]},"tedarikci":{"I":["«{k}» kapsamında tedarikçi ilişkisinin güvenlik tarafından kimin sorumlu olduğu tanımlı değildir.","Tedarikçiyle ilişkiyi iş birimi yürütmektedir; güvenlik gereksinimleri ancak sorun çıktığında gündeme gelmektedir.","«{k}» için her tedarikçiye kurum içi bir sahip atanmış; güvenlik gereksinimlerini takip etme sorumluluğu yazılı olarak tanımlanmıştır.","Tedarikçi sahipleri tanımlıdır; sahip bazında değerlendirilen tedarikçi oranı, açık bulgu sayısı ve kapatma süresi yönetime raporlanmaktadır.","Tedarikçi güvenliği yetkinliği düzenli geliştirilmekte; kritik tedarikçilerle ortak tatbikat ve gözden geçirmeler yapılarak ilişki sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında tedarikçilerin güvenlik açısından değerlendirilmesine ilişkin bir süreç bulunmamaktadır.","Bazı tedarikçilerden gizlilik taahhüdü alınmaktadır; sistematik bir değerlendirme, sözleşme güvenlik maddesi ve izleme yoktur.","«{k}» için tedarikçi seçiminde güvenlik değerlendirmesi yapılmakta, sözleşmelere güvenlik ve gizlilik maddeleri konulmakta ve ilişki sonlandırma adımları tanımlanmıştır.","Tedarikçiler kritiklik seviyesine göre periyodik olarak yeniden değerlendirilmekte; değerlendirme kayıtları, açık bulgu sayısı ve sözleşme uyum oranı metrik olarak izlenmektedir.","Tedarikçi riski sürekli izlenmekte (dış kaynaklı risk verisi, olay bildirimi, denetim raporu); bulgular otomatik aksiyona dönüşerek süreç iyileştirilmektedir."],"T":["«{k}» kapsamındaki tedarikçilere ilişkin bilgiler için tanımlı bir kayıt ortamı bulunmamaktadır.","Tedarikçi listesi elektronik tabloda tutulmaktadır; erişim ve veri paylaşımı teknik olarak ayrıştırılmamıştır.","«{k}» için tedarikçi envanteri merkezî olarak tutulmakta; tedarikçi erişimleri ayrı hesaplarla verilmekte ve kısıtlanmaktadır.","Tedarikçi erişimleri izlenip kayıt altına alınmakta; tedarikçi hesap sayısı, kullanılmayan erişimler ve değerlendirme durumu gösterge panosunda raporlanmaktadır.","Tedarikçi erişimi tam zamanında (just-in-time) ve otomatik sonlandırmalı verilmekte, tedarikçi risk verisi sistemlerle entegre şekilde sürekli güncellenmektedir."]},"yapilandirma":{"I":["«{k}» kapsamında sistem yapılandırmasının kimin sorumluluğunda olduğu ve neye göre yapılacağı tanımlı değildir.","Yapılandırmayı kuran kişi belirlemektedir; standart bir referans yoktur, sonuç kişiden kişiye değişmektedir.","«{k}» için yapılandırma standardını belirleme, uygulama ve değişikliği onaylama sorumlulukları yazılı olarak atanmıştır.","Sorumlular tanımlıdır; standarda uymayan sistem sayısı ve onaysız değişiklik sayısı sahip bazında ölçülüp raporlanmaktadır.","Yapılandırma standartları ilgili ekiplerce düzenli gözden geçirilmekte; sapma sayısı ve nedenleri ölçülüp raporlanarak standart ve yetkinlik sürekli iyileştirilmektedir."],"S":["«{k}» kapsamında güvenli yapılandırma ve değişiklik yönetimine ilişkin tanımlı bir süreç bulunmamaktadır.","Sistemler kurulurken temel ayarlar yapılmaktadır; yazılı bir sıkılaştırma standardı ve değişiklik onay akışı yoktur.","«{k}» için güvenli yapılandırma (sıkılaştırma) standardı yazılı olarak tanımlanmış; değişiklikler talep, onay, test ve geri alma adımlarıyla yönetilmektedir.","Yapılandırma uyumu periyodik denetlenmekte; standarda uyum oranı, sapma sayısı, acil değişiklik oranı ve geri alma sayısı metrik olarak izlenip kayıt altına alınmaktadır.","Yapılandırmalar kod olarak yönetilmekte, sapmalar otomatik tespit edilip düzeltilmekte ve standart tehdit gelişimine göre sürekli güncellenmektedir."],"T":["«{k}» kapsamında sistemler varsayılan ayarlarıyla çalışmakta, sıkılaştırma yapılmamaktadır.","Sıkılaştırma kurulum sırasında elle yapılmaktadır; sonradan oluşan sapmaları tespit eden bir araç yoktur.","«{k}» için standart imaj/yapılandırma şablonları kullanılmakta ve sistemler bu şablonlarla kurulmaktadır.","Yapılandırma uyumu bir araçla düzenli taranmakta; sapma raporları üretilmekte ve değişiklikler kayıt altına alınıp izlenmektedir.","Yapılandırma otomasyonla zorlanmakta (desired state); sapmalar otomatik geri alınmakta ve uyum durumu sürekli raporlanmaktadır."]},"yedek":{"I":["«{k}» kapsamında yedeklemeden sorumlu tanımlı bir kişi bulunmamaktadır; yedek alınıp alınmadığı kuruma bağlı olarak bilinmemektedir.","Yedekleme bir kişinin bilgisine ve hatırlamasına bağlıdır; yedeği bu kişi dışında geri yükleyebilecek personel yoktur.","«{k}» için yedekleme ve geri yükleme sorumluluğu yazılı olarak atanmış, yedek sorumlu belirlenmiş ve ilgili personel bilgilendirilmiştir.","Sorumlular tanımlıdır; başarısız yedek işi sayısı ve geri yükleme testi sonuçları sorumlular tarafından düzenli raporlanmaktadır.","Geri yükleme kabiliyeti farklı personelle tatbikat yapılarak doğrulanmakta; bulgular eğitim ve süreç iyileştirmesine dönüştürülmektedir."],"S":["«{k}» kapsamında yedekleme kapsamı, sıklığı ve saklama süresini tanımlayan bir süreç bulunmamaktadır.","Bazı sistemlerin yedeği alınmaktadır; kapsam, sıklık, saklama süresi ve geri yükleme hedefleri (RPO/RTO) yazılı değildir.","«{k}» için yedeklenecek veri kümesi, sıklık, saklama süresi, saklama yeri ve RPO/RTO hedefleri yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Geri yükleme testleri periyodik olarak yapılmakta ve kayıt altına alınmakta; başarılı yedek oranı, gerçekleşen geri yükleme süresi ve RPO/RTO sapmaları metrik olarak izlenmektedir.","Yedekler değiştirilemez (immutable) ve çevrim dışı kopya dâhil olacak şekilde saklanmakta, geri yükleme tatbikatları düzenli tekrarlanıp sonuçlarına göre iyileştirme yapılmaktadır."],"T":["«{k}» için otomatik bir yedekleme çözümü kullanılmamaktadır; yedek varsa elle kopyalanmaktadır.","Yedekler elle veya kısmi otomasyonla alınmakta, tek bir ortamda tutulmaktadır; şifreleme ve doğrulama yapılmamaktadır.","«{k}» kapsamında merkezî bir yedekleme çözümü kurulmuş, yedekler planlı olarak alınıp şifreli biçimde saklanmaktadır.","Yedek işlerinin başarı/başarısızlık durumu araç üzerinden izlenip alarm üretmekte, yedek bütünlüğü otomatik doğrulanmakta ve raporlanmaktadır.","Yedekleme; farklı lokasyon, değiştirilemez depolama ve otomatik geri yükleme doğrulaması ile çalışmakta, kurtarma senaryoları otomatik test edilmektedir."]},"zafiyet":{"I":["«{k}» kapsamında zafiyetleri takip etmek ve kapatmaktan sorumlu tanımlı bir kişi bulunmamaktadır.","Zafiyetlerle sistem yöneticilerimiz fırsat buldukça ilgilenmektedir; sahiplik ve kapatma sorumluluğu yazılı değildir.","«{k}» için zafiyet tarama, önceliklendirme ve kapatma sorumlulukları yazılı olarak atanmış ve ilgili ekiplere duyurulmuştur.","Sorumlular tanımlıdır; ekip bazında açık zafiyet sayısı, kritik zafiyetlerde ortalama kapatma süresi ve süresi geçmiş kayıtlar düzenli raporlanmaktadır.","Zafiyet yönetimi ekiplerin performans hedeflerine bağlanmış; sızma testi ve tatbikat bulgularıyla yetkinlik sürekli geliştirilmektedir."],"S":["«{k}» kapsamında zafiyet taraması, önceliklendirme ve yama uygulama konusunda tanımlı bir süreç bulunmamaktadır.","Yamalar üretici uyarısı geldikçe veya sorun çıktıkça uygulanmaktadır; tarama sıklığı ve kapatma süresi hedefleri yazılı değildir.","«{k}» için tarama sıklığı, kritiklik bazlı kapatma süresi hedefleri, istisna onayı ve doğrulama adımları yazılı prosedürde tanımlanmış ve uygulanmaktadır.","Zafiyet kapatma performansı ölçülmektedir: kritiklik bazlı ortalama kapatma süresi, hedefe uyum oranı, tekrar açılan bulgu sayısı ve periyodik sızma testi raporları kayıt altındadır.","Zafiyet yönetimi tehdit istihbaratıyla önceliklendirilmekte, istisnalar otomatik takip edilmekte ve süreç bağımsız test bulgularıyla sürekli iyileştirilmektedir."],"T":["«{k}» kapsamında zafiyet taraması yapan bir araç kullanılmamaktadır.","Tarama zaman zaman elle veya ücretsiz araçlarla yapılmaktadır; kapsam sınırlı ve düzensizdir.","«{k}» için bir zafiyet tarama çözümü kurulmuş, tanımlı kapsamdaki sistemler düzenli olarak taranmaktadır.","Tarama sonuçları merkezî olarak toplanmakta; kapsama oranı, açık bulgu yaşı ve yama uyumu gösterge panosunda ölçülüp raporlanmakta, yama dağıtımı araçla yönetilmektedir.","Tarama sürekli çalışmakta, bulgular otomatik olarak iş emrine dönüşmekte; yama dağıtımı otomatik ve doğrulamalı biçimde yürütülmektedir."]}},"areas":[{"c":"GV.OC","n":"Organizasyonel Bağlam","f":"GV","r":"Kurumun neyi, kimin için koruduğunun net olması tüm diğer kararların temelidir.","pool":[{"id":"UCT.09.021","t":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler","q":"Bilgi güvenliği ile ilgili yasal düzenleyici ve sözleşmeye tabi gereklilikler belirlenmiş ve dokümante edilmekte midir?","w":3,"m":2,"tag":10,"arch":"politika","k":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler"},{"id":"UCT.09.022","t":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler","q":"Kuruluş faaliyet alanlarına ilişkin tüm bilgi güvenliği mevzuatını ve düzenlemelerini tanımlamakta mıdır?","w":3,"m":2,"tag":10,"arch":"politika","k":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler"},{"id":"UCT.09.023","t":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler","q":"Mevzuat ve düzenlemelerdeki değişiklikler düzenli olarak takip edilmiş ve gözden geçirilmekte midir?","w":2,"m":3,"tag":10,"arch":"denetim","k":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler"},{"id":"UCT.09.024","t":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler","q":"Takip edilen değişikliklerin gerekliliklerini karşılamak için sorumluluklar tanımlanmakta mıdır?","w":2,"m":2,"tag":10,"arch":"politika","k":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler"},{"id":"UCT.09.047","t":"Paydaş Beklentileri ve İletişim","q":"İç ve dış paydaşların siber güvenlik beklentileri anlaşılmış ve dikkate alınmakta mıdır?","w":2,"m":1,"tag":10,"arch":"politika","k":"Paydaş Beklentileri ve İletişim"},{"id":"UCT.11.001","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Kuruluş ilgili tüm taraflara tedarikçi ilişkileri hakkında konuya özgü bir politika oluşturmuş ve iletmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.002","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Tedarikçiler tarafından sağlanan ürün ve hizmetlerin kullanımıyla ilgili güvenlik risklerini ele almak için süreçler belirlenmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.003","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Kuruluşun bilgilerinin güvenliğini etkileyebilecek tedarikçi türleri belirlenmiş ve dokümante edilmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.004","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Tedarikçilerin hassasiyetine göre nasıl değerlendirileceği ve seçileceği (pazar analizi referanslar vb) belirlenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.005","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Tedarikçi personelinden veya ürün arızalarından kaynaklanabilecek bilgi güvenliği riskleri değerlendirilmiş ve yönetilmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.006","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Tedarikçi türüne göre uygun sözleşme kuralları ve personelin tedarikçilerle etkileşimi için farkındalık sağlanmakta mıdır?","w":3,"m":2,"tag":8,"arch":"egitim","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"},{"id":"UCT.11.007","t":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi","q":"Tedarikçi ilişkisinin güvenli bir şekilde sonlandırılmasını (erişim iptali veri iadesi vb) sağlamaya yönelik gereklilikler belirlenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi ilişkilerinde bilgi güvenliği yönetimi"}]},{"c":"GV.RM","n":"Risk Yönetim Stratejisi","f":"GV","r":"Kabul edilebilir risk seviyesi tanımlı olmadan hangi yatırımın öncelikli olduğuna karar verilemez.","pool":[{"id":"UCT.09.001","t":"Bilgi güvenliği politikaları","q":"Bilgi güvenliği politikası ve konuya özgü politikalar tanımlanmış yönetim tarafından onaylanmış ve personele iletilmekte midir?","w":3,"m":2,"tag":10,"arch":"politika","k":"Bilgi güvenliği politikaları"},{"id":"UCT.09.002","t":"Bilgi güvenliği politikaları","q":"Bilgi güvenliği politikası ve konuya özgü politikalar planlı aralıklarla ve önemli değişiklikler olması durumunda gözden geçirilmekte midir?","w":2,"m":3,"tag":10,"arch":"denetim","k":"Bilgi güvenliği politikaları"},{"id":"UCT.09.003","t":"Bilgi güvenliği politikaları","q":"Politika iş stratejisi yönetmelikler mevzuat sözleşmeler ve bilgi güvenliği risklerinden türetilen gereksinimleri içermekte midir?","w":3,"m":2,"tag":10,"arch":"politika","k":"Bilgi güvenliği politikaları"},{"id":"UCT.09.004","t":"Bilgi güvenliği politikaları","q":"Bilgi güvenliği politikası erişim kontrolü fiziksel güvenlik varlık yönetimi gibi konuya özgü alt seviye politikalar ile desteklenmekte midir?","w":3,"m":2,"tag":10,"arch":"fiziksel","k":"Bilgi güvenliği politikaları"}]},{"c":"GV.RR","n":"Roller, Sorumluluklar ve Yetkiler","f":"GV","r":"Sorumluluğun kimde olduğu net değilse, bir olay anında kimin karar vereceği de net değildir.","pool":[{"id":"UCT.09.005","t":"Bilgi güvenliği rolleri ve sorumlulukları","q":"Bilgi güvenliği rolleri ve sorumlulukları kuruluşun ihtiyaçlarına göre tanımlanmış ve dağıtılmakta mıdır?","w":3,"m":2,"tag":10,"arch":"politika","k":"Bilgi güvenliği rolleri ve sorumlulukları"},{"id":"UCT.09.006","t":"Bilgi güvenliği rolleri ve sorumlulukları","q":"Bilgilerin korunması süreçlerin yürütülmesi ve risk yönetimi faaliyetlerine yönelik sorumluluklar tanımlanmış ve yönetilmekte midir?","w":3,"m":2,"tag":10,"arch":"risk","k":"Bilgi güvenliği rolleri ve sorumlulukları"},{"id":"UCT.09.007","t":"Bilgi güvenliği rolleri ve sorumlulukları","q":"Kişilerin sorumlu olduğu her bir güvenlik alanı tanımlanmış belgelenmiş ve ilgili kişilere iletilmekte midir?","w":2,"m":2,"tag":10,"arch":"kvkk","k":"Bilgi güvenliği rolleri ve sorumlulukları"},{"id":"UCT.09.008","t":"Bilgi güvenliği rolleri ve sorumlulukları","q":"Yetki seviyeleri tanımlanmış ve belgelenmekte midir?","w":3,"m":2,"tag":10,"arch":"erisim","k":"Bilgi güvenliği rolleri ve sorumlulukları"},{"id":"UCT.09.011","t":"Yönetim sorumlulukları","q":"Yönetim tüm personelinin bilgi güvenliği politikalarına uygun hareket etmesini zorunlu tutmuş ve personeli bilgilendirmekte midir?","w":4,"m":2,"tag":10,"arch":"politika","k":"Yönetim sorumlulukları"},{"id":"UCT.09.012","t":"Yönetim sorumlulukları","q":"Kuruluşun bilgi güvenliği politikasını ve özel politikalarını yerine getirmekle görevli olduğu personele bildirilmekte midir?","w":3,"m":2,"tag":10,"arch":"politika","k":"Yönetim sorumlulukları"},{"id":"UCT.09.013","t":"Yönetim sorumlulukları","q":"Personelin kuruluş içindeki rolleri ve sorumluluklarıyla ilgili bilgi güvenliği farkındalığı seviyesine ulaşıp ulaşmadığı kontrol edilmekte midir?","w":2,"m":3,"tag":10,"arch":"politika","k":"Yönetim sorumlulukları"},{"id":"UCT.10.001","t":"Tarama (Geçmiş doğrulama)","q":"Tüm personel adaylarına dair geçmiş doğrulama kontrolleri (tarama) yapılmakta mıdır?","w":3,"m":1,"tag":11,"arch":"ik","k":"Tarama (Geçmiş doğrulama)"},{"id":"UCT.10.002","t":"Tarama (Geçmiş doğrulama)","q":"Doğrulama süreci referanslar özgeçmiş akademik nitelikler ve kimlik doğrulamasını içermekte midir?","w":3,"m":2,"tag":11,"arch":"ik","k":"Tarama (Geçmiş doğrulama)"},{"id":"UCT.10.003","t":"Tarama (Geçmiş doğrulama)","q":"Prosedürler doğrulama incelemeleri için kriterleri ve sınırlamaları tanımlamakta mıdır?","w":2,"m":2,"tag":11,"arch":"politika","k":"Tarama (Geçmiş doğrulama)"},{"id":"UCT.10.004","t":"İstihdam hüküm ve koşulları","q":"İş sözleşmeleri personelin ve kuruluşun bilgi güvenliği sorumluluklarını içermekte midir?","w":3,"m":2,"tag":11,"arch":"ik","k":"İstihdam hüküm ve koşulları"},{"id":"UCT.10.005","t":"Gizlilik veya ifşa etmeme anlaşmaları","q":"Gizli bilgilere erişim verilecek personel işe başlamadan önce gizlilik anlaşması imzalamakta mıdır?","w":4,"m":2,"tag":11,"arch":"ik","k":"Gizlilik veya ifşa etmeme anlaşmaları"},{"id":"UCT.10.006","t":"İstihdam hüküm ve koşulları","q":"Sözleşmelerde yasal sorumluluklar ve haklar açıkça belirtilmekte midir?","w":3,"m":2,"tag":11,"arch":"ik","k":"İstihdam hüküm ve koşulları"},{"id":"UCT.10.007","t":"İstihdam hüküm ve koşulları","q":"Bilgi varlıklarının yönetimi ve bilgi güvenliği sorumlulukları personele açıkça bildirilmekte midir?","w":2,"m":2,"tag":11,"arch":"envanter","k":"İstihdam hüküm ve koşulları"},{"id":"UCT.10.011","t":"Disiplin süreci","q":"Bilgi güvenliği ihlalleri için bir disiplin süreci resmileştirilmiş ve personele iletilmekte midir?","w":2,"m":2,"tag":11,"arch":"ik","k":"Disiplin süreci"},{"id":"UCT.10.012","t":"Disiplin süreci","q":"Yaptırımlar ihlalin ciddiyeti ve yasal gereklilikler dikkate alınarak uygulanmakta mıdır?","w":2,"m":2,"tag":11,"arch":"ik","k":"Disiplin süreci"},{"id":"UCT.10.013","t":"Disiplin süreci","q":"Disiplin sürecinde kişilerin kimlikleri gizlilik gerekliliklerine uygun saklanmakta mıdır?","w":1,"m":2,"tag":11,"arch":"ik","k":"Disiplin süreci"}]},{"c":"GV.PO","n":"Politika","f":"GV","r":"Yazılı politika, beklenen davranışın kişiye değil kuruma ait olmasını sağlar.","pool":[{"id":"UCT.04.012","t":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)","q":"Kişisel verilerin (PII) gizliliği ve korunması hakkında konuya özgü bir politika oluşturulmuş ve iletilmekte midir?","w":3,"m":2,"tag":4,"arch":"kvkk","k":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)"},{"id":"UCT.04.013","t":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)","q":"Kişisel verilerin gizliliği ve korunması için prosedürler geliştirilmiş ve uygulanmakta mıdır?","w":3,"m":2,"tag":4,"arch":"kvkk","k":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)"},{"id":"UCT.04.014","t":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)","q":"Kişisel verileri korumak için uygun teknik ve idari tedbirler uygulanmakta mıdır?","w":4,"m":1,"tag":4,"arch":"kvkk","k":"Kişisel Verilerin Gizlenmesi ve Korunması (PII)"},{"id":"UCT.09.028","t":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)","q":"Kayıtların saklanması ve korunmasına ilişkin yönergeler yayınlanmış ve politika ile uyumlu olmakta mıdır?","w":2,"m":2,"tag":10,"arch":"politika","k":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)"},{"id":"UCT.09.029","t":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)","q":"Kayıtları ve saklama sürelerini tanımlayan bir saklama programı hazırlanmakta mıdır?","w":2,"m":2,"tag":10,"arch":"politika","k":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)"},{"id":"UCT.09.030","t":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)","q":"Kayıtlar saklama süreleri ve depolama ortamı türlerini içerecek şekilde sınıflandırılmakta mıdır?","w":2,"m":2,"tag":10,"arch":"envanter","k":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)"}]},{"c":"GV.OV","n":"Gözetim","f":"GV","r":"Bağımsız gözetim olmadan programın gerçekten çalışıp çalışmadığı yalnızca varsayımdan ibarettir.","pool":[{"id":"UCT.09.034","t":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk","q":"Bilgi güvenliği politikalarına ve standartlarına uyum düzenli olarak gözden geçirilmekte midir?","w":2,"m":3,"tag":10,"arch":"politika","k":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk"},{"id":"UCT.09.035","t":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk","q":"Gözden geçirme sonucunda bulunan uygunsuzlukların nedenleri belirlenmekte midir?","w":2,"m":2,"tag":10,"arch":"politika","k":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk"},{"id":"UCT.09.036","t":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk","q":"Uyumluluğu sağlamak için düzeltici faaliyetler uygulanmakta mıdır?","w":2,"m":2,"tag":10,"arch":"politika","k":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk"},{"id":"UCT.09.037","t":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk","q":"Bilgi güvenliği politika ve standartlarına uyum oranı (örn. departman bazlı uygunluk yüzdesi) periyodik olarak bir metrikle ölçülüp raporlanmakta mıdır?","w":2,"m":4,"tag":10,"arch":"politika","k":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk"},{"id":"UCT.09.038","t":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk","q":"Kapatılmış bir düzeltici faaliyetin belirli bir süre sonra gerçekten işe yarayıp yaramadığı (etkinliği) ayrıca değerlendirilip kayıt altına alınmakta mıdır?","w":1,"m":5,"tag":10,"arch":"politika","k":"Bilgi güvenliğine yönelik politikalar, kurallar ve standartlara uygunluk"}]},{"c":"GV.SC","n":"Tedarik Zinciri Siber Risk Yönetimi","f":"GV","r":"Kurumun kendi kontrolleri güçlü olsa da zayıf bir tedarikçi tüm zinciri riske atabilir.","pool":[{"id":"UCT.07.002","t":"Güvenli geliştirme yaşam döngüsü","q":"Geliştirme dış kaynaklı ise tedarikçinin güvenli geliştirme kurallarına uyduğu güvence altına alınmakta mıdır?","w":3,"m":2,"tag":2,"arch":"tedarikci","k":"Güvenli geliştirme yaşam döngüsü"},{"id":"UCT.11.008","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Tedarikçi ile kuruluş arasında bilgi güvenliği yükümlülüklerini netleştiren anlaşmalar yapılmış ve dokümante edilmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.009","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Sağlanacak bilgilerin tanımı ve erişim yöntemleri sözleşmelere dahil edilmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.010","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Kuruluşun sınıflandırma şeması ile tedarikçinin şeması arasında eşleştirme yapılıp sözleşmelere eklenmekte midir?","w":2,"m":3,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.011","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Veri koruma PII işleme ve fikri mülkiyet hakları gibi yasal ve düzenleyici gereklilikler sözleşmelere eklenmekte midir?","w":4,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.012","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Bilgilerin ve varlıkların kabul edilebilir kullanım kuralları sözleşmelere eklenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.013","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Tedarikçi personelinin yetkilendirilmesi ve yetkilerinin kaldırılmasına ilişkin prosedürler sözleşmelere eklenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.014","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Yüklenicinin gereklilikleri karşılamaması durumunda uygulanacak tazminatlar ve düzeltmeler sözleşmelere eklenmekte midir?","w":1,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.015","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"İhlal olayı yönetimi gereklilikleri ve bildirim prosedürleri sözleşmelere eklenmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.016","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Bilgi güvenliği konuları için irtibat kişileri sözleşmelere eklenmekte midir?","w":1,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.017","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Tedarikçi süreçlerini ve kontrollerini denetleme hakkı sözleşmelere eklenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.018","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Kusur çözme ve çatışma çözme süreçleri sözleşmelere eklenmekte midir?","w":1,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.019","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Bilgi sınıflandırmasıyla orantılı fiziksel güvenlik kontrolleri sözleşmelere eklenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.020","t":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması","q":"Tedarikçi tarafından depolanan bilgilerin artık gerekli olmadığında güvenli imha edilmesi şartı sözleşmelere eklenmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi anlaşmalarında bilgi güvenliğinin ele alınması"},{"id":"UCT.11.027","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Tedarikçi hizmetlerinin izlenmesi anlaşma hükümlerine uyulmasını ve ihlallerin yönetilmesini sağlamakta mıdır?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.028","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Hizmet performansını ve tedarikçi tarafından yapılan değişiklikleri izlemek için bir süreç olmakta mıdır?","w":2,"m":4,"tag":8,"arch":"tedarikci","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.029","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Varsa bağımsız denetçi raporlarının incelenmesi ve tedarikçi denetimlerinin yapılması sağlanmakta mıdır?","w":2,"m":3,"tag":8,"arch":"denetim","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.030","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Bilgi güvenliği ihlal olayları hakkında bilgi sağlanmış ve prosedürlere göre gözden geçirilmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.031","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Tedarikçi hizmetlerinde tespit edilen bilgi güvenliği açıkları yönetilmekte midir?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.032","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Tedarikçi ilişkilerini yönetme sorumluluğu belirlenmiş bir kişiye veya takıma atanmakta mıdır?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"},{"id":"UCT.11.033","t":"Bulut hizmetlerinin kullanımı için bilgi güvenliği","q":"Kuruluş bulut hizmetlerinin kullanımına ilişkin konuya özgü bir politika oluşturmuş ve iletmekte midir?","w":2,"m":2,"tag":8,"arch":"politika","k":"Bulut hizmetlerinin kullanımı için bilgi güvenliği"},{"id":"UCT.11.034","t":"Bulut hizmetlerinin kullanımı için bilgi güvenliği","q":"Bulut hizmetleri için bilgi güvenliği gereklilikleri ve risk yönetimi planı tanımlanmakta mıdır?","w":3,"m":2,"tag":8,"arch":"risk","k":"Bulut hizmetlerinin kullanımı için bilgi güvenliği"},{"id":"UCT.11.035","t":"Bulut hizmetlerinin kullanımı için bilgi güvenliği","q":"Bulut hizmetlerinin kullanımı ve yönetimi ile ilgili roller ve sorumluluklar tanımlanmakta mıdır?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Bulut hizmetlerinin kullanımı için bilgi güvenliği"},{"id":"UCT.11.036","t":"Bulut hizmetlerinin kullanımı için bilgi güvenliği","q":"Bulut hizmet sağlayıcısı ile yapılan anlaşma veri koruma erişim kontrolleri ve hizmetten çıkış desteğini içermekte midir?","w":4,"m":2,"tag":8,"arch":"tedarikci","k":"Bulut hizmetlerinin kullanımı için bilgi güvenliği"},{"id":"UCT.11.040","t":"Dış kaynak yoluyla geliştirme","q":"Dış kaynaklı geliştirmelerde kuruluş beklentilerini iletmiş ve süreci izlemekte midir?","w":3,"m":2,"tag":2,"arch":"gelistirme","k":"Dış kaynak yoluyla geliştirme"},{"id":"UCT.11.041","t":"Dış kaynak yoluyla geliştirme","q":"Dış tedarik zincirinde lisanslama güvenli kodlama kabul testleri ve kaynak kod emaneti (escrow) dikkate alınmakta mıdır?","w":3,"m":2,"tag":2,"arch":"tedarikci","k":"Dış kaynak yoluyla geliştirme"},{"id":"UCT.11.042","t":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi","q":"Tedarikçi performans/denetim bulgularına dayanarak, son 12 ay içinde sözleşme kapsamında, hizmet seviyesinde veya tedarikçi seçiminde somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":8,"arch":"denetim","k":"Tedarikçi hizmetlerinin izlenmesi, gözden geçirilmesi ve değişiklik yönetimi"}]},{"c":"ID.AM","n":"Varlık Yönetimi","f":"ID","r":"Envanterde olmayan bir varlık korunamaz; çoğu ihlal unutulmuş sistemlerden başlar.","pool":[{"id":"UCT.01.001","t":"Bilgi envanteri ve diğer ilgili varlıklar","q":"Kuruluş bilgilerini ve diğer ilişkili varlıklarını tanımlamış ve bir envanter oluşturmakta mıdır?","w":4,"m":1,"tag":9,"arch":"envanter","k":"Bilgi envanteri ve diğer ilgili varlıklar"},{"id":"UCT.01.002","t":"Bilgi envanteri ve diğer ilgili varlıklar","q":"Dokümantasyon uygun şekilde özel veya mevcut envanterlerde tutulmakta mıdır?","w":3,"m":2,"tag":9,"arch":"envanter","k":"Bilgi envanteri ve diğer ilgili varlıklar"},{"id":"UCT.01.003","t":"Bilgi envanteri ve diğer ilgili varlıklar","q":"Bilgi ve diğer ilgili varlıkların envanteri doğru güncel tutarlı ve diğer envanterlerle uyumlu olmakta mıdır?","w":3,"m":3,"tag":9,"arch":"envanter","k":"Bilgi envanteri ve diğer ilgili varlıklar"},{"id":"UCT.01.004","t":"Bilgi envanteri ve diğer ilgili varlıklar","q":"Sahipler de dahil olmak üzere bilgi ve varlık envanteri geliştirilmiş ve sürdürülmekte midir?","w":3,"m":2,"tag":9,"arch":"envanter","k":"Bilgi envanteri ve diğer ilgili varlıklar"},{"id":"UCT.01.020","t":"Kullanıcı uç nokta cihazları","q":"Kullanıcı uç nokta cihazlarının güvenli konfigürasyonu ve kullanımı hakkında politika oluşturulmakta mıdır?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"Kullanıcı uç nokta cihazları"},{"id":"UCT.01.021","t":"Kullanıcı uç nokta cihazları","q":"Cihazlardaki kablosuz bağlantıların yapılandırılması için prosedürler oluşturulmakta mıdır?","w":3,"m":2,"tag":7,"arch":"ag","k":"Kullanıcı uç nokta cihazları"},{"id":"UCT.01.022","t":"Kullanıcı uç nokta cihazları","q":"Bağlantı türlerine (kablolu/kablosuz) göre kullanım prosedürleri belirlenmekte midir?","w":2,"m":2,"tag":7,"arch":"ag","k":"Kullanıcı uç nokta cihazları"},{"id":"UCT.01.037","t":"Bilgi envanteri ve diğer ilgili varlıklar","q":"Envanter doğruluk ölçümlerinden (örn. fiziksel sayım ile kayıt uyuşma oranı) elde edilen bulgulara dayanarak, son 12 ay içinde envanter yönetim sürecinde somut bir iyileştirme (örn. otomatik varlık keşif aracının devreye alınması) yapılmakta mıdır?","w":1,"m":5,"tag":9,"arch":"envanter","k":"Bilgi envanteri ve diğer ilgili varlıklar"},{"id":"UCT.03.020","t":"Ağ güvenliği","q":"Ağlardaki bilgileri korumak için segmentasyon cihaz yönetimi ve erişim kontrolleri uygulanmakta mıdır?","w":4,"m":1,"tag":7,"arch":"ag","k":"Ağ güvenliği"},{"id":"UCT.03.021","t":"Ağ güvenliği","q":"Sanallaştırılmış ağların (SDN vb) güvenliği için uygun kontroller uygulanmakta mıdır?","w":2,"m":1,"tag":7,"arch":"ag","k":"Ağ güvenliği"},{"id":"UCT.03.032","t":"Ağ güvenliği","q":"Ağ güvenliği olayları (engellenen bağlantı sayısı, anormal trafik uyarıları) bir metrikle düzenli olarak izlenip raporlanmakta mıdır?","w":2,"m":4,"tag":7,"arch":"ag","k":"Ağ güvenliği"},{"id":"UCT.04.001","t":"Bilgilerin sınıflandırılması","q":"Kuruluş bilgi sınıflandırmasına ilişkin konuya özgü bir politika oluşturmuş ve iletmekte midir?","w":3,"m":2,"tag":9,"arch":"envanter","k":"Bilgilerin sınıflandırılması"},{"id":"UCT.04.002","t":"Bilgilerin sınıflandırılması","q":"Sınıflandırma şeması gizlilik bütünlük ve kullanılabilirlik gerekliliklerini dikkate almakta mıdır?","w":3,"m":2,"tag":9,"arch":"envanter","k":"Bilgilerin sınıflandırılması"},{"id":"UCT.04.003","t":"Bilgilerin sınıflandırılması","q":"Sınıflandırma şeması kuralları ve sınıflandırmanın zaman içinde gözden geçirilmesi kriterlerini içermekte midir?","w":2,"m":3,"tag":9,"arch":"denetim","k":"Bilgilerin sınıflandırılması"},{"id":"UCT.04.004","t":"Bilgilerin sınıflandırılması","q":"Şema erişim kontrolü politikasıyla uyumlu olmuş ve kuruluşun iş ihtiyaçlarını karşılamakta mıdır?","w":3,"m":2,"tag":9,"arch":"envanter","k":"Bilgilerin sınıflandırılması"}]},{"c":"ID.RA","n":"Risk Değerlendirmesi","f":"ID","r":"Zafiyetler düzenli taranmazsa saldırganlar bunları savunmadan önce bulur.","pool":[{"id":"UCT.01.034","t":"Değişiklik yönetimi","q":"Bilgi sistemlerindeki değişiklikler resmi bir değişiklik yönetimi sürecine tabi olmakta mıdır?","w":3,"m":2,"tag":2,"arch":"yapilandirma","k":"Değişiklik yönetimi"},{"id":"UCT.01.035","t":"Değişiklik yönetimi","q":"Değişikliklerin kontrolü için yönetim sorumlulukları ve onay mekanizmaları bulunmakta mıdır?","w":3,"m":2,"tag":2,"arch":"yapilandirma","k":"Değişiklik yönetimi"},{"id":"UCT.01.036","t":"Değişiklik yönetimi","q":"Değişiklik prosedürleri etki analizi geri alma planları ve testleri içermekte midir?","w":3,"m":2,"tag":2,"arch":"yapilandirma","k":"Değişiklik yönetimi"},{"id":"UCT.05.008","t":"Tehdit ve Zafiyet Yönetimi","q":"Güvenlik açığı izleme risk değerlendirmesi ve yama yönetimi ile ilgili roller ve sorumluluklar tanımlanmakta mıdır?","w":2,"m":2,"tag":7,"arch":"zafiyet","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.05.009","t":"Tehdit ve Zafiyet Yönetimi","q":"Yazılım ve teknolojiler için ilgili açıklıklar belirlenmiş ve takip edilmekte midir?","w":4,"m":4,"tag":7,"arch":"zafiyet","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.05.010","t":"Tehdit ve Zafiyet Yönetimi","q":"Tedarikçilerin güvenlik açığı raporlaması ve ifşası sözleşmelerle zorunlu kılınmakta mıdır?","w":2,"m":2,"tag":7,"arch":"tedarikci","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.05.011","t":"Tehdit ve Zafiyet Yönetimi","q":"Dahili ve harici kaynaklardan güvenlik açığı raporları alınmakta mıdır?","w":2,"m":2,"tag":7,"arch":"zafiyet","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.05.014","t":"Tehdit ve Zafiyet Yönetimi","q":"Zafiyet yönetimi metriklerine (ortalama kapatma süresi, açık kritik zafiyet sayısı) dayanarak, son 12 ay içinde zafiyet yönetim sürecinde somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":7,"arch":"zafiyet","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.05.016","t":"Tehdit ve Zafiyet Yönetimi","q":"Zafiyet yönetimi süreci, kuruluş genelinde tutarlı bir standart SLA'ya (örn. kritik zafiyetler 30 gün içinde kapatılır) göre yürütülüp periyodik olarak denetlenmekte midir?","w":2,"m":3,"tag":7,"arch":"zafiyet","k":"Tehdit ve Zafiyet Yönetimi"},{"id":"UCT.07.015","t":"Geliştirme ve kabul aşamasında güvenlik testleri","q":"Geliştirme yaşam döngüsünde güvenlik test süreçleri tanımlanmış ve uygulanmakta mıdır?","w":3,"m":2,"tag":2,"arch":"gelistirme","k":"Geliştirme ve kabul aşamasında güvenlik testleri"},{"id":"UCT.07.016","t":"Geliştirme ve kabul aşamasında güvenlik testleri","q":"Güvenlik testleri işlevsel ve işlevsel olmayan gerekliliklere göre yapılmakta mıdır?","w":2,"m":2,"tag":2,"arch":"yapilandirma","k":"Geliştirme ve kabul aşamasında güvenlik testleri"},{"id":"UCT.07.017","t":"Geliştirme ve kabul aşamasında güvenlik testleri","q":"Güvenlik testleri kod güvenliği konfigürasyonlar ve erişim kontrollerini kapsamakta mıdır?","w":3,"m":2,"tag":2,"arch":"yapilandirma","k":"Geliştirme ve kabul aşamasında güvenlik testleri"},{"id":"UCT.07.018","t":"Geliştirme ve kabul aşamasında güvenlik testleri","q":"Test planları girdileri beklenen çıktıları ve başarı kriterlerini içermekte midir?","w":2,"m":2,"tag":2,"arch":"yapilandirma","k":"Geliştirme ve kabul aşamasında güvenlik testleri"},{"id":"UCT.09.015","t":"Özel ilgi gruplarıyla iletişim","q":"Kuruluş en iyi uygulamaları takip etmek ve tehditler hakkında bilgi almak için özel ilgi grupları ve güvenlik forumlarıyla iletişim kurmakta mıdır?","w":2,"m":2,"tag":8,"arch":"politika","k":"Özel ilgi gruplarıyla iletişim"},{"id":"UCT.11.021","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"BİT ürün veya hizmet alımına uygulanacak güvenlik gereklilikleri tanımlanmış ve tedarik zinciri boyunca yayılması şart koşulmakta mıdır?","w":3,"m":2,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"},{"id":"UCT.11.022","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"BİT ürünleri tedarikçilerinden ürünlerde kullanılan yazılım bileşenlerini (SBOM vb) açıklamaları talep edilmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"},{"id":"UCT.11.023","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"Tedarikçilerden ürünlerinin güvenlik fonksiyonlarını ve güvenli konfigürasyonunu açıklayan bilgileri sağlamaları istenmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"},{"id":"UCT.11.024","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"Kritik bileşenlerin ve bunların kaynağının tedarik zinciri boyunca izlenebileceğine dair güvence elde edilmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"},{"id":"UCT.11.025","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"Teslim edilen BİT ürünlerinin beklenmedik özellikler olmadan çalıştığına dair güvence alınmakta mıdır?","w":3,"m":1,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"},{"id":"UCT.11.026","t":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme","q":"BİT ürünlerinin gerekli güvenlik seviyelerine ulaştığına dair sertifikasyon veya değerlendirme güvencesi elde edilmekte midir?","w":2,"m":2,"tag":8,"arch":"tedarikci","k":"Bilgi ve iletişim teknolojisi (BİT) tedarik zincirinde bilgi güvenliğini yönetme"}]},{"c":"ID.IM","n":"İyileştirme","f":"ID","r":"Aynı hatanın tekrarlanmaması, dersin çıkarılıp sisteme geri beslenmesiyle mümkündür.","pool":[{"id":"UCT.05.012","t":"Uygulama Güvenlik Testleri ve Güvenlik Denetimleri","q":"Denetim testleri operasyonel sistemleri etkilemeyecek şekilde planlanmış ve sadece salt okunur erişimle sınırlandırılmakta mıdır?","w":2,"m":2,"tag":2,"arch":"denetim","k":"Uygulama Güvenlik Testleri ve Güvenlik Denetimleri"},{"id":"UCT.05.013","t":"Uygulama Güvenlik Testleri ve Güvenlik Denetimleri","q":"Hassas bilgi ifşası riski varsa denetim testleri geliştirme ortamlarında yapılmakta mıdır?","w":2,"m":2,"tag":2,"arch":"denetim","k":"Uygulama Güvenlik Testleri ve Güvenlik Denetimleri"},{"id":"UCT.06.021","t":"İş sürekliliği için BİT hazırlığı","q":"İş etki analizi sürecinde kesinti etkilerini değerlendirmek için kriterler kullanılmakta mıdır?","w":3,"m":2,"tag":6,"arch":"risk","k":"İş sürekliliği için BİT hazırlığı"},{"id":"UCT.06.023","t":"İş sürekliliği için BİT hazırlığı","q":"Kuruluş BİT süreklilik planlarını (RTO RPO hedefleri dahil) hazırlamış ve düzenli olarak test etmekte midir?","w":4,"m":3,"tag":6,"arch":"yedek","k":"İş sürekliliği için BİT hazırlığı"},{"id":"UCT.09.031","t":"Bilgi güvenliğinin bağımsız gözden geçirilmesi","q":"Kuruluşun bilgi güvenliği yönetimi yaklaşımı planlı aralıklarla bağımsız olarak gözden geçirilmekte midir?","w":2,"m":3,"tag":10,"arch":"denetim","k":"Bilgi güvenliğinin bağımsız gözden geçirilmesi"},{"id":"UCT.09.032","t":"Bilgi güvenliğinin bağımsız gözden geçirilmesi","q":"Gözden geçirmeler iyileştirme fırsatlarını ve politika değişiklik ihtiyaçlarını içermekte midir?","w":2,"m":3,"tag":10,"arch":"denetim","k":"Bilgi güvenliğinin bağımsız gözden geçirilmesi"},{"id":"UCT.09.033","t":"Bilgi güvenliğinin bağımsız gözden geçirilmesi","q":"Gözden geçirmeler incelenen alandan bağımsız kişiler tarafından yapılmakta mıdır?","w":2,"m":3,"tag":10,"arch":"denetim","k":"Bilgi güvenliğinin bağımsız gözden geçirilmesi"}]},{"c":"PR.AA","n":"Kimlik Yönetimi ve Erişim Kontrolü","f":"PR","r":"Çalınan veya aşırı yetkili bir hesap saldırganlar için en kısa yoldur.","pool":[{"id":"UCT.02.004","t":"Kimlik yönetimi (Yaşam döngüsü yönetimi)","q":"Hesap verebilirliği sağlamak için her kimlik tek bir kişiyle ilişkilendirilmiş ve zorunlu haller dışında ortak kimlik kullanımından kaçınılmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Kimlik yönetimi (Yaşam döngüsü yönetimi)"},{"id":"UCT.02.005","t":"Kimlik yönetimi (Yaşam döngüsü yönetimi)","q":"İnsan olmayan öğelere (servis hesapları botlar vb) atanan kimlikler ayrılmış onaya ve bağımsız gözetime tabi tutulmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Kimlik yönetimi (Yaşam döngüsü yönetimi)"},{"id":"UCT.02.006","t":"Kimlik yönetimi (Yaşam döngüsü yönetimi)","q":"Artık gerekli olmayan (personel ayrılması vb) kimlikler zamanında devre dışı bırakılmış veya kaldırılmakta mıdır?","w":4,"m":2,"tag":3,"arch":"erisim","k":"Kimlik yönetimi (Yaşam döngüsü yönetimi)"},{"id":"UCT.02.007","t":"Kimlik yönetimi (Yaşam döngüsü yönetimi)","q":"Kullanıcı kimliklerinin ve kimlik doğrulama bilgilerinin yönetimi ile ilgili önemli olayların kayıtları tutulmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Kimlik yönetimi (Yaşam döngüsü yönetimi)"},{"id":"UCT.02.008","t":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)","q":"Kullanıcıların kimliğini doğrulamak için prosedürler oluşturulmuş ve uygulanmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)"},{"id":"UCT.02.009","t":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)","q":"Tedarikçiler tarafından sağlanan varsayılan kimlik doğrulama bilgileri sistem kurulumunun hemen ardından değiştirilmekte midir?","w":4,"m":1,"tag":3,"arch":"erisim","k":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)"},{"id":"UCT.02.010","t":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)","q":"Kimlik doğrulama bilgilerinin yönetimiyle ilgili kayıtlar tutulmuş ve bu kayıtların gizliliği sağlanmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)"},{"id":"UCT.02.011","t":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)","q":"Kullanıcıların kendi parolalarını seçmelerine izin verilmiş ve ilk girişte parola değiştirmeye zorlanmakta mıdır?","w":3,"m":1,"tag":3,"arch":"erisim","k":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)"},{"id":"UCT.02.012","t":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)","q":"Yaygın kullanılan parolaların ve ifşa olmuş kullanıcı adı-parola kombinasyonlarının kullanılması önlenmekte midir?","w":4,"m":1,"tag":3,"arch":"erisim","k":"Kimlik Doğrulama Yönetimi (Parola, MFA ve Politikalar)"},{"id":"UCT.02.013","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Erişim hakları sağlanırken iş gereklilikleri ve kuruluşun erişim politikası göz önünde bulundurulmakta mıdır?","w":3,"m":2,"tag":3,"arch":"denetim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.014","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Erişim haklarının onaylanması ve uygulanması süreçlerinde görevler ayrılığı ilkesi uygulanmakta mıdır?","w":2,"m":2,"tag":3,"arch":"erisim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.015","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Ayrılan personelin veya erişim gereksinimi kalmayan kullanıcıların erişim haklarının zamanında kaldırılması sağlanmakta mıdır?","w":4,"m":2,"tag":3,"arch":"denetim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.016","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Erişim haklarının ancak yetkilendirme prosedürleri başarıyla tamamlandıktan sonra etkinleştirilmesi sağlanmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.017","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Verilen erişim haklarının (kullanıcı kimliklerinin) merkezi bir kaydı tutulmakta mıdır?","w":2,"m":2,"tag":3,"arch":"denetim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.018","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Rol veya iş değiştiren kullanıcıların erişim hakları yeni görevlerine göre güncellenmekte midir?","w":3,"m":3,"tag":3,"arch":"denetim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.019","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"İş değişikliği terfi veya işten ayrılma gibi durumlardan sonra kullanıcıların erişim hakları gözden geçirilmekte midir?","w":3,"m":3,"tag":3,"arch":"ik","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.02.020","t":"Ayrıcalıklı erişim hakları","q":"Ayrıcalıklı erişim hakları için yetkiler özel olarak düzenlenmiş ve denetlenmekte midir?","w":4,"m":3,"tag":3,"arch":"erisim","k":"Ayrıcalıklı erişim hakları"},{"id":"UCT.02.021","t":"Uzaktan Çalışma","q":"Uzaktan çalışmaya ilişkin koşulları ve kısıtlamaları tanımlayan konuya özgü bir politika yayınlanmakta mıdır?","w":3,"m":2,"tag":7,"arch":"politika","k":"Uzaktan Çalışma"},{"id":"UCT.02.022","t":"Uzaktan Çalışma","q":"Uzaktan çalışma için beklenen fiziksel ortam güvenliği dikkate alınmakta mıdır?","w":2,"m":2,"tag":7,"arch":"fiziksel","k":"Uzaktan Çalışma"},{"id":"UCT.02.023","t":"Uzaktan Çalışma","q":"Uzaktan erişim için iletişim güvenliği gereklilikleri (VPN şifreleme vb) sağlanmakta mıdır?","w":4,"m":1,"tag":7,"arch":"ag","k":"Uzaktan Çalışma"},{"id":"UCT.02.024","t":"Uzaktan Çalışma","q":"Sanal masaüstü erişimi gibi uzaktan erişim yöntemlerinin kullanımı düzenlenmekte midir?","w":3,"m":1,"tag":7,"arch":"erisim","k":"Uzaktan Çalışma"},{"id":"UCT.02.025","t":"Uzaktan Çalışma","q":"Uzaktan çalışma cihazlarında güvenlik duvarı ve antivirüs gibi koruma önlemleri bulunmakta mıdır?","w":4,"m":1,"tag":7,"arch":"ag","k":"Uzaktan Çalışma"},{"id":"UCT.02.026","t":"Uzaktan Çalışma","q":"Uzaktan çalışma yönergeleri temiz ekran ilkesi aile üyelerinin erişim kısıtlaması ve cihaz güvenliğini kapsamakta mıdır?","w":3,"m":2,"tag":7,"arch":"erisim","k":"Uzaktan Çalışma"},{"id":"UCT.02.027","t":"Ayrıcalıklı erişim hakları","q":"Ayrıcalıklı erişim haklarının tahsisi yetkilendirme süreci ile kontrol edilmekte midir?","w":4,"m":2,"tag":3,"arch":"erisim","k":"Ayrıcalıklı erişim hakları"},{"id":"UCT.02.028","t":"Ayrıcalıklı erişim hakları","q":"Her sistem için ayrıcalıklı erişim ihtiyacı olan kullanıcılar belirlenmekte midir?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Ayrıcalıklı erişim hakları"},{"id":"UCT.02.029","t":"Ayrıcalıklı erişim hakları","q":"Ayrıcalıklı erişimler olay bazında ve politika gereği tahsis edilmekte midir?","w":2,"m":2,"tag":3,"arch":"erisim","k":"Ayrıcalıklı erişim hakları"},{"id":"UCT.02.030","t":"Ayrıcalıklı erişim hakları","q":"Ayrıcalıklı erişim haklarının sona ermesi için gereklilikler tanımlanmakta mıdır?","w":3,"m":2,"tag":3,"arch":"erisim","k":"Ayrıcalıklı erişim hakları"},{"id":"UCT.02.038","t":"Güvenli kimlik doğrulama (MFA kullanımı)","q":"Kritik sistemlere erişim için güvenli kimlik doğrulama (MFA vb) kullanılmakta mıdır?","w":4,"m":1,"tag":3,"arch":"erisim","k":"Güvenli kimlik doğrulama (MFA kullanımı)"},{"id":"UCT.02.039","t":"Güvenli kimlik doğrulama (MFA kullanımı)","q":"Başarılı ve başarısız oturum açma girişimleri kaydedilmekte midir?","w":3,"m":4,"tag":3,"arch":"erisim","k":"Güvenli kimlik doğrulama (MFA kullanımı)"},{"id":"UCT.02.040","t":"Güvenli kimlik doğrulama (MFA kullanımı)","q":"Sistemlere girişte yetkili kullanım uyarısı gösterilmekte midir?","w":1,"m":1,"tag":3,"arch":"erisim","k":"Güvenli kimlik doğrulama (MFA kullanımı)"},{"id":"UCT.02.042","t":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)","q":"Erişim hakları gözden geçirmelerinden elde edilen bulgulara (örn. tespit edilen fazla yetkilendirme oranı) dayanarak, son 12 ay içinde erişim yönetimi sürecinde somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":3,"arch":"erisim","k":"Erişim hakları (Sağlama, gözden geçirme, kaldırma)"},{"id":"UCT.08.001","t":"Fiziksel güvenlik sınırları","q":"Bilgi ve diğer ilişkili varlıkları içeren alanları korumak için fiziksel güvenlik sınırları tanımlanmış ve kullanılmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik sınırları"},{"id":"UCT.08.002","t":"Fiziksel güvenlik sınırları","q":"Bina veya alanın fiziksel olarak sağlam çevre sınırlarına sahip olması ve dış kapıların korunması sağlanmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik sınırları"},{"id":"UCT.08.003","t":"Fiziksel güvenlik sınırları","q":"Güvenlik sınırlarında yer alan duvarlarla bağlantılı tüm yangın çıkış kapıları alarm sistemine dahil edilmiş ve izlenmekte midir?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik sınırları"},{"id":"UCT.08.004","t":"Fiziksel giriş","q":"Teslimat ve yükleme alanları gibi erişim noktaları kontrol edilmiş ve bilgi işleme tesislerinden izole edilmekte midir?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel giriş"},{"id":"UCT.08.005","t":"Fiziksel giriş","q":"Güvenli alanlara tüm erişimler kayıt altına alınmış ve ziyaretçiler gözetim altında tutulmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel giriş"},{"id":"UCT.08.006","t":"Fiziksel giriş","q":"Hassas alanlara erişim için uygun kimlik doğrulama mekanizmaları (kart biyometri vb) kullanılmakta mıdır?","w":3,"m":1,"tag":1,"arch":"erisim","k":"Fiziksel giriş"},{"id":"UCT.08.007","t":"Fiziksel giriş","q":"Alana veya binaya fiziksel erişimi kontrol etmek için bir resepsiyon alanı oluşturulmakta mıdır?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel giriş"},{"id":"UCT.08.008","t":"Fiziksel giriş","q":"Acil durum çıkışları gibi diğer giriş noktalarının yetkisiz erişimden korunması sağlanmakta mıdır?","w":3,"m":1,"tag":1,"arch":"erisim","k":"Fiziksel giriş"},{"id":"UCT.08.009","t":"Ofislerin, odaların ve tesislerin güvenliğini sağlama","q":"Kritik tesislerin konumu yetkisiz erişimi önleyecek şekilde seçilmiş ve ofis güvenliği tasarlanmakta mıdır?","w":2,"m":2,"tag":1,"arch":"erisim","k":"Ofislerin, odaların ve tesislerin güvenliğini sağlama"},{"id":"UCT.08.010","t":"Ofislerin, odaların ve tesislerin güvenliğini sağlama","q":"Gizli bilgilerin veya faaliyetlerin dışarıdan görünür ve işitilebilir olması önlenmekte midir?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Ofislerin, odaların ve tesislerin güvenliğini sağlama"},{"id":"UCT.08.011","t":"Ofislerin, odaların ve tesislerin güvenliğini sağlama","q":"Gizli bilgi işleme tesislerinin yerlerini gösteren dizinler veya haritalar yetkisiz kişilere ifşa edilmemekte midir?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Ofislerin, odaların ve tesislerin güvenliğini sağlama"},{"id":"UCT.08.018","t":"Güvenli alanlarda çalışma","q":"Güvenli alanlarda çalışma kuralları belirlenmiş ve tüm personel için geçerli olmakta mıdır?","w":2,"m":2,"tag":1,"arch":"politika","k":"Güvenli alanlarda çalışma"},{"id":"UCT.08.019","t":"Güvenli alanlarda çalışma","q":"Personel yalnızca bilmesi gereken temelinde güvenli alanların varlığından haberdar edilmekte midir?","w":2,"m":2,"tag":1,"arch":"fiziksel","k":"Güvenli alanlarda çalışma"},{"id":"UCT.08.020","t":"Güvenli alanlarda çalışma","q":"Güvenli alanlarda yetkilendirilmedikçe kayıt cihazlarının (kamera ses kayıt vb) kullanımına izin verilmemekte midir?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Güvenli alanlarda çalışma"},{"id":"UCT.08.021","t":"Güvenli alanlarda çalışma","q":"Acil durum prosedürleri güvenli alanlarda kolayca görülebilir şekilde asılmakta mıdır?","w":2,"m":1,"tag":1,"arch":"politika","k":"Güvenli alanlarda çalışma"}]},{"c":"PR.AT","n":"Farkındalık ve Eğitim","f":"PR","r":"Teknik kontroller ne kadar güçlü olursa olsun, en zayıf halka çoğu zaman bilgilendirilmemiş bir kullanıcıdır.","pool":[{"id":"UCT.10.008","t":"Bilgi güvenliği farkındalığı, eğitim ve öğretim","q":"Kuruluş politikaları doğrultusunda bir bilgi güvenliği farkındalık eğitim ve öğretim programı oluşturulmakta mıdır?","w":4,"m":2,"tag":11,"arch":"egitim","k":"Bilgi güvenliği farkındalığı, eğitim ve öğretim"},{"id":"UCT.10.009","t":"Bilgi güvenliği farkındalığı, eğitim ve öğretim","q":"Bilgi güvenliği farkındalık eğitimleri periyodik olarak tekrarlanmakta mıdır?","w":3,"m":3,"tag":11,"arch":"egitim","k":"Bilgi güvenliği farkındalığı, eğitim ve öğretim"},{"id":"UCT.10.010","t":"Bilgi güvenliği farkındalığı, eğitim ve öğretim","q":"Teknik ekipler ve uzmanlık gerektiren roller için uygun bir eğitim planı uygulanmakta mıdır?","w":3,"m":3,"tag":11,"arch":"egitim","k":"Bilgi güvenliği farkındalığı, eğitim ve öğretim"},{"id":"UCT.10.021","t":"Bilgi güvenliği farkındalığı, eğitim ve öğretim","q":"Farkındalık eğitiminin etkinliği (örn. oltalama simülasyonu tıklama/bildirim oranı, sınav başarı oranı) bir metrikle ölçülüp izlenmekte midir?","w":2,"m":4,"tag":11,"arch":"egitim","k":"Bilgi güvenliği farkındalığı, eğitim ve öğretim"},{"id":"UCT.10.022","t":"Bilgi güvenliği farkındalığı, eğitim ve öğretim","q":"Farkındalık eğitimi etkinlik ölçümlerine dayanarak, son 12 ay içinde eğitim programının içeriğinde veya sıklığında somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":11,"arch":"egitim","k":"Bilgi güvenliği farkındalığı, eğitim ve öğretim"}]},{"c":"PR.DS","n":"Veri Güvenliği","f":"PR","r":"Bir sızıntının yasal ve itibari maliyeti verinin korunma biçimine bağlıdır.","pool":[{"id":"UCT.03.001","t":"İletişim Güvenliği","q":"Kuruluş bilgi aktarımı konusunda konuya özgü bir politika oluşturmuş ve iletmekte midir?","w":3,"m":2,"tag":7,"arch":"politika","k":"İletişim Güvenliği"},{"id":"UCT.03.002","t":"İletişim Güvenliği","q":"Aktarılan bilgileri koruma kuralları bilgilerin sınıflandırmasını yansıtmakta mıdır?","w":3,"m":2,"tag":7,"arch":"envanter","k":"İletişim Güvenliği"},{"id":"UCT.03.003","t":"İletişim Güvenliği","q":"Üçüncü şahıslara aktarımda bilgileri korumak için aktarım anlaşmaları yapılmakta mıdır?","w":3,"m":2,"tag":7,"arch":"ag","k":"İletişim Güvenliği"},{"id":"UCT.03.004","t":"İletişim Güvenliği","q":"Prosedürler ele geçirme kopyalama ve değiştirmeye karşı koruma kontrollerini içermekte midir?","w":3,"m":2,"tag":7,"arch":"politika","k":"İletişim Güvenliği"},{"id":"UCT.03.005","t":"Bilgilerin etiketlenmesi","q":"Hassas bilgiler için üzerinde anlaşmaya varılmış bir etiketleme sistemi kullanılmakta mıdır?","w":2,"m":2,"tag":9,"arch":"envanter","k":"Bilgilerin etiketlenmesi"},{"id":"UCT.03.006","t":"İletişim Güvenliği","q":"Bilgi aktarım araçlarının kabul edilebilir kullanımına ilişkin politika veya yönergeler hazırlanmakta mıdır?","w":2,"m":2,"tag":7,"arch":"politika","k":"İletişim Güvenliği"},{"id":"UCT.03.007","t":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)","q":"Mesajlar dahil tüm iş kayıtları için saklama ve imha yönergeleri mevcut olmakta mıdır?","w":2,"m":2,"tag":10,"arch":"imha","k":"Kayıtların Korunması (Yasal ve Operasyonel Kayıtlar)"},{"id":"UCT.03.008","t":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler","q":"Bilgi aktarımıyla ilgili yasal düzenleyici ve sözleşmesel gereklilikler (e-imza vb) dikkate alınmakta mıdır?","w":2,"m":2,"tag":10,"arch":"ag","k":"Yasal, meşru, düzenleyici ve sözleşmeye tabi gereklilikler"},{"id":"UCT.03.009","t":"Zararlı Yazılımlardan Korunma","q":"Elektronik iletişim yoluyla iletilebilen kötü amaçlı yazılımların tespiti ve koruması sağlanmakta mıdır?","w":4,"m":1,"tag":7,"arch":"malware","k":"Zararlı Yazılımlardan Korunma"},{"id":"UCT.03.010","t":"İletişim Güvenliği","q":"Harici kamu hizmetlerini (IM bulut depolama vb) kullanmadan önce onay alınmakta mıdır?","w":3,"m":2,"tag":7,"arch":"ag","k":"İletişim Güvenliği"},{"id":"UCT.03.011","t":"E-Posta Alışverişlerinin Şifreli ve İmzalı Yapılması","q":"Elektronik iletişim kısıtlamaları (örn otomatik e-posta yönlendirme engeli) kullanılmakta mıdır?","w":3,"m":1,"tag":7,"arch":"kripto","k":"E-Posta Alışverişlerinin Şifreli ve İmzalı Yapılması"},{"id":"UCT.03.012","t":"İletişim Güvenliği","q":"Personele halka açık yerlerde kritik bilgiler içeren SMS veya anlık mesaj göndermemeleri tavsiye edilmekte midir?","w":2,"m":2,"tag":7,"arch":"ag","k":"İletişim Güvenliği"},{"id":"UCT.03.013","t":"Fiziksel Bilgi Transferi Güvenliği","q":"Yönetim tarafından kabul edilen yetkili güvenilir kuryelerin listesi mevcut olmakta mıdır?","w":2,"m":2,"tag":7,"arch":"fiziksel","k":"Fiziksel Bilgi Transferi Güvenliği"},{"id":"UCT.03.014","t":"Fiziksel Bilgi Transferi Güvenliği","q":"Kurye tanımlama standartları mevcut olmakta mıdır?","w":2,"m":1,"tag":7,"arch":"fiziksel","k":"Fiziksel Bilgi Transferi Güvenliği"},{"id":"UCT.03.015","t":"Fiziksel Bilgi Transferi Güvenliği","q":"Kuryelerin kimliğini doğrulamak için prosedürler mevcut olmakta mıdır?","w":2,"m":2,"tag":7,"arch":"fiziksel","k":"Fiziksel Bilgi Transferi Güvenliği"},{"id":"UCT.04.020","t":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme","q":"Artık gerekli olmayan bilgilerin silinmesi durumunda silme sonuçları kanıt olarak kaydedilmekte midir?","w":2,"m":2,"tag":6,"arch":"imha","k":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme"},{"id":"UCT.04.021","t":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme","q":"Ekipman iade edilirken hassas bilgi içeren depolama parçaları sökülmüş veya temizlenmekte midir?","w":3,"m":1,"tag":6,"arch":"imha","k":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme"},{"id":"UCT.04.022","t":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme","q":"Depolama ortamının türüne uygun imha mekanizmaları kullanılmakta mıdır?","w":3,"m":1,"tag":6,"arch":"imha","k":"Yedekleme, Silme, Yok Etme ve Anonim Hale Getirme"},{"id":"UCT.04.025","t":"Veri Sızıntısı Önleme","q":"Veri sızıntısını önlemek (DLP) için bilgiler tanımlanmış ve sınıflandırılmakta mıdır?","w":3,"m":2,"tag":5,"arch":"envanter","k":"Veri Sızıntısı Önleme"},{"id":"UCT.04.026","t":"Veri Sızıntısı Önleme","q":"Veri sızıntısı kanalları (ağ USB e-posta vb) izlenmekte midir?","w":3,"m":4,"tag":5,"arch":"kripto","k":"Veri Sızıntısı Önleme"},{"id":"UCT.04.027","t":"Veri Sızıntısı Önleme","q":"Yetkisiz ifşa riski taşıyan hassas bilgiler sürekli izlenmekte midir?","w":3,"m":4,"tag":5,"arch":"erisim","k":"Veri Sızıntısı Önleme"},{"id":"UCT.04.028","t":"Kriptografi (şifreleme) kullanımı","q":"Kriptografi kullanımına ilişkin politika oluşturulmuş ve anahtar yönetimi süreçleri belirlenmekte midir?","w":3,"m":2,"tag":5,"arch":"kripto","k":"Kriptografi (şifreleme) kullanımı"},{"id":"UCT.04.029","t":"Kriptografi (şifreleme) kullanımı","q":"Uygun anahtar yönetimi için oluşturma saklama dağıtım ve imha süreçleri güvenli olmakta mıdır?","w":3,"m":2,"tag":5,"arch":"kripto","k":"Kriptografi (şifreleme) kullanımı"},{"id":"UCT.04.030","t":"Kriptografi (şifreleme) kullanımı","q":"Anahtar yönetim sistemi standartlara ve güvenli prosedürlere (yedekleme iptal etme vb) dayanmakta mıdır?","w":3,"m":2,"tag":5,"arch":"kripto","k":"Kriptografi (şifreleme) kullanımı"},{"id":"UCT.04.031","t":"Kriptografi (şifreleme) kullanımı","q":"Tüm kriptografik anahtarlar fiziksel ve mantıksal olarak korunmakta mıdır?","w":4,"m":1,"tag":5,"arch":"kripto","k":"Kriptografi (şifreleme) kullanımı"},{"id":"UCT.04.032","t":"Veri Sızıntısı Önleme","q":"Veri sızıntısı önleme (DLP) ve şifreleme olay/alarm analizlerine dayanarak, son 12 ay içinde veri güvenliği kontrollerinde somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":5,"arch":"log","k":"Veri Sızıntısı Önleme"},{"id":"UCT.06.027","t":"Bilgi yedekleme","q":"Veri saklama gerekliliklerini ele alan konuya özgü bir yedekleme politikası oluşturulmakta mıdır?","w":4,"m":2,"tag":6,"arch":"yedek","k":"Bilgi yedekleme"},{"id":"UCT.06.028","t":"Bilgi yedekleme","q":"Yedekleme kopyaları ve restorasyon prosedürleri düzenli olarak test edilmiş ve kayıt altına alınmakta mıdır?","w":4,"m":4,"tag":6,"arch":"yedek","k":"Bilgi yedekleme"},{"id":"UCT.06.029","t":"Bilgi yedekleme","q":"Yedekler ana tesisteki felaketlerden etkilenmeyecek güvenli bir uzaklıkta depolanmakta mıdır?","w":4,"m":1,"tag":6,"arch":"fiziksel","k":"Bilgi yedekleme"},{"id":"UCT.06.030","t":"Bilgi yedekleme","q":"Yedeklemeler risklere göre şifreleme ile korunmakta mıdır?","w":3,"m":1,"tag":6,"arch":"yedek","k":"Bilgi yedekleme"}]},{"c":"PR.PS","n":"Platform Güvenliği","f":"PR","r":"Yamanmamış bir sistem, bilinen açıkların otomatik taranıp istismar edildiği bir hedef hâline gelir.","pool":[{"id":"UCT.01.014","t":"Dokümante edilmiş işletim prosedürleri","q":"Bilgi işleme faaliyetleri için (yedekleme kurulum vb) işletim prosedürleri dokümante edilmekte midir?","w":2,"m":2,"tag":10,"arch":"politika","k":"Dokümante edilmiş işletim prosedürleri"},{"id":"UCT.01.015","t":"Dokümante edilmiş işletim prosedürleri","q":"İşletim prosedürleri sorumlu kişileri yapılandırma adımlarını ve hata yönetimi talimatlarını içermekte midir?","w":2,"m":2,"tag":10,"arch":"politika","k":"Dokümante edilmiş işletim prosedürleri"},{"id":"UCT.01.016","t":"Dokümante edilmiş işletim prosedürleri","q":"Dokümante edilmiş işletim prosedürlerindeki değişiklikler kontrollü bir şekilde yapılmakta mıdır?","w":2,"m":2,"tag":10,"arch":"politika","k":"Dokümante edilmiş işletim prosedürleri"},{"id":"UCT.01.025","t":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)","q":"Donanım yazılım ve ağlar için güvenli yapılandırmaların uygulanması amacıyla süreçler tanımlanmakta mıdır?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)"},{"id":"UCT.01.026","t":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)","q":"Tüm yapılandırma değişikliklerinin kontrolünü sağlamak amacıyla prosedürler mevcut olmakta mıdır?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)"},{"id":"UCT.01.027","t":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)","q":"Ayrıcalıklı erişim haklarına sahip kimliklerin sayısı en aza indirilmekte midir?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)"},{"id":"UCT.01.028","t":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)","q":"Gereksiz kullanılmayan veya güvensiz kimlikler devre dışı bırakılmakta mıdır?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"Konfigürasyon Yönetimi ve Güvenli Yapılandırma (ISO 27001 A.8.9)"},{"id":"UCT.01.029","t":"İşletim sistemlerine yazılım kurulumu","q":"İşletim sistemlerine yazılım kurulumu ve güncellemeler sadece yetkili yöneticiler tarafından yapılmakta mıdır?","w":3,"m":1,"tag":7,"arch":"yapilandirma","k":"İşletim sistemlerine yazılım kurulumu"},{"id":"UCT.01.030","t":"İşletim sistemlerine yazılım kurulumu","q":"Yazılım kurulumlarında geri alma stratejisi tanımlanmış ve eski sürümler arşivlenmekte midir?","w":2,"m":2,"tag":7,"arch":"yapilandirma","k":"İşletim sistemlerine yazılım kurulumu"},{"id":"UCT.01.031","t":"İşletim sistemlerine yazılım kurulumu","q":"Sürüm yükseltme kararları güvenlik riskleri ve iş gereklilikleri dikkate alınarak verilmekte midir?","w":2,"m":2,"tag":7,"arch":"yapilandirma","k":"İşletim sistemlerine yazılım kurulumu"},{"id":"UCT.01.032","t":"İşletim sistemlerine yazılım kurulumu","q":"Kuruluş kullanıcıların hangi yazılımları yükleyebileceği konusunda katı kurallar uygulamakta mıdır?","w":3,"m":2,"tag":7,"arch":"yapilandirma","k":"İşletim sistemlerine yazılım kurulumu"},{"id":"UCT.01.033","t":"İşletim sistemlerine yazılım kurulumu","q":"Yazılım kurulumlarında en az ayrıcalık ilkesi uygulanmakta mıdır?","w":3,"m":1,"tag":7,"arch":"yapilandirma","k":"İşletim sistemlerine yazılım kurulumu"},{"id":"UCT.03.016","t":"Saat senkronizasyonu","q":"Zaman senkronizasyonu için harici ve dahili gereklilikler dokümante edilmekte midir?","w":2,"m":2,"tag":6,"arch":"log","k":"Saat senkronizasyonu"},{"id":"UCT.03.017","t":"Saat senkronizasyonu","q":"Tüm sistemler (kamera giriş çıkış vb) için standart bir referans zamanı tanımlanmakta mıdır?","w":2,"m":2,"tag":6,"arch":"log","k":"Saat senkronizasyonu"},{"id":"UCT.03.018","t":"Saat senkronizasyonu","q":"Doğru zaman damgaları için güvenilir bir referans saat (NTP GPS vb) kullanılmakta mıdır?","w":2,"m":1,"tag":6,"arch":"log","k":"Saat senkronizasyonu"},{"id":"UCT.03.019","t":"Saat senkronizasyonu","q":"Ağa bağlı tüm sistemleri senkronize tutmak için NTP veya PTP protokolleri kullanılmakta mıdır?","w":2,"m":1,"tag":6,"arch":"log","k":"Saat senkronizasyonu"},{"id":"UCT.05.004","t":"Zararlı Yazılımlardan Korunma","q":"Yetkisiz yazılımların kullanımını engelleyen veya tespit eden kontroller uygulanmakta mıdır?","w":3,"m":1,"tag":7,"arch":"malware","k":"Zararlı Yazılımlardan Korunma"},{"id":"UCT.05.005","t":"Zararlı Yazılımlardan Korunma","q":"Bilinen veya şüphelenilen kötü amaçlı web sitelerinin kullanımını önleyen kontroller uygulanmakta mıdır?","w":3,"m":1,"tag":7,"arch":"malware","k":"Zararlı Yazılımlardan Korunma"},{"id":"UCT.05.006","t":"Zararlı Yazılımlardan Korunma","q":"Kötü amaçlı yazılım tarafından yararlanılabilecek güvenlik açıkları azaltılmakta mıdır?","w":4,"m":2,"tag":7,"arch":"malware","k":"Zararlı Yazılımlardan Korunma"},{"id":"UCT.05.007","t":"Zararlı Yazılımlardan Korunma","q":"Harici ağlardan dosya ve yazılım alınmasıyla ilgili risklere karşı koruyucu önlemler alınmakta mıdır?","w":3,"m":1,"tag":7,"arch":"malware","k":"Zararlı Yazılımlardan Korunma"},{"id":"UCT.07.001","t":"Güvenli geliştirme yaşam döngüsü","q":"Yazılım geliştirme yaşam döngüsünde (SDLC) güvenli kodlama test ve ayırma kuralları uygulanmakta mıdır?","w":3,"m":2,"tag":2,"arch":"gelistirme","k":"Güvenli geliştirme yaşam döngüsü"},{"id":"UCT.08.037","t":"Ekipman bakımı","q":"Ekipman bakımı tedarikçi önerilerine göre yapılmış ve bir program dahilinde izlenmekte midir?","w":2,"m":2,"tag":1,"arch":"tedarikci","k":"Ekipman bakımı"},{"id":"UCT.08.038","t":"Ekipman bakımı","q":"Bakım personeli yetkili olmuş ve gizlilik sözleşmelerine tabi tutulmakta mıdır?","w":2,"m":2,"tag":1,"arch":"erisim","k":"Ekipman bakımı"},{"id":"UCT.08.039","t":"Ekipman bakımı","q":"Arızalar ve bakım kayıtları tutulmakta mıdır?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Ekipman bakımı"},{"id":"UCT.08.040","t":"Ekipman bakımı","q":"Bakım sonrası ekipmanlar kurcalanmaya karşı incelenmekte midir?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Ekipman bakımı"},{"id":"UCT.08.041","t":"Ekipman bakımı","q":"Elden çıkarılacak ekipmanların güvenli yok edilmesi veya temizlenmesi sağlanmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Ekipman bakımı"}]},{"c":"PR.IR","n":"Teknoloji Altyapısı Dayanıklılığı","f":"PR","r":"Bir felaket anında iş sürekliliği, önceden test edilmiş yedekleme ve kurtarma kapasitesine bağlıdır.","pool":[{"id":"UCT.03.025","t":"Ağların ayrımı","q":"Kuruluş büyük ağları güvenlik düzeylerine ve iş birimlerine göre (VLAN vb) ayırmakta mıdır?","w":3,"m":1,"tag":7,"arch":"ag","k":"Ağların ayrımı"},{"id":"UCT.03.026","t":"Ağların ayrımı","q":"Her ağ alanının sınırları iyi bir şekilde tanımlanmakta mıdır?","w":2,"m":2,"tag":7,"arch":"ag","k":"Ağların ayrımı"},{"id":"UCT.03.027","t":"Ağların ayrımı","q":"Ağ etki alanları arasındaki geçişler güvenlik duvarları veya ağ geçitleri ile kontrol edilmekte midir?","w":4,"m":1,"tag":7,"arch":"ag","k":"Ağların ayrımı"},{"id":"UCT.03.031","t":"Ağ güvenliği","q":"Ağ güvenliği kontrolleri (segmentasyon, güvenlik duvarı kuralları) kurum genelindeki tüm ağ bölgelerinde tutarlı bir standarda göre uygulanıp periyodik olarak denetlenmekte midir?","w":2,"m":3,"tag":7,"arch":"ag","k":"Ağ güvenliği"},{"id":"UCT.03.033","t":"Ağ güvenliği","q":"Ağ güvenliği metriklerinden elde edilen bulgulara dayanarak, son 12 ay içinde ağ mimarisinde veya güvenlik duvarı kurallarında somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":7,"arch":"ag","k":"Ağ güvenliği"},{"id":"UCT.06.031","t":"Bilgi işleme tesislerinin yedek fazlalığı","q":"Kullanılabilirlik gerekliliklerini karşılamak için kritik tesislerde yedekli yapılar (ISS güç vb) sağlanmakta mıdır?","w":3,"m":1,"tag":6,"arch":"fiziksel","k":"Bilgi işleme tesislerinin yedek fazlalığı"},{"id":"UCT.06.032","t":"Bilgi işleme tesislerinin yedek fazlalığı","q":"Yedekli ağlar kullanılmış ve test edilmekte midir?","w":2,"m":4,"tag":6,"arch":"fiziksel","k":"Bilgi işleme tesislerinin yedek fazlalığı"},{"id":"UCT.08.015","t":"Fiziksel ve çevresel tehditlere karşı koruma","q":"Doğal afetler ve diğer fiziksel tehditler için risk değerlendirmeleri yapılmış ve koruma tasarlanmakta mıdır?","w":3,"m":2,"tag":1,"arch":"fiziksel","k":"Fiziksel ve çevresel tehditlere karşı koruma"},{"id":"UCT.08.016","t":"Fiziksel ve çevresel tehditlere karşı koruma","q":"Fiziksel tesislerin konumu yerel topografya ve kentsel tehditler dikkate alınarak seçilmekte midir?","w":2,"m":2,"tag":1,"arch":"fiziksel","k":"Fiziksel ve çevresel tehditlere karşı koruma"},{"id":"UCT.08.017","t":"Fiziksel ve çevresel tehditlere karşı koruma","q":"Yangın su baskını elektrik dalgalanmaları ve diğer tehditler için gerekli önlemler alınmakta mıdır?","w":4,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel ve çevresel tehditlere karşı koruma"},{"id":"UCT.08.029","t":"Destekleyici altyapı hizmetleri (Enerji, acil durum)","q":"Altyapı destek ekipmanlarının bakımı üretici spesifikasyonlarına göre yapılmakta mıdır?","w":2,"m":2,"tag":1,"arch":"fiziksel","k":"Destekleyici altyapı hizmetleri (Enerji, acil durum)"},{"id":"UCT.08.030","t":"Destekleyici altyapı hizmetleri (Enerji, acil durum)","q":"Destek ekipmanları internete sadece güvenli şekilde ve ihtiyaç halinde bağlanmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Destekleyici altyapı hizmetleri (Enerji, acil durum)"},{"id":"UCT.08.031","t":"Destekleyici altyapı hizmetleri (Enerji, acil durum)","q":"Acil durum aydınlatması ve haberleşme sistemleri sağlanmakta mıdır?","w":3,"m":1,"tag":1,"arch":"kvkk","k":"Destekleyici altyapı hizmetleri (Enerji, acil durum)"},{"id":"UCT.08.032","t":"Destekleyici altyapı hizmetleri (Enerji, acil durum)","q":"Acil durum anahtarları ve vanaları erişilebilir yerlere konumlandırılmakta mıdır?","w":2,"m":1,"tag":1,"arch":"fiziksel","k":"Destekleyici altyapı hizmetleri (Enerji, acil durum)"},{"id":"UCT.08.033","t":"Destekleyici altyapı hizmetleri (Enerji, acil durum)","q":"Acil durum iletişim bilgileri kaydedilmiş ve erişilebilir olmakta mıdır?","w":3,"m":2,"tag":1,"arch":"fiziksel","k":"Destekleyici altyapı hizmetleri (Enerji, acil durum)"}]},{"c":"DE.CM","n":"Sürekli İzleme","f":"DE","r":"Fark edilmeyen bir saldırı aylarca sistemde kalıp zararını katlayarak büyütebilir.","pool":[{"id":"UCT.01.050","t":"Zafiyet Tarama Araçlarının Kullanımı","q":"Donanım yazılım ve çalışma zamanı ortamları izlenmekte midir?","w":3,"m":1,"tag":7,"arch":"zafiyet","k":"Zafiyet Tarama Araçlarının Kullanımı"},{"id":"UCT.06.036","t":"İzleme faaliyetleri (Anomali tespiti)","q":"İzleme kapsamı iş ve bilgi güvenliği gerekliliklerine uygun olarak belirlenmekte midir?","w":3,"m":2,"tag":6,"arch":"olay","k":"İzleme faaliyetleri (Anomali tespiti)"},{"id":"UCT.06.037","t":"İzleme faaliyetleri (Anomali tespiti)","q":"İzleme kayıtları tanımlanmış saklama süreleri boyunca tutulmakta mıdır?","w":3,"m":2,"tag":6,"arch":"olay","k":"İzleme faaliyetleri (Anomali tespiti)"},{"id":"UCT.06.039","t":"İzleme faaliyetleri (Anomali tespiti)","q":"Ağ ve sistemlerdeki anormal davranışları tespit etmek için bir izleme aracı (SIEM, IDS vb.) kurulu ve çalışır durumda mıdır?","w":3,"m":1,"tag":6,"arch":"log","k":"İzleme faaliyetleri (Anomali tespiti)"},{"id":"UCT.08.012","t":"Fiziksel güvenlik izleme","q":"Fiziksel tesisler güvenlik görevlileri alarmlar ve video izleme sistemleri ile sürekli izlenmekte midir?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik izleme"},{"id":"UCT.08.013","t":"Fiziksel güvenlik izleme","q":"Hassas alanları görüntülemek ve erişimi kaydetmek için CCTV sistemleri kurulmakta mıdır?","w":3,"m":1,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik izleme"},{"id":"UCT.08.014","t":"Fiziksel güvenlik izleme","q":"İzleme sistemleri ve kayıtları yetkisiz erişime karşı korunmakta mıdır?","w":2,"m":4,"tag":1,"arch":"erisim","k":"Fiziksel güvenlik izleme"},{"id":"UCT.08.042","t":"Fiziksel güvenlik izleme","q":"Fiziksel güvenlik izleme uygulamaları (CCTV kapsamı, erişim logu tutulması, güvenlik devriyeleri) tüm yerleşkelerde tutarlı bir standarda göre yürütülüp periyodik olarak denetlenmekte midir?","w":2,"m":3,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik izleme"},{"id":"UCT.08.043","t":"Fiziksel güvenlik izleme","q":"Fiziksel güvenlik olaylarından (yetkisiz giriş denemesi, alarm tetiklenmesi) elde edilen bulgulara dayanarak, son 12 ay içinde fiziksel güvenlik önlemlerinde somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":1,"arch":"fiziksel","k":"Fiziksel güvenlik izleme"},{"id":"UCT.09.009","t":"Görevlerin ayrılığı","q":"Çakışan görevler ve çatışan sorumluluk alanları (değişiklik başlatma onaylama vb) birbirinden ayrılmakta mıdır?","w":3,"m":1,"tag":10,"arch":"politika","k":"Görevlerin ayrılığı"},{"id":"UCT.09.010","t":"Görevlerin ayrılığı","q":"Görevler ayrılığının zor olduğu durumlarda faaliyetlerin izlenmesi ve yönetim denetimi gibi telafi edici kontroller uygulanmakta mıdır?","w":3,"m":2,"tag":10,"arch":"erisim","k":"Görevlerin ayrılığı"},{"id":"UCT.11.044","t":"Tedarikçi Hizmetlerinin İzlenmesi","q":"Dış hizmet sağlayıcı aktiviteleri ve servisleri izlenmekte midir?","w":2,"m":1,"tag":8,"arch":"tedarikci","k":"Tedarikçi Hizmetlerinin İzlenmesi"}]},{"c":"DE.AE","n":"Olumsuz Olay Analizi","f":"DE","r":"Ham alarmların anlamlı bir olaya dönüşmesi doğru analiz ve önceliklendirmeden geçer.","pool":[{"id":"UCT.05.001","t":"Siber Tehdit İstihbaratı (CTI)","q":"Bilgi güvenliği tehditlerine ilişkin bilgiler toplanmış ve analiz edilmekte midir?","w":2,"m":2,"tag":7,"arch":"zafiyet","k":"Siber Tehdit İstihbaratı (CTI)"},{"id":"UCT.05.002","t":"Siber Tehdit İstihbaratı (CTI)","q":"Tehdit istihbaratı ilgili anlayışlı bağlamsal ve eyleme geçirilebilir nitelikte olmakta mıdır?","w":2,"m":3,"tag":7,"arch":"risk","k":"Siber Tehdit İstihbaratı (CTI)"},{"id":"UCT.05.003","t":"Siber Tehdit İstihbaratı (CTI)","q":"Tehdit istihbaratı üretimi için hedefler belirlenmiş kaynaklar seçilmiş ve analiz edilmekte midir?","w":2,"m":2,"tag":7,"arch":"risk","k":"Siber Tehdit İstihbaratı (CTI)"},{"id":"UCT.05.015","t":"Siber Tehdit İstihbaratı (CTI)","q":"Tehdit istihbaratı analizlerine dayanarak, son 12 ay içinde güvenlik kontrollerinde (imza/kural güncellemesi, yeni izleme senaryosu) somut bir iyileştirme yapılmakta mıdır?","w":1,"m":5,"tag":7,"arch":"risk","k":"Siber Tehdit İstihbaratı (CTI)"},{"id":"UCT.06.024","t":"Bilgi güvenliği olayı raporlanması","q":"Personel şüphelenilen bilgi güvenliği olaylarını raporlama sorumluluğu hakkında bilgilendirilmekte midir?","w":3,"m":2,"tag":11,"arch":"olay","k":"Bilgi güvenliği olayı raporlanması"},{"id":"UCT.06.025","t":"Bilgi güvenliği olayı raporlanması","q":"Raporlanması gereken olay türleri (erişim ihlalleri zararlı yazılım vb) tanımlanmakta mıdır?","w":2,"m":2,"tag":11,"arch":"malware","k":"Bilgi güvenliği olayı raporlanması"},{"id":"UCT.06.026","t":"Bilgi güvenliği olayı raporlanması","q":"Personele güvenlik açıklarını kendi başlarına kanıtlamaya çalışmamaları (sadece raporlamaları) tavsiye edilmekte midir?","w":2,"m":2,"tag":11,"arch":"olay","k":"Bilgi güvenliği olayı raporlanması"},{"id":"UCT.06.033","t":"Kayıt Yönetimi ve Log Tutma","q":"Kayıtların (logların) oluşturulma amaçları ve hangi verilerin toplanacağı belirlenmekte midir?","w":3,"m":2,"tag":6,"arch":"log","k":"Kayıt Yönetimi ve Log Tutma"},{"id":"UCT.06.034","t":"Kayıt Yönetimi ve Log Tutma","q":"Loglar hataları istisnaları ve güvenlik olaylarını içerecek şekilde üretilmiş ve analiz edilmekte midir?","w":3,"m":4,"tag":6,"arch":"log","k":"Kayıt Yönetimi ve Log Tutma"},{"id":"UCT.06.035","t":"Kayıt Yönetimi ve Log Tutma","q":"Loglama konusunda konuya özgü bir politika oluşturulmakta mıdır?","w":2,"m":2,"tag":6,"arch":"log","k":"Kayıt Yönetimi ve Log Tutma"},{"id":"UCT.06.038","t":"İzleme faaliyetleri (Anomali tespiti)","q":"Anomali tespiti için sürekli izleme araçları kullanılmakta mıdır?","w":3,"m":4,"tag":6,"arch":"log","k":"İzleme faaliyetleri (Anomali tespiti)"},{"id":"UCT.06.044","t":"Anomali Tespiti için Referans (Baseline) Yönetimi","q":"Kullanıcılar ve sistemler için ağ operasyonları ve beklenen veri akışlarına ait temel çizgiler (baseline) oluşturulmuş ve yönetilmekte midir?","w":3,"m":1,"tag":6,"arch":"olay","k":"Anomali Tespiti için Referans (Baseline) Yönetimi"}]},{"c":"RS.MA","n":"Olay Yönetimi","f":"RS","r":"Bir olay anında kime, hangi sırayla ne yapılacağının belli olmaması küçük bir sorunu krize dönüştürür.","pool":[{"id":"UCT.06.007","t":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme","q":"İhlal olaylarının sonuçlarını ve önceliğini tanımlamak için bir kategorizasyon ve önceliklendirme şeması bulunmakta mıdır?","w":2,"m":3,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme"},{"id":"UCT.06.008","t":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme","q":"Şema olayları bilgi güvenliği ihlal olayları olarak kategorize etmek için kriterler içermekte midir?","w":2,"m":3,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme"},{"id":"UCT.06.009","t":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme","q":"Bilgi güvenliği ihlal olaylarını koordine eden personel değerlendirmeyi gerçekleştirmiş ve olaylara ilişkin kararlar vermekte midir?","w":3,"m":3,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olaylarını değerlendirme ve karar verme"}]},{"c":"RS.AN","n":"Olay Analizi","f":"RS","r":"Kök nedeni bulunmayan bir olay kısa süre sonra farklı bir yoldan tekrar yaşanır.","pool":[{"id":"UCT.06.006","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"İhlal olayı yönetim planı olayların değerlendirilmesi izlenmesi analizi müdahalesi ve raporlanması senaryolarını içermekte midir?","w":3,"m":2,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.06.015","t":"Kanıt toplama","q":"Disiplin ve yasal işlemler amacıyla olaylarla ilgili kanıtlarla ilgilenmek için prosedürler geliştirilmekte midir?","w":3,"m":2,"tag":6,"arch":"ik","k":"Kanıt toplama"},{"id":"UCT.06.016","t":"Kanıt toplama","q":"Kanıt yönetimi prosedürleri depolama ortamına uygun olarak tanımlama toplama ve koruma talimatlarını sağlamakta mıdır?","w":2,"m":2,"tag":6,"arch":"politika","k":"Kanıt toplama"},{"id":"UCT.06.017","t":"Kanıt toplama","q":"Deliller ulusal mahkemelerde kabul edilebilir şekilde toplanmakta mıdır?","w":2,"m":1,"tag":6,"arch":"olay","k":"Kanıt toplama"}]},{"c":"RS.CO","n":"Olay Müdahale Raporlama ve İletişimi","f":"RS","r":"Yasal bildirim süresini kaçırmak, olayın kendisi kadar ciddi bir uyum riski yaratabilir.","pool":[{"id":"UCT.06.002","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"İhlal olayı yönetimi prosedürlerini yürütmek için roller ve sorumluluklar belirlenmiş ve iletilmekte midir?","w":2,"m":2,"tag":6,"arch":"politika","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.06.004","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"Olayları değerlendirme müdahale etme ve ders alma yeteneği sağlayan bir olay müdahale süreci oluşturulmakta mıdır?","w":3,"m":2,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.09.014","t":"Yetkililerle iletişim","q":"Kuruluş ilgili makamlarla iletişim kurmuş ve ihlal durumlarında raporlama yöntemlerini belirlemekte midir?","w":3,"m":2,"tag":8,"arch":"erisim","k":"Yetkililerle iletişim"}]},{"c":"RS.MI","n":"Olay Azaltma","f":"RS","r":"Bir tehdidi hızla izole edebilme kapasitesi etkiyi dakikalar içinde sınırlayabilir.","pool":[{"id":"UCT.06.010","t":"Bilgi güvenliği ihlal olaylarına yanıt verme","q":"Kuruluş bilgi güvenliği ihlal olaylarına müdahale ilişkin prosedürler oluşturmuş ve iletmekte midir?","w":3,"m":4,"tag":6,"arch":"politika","k":"Bilgi güvenliği ihlal olaylarına yanıt verme"},{"id":"UCT.06.011","t":"Bilgi güvenliği ihlal olaylarına yanıt verme","q":"Bilgi güvenliği ihlal olaylarına gerekli yetkinliğe sahip atanmış bir ekip müdahale etmekte midir?","w":2,"m":2,"tag":6,"arch":"erisim","k":"Bilgi güvenliği ihlal olaylarına yanıt verme"},{"id":"UCT.06.012","t":"Bilgi güvenliği ihlal olaylarına yanıt verme","q":"Olaylara yanıt verme faaliyetleri kanıt toplama kriz yönetimi iletişim analiz ve kök neden belirlemeyi içermekte midir?","w":3,"m":2,"tag":6,"arch":"sureklilik","k":"Bilgi güvenliği ihlal olaylarına yanıt verme"}]},{"c":"RC.RP","n":"Kurtarma Planının Uygulanması","f":"RC","r":"Test edilmemiş bir kurtarma planı gerçek bir kriz anında beklenenden çok daha yavaş çalışır.","pool":[{"id":"UCT.06.013","t":"Bilgi güvenliği ihlal olaylarından ders çıkarma","q":"Kuruluş olayların türlerini hacimlerini ve maliyetlerini ölçmek için prosedürler oluşturmakta mıdır?","w":1,"m":4,"tag":6,"arch":"politika","k":"Bilgi güvenliği ihlal olaylarından ders çıkarma"},{"id":"UCT.06.014","t":"Bilgi güvenliği ihlal olaylarından ders çıkarma","q":"Olaylardan elde edilen bilgiler yönetim planını geliştirmek ve risk değerlendirmesini güncellemek için kullanılmakta mıdır?","w":2,"m":5,"tag":6,"arch":"risk","k":"Bilgi güvenliği ihlal olaylarından ders çıkarma"},{"id":"UCT.06.018","t":"Kesinti sırasında bilgi güvenliği","q":"Kesinti sırasında bilgi güvenliği kontrollerini uyarlamak için gereklilikler belirlenmekte midir?","w":3,"m":2,"tag":6,"arch":"olay","k":"Kesinti sırasında bilgi güvenliği"},{"id":"UCT.06.019","t":"Kesinti sırasında bilgi güvenliği","q":"Bilgi güvenliği gereklilikleri iş sürekliliği yönetimi süreçlerine dahil edilmekte midir?","w":3,"m":2,"tag":6,"arch":"sureklilik","k":"Kesinti sırasında bilgi güvenliği"},{"id":"UCT.06.020","t":"Kesinti sırasında bilgi güvenliği","q":"Kritik iş süreçlerindeki bilgilerin güvenliğini sürdürmek veya eski haline getirmek için planlar geliştirilmiş ve test edilmekte midir?","w":4,"m":2,"tag":6,"arch":"olay","k":"Kesinti sırasında bilgi güvenliği"},{"id":"UCT.06.022","t":"İş sürekliliği için BİT hazırlığı","q":"Etkinin büyüklüğü ve süresi öncelikli faaliyetleri ve kurtarma süresi hedeflerini belirlemek için kullanılmakta mıdır?","w":4,"m":3,"tag":6,"arch":"sureklilik","k":"İş sürekliliği için BİT hazırlığı"}]},{"c":"RC.CO","n":"Kurtarma İletişimi","f":"RC","r":"Kurtarma teknik olarak başarılı olsa da iletişimsizlik güveni ve itibarı zedeleyebilir.","pool":[{"id":"UCT.06.001","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"Uygun bilgi güvenliği ihlal olayı yönetimi süreçleri oluşturulmakta mıdır?","w":3,"m":2,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.06.003","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"Bilgi güvenliği ihlal olaylarını raporlamak için ortak bir yöntem ve temas noktası oluşturulmakta mıdır?","w":3,"m":2,"tag":6,"arch":"olay","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.06.005","t":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı","q":"Bilgi güvenliği ihlal olayları yalnızca yetkin personel tarafından ele alınmış ve bu personele eğitim sağlanmakta mıdır?","w":2,"m":2,"tag":6,"arch":"egitim","k":"Bilgi güvenliği ihlal olayı yönetimi planlaması ve hazırlığı"},{"id":"UCT.06.045","t":"İletişim Bilgileri Dokümanının Hazırlanması","q":"Kurtarma faaliyetleri ve ilerleme durumu paydaşlara iletilmekte midir?","w":2,"m":1,"tag":6,"arch":"politika","k":"İletişim Bilgileri Dokümanının Hazırlanması"}]}]};

/* =====================================================================
   SABİTLER
   ===================================================================== */
const AXES = ["I","S","T"];
const AXIS_NAME = { I:"İnsan", S:"Süreç", T:"Teknoloji" };
const AXIS_FULL = { I:"İnsan (People)", S:"Süreç (Process)", T:"Teknoloji (Technology)" };
const AXIS_HINT = {
  I:"Sorumluluk, rol ve farkındalık tarafı — bu işi kim sahipleniyor?",
  S:"Süreç tarafı — yazılı kural var mı, düzenli işletiliyor mu?",
  T:"Teknoloji tarafı — hangi araç/kontrol devrede?"
};
const CRIT_LABEL = {1:"Düşük", 2:"Orta", 3:"Yüksek", 4:"Kritik"};
/* 0 = kapsam dışı: bu boyutun kurumda karşılığı yok. Skorlamaya girmez. */
const NA_VALUE = 0;
const NA_TEXT = "Bu boyutun kurumumuzda uygulama alanı bulunmamaktadır (kapsam dışı).";
const ML_LABEL = {1:"Seviye 1 · Başlangıç", 2:"Seviye 2 · Tekrarlanabilir", 3:"Seviye 3 · Tanımlanmış",
                  4:"Seviye 4 · Yönetilen", 5:"Seviye 5 · Optimize"};

const FULL_AREAS = SURVEY.areas;              /* tam havuz — süzülmemiş */
const SCOPES = SURVEY.scopes || [];

/* Çalışma anında kapsam cevaplarına göre kurulan alan listesi */
let AREAS = [];
let AREA_BY_CODE = {};

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Arketip şablonuna sorunun konusunu gömer. */
function ansText(arch, axis, level, konu){
  const set = (SURVEY.ans[arch] || SURVEY.ans["politika"])[axis];
  return String(set[level-1]).replace(/\{k\}/g, konu || "");
}

/* =====================================================================
   KAPSAM — anketin ilk sayfası
   ===================================================================== */
function defaultScopeAnswers(){
  const o = {}; SCOPES.forEach(s => o[s[0]] = !!s[2]); return o;
}

/* Kapsam cevaplarına göre AREAS'ı yeniden kurar.
   Havuzu tamamen elenen alan otomatik olarak kapsam dışı sayılır. */
function rebuildAreas(scopeAnswers){
  const ex = excludedTagsFrom(SCOPES, scopeAnswers);
  AREAS = resolveAreas(FULL_AREAS, ex, SURVEY.meta.target);
  AREA_BY_CODE = {}; AREAS.forEach(a => AREA_BY_CODE[a.c] = a);
  return AREAS;
}
function liveAreas(){ return AREAS.filter(a => !a.scopeOut); }

/* =====================================================================
   ADAPTİF MOTOR — bir alan içinde sıradaki kontrol sorusunun seçimi.
   prior: [{i:havuzIndeksi, r:1..5 (üç eksenin ortalaması)}]
   ===================================================================== */
function nextItemIndex(area, prior){
  const pool = area.pool;
  const used = prior.map(p => p.i);
  const free = i => used.indexOf(i) === -1;
  if(!pool.length) return -1;

  /* Yalnızca puanlanan (en az bir ekseni kapsam içi) cevaplar kotayı tüketir. */
  const scored = prior.filter(p => p.r !== null);
  if(scored.length >= area.askMax) return -1;

  const all = []; for(let i=0;i<pool.length;i++) if(free(i)) all.push(i);
  if(all.length === 0) return -1;                 /* havuz tükendi */

  const pickBy = (cands, keyFn) => cands.reduce((x,y) => {
    const kx = keyFn(x), ky = keyFn(y);
    return (ky[0] < kx[0] || (ky[0] === kx[0] && ky[1] < kx[1])) ? y : x;
  });

  /* İlk soru: olgunluk 2 civarı, en kritik olan. */
  if(prior.length === 0) return pickBy(all, i => [Math.abs(pool[i].m - 2), -pool[i].w]);

  const lastEntry = prior[prior.length-1];

  /* Son soru tamamen kapsam dışıydı → yana kay: farklı kontrol başlığı dene,
     kotayı tüketmediği için aynı basamakta kalınır. */
  if(lastEntry.r === null){
    const base = scored.length ? pool[scored[scored.length-1].i].m : 2;
    const lastT = pool[lastEntry.i].t;
    const other = all.filter(i => pool[i].t !== lastT);
    const c = other.length ? other : all;
    return pickBy(c, i => [Math.abs(pool[i].m - base), -pool[i].w]);
  }

  /* Yakınsama kontrolü son iki PUANLANAN cevaba bakar. */
  if(scored.length >= area.askMin){
    const a = scored[scored.length-2], b = scored[scored.length-1];
    if(a && Math.abs(a.r - b.r) <= 1) return -1;
  }

  const curM = pool[lastEntry.i].m;
  if(lastEntry.r >= 4){                             /* tavanı sına */
    const up = all.filter(i => pool[i].m > curM);
    const c = up.length ? up : all;
    return c.reduce((x,y) => (pool[y].m > pool[x].m || (pool[y].m === pool[x].m && pool[y].w > pool[x].w)) ? y : x);
  }
  if(lastEntry.r <= 2){                             /* tabanı sına */
    const dn = all.filter(i => pool[i].m < curM);
    const c = dn.length ? dn : all;
    return c.reduce((x,y) => (pool[y].m < pool[x].m || (pool[y].m === pool[x].m && pool[y].w > pool[x].w)) ? y : x);
  }
  return pickBy(all, i => [Math.abs(pool[i].m - curM - 1), -pool[i].w]);   /* bir üst basamak */
}

/* Kapsam dışı (0) eksenler ortalamaya girmez. Üçü de kapsam dışıysa null. */
function meanR(r){
  const v = AXES.map(a => r[a]).filter(x => x > 0);
  return v.length ? v.reduce((a,b) => a + b, 0) / v.length : null;
}
function isAllNA(r){ return AXES.every(a => r[a] === NA_VALUE); }
function naAxisCount(r){ return AXES.filter(a => r[a] === NA_VALUE).length; }

/* =====================================================================
   ŞİFRELEME (AES-256-GCM / PBKDF2-SHA256)
   ===================================================================== */
function generateSubmissionPassword(){
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  return String(10000000 + (a[0] % 90000000));
}
function buf2b64(buf){ const b = new Uint8Array(buf); let s=""; for(let i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s); }
async function deriveAesKey(password, saltBuf){
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), {name:"PBKDF2"}, false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2", salt:saltBuf, iterations:150000, hash:"SHA-256"}, km, {name:"AES-GCM", length:256}, false, ["encrypt"]);
}
async function encryptJsonPayload(obj, password){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ct = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { type:"aoc_encrypted_submission", alg:"AES-256-GCM/PBKDF2-SHA256", salt:buf2b64(salt), iv:buf2b64(iv), ciphertext:buf2b64(ct) };
}
const TR_ASCII = { "ç":"c","Ç":"C","ğ":"g","Ğ":"G","ı":"i","İ":"I","ö":"o","Ö":"O","ş":"s","Ş":"S","ü":"u","Ü":"U" };
function slugForFilename(s){
  let t = String(s || "Kurum").replace(/[çÇğĞıİöÖşŞüÜ]/g, ch => TR_ASCII[ch]);
  try { t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch(e) {}
  return t.replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40) || "Kurum";
}

/* =====================================================================
   DURUM — kapsam cevapları + düz geçmiş dizisi
   history[k] = {a:alanKodu, i:havuzIndeksi, r:{I,S,T}} | {a:alanKodu, na:true}
   ===================================================================== */
let state = { orgName:"", scope:defaultScopeAnswers(), history:[], contact:null };
let viewIdx = 0;

function resetState(orgName){
  state = { orgName: orgName||"", scope: defaultScopeAnswers(), history: [], contact: null };
  viewIdx = 0; rebuildAreas(state.scope);
}

function deriveStateFromHistory(history){
  const areas = liveAreas();
  const results = {}; let areaPtr = 0, current = [], h = 0;
  for(; areaPtr < areas.length; areaPtr++){
    const area = areas[areaPtr];
    if(h < history.length && history[h].a === area.c && history[h].na){
      results[area.c] = { na:true, reason:"user", items:[] }; h++; continue;
    }
    const acc = [];
    while(h < history.length && history[h].a === area.c && !history[h].na){
      acc.push({ i:history[h].i, r:meanR(history[h].r), raw:history[h].r,
                 ev:history[h].ev, cf:history[h].cf }); h++;
      if(nextItemIndex(area, acc) === -1) break;
    }
    if(acc.length > 0 && nextItemIndex(area, acc) === -1){
      const scored = acc.filter(x => x.r !== null);
      const skipped = acc.filter(x => x.r === null).map(x => {
        const it = area.pool[x.i];
        return { id:it.id, q:it.q, t:it.t };
      });
      if(scored.length === 0){
        /* Alanın çalışma havuzundaki her kontrol kapsam dışı işaretlendi. */
        results[area.c] = { na:true, reason:"allNA", items:[], skipped:skipped };
      } else {
        results[area.c] = { na:false, skipped:skipped, items: scored.map(x => {
          const it = area.pool[x.i];
          const o = { id:it.id, q:it.q, t:it.t, arch:it.arch, k:it.k, w:it.w, ml:it.m, r:x.raw };
          if(x.ev) o.ev = x.ev;          /* katılımcının yazdığı kanıt */
          if(x.cf && x.cf.length) o.cf = x.cf;   /* tetiklenen çelişki kuralları */
          return o;
        })};
      }
      continue;
    }
    current = acc; break;
  }
  return { results, areaPtr, current, areas };
}

/* Kapsam dışı kalan alanlar sonuç paketine de yazılır. */
function scopeOutResults(){
  const o = {};
  AREAS.filter(a => a.scopeOut).forEach(a => { o[a.c] = { na:true, reason:"scope", items:[] }; });
  return o;
}

/* =====================================================================
   OTURUM (localStorage)
   ===================================================================== */
const LS_PROGRESS = "aoc_client_progress_" + (SURVEY.meta.id || "v4");
function saveProgress(){ try{ localStorage.setItem(LS_PROGRESS, JSON.stringify(state)); }catch(e){} }
function clearProgress(){ try{ localStorage.removeItem(LS_PROGRESS); }catch(e){} }
function loadProgress(){
  try{ const raw = localStorage.getItem(LS_PROGRESS); if(!raw) return null;
    const p = JSON.parse(raw); return (p && Array.isArray(p.history)) ? p : null; }catch(e){ return null; }
}

/* =====================================================================
   EKRANLAR
   ===================================================================== */
const SCREENS = ["landing","scopeScreen","assessment","clientDone"];
function showScreen(id){
  SCREENS.forEach(s => { const el = document.getElementById(s); if(el) el.classList.toggle("hidden", s !== id); });
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
}
function reducedMotion(){ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function transitionSlide(dir, buildFn){
  const card = document.getElementById("slideCard");
  if(reducedMotion()){ buildFn(); return; }
  card.classList.add(dir === "fwd" ? "slide-out-fwd" : "slide-out-back");
  setTimeout(() => {
    card.classList.remove("slide-out-fwd","slide-out-back");
    buildFn();
    card.classList.add(dir === "fwd" ? "slide-in-fwd" : "slide-in-back");
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("slide-in-fwd","slide-in-back")));
  }, 200);
}

/* ---------------------------------------------------------------------
   KAPSAM SAYFASI
   --------------------------------------------------------------------- */
function renderScopeScreen(){
  const wrap = document.getElementById("scopeList");
  wrap.innerHTML = SCOPES.map(s => {
    const on = state.scope[s[0]];
    return '<div class="scope-q" data-id="' + esc(s[0]) + '">' +
      '<div class="scope-q-text">' + esc(s[1]) + '</div>' +
      (s[4] ? '<div class="scope-q-note">' + esc(s[4]) + '</div>' : '') +
      '<div class="scope-q-btns">' +
      '<button type="button" class="scope-btn' + (on ? " on" : "") + '" data-v="1">Evet</button>' +
      '<button type="button" class="scope-btn' + (!on ? " on no" : "") + '" data-v="0">Hayır</button>' +
      '</div></div>';
  }).join("");
  wrap.querySelectorAll(".scope-btn").forEach(b => b.addEventListener("click", () => {
    state.scope[b.closest(".scope-q").dataset.id] = b.dataset.v === "1";
    rebuildAreas(state.scope); saveProgress(); renderScopeScreen();
  }));
  const areas = rebuildAreas(state.scope);
  const live = areas.filter(a => !a.scopeOut), out = areas.filter(a => a.scopeOut);
  const lo = live.reduce((s,a) => s + a.askMin, 0), hi = live.reduce((s,a) => s + a.askMax, 0);
  document.getElementById("scopeSummary").innerHTML =
    '<div class="scope-sum-grid">' +
    '<div class="pv"><div class="n">' + live.length + '</div><div class="l">Kapsamdaki kontrol alanı</div></div>' +
    '<div class="pv"><div class="n">' + lo + '–' + hi + '</div><div class="l">Kontrol sorusu</div></div>' +
    '<div class="pv"><div class="n">' + (lo*3) + '–' + (hi*3) + '</div><div class="l">İ/S/T cevabı</div></div>' +
    '<div class="pv"><div class="n">~' + Math.max(8, Math.round(hi * 0.8)) + 'dk</div><div class="l">Tahmini süre</div></div>' +
    '</div>' +
    (out.length ? '<div class="scope-out-note"><b>' + out.length + ' kontrol alanı</b> kapsam dışı sayıldı: ' +
       out.map(a => esc(a.n)).join(", ") + '. Bu alanlar skorlamaya dâhil edilmeyecektir.</div>' : '');
  document.getElementById("btnScopeNext").disabled = live.length === 0;
  document.getElementById("scopeEmpty").classList.toggle("hidden", live.length !== 0);
}

/* ---------------------------------------------------------------------
   İLERLEME ÇUBUĞU
   --------------------------------------------------------------------- */
function updateTopbar(d){
  const areas = d.areas || liveAreas();
  const total = areas.length;
  const done = Math.min(d.areaPtr, total);
  const answered = state.history.filter(x => !x.na);
  const nq = answered.filter(x => !isAllNA(x.r)).length;
  const naA = answered.reduce((s2,x) => s2 + naAxisCount(x.r), 0);
  document.getElementById("assessProgressLabel").textContent =
    "Alan " + Math.min(done+1, total) + "/" + total + " · " + nq + " kontrol sorusu · " +
    (answered.length * 3 - naA) + " skorlanan cevap" +
    (naA ? " · " + naA + " kapsam dışı" : "");
  document.getElementById("assessProgressFill").style.width = Math.round((done/(total||1))*100) + "%";
  document.getElementById("funcDots").innerHTML = areas.map((a,i) =>
    '<span class="func-dot ' + (i < done ? "done" : (i === done ? "current" : "")) + '" title="' + esc(a.n) + '"></span>').join("");
}

/* ---------------------------------------------------------------------
   SORU KARTI — tek kontrol sorusu, üç eksen
   --------------------------------------------------------------------- */
function axisBlockHTML(item, axis, selected){
  const has = selected != null;
  const na = selected === NA_VALUE;
  const opts = [1,2,3,4,5].map(l =>
    '<button type="button" class="reply-opt' + (selected === l ? " selected" : "") + '" data-ax="' + axis + '" data-r="' + l + '">' +
    '<span class="radio"></span><span class="txt">' + esc(ansText(item.arch, axis, l, item.k)) + '</span></button>').join("") +
    '<button type="button" class="reply-opt na-opt' + (na ? " selected" : "") + '" data-ax="' + axis + '" data-r="' + NA_VALUE + '">' +
    '<span class="radio"></span><span class="txt">' + esc(NA_TEXT) + '</span></button>';
  return '<div class="axis-block axis-' + axis.toLowerCase() + (has ? " answered" : "") + (na ? " na" : "") + '" data-axis="' + axis + '">' +
    '<div class="axis-head"><span class="axis-badge">' + esc(AXIS_FULL[axis]) + '</span>' +
    '<span class="axis-state">' + (na ? "kapsam dışı" : (has ? selected + "/5" : "seçilmedi")) + '</span></div>' +
    '<div class="axis-hint">' + esc(AXIS_HINT[axis]) + '</div>' +
    '<div class="reply-options">' + opts + '</div></div>';
}

/* Şimdiye kadar puanlanmış tüm cevaplar — bağlamsal çelişki taraması için.
   Kesinleşmiş alanlar + içinde bulunulan alanın birikimi. */
function answeredSoFar(extra){
  const out = [];
  try{
    const d = deriveStateFromHistory(state.history);
    Object.keys(d.results).forEach(code => {
      (d.results[code].items || []).forEach(it => {
        const m = meanR(it.r);
        if(m != null) out.push({ id:it.id, area:code, arch:it.arch, mean:m });
      });
    });
    const area = d.areas[d.areaPtr];
    if(area) (d.current || []).forEach(x => {
      if(x.r == null) return;
      const p = area.pool[x.i];
      out.push({ id:p.id, area:area.c, arch:p.arch, mean:x.r });
    });
  }catch(e){}
  if(extra) out.push(extra);
  return out;
}

/* Bu soruya iliştirilen bağlamsal çelişki bulguları. */
function liveContradictions(area, item, sel, editing){
  if(!AXES.every(ax => sel[ax] != null)) return [];
  const m = meanR(sel);
  if(m == null) return [];
  const all = answeredSoFar({ id:item.id, area:area.c, arch:item.arch, mean:m })
    .filter((x,i,arr) => arr.findIndex(y => y.id === x.id) === i || x.id === item.id);
  /* aynı soru hem geçmişten hem taslaktan gelebilir → son hâli kalsın */
  const dedup = {}; all.forEach(x => dedup[x.id] = x);
  const map = contradictionsByQuestion(Object.keys(dedup).map(k => dedup[k]));
  return map[item.id] || [];
}

/* Anlık anomali taraması. Üç eksen de seçilmeden çalışmaz; düzenleme modunda
   alan düzeyi kurallar atlanır (birikim o alana ait olmayabilir). */
function liveAnomalies(area, item, sel, editing){
  if(!AXES.every(ax => sel[ax] != null)) return [];
  const out = questionAnomalies(sel).slice();
  if(editing) return out;
  try{
    const cur = deriveStateFromHistory(state.history).current || [];
    const list = cur.filter(x => x.raw).map(x => ({ ml: area.pool[x.i].m, raw: x.raw, mean: x.r }));
    list.push({ ml: item.m, raw: sel, mean: meanR(sel) });
    areaAnomalies(list).forEach(a => out.push(a));
  }catch(e){}
  return out;
}

function questionSlideHTML(area, item, opts){
  const idxInArea = opts.answeredInArea + 1;
  const sel = opts.selected || {};
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">' + esc(area.c + " · " + area.n) + '</span>' +
          '<span class="slide-cat-count">Kontrol sorusu ' + idxInArea + '/' + area.askMax + '</span></div>';
  if(idxInArea === 1 && area.r) h += '<p class="slide-rationale">' + esc(area.r) + '</p>';
  if(opts.reviewNote) h += '<div class="slide-review-note">' + opts.reviewNote + '</div>';
  h += '<div class="pill-row">' +
       '<span class="axis-pill ml">' + esc(ML_LABEL[item.m]) + '</span>' +
       '<span class="axis-pill crit-' + item.w + '">' + CRIT_LABEL[item.w] + '</span>' +
       '<span class="axis-pill">' + esc(SURVEY.arch[item.arch] || item.arch) + '</span></div>';
  h += '<div class="slide-question">' + esc(item.q) + '</div>';
  h += '<div class="slide-hint">Kontrol başlığı: ' + esc(item.t) +
       ' &middot; Aynı kontrolü üç boyutta değerlendirin; her boyut için kurumunuzu bugün en iyi tanımlayan ifadeyi seçin.</div>';
  h += AXES.map(ax => axisBlockHTML(item, ax, sel[ax] == null ? null : sel[ax])).join("");
  const complete = AXES.every(ax => sel[ax] != null);
  const naCount = AXES.filter(ax => sel[ax] === NA_VALUE).length;
  if(naCount === 3) h += '<div class="na-note"><b>Bu kontrol kapsam dışı sayılacak.</b> Skorlamaya girmeyecek ve ' +
    'soru kotanızdan düşülmeyecek — yerine bu alandan başka bir kontrol sorulacaktır.</div>';
  else if(naCount) h += '<div class="na-note">' + naCount + ' boyut kapsam dışı işaretlendi; yalnızca kalan ' +
    (3 - naCount) + ' boyut skorlamaya girecek.</div>';

  /* Bağlamsal çelişki → kanıt talebi. İlerlemeyi engellemez; boş bırakılırsa
     soru «kanıtsız» olarak analiz operatörünün inceleme kuyruğuna düşer. */
  const contra = liveContradictions(area, item, sel, opts.editing);
  if(contra.length){
    h += '<div class="ev-box"><div class="ev-head">Bu cevap için kanıt isteniyor</div>' +
      '<ul class="ev-list">' + contra.map(c =>
        '<li><b>' + esc(c.label) + ':</b> ' + esc(c.msg) + '</li>').join("") + '</ul>' +
      '<label class="ev-label" for="evInput">Bu yeteneği doğrulayan kanıtı kısaca tarif edin ' +
      '(belge adı, sistem/rapor adı, tarih, sorumlu birim vb.):</label>' +
      '<textarea id="evInput" class="ev-input" rows="3" placeholder="Örn. «Varlık Envanteri Prosedürü v2.1, CMDB kayıtları, son gözden geçirme 03/2026, BT Operasyon»">' +
      esc(opts.evidence || "") + '</textarea>' +
      '<span class="ev-sub">Kanıt zorunlu değildir. Boş bırakırsanız bu soru, analiz operatörü ' +
      'inceleyip karar verene kadar skorlamaya dâhil edilmez.</span></div>';
  }

  /* Cevap örüntüsü uyarısı — engellemez, yalnızca gözden geçirmeye davet eder. */
  const anoms = liveAnomalies(area, item, sel, opts.editing);
  if(anoms.length) h += '<div class="anom-note"><b>Cevabınızı gözden geçirmek ister misiniz?</b>' +
    '<ul>' + anoms.map(a => '<li>' + esc(a.msg) + '</li>').join("") + '</ul>' +
    '<span class="anom-sub">Bu bir hata değildir; cevabınız olduğu gibi kaydedilebilir. ' +
    'Ancak değerlendirme sonrasında bu kontrol için kanıt istenebilir.</span></div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"' + (viewIdx > 0 ? "" : " disabled") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button>' +
       (opts.showNA ? '<button class="na-btn" id="btnNA">Bu alan kurumumuzda uygulanamaz</button>' : '') + '</div>' +
       '<button class="btn btn-primary" id="btnForward"' + (complete ? "" : " disabled") + '>İleri</button></div>';
  return h;
}

function naSlideHTML(area){
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">' + esc(area.c + " · " + area.n) + '</span>' +
          '<span class="slide-cat-count">Uygulanamaz</span></div>';
  h += '<div class="slide-question">Bu alanı «kurumumuzda uygulanamaz» olarak işaretlediniz.</div>';
  h += '<div class="slide-hint">Bu alan skorlamaya dâhil edilmeyecektir. Kararınızı değiştirebilirsiniz.</div>';
  h += '<div class="reply-options"><button type="button" class="reply-opt selected" id="btnKeepNA"><span class="radio"></span><span class="txt">Evet, uygulanamaz olarak kalsın</span></button>' +
       '<button type="button" class="reply-opt" id="btnUndoNA"><span class="radio"></span><span class="txt">Hayır, bu alanı normal şekilde cevaplamak istiyorum</span></button></div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"' + (viewIdx > 0 ? "" : " disabled") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button></div>' +
       '<button class="btn btn-primary" id="btnForward">İleri</button></div>';
  return h;
}

function completionSlideHTML(){
  const d = deriveStateFromHistory(state.history);
  const naUser = Object.keys(d.results).filter(k => d.results[k].na && d.results[k].reason === "user").length;
  const naScope = AREAS.filter(a => a.scopeOut).length;
  const answered = state.history.filter(x => !x.na);
  const nq = answered.filter(x => !isAllNA(x.r)).length;
  const naAx = answered.reduce((s2,x) => s2 + naAxisCount(x.r), 0);
  const naQ = answered.filter(x => isAllNA(x.r)).length;
  const naAllArea = Object.keys(d.results).filter(k => d.results[k].reason === "allNA").length;
  let h = '<div class="slide-cat-row"><span class="slide-cat-name">Tamamlandı</span></div>';
  h += '<div class="slide-question">Tüm kontrol alanları için sorularınız tamamlandı.</div>';
  h += '<div class="slide-hint">' + liveAreas().length + ' alan · ' + nq + ' kontrol sorusu · ' +
       (nq*3 - (naAx - naQ*3)) + ' skorlanan İ/S/T cevabı' +
       (naQ ? ' · ' + naQ + ' kontrol kapsam dışı' : '') +
       ((naAx - naQ*3) ? ' · ' + (naAx - naQ*3) + ' boyut kapsam dışı' : '') +
       (naAllArea ? ' · ' + naAllArea + ' alan tamamen kapsam dışı' : '') +
       (naUser ? ' · ' + naUser + ' alan uygulanamaz işaretlendi' : '') +
       (naScope ? ' · ' + naScope + ' alan kapsam sorusundan kapandı' : '') +
       '. «Anketi Tamamla» dediğinizde iletişim bilgileriniz alınacak, e-posta adresiniz doğrulanacak ve yanıtlarınız cihazınızda şifrelenerek hem indirilecek hem de danışman ekibimize iletilecektir.</div>';
  h += '<div class="slide-footer"><div class="slide-footer-left">' +
       '<button class="nav-btn" id="btnPrev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 5l-7 7 7 7"/></svg>Önceki</button></div>' +
       '<button class="btn btn-primary" id="btnFinish">Anketi Tamamla</button></div>';
  return h;
}

/* ---------------------------------------------------------------------
   ETKİLEŞİM
   --------------------------------------------------------------------- */
let draft = null;   /* canlı slaytta henüz tamamlanmamış {I,S,T} seçimi */
let draftEv = "";   /* canlı slaytta yazılmakta olan kanıt metni */

function countDownstream(fromIdx){ return state.history.length - fromIdx - 1; }

function wireQuestionSlide(area, item, editIdx, sel){
  const card = document.getElementById("slideCard");
  card.querySelectorAll(".reply-opt[data-r]").forEach(btn => {
    btn.addEventListener("click", () => {
      sel[btn.dataset.ax] = Number(btn.dataset.r);
      if(editIdx === null || editIdx === undefined) draft = sel;
      rerenderSlideInPlace(area, item, editIdx, sel);
    });
  });
  /* Kanıt metni yeniden çizimlerde kaybolmasın diye taslakta tutulur. */
  const ev = card.querySelector("#evInput");
  if(ev){
    ev.addEventListener("input", () => { draftEv = ev.value; });
    if(document.activeElement !== ev && ev.value){
      ev.selectionStart = ev.selectionEnd = ev.value.length;
    }
  }
  const f = card.querySelector("#btnForward");
  if(f) f.addEventListener("click", () => commitAnswer(area, item, sel, editIdx));
  const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
  const na = card.querySelector("#btnNA");
  if(na) na.addEventListener("click", () => {
    draft = null; draftEv = "";
    state.history.push({ a:area.c, na:true });
    viewIdx = state.history.length; saveProgress();
    transitionSlide("fwd", renderAtViewIdx);
  });
}

function rerenderSlideInPlace(area, item, editIdx, sel){
  const card = document.getElementById("slideCard");
  const answeredBefore = editIdx === null || editIdx === undefined
    ? deriveStateFromHistory(state.history).current.filter(x => x.r !== null).length
    : state.history.slice(0, editIdx).filter(x => x.a === area.c && !x.na && !isAllNA(x.r)).length;
  const note = (editIdx !== null && editIdx !== undefined && countDownstream(editIdx) > 0)
    ? "Bu cevabı değiştirirseniz, bu noktadan sonra verdiğiniz <b>" + countDownstream(editIdx) + "</b> kontrol sorusu sıfırlanır ve anket buradan yeniden uyarlanır."
    : null;
  const liveScored = (editIdx === null || editIdx === undefined)
    ? deriveStateFromHistory(state.history).current.filter(x => x.r !== null).length : 1;
  card.innerHTML = questionSlideHTML(area, item, {
    selected: sel, showNA: (editIdx === null || editIdx === undefined) && liveScored === 0,
    reviewNote: note, answeredInArea: answeredBefore, evidence: draftEv,
    editing: editIdx !== null && editIdx !== undefined
  });
  wireQuestionSlide(area, item, editIdx, sel);
}

function commitAnswer(area, item, sel, editIdx){
  if(!AXES.every(ax => sel[ax] != null)) return;
  const r = { I:sel.I, S:sel.S, T:sel.T };
  /* Çelişki bulguları ve katılımcının yazdığı kanıt cevapla birlikte saklanır. */
  const cf = liveContradictions(area, item, sel, editIdx !== null && editIdx !== undefined).map(c => c.id);
  const ev = (draftEv || "").trim();
  const rec = { a:area.c, i:item._i, r:r };
  if(cf.length) rec.cf = cf;
  if(ev) rec.ev = ev;
  draft = null; draftEv = "";
  if(editIdx === undefined || editIdx === null){
    state.history.push(rec);
  } else {
    const prev = state.history[editIdx];
    const same = prev.r && AXES.every(ax => prev.r[ax] === r[ax]) && (prev.ev || "") === ev;
    if(same){ viewIdx = editIdx + 1; saveProgress(); transitionSlide("fwd", renderAtViewIdx); return; }
    state.history = state.history.slice(0, editIdx);
    state.history.push(rec);
  }
  viewIdx = state.history.length;
  saveProgress();
  transitionSlide("fwd", renderAtViewIdx);
}

function goForwardFromReview(){ viewIdx = Math.min(viewIdx + 1, state.history.length); transitionSlide("fwd", renderAtViewIdx); }
function goBack(){ if(viewIdx > 0){ draft = null; viewIdx--; transitionSlide("back", renderAtViewIdx); } }

function renderReviewAt(idx){
  const rec = state.history[idx];
  const area = AREA_BY_CODE[rec.a];
  const card = document.getElementById("slideCard");
  updateTopbar(deriveStateFromHistory(state.history.slice(0, idx)));
  if(rec.na){
    card.innerHTML = naSlideHTML(area);
    card.querySelector("#btnKeepNA").addEventListener("click", goForwardFromReview);
    card.querySelector("#btnUndoNA").addEventListener("click", () => {
      state.history = state.history.slice(0, idx); viewIdx = state.history.length;
      saveProgress(); transitionSlide("fwd", renderAtViewIdx);
    });
    const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
    const f = card.querySelector("#btnForward"); if(f) f.addEventListener("click", goForwardFromReview);
    return;
  }
  const item = Object.assign({}, area.pool[rec.i], {_i: rec.i});
  draftEv = rec.ev || "";
  rerenderSlideInPlace(area, item, idx, Object.assign({}, rec.r));
}

function renderLive(){
  const d = deriveStateFromHistory(state.history);
  const card = document.getElementById("slideCard");
  updateTopbar(d);
  if(d.areaPtr >= d.areas.length){ card.innerHTML = completionSlideHTML(); wireCompletion(); return; }
  const area = d.areas[d.areaPtr];
  const ni = nextItemIndex(area, d.current);
  if(ni === -1){ card.innerHTML = completionSlideHTML(); wireCompletion(); return; }
  const item = Object.assign({}, area.pool[ni], {_i: ni});
  const sel = draft || {};
  rerenderSlideInPlace(area, item, null, sel);
}
function wireCompletion(){
  const card = document.getElementById("slideCard");
  const p = card.querySelector("#btnPrev"); if(p) p.addEventListener("click", goBack);
  const fin = card.querySelector("#btnFinish"); if(fin) fin.addEventListener("click", finishAssessment);
}

function renderAtViewIdx(){ if(viewIdx < state.history.length) renderReviewAt(viewIdx); else renderLive(); }

/* =====================================================================
   ŞİFRELE + İNDİR
   ===================================================================== */
let currentPassword = null, lastEnvelope = null;

function buildSubmission(){
  const d = deriveStateFromHistory(state.history);
  const results = Object.assign({}, scopeOutResults(), d.results);
  return {
    type:"aoc_submission_v4",
    orgName: state.orgName,
    submittedAt: new Date().toISOString(),
    taxonomy: SURVEY.meta.tax,
    taxonomyName: SURVEY.meta.taxName,
    bankVersion: SURVEY.meta.bankVersion,
    surveyId: SURVEY.meta.id,
    scope: state.scope,
    contact: state.contact || null,
    areaNames: AREAS.reduce((o,a) => (o[a.c] = a.n, o), {}),
    results: results
  };
}

async function exportEncrypted(regen){
  if(regen || !lastEnvelope){
    currentPassword = generateSubmissionPassword();
    lastEnvelope = await encryptJsonPayload(buildSubmission(), currentPassword);
  }
  const blob = new Blob([JSON.stringify(lastEnvelope)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Siber_Olgunluk_Cevaplari_" + slugForFilename(state.orgName) + "_" + new Date().toISOString().slice(0,10) + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  document.getElementById("clientPasswordOut").textContent = currentPassword;
}

function finishAssessment(){
  /* Site sürümünde tamamlama akışı iletişim + doğrulama adımlarıyla yürütülür. */
  finishAssessmentSite();
}

/* =====================================================================
   BAŞLANGIÇ
   ===================================================================== */
function initLanding(){
  const m = SURVEY.meta;
  rebuildAreas(state.scope);
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("taxPill").textContent = m.taxName;
  document.getElementById("footMeta").textContent = m.taxName + " · " + m.bankVersion;
  const live = liveAreas();
  const lo = live.reduce((a,x) => a + x.askMin, 0), hi = live.reduce((a,x) => a + x.askMax, 0);
  document.getElementById("statAreas").textContent = live.length;
  document.getElementById("statAreasLbl").textContent = m.tax === "nist" ? "NIST CSF 2.0 Kontrol Alanı" : "UCT Kontrol Alanı";
  document.getElementById("statRange").textContent = lo + "–" + hi;
  document.getElementById("statRangeSub").textContent = "= " + (lo*3) + "–" + (hi*3) + " İ/S/T cevabı";
  document.getElementById("statTime").textContent = "~" + Math.max(8, Math.round(hi * 0.8)) + "dk";
  document.getElementById("leadText").textContent =
    live.length + " " + m.taxName + " kontrol alanını İnsan, Süreç ve Teknoloji boyutlarında değerlendiren kısa bir öz-değerlendirme anketidir. " +
    "Her kontrol sorusunu üç boyut için ayrı ayrı yanıtlarsınız. Bu bir sınav değildir; doğru ya da yanlış cevap yoktur — " +
    "amaç yalnızca kurumunuzu bugün en iyi tanımlayan ifadeleri seçmenizdir. Sorular cevaplarınıza göre uyarlanır; " +
    "dilediğiniz zaman ara verip kaldığınız yerden devam edebilirsiniz.";
  if(m.orgName) document.getElementById("orgNameInput").value = m.orgName;

  const strip = document.getElementById("funcStrip");
  strip.innerHTML = "";
  FULL_AREAS.forEach(a => { const el = document.createElement("span"); el.textContent = a.n; strip.appendChild(el); });

  document.getElementById("btnStart").addEventListener("click", () => {
    const org = document.getElementById("orgNameInput").value.trim() || "Kurum";
    resetState(org);
    showScreen("scopeScreen"); renderScopeScreen();
  });
  document.getElementById("btnScopeBack").addEventListener("click", () => showScreen("landing"));
  document.getElementById("btnScopeNext").addEventListener("click", () => {
    rebuildAreas(state.scope); saveProgress();
    showScreen("assessment"); renderAtViewIdx();
  });
  document.getElementById("btnHomeFromAssess").addEventListener("click", () => { saveProgress(); showScreen("landing"); });

  const saved = loadProgress();
  if(saved && saved.history.length > 0){
    document.getElementById("resumeModal").classList.remove("hidden");
    document.getElementById("btnResumeFresh").onclick = () => { clearProgress(); document.getElementById("resumeModal").classList.add("hidden"); };
    document.getElementById("btnResumeContinue").onclick = () => {
      document.getElementById("resumeModal").classList.add("hidden");
      state = { orgName: saved.orgName || "", scope: saved.scope || defaultScopeAnswers(), history: saved.history };
      rebuildAreas(state.scope);
      viewIdx = state.history.length;
      showScreen("assessment"); renderAtViewIdx();
    };
  }
}

/* =====================================================================
   OTOMASYON KÖPRÜSÜ — headless doğrulama için (arayüzü etkilemez).
   ===================================================================== */
Object.assign(window, { SURVEY, SCOPES, AXES, AXIS_NAME, FULL_AREAS });
Object.defineProperty(window, "AREAS",        { get: () => AREAS,        configurable: true });
Object.defineProperty(window, "AREA_BY_CODE", { get: () => AREA_BY_CODE, configurable: true });
Object.defineProperty(window, "state",        { get: () => state,        configurable: true });
Object.defineProperty(window, "viewIdx",      { get: () => viewIdx,      configurable: true });

initLanding();
showScreen("landing");

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

/* =====================================================================
   SİTE SÜRÜMÜ — İLETİŞİM, E-POSTA DOĞRULAMA (OTP) VE GÖNDERİM
   ---------------------------------------------------------------------
   Anket tamamlandığında:
     1) Ziyaretçiden kurumsal e-posta + telefon alınır ve KVKK onayı istenir.
     2) noreply@ üzerinden 6 haneli doğrulama kodu gönderilir.
     3) Kod doğrulanınca cevaplar cihazda AES-256-GCM ile şifrelenir,
        şifreli paket hem indirilir hem de aynı origin'deki OTP servisine
        POST edilerek webrequest@ adresine ek olarak iletilir.
   Şifre HİÇBİR koşulda sunucuya gönderilmez; ekranda gösterilir ve
   ziyaretçi tarafından ayrı bir kanaldan iletilir.
   ===================================================================== */

var GONDERIM = /*__GONDERIM__*/{
  "endpoint": "../otp-servisi.php",
  "alici": "webrequest@scaleteknoloji.com",
  "aydinlatmaUrl": "https://infosec.scaleteknoloji.com/aydinlatma-metni.html"
}/*__/GONDERIM__*/;

var otpToken = null, otpExp = 0, gonderimMesgul = false;

function dgEl(id){ return document.getElementById(id); }

function dgAdim(ad){
  ["doneContact", "doneCode", "doneFinal"].forEach(function (k) {
    var el = dgEl(k); if (el) el.classList.toggle("hidden", k !== ad);
  });
  window.scrollTo(0, 0);
}

function dgHata(id, mesaj){
  var el = dgEl(id);
  if (!el) return;
  el.textContent = mesaj || "";
  el.classList.toggle("hidden", !mesaj);
}

function dgMesgul(btnId, mesgul, etiket){
  var b = dgEl(btnId);
  if (!b) return;
  b.disabled = mesgul;
  if (mesgul) { b.dataset.eski = b.textContent; b.textContent = etiket || "Gönderiliyor…"; }
  else if (b.dataset.eski) { b.textContent = b.dataset.eski; }
}

function gecerliEposta(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function gecerliTelefon(v){ return (v.replace(/\D/g, "").length >= 10); }

async function servisIstek(govde){
  var r, metin;
  try {
    r = await fetch(GONDERIM.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(govde)
    });
    metin = await r.text();
  } catch (e) {
    throw new Error("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.");
  }
  var j = null;
  try { j = JSON.parse(metin); } catch (e) {}
  if (!j) throw new Error("Servis beklenmeyen bir yanıt döndürdü (HTTP " + r.status + "). Lütfen daha sonra tekrar deneyin.");
  if (!j.ok) throw new Error(j.error || "İşlem tamamlanamadı.");
  return j;
}

/* ---------- iletişim bilgileri ---------- */
function iletisimOku(){
  return {
    email: (dgEl("cEmail").value || "").trim().toLowerCase(),
    telefon: (dgEl("cPhone").value || "").trim(),
    onay: !!dgEl("cConsent").checked
  };
}

function iletisimDogrula(k, onayZorunlu){
  if (!gecerliEposta(k.email)) return "Geçerli bir e-posta adresi girin.";
  if (!gecerliTelefon(k.telefon)) return "Geçerli bir telefon numarası girin (en az 10 hane).";
  if (onayZorunlu && !k.onay) return "Devam edebilmek için aydınlatma metnini onaylamanız gerekir.";
  return "";
}

/* ---------- şifreleme + indirme ---------- */
async function paketHazirla(){
  state.contact = {
    email: (dgEl("cEmail").value || "").trim().toLowerCase(),
    telefon: (dgEl("cPhone").value || "").trim(),
    onay: !!dgEl("cConsent").checked,
    onayZamani: new Date().toISOString()
  };
  currentPassword = generateSubmissionPassword();
  lastEnvelope = await encryptJsonPayload(buildSubmission(), currentPassword);
  return lastEnvelope;
}

function paketDosyaAdi(){
  return "Siber_Olgunluk_Cevaplari_" + slugForFilename(state.orgName) + "_" +
         new Date().toISOString().slice(0, 10) + ".json";
}

function paketIndir(){
  if (!lastEnvelope) return;
  var blob = new Blob([JSON.stringify(lastEnvelope)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = paketDosyaAdi();
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

/* ---------- son ekran ---------- */
function sonEkran(durum, ayrinti){
  dgEl("clientPasswordOut").textContent = currentPassword || "--------";
  var not = dgEl("deliveryNote");
  if (durum === "gonderildi") {
    not.className = "delivery-note ok";
    not.innerHTML = "<b>Şifreli paket Scale Bilgi Güvenliği'ne iletildi.</b> " +
      "Danışmanınız çözümleme için yalnızca aşağıdaki şifreye ihtiyaç duyacak — " +
      "bu şifreyi <b>e-posta dışında</b> bir kanaldan (telefon veya SMS) iletin. " +
      "Şifre hiçbir zaman sunucuya gönderilmez.";
  } else if (durum === "gonderilemedi") {
    not.className = "delivery-note warn";
    not.innerHTML = "<b>Paket otomatik olarak iletilemedi.</b> " + esc(ayrinti || "") +
      "<br>İndirilen dosyayı <b>" + esc(GONDERIM.alici) + "</b> adresine e-posta ile gönderebilir, " +
      "şifreyi ise telefonla iletebilirsiniz.";
  } else {
    not.className = "delivery-note";
    not.innerHTML = "Doğrulama yapılmadığı için paket otomatik iletilmedi. " +
      "İndirilen dosyayı <b>" + esc(GONDERIM.alici) + "</b> adresine gönderin, " +
      "şifreyi ise <b>farklı bir kanaldan</b> (telefon veya SMS) iletin.";
  }
  dgAdim("doneFinal");
}

/* ---------- olaylar ---------- */
function iletisimBagla(){
  dgEl("btnSendCode").addEventListener("click", async function () {
    if (gonderimMesgul) return;
    var k = iletisimOku();
    var h = iletisimDogrula(k, true);
    if (h) { dgHata("contactErr", h); return; }
    dgHata("contactErr", "");
    gonderimMesgul = true; dgMesgul("btnSendCode", true, "Kod gönderiliyor…");
    try {
      var j = await servisIstek({ action: "send", email: k.email, baglam: "degerlendirme" });
      otpToken = j.token; otpExp = j.exp;
      dgEl("codeEmailOut").textContent = k.email;
      dgEl("cCode").value = "";
      dgHata("codeErr", "");
      dgAdim("doneCode");
      dgEl("cCode").focus();
    } catch (e) {
      dgHata("contactErr", e.message);
    } finally {
      gonderimMesgul = false; dgMesgul("btnSendCode", false);
    }
  });

  dgEl("btnSkipVerify").addEventListener("click", async function () {
    if (gonderimMesgul) return;
    gonderimMesgul = true;
    try {
      await paketHazirla();
      paketIndir();
      sonEkran("dogrulanmadi");
    } catch (e) {
      dgHata("contactErr", "Dosya şifrelenemedi: " + e.message);
    } finally { gonderimMesgul = false; }
  });

  dgEl("btnCodeBack").addEventListener("click", function () { dgAdim("doneContact"); });

  dgEl("btnResend").addEventListener("click", function () {
    dgHata("codeErr", "");
    dgAdim("doneContact");
    dgEl("btnSendCode").click();
  });

  dgEl("cCode").addEventListener("keydown", function (e) {
    if (e.key === "Enter") dgEl("btnVerifySend").click();
  });

  dgEl("btnVerifySend").addEventListener("click", async function () {
    if (gonderimMesgul) return;
    var kod = (dgEl("cCode").value || "").replace(/\D/g, "");
    if (kod.length !== 6) { dgHata("codeErr", "6 haneli kodu eksiksiz girin."); return; }
    dgHata("codeErr", "");
    gonderimMesgul = true; dgMesgul("btnVerifySend", true, "Gönderiliyor…");
    var k = iletisimOku();
    try {
      var zarf = await paketHazirla();
      var d = deriveStateFromHistory(state.history);
      await servisIstek({
        action: "degerlendirme",
        email: k.email, telefon: k.telefon, kurum: state.orgName,
        code: kod, token: otpToken, exp: otpExp,
        dosyaAdi: paketDosyaAdi(),
        zarf: zarf,
        ozet: {
          surveyId: SURVEY.meta.id,
          taksonomi: SURVEY.meta.taxName,
          bankaSurumu: SURVEY.meta.bankVersion,
          alanSayisi: liveAreas().length,
          soruSayisi: state.history.filter(function (x) { return !x.na; }).length,
          gonderimZamani: new Date().toISOString()
        }
      });
      paketIndir();
      sonEkran("gonderildi");
    } catch (e) {
      var m = e.message || "";
      /* Kod hatalıysa kullanıcı aynı ekranda kalıp tekrar denesin. */
      if (/kod/i.test(m) && /hatal|süresi|kullan/i.test(m)) {
        dgHata("codeErr", m);
      } else {
        paketIndir();
        sonEkran("gonderilemedi", m);
      }
    } finally {
      gonderimMesgul = false; dgMesgul("btnVerifySend", false);
    }
  });

  dgEl("btnRedownload").addEventListener("click", paketIndir);

  dgEl("btnClientRestart").addEventListener("click", function () {
    clearProgress(); resetState(""); lastEnvelope = null; currentPassword = null;
    otpToken = null; otpExp = 0;
    showScreen("landing");
  });

  dgEl("btnCopyPassword").addEventListener("click", function () {
    if (!currentPassword) return;
    var btn = dgEl("btnCopyPassword"), lbl = dgEl("copyBtnLabel");
    var bitti = function () {
      btn.classList.add("copied"); lbl.textContent = "Kopyalandı";
      setTimeout(function () { btn.classList.remove("copied"); lbl.textContent = "Kopyala"; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(currentPassword).then(bitti).catch(bitti);
    else bitti();
  });
}

/* Anket bittiğinde çağrılır (survey motorundaki finishAssessment yerine). */
function finishAssessmentSite(){
  clearProgress();
  lastEnvelope = null; currentPassword = null;
  showScreen("clientDone");
  dgHata("contactErr", ""); dgHata("codeErr", "");
  dgAdim("doneContact");
  if (!cryptoKullanilabilir()) {
    dgHata("contactErr", "Tarayıcınız bu sayfada güvenli şifreleme (Web Crypto) arayüzünü kullanıma açmadı. " +
      "Sayfayı https:// adresinden açtığınızdan emin olun.");
    dgEl("btnSendCode").disabled = true;
    dgEl("btnSkipVerify").disabled = true;
  }
}

function cryptoKullanilabilir(){
  return !!(window.crypto && window.crypto.subtle && window.crypto.subtle.encrypt);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iletisimBagla);
else iletisimBagla();
