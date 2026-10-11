# Siber Güvenlik Olgunluk — Analiz Paneli (Scale Teknoloji)

Danışmanın kendi bilgisayarında, **tek HTML dosyası** olarak ve **internetsiz** çalışan siber güvenlik olgunluk değerlendirme aracı. Girişten sonra açılan Değerlendirme Merkezi'nde üç fonksiyon vardır:

| Fonksiyon | Ne yapar |
|---|---|
| **Anket Analizi** | Kurumdan gelen şifreli cevap dosyası (`.json`) sürüklenip bırakılır, 8 haneli şifre girilir ve analiz açılır. Ardından kanıt incelemesi, skorlama, verilen cevaplar, **Word** ve **HTML infografik** rapor gelir. |
| **Anket Üretimi** | Çerçeve (UCT veya NIST CSF 2.0), uzunluk ve kurum bilgisi seçilir; kuruma özel, tek dosyalık çevrimdışı anket üretilir. |
| **Soru Yönetimi** | Soru bankası (440 kontrol), kapsam soruları, ön koşul bağımlılıkları, kritiklik ağırlıkları, olgunluk çarpanları ve basamak eşiği yönetilir. Excel ve JSON ile içe/dışa aktarım yapılabilir. |

## Build

Gerekenler: Node.js 20 veya üstü (22 önerilir). Python yalnızca şablon dönüştürme aracı için gerekir.

```bash
npm ci
QA_ADMIN_PASSWORD='uzun-ve-tahmin-edilemez-bir-parola' npm run build
```

Çıktılar `_build/` klasörüne yazılır (git'e girmez):

| Dosya | Açıklama |
|---|---|
| `_build/Siber_Olgunluk_Analiz_Paneli.html` | Analiz Paneli (~1,3 MB). Danışmanlara bu dosya verilir. |
| `_build/Kimlik_Dogrulayici.html` | İki adımlı doğrulama kodlarını üreten çevrimdışı uygulama. |

- **`QA_ADMIN_PASSWORD` zorunludur** ve en az 8 karakter olmalıdır; aksi hâlde build hata verip durur. Gerçek kullanım için 12+ karakterlik güçlü bir parola seçin (12'den kısa parolada build uyarı verir).
  - Parola dosyaya hiçbir biçimde (açık metin ya da özet olarak) yazılmaz.
  - Panelin tüm içeriği bu parolayla şifrelenir: PBKDF2-SHA256 600 000 tur → AES-256-GCM.
  - Parolayı repoya, commit mesajına veya CI günlüğüne yazmayın; CI'da secret olarak tanımlayın.
- **Parolayı değiştirmek** için yeni parolayla yeniden build alıp yeni dosyayı dağıtın. Eski dosyada kurulmuş iki adımlı doğrulama yeni dosyaya taşınmaz, yeniden kurulmalıdır.
- `QA_BUILD_OUT` ortam değişkeni ya da `--out <klasör>` ile çıktı klasörü değiştirilebilir.
- Build kendi denetimlerini de yapar:
  - Her gömülü betik sözdizimi denetiminden geçer.
  - Panelin şifresiz kabuğunda soru bankası veya iç mantık izi aranır.
  - Ankette ağ erişimi izi aranır.
  - Kimlik Doğrulayıcı'da da aynı ağ izi taraması yapılır.

### Dağıtım oluşturma (arayüzlü)

Danışmanlara verilecek dosyayı üretmenin en kolay yolu repo kökündeki `dagitim_olustur.py` betiğidir. Windows'ta çift tıklayın ya da şu komutu çalıştırın:

```
python dagitim_olustur.py
```

Açılan pencerede yapmanız gerekenler:

1. Parolayı iki kez girin (en az 12 karakter). Güç göstergesi parolayı değerlendirir.
2. **Dağıtımı Oluştur** düğmesine basın.

Betik şunları kendisi yapar:

- Node.js'i denetler (20 veya üstü gerekir).
- Gerekirse bağımlılıkları kurar (`npm ci`).
- Paneli derleyip `dagitim/Analiz_Paneli_v<sürüm>_<tarih>/` klasörüne yazar: panel, Kimlik Doğrulayıcı ve `OKUBENI.txt`. İş bitince klasörü açar.

Parola derlemeye yalnızca ortam değişkeniyle verilir. Hiçbir dosyaya, günlüğe ya da komut satırına yazılmaz; derleme sonunda çıktıda bulunmadığı ayrıca denetlenir. `dagitim/` klasörü git'e girmez. Pencere kullanmak istemezseniz konsol kipi de var: `python dagitim_olustur.py --konsol`.

### Repo kökündeki test derlemesi

Geliştirme sürecinde repo kökündeki `Siber_Olgunluk_Analiz_Paneli.html` ve `Kimlik_Dogrulayici.html` her değişiklikte
**ekiple paylaşılan test parolasıyla** yeniden üretilir (`node scripts/build.mjs --out .`); denemek için build almaya gerek yoktur.
Bu dosyalar yalnızca test içindir — danışmanlara veya müşteriye verilecek dosyayı kendi güçlü parolanızla `_build/` altına üretin.

## Sürüm kuralı

Sürüm tek kaynaktan yönetilir: `src/panel/version.js` (`APP_VERSION` + `APP_CHANGELOG`).
- Her yayında sürüm numarasını artırın ve `APP_CHANGELOG`'a bir satır ekleyin.
- Sürüm panelin alt bilgisinde, üretilen ankette ve raporlarda görünür.
- Mevcut sürüm **2.0**.

## Kullanım

### Giriş ve iki adımlı doğrulama (MFA)

1. Panel dosyasını açın ve parolayı girin. 5 hatalı denemede giriş 5 dakika kilitlenir. 30 dakika işlem yapılmazsa oturum kapanır.
2. İki adımlı doğrulamayı kurmak için:
   1. Panelde **Güvenlik** bölümünü açın.
   2. `Kimlik_Dogrulayici.html` uygulamasında **Hesap Ekle** deyip gösterilen otpauth bağlantısını yapıştırın (telefon uygulaması kullanıyorsanız QR kodu okutun).
   3. Uygulamanın ürettiği 6 haneli kodu ve panel parolasını girip **Doğrula ve Etkinleştir** deyin.
   4. İki adımlı doğrulama içeren **yeni panel dosyası** iner. Eski dosyayı silip yenisini kullanın.
3. Kurulumdan sonra girişte parolaya ek olarak 6 haneli kod istenir. Kodlar TOTP'dir (RFC 6238, SHA1, 30 sn, ±1 adım) ve aynı kod ikinci kez kullanılamaz.
4. Anahtarı yenilemek veya iki adımlı doğrulamayı kapatmak da **Güvenlik** bölümünden yapılır ve yine yeni bir dosya indirir.

> Çevrimdışı tek dosyada ikinci adım bir **işletim kontrolüdür**. Dosyayı ve parolayı birlikte ele geçiren birine karşı asıl koruma parolayla yapılan şifrelemedir. Bu yüzden güçlü bir parola seçin.

### Anket üretimi

- **Anket Üretimi**'nde çerçeve, hedef soru sayısı, kurum adı, dosya etiketi ve dönüş e-postasını seçip **Anketi Üret ve İndir** deyin.
- Ankete yalnızca gereken bilgi gider:
  - Kapsam kombinasyonlarının (2⁴ = 16) her biri için panelde önceden hesaplanmış alan planı.
  - Bu planlarda geçen soruların metinleri ve cevap şıkları.
- Ankete gitmeyenler: kritiklik ağırlıkları, mevzuat eşlemeleri, bağımlılıklar, seçim ve puanlama kodu, banka sürümü ve iç dosya etiketi.
- Katılımcının çelişkili cevaplarında gösterilen anlık uyarılar ankette kalır.
- Anket ağ erişimi kapalı çalışır (CSP `connect-src 'none'`). Sonunda katılımcının iletişim bilgisi alınır, cevaplar cihazda AES-256-GCM ile şifrelenip indirilir.
- Katılımcı dosyayı e-postayla, 8 haneli açma şifresini ayrı bir kanaldan (telefon/SMS) iletir.
- Üretilen her anketin soru seti kaydı bu tarayıcıda tutulur. Cevap dosyası geldiğinde puanlama bu kayıttan yapılır; kayıt bulunamazsa güncel bankaya dönülür.
  - Cevap dosyası soru başına yalnızca kimlik, metin ve cevap taşır.
  - Kritiklik ve olgunluk değerleri dosyadan alınmaz; böylece dosya üzerinde oynanarak skor değiştirilemez.

### Anket analizi ve raporlar

- Değerlendirme Merkezi'ndeki alana cevap dosyasını bırakın, şifreyi girin ve Enter'a basın.
- **Tutarsızlık kontrolleri:**
  - Aynı konuda çelişkili beyan (ör. «envanter oluşturulmamış» ↔ «varlık sahipleri atanmış»).
  - Konular arası ön koşul kuralları.
  - Bağımlılık kapıları.
  - Yanıt örüntüsü anomalileri.
- İşaretlenen sorular **Kanıt İncelemesi**'ne düşer ve karar verilene kadar skora girmez. Olası kararlar: kanıt kabul, reddet, danışman seviyesi ata.
- **Word Raporu**:
  - Scale şablonundan (`assets/Rapor_Sablonu_Scale.dotx`) üretilir.
  - Kapak, fikri mülkiyet sayfası, içindekiler, yönetici özeti, metodoloji, İnsan/Süreç/Teknoloji, kontrol alanları, olgunluk merdiveni, mevzuat ve öncelikler bölümlerini içerir.
  - Değerlendirme Notları bölümü yalnızca tespit varsa açılır.
  - EK-1 Soru / Cevap tablosu vardır. Tüm tablolardaki «Soru No» bu tabloya bağlanır.
- **HTML İnfografik Rapor**:
  - Tek dosyadır ve ağ erişimi kapalı çalışır.
  - Göstergeler, radar, ısı haritası, olgunluk merdiveni, kritiklik × olgunluk matrisi ve öncelik şeritleri içerir.
  - İç bağlantılar ve EK-1 süzgeci vardır; yazdırılıp PDF'e çevrilebilir.

### Soru Yönetimi

- Soru ekle/düzenle/sil ekranında şunlar düzenlenir: kimlik, UCT/NIST alanı, kapsam etiketi, başlık, soru, kritiklik, olgunluk basamağı, arketip (cevap şablonu), konu, mevzuat ve ön koşullar.
- Düzenlemeler bu tarayıcıda saklanır. Başka bir bilgisayara taşımak için **Yedek İndir (JSON)** kullanın; yedek bankayı, ağırlıkları ve anket üretim kayıtlarını içerir. **Varsayılana Dön** build ile gelen bankaya döner.
- **Excel düzeni** repodaki kaynak çalışma kitaplarıyla aynıdır:
  - `UCT_Sorular_MevcutDurum_v3.xlsx` → **Sorular**
  - `UCT_Cevap_Setleri_v3.xlsx` → **Sablonlar**
  - `Unified_Controls_Taxonomy_v2.xlsx` → **Bagimliliklar**, **Kapsam_Bayraklari**, **Agirliklar**, **Olgunluk_Carpanlari**
- Bu kitaplar doğrudan içe aktarılabilir. Yüklemeden önce eklenecek, değişecek ve silinecek soru sayısı onaya sunulur; hatalı kitap reddedilir.
- Build ile gelen varsayılan banka `src/data/bank.json`'dur. Kalıcı değişiklik için bu dosyayı güncelleyip yeniden build alın.

## Testler

```bash
npx playwright install chromium   # bir kez; tarayıcı kuruluysa gerekmez
npm test                          # ya da: node tests/run.mjs t7  (yalnız bir test)
```

`npm test` önce bilinen bir test parolasıyla `_build/test/` altına ayrı bir build alır; gerçek parolaya ihtiyaç duymaz. Testler:

| Test | Kapsam |
|---|---|
| `t1_anket_dongusu` | Anket üret → doldur → şifreli cevap → panelde çöz (UCT ve NIST), yanlış şifre |
| `t2_giris_2fa` | Parola kapısı, kabukta iç bilgi yok, 5 hata kilidi, 2FA kur/giriş/kod tekrarı/kapat |
| `t3_totp_kimlik_dogrulayici` | RFC 6238 test vektörleri (SHA1/256/512), Kimlik Doğrulayıcı ile kod uyumu |
| `t4_temiz_anket_butunluk` | Ankette mevzuat/ağırlık/kod yok; cevap dosyası içeriği; değiştirilmiş dosya skoru etkilemiyor |
| `t5_soru_yonetimi` | Ekle/düzenle/sil, doğrulama, Excel ve yedek gidiş-dönüşü, repo kitaplarıyla uyum |
| `t6_tutarsizlik` | Aynı konu çelişkisi kuralları, kanıt incelemesi akışı |
| `t7_raporlar` | Word ve HTML raporlar, LibreOffice ile PDF'e dönüşüm, kırık iç bağlantı 0 |

Tüm uçtan uca testler konsol hatası, CSP ihlali ve ağ isteği olmadığını da denetler.

## Dizin yapısı

```
src/panel/      panel: giriş kapısı (gate.*), arayüz (body.html, panel.css), mantık (panel.js),
                seçim motoru (selection.js), banka katmanı (bankstore.js), Soru Yönetimi (bankedit.js),
                güvenlik/2FA (security.js), raporlar (reportmodel.js, report_word.js, report_html.js),
                sürüm (version.js)
src/survey/     müşteri anketi şablonu
src/shared/     ortak kurallar (rules.js: anomali + çelişki), TOTP (totp.js)
src/auth/       Kimlik Doğrulayıcı
src/data/       varsayılan soru bankası (bank.json)
assets/         Word rapor şablonu ve kaynak görselleri
scripts/        build
tools/          rapor şablonunu Scale'e dönüştüren tek seferlik araçlar
tests/          Playwright uçtan uca testleri
olgunluk-v1.6-guncelleme/  CyberArts için hazırlanan v1.6 paketi (yalnız örnek/kaynak)
```

## Açık konular

- **Rapor künyesi:** Word ve HTML raporlarda adres ve e-posta yer tutucudur (`[Ofis adresi eklenecek]`, `[e-posta adresi]`). Kurum unvanı «Scale Teknoloji ve Danışmanlık» olarak yazıldı; doğrulanmalı.
  - Unvan ve iletişim bilgileri `tools/sablon_scale.py` ve `src/panel/reportmodel.js` (`RPT`) içinde güncellenir.
  - Kapak ve logo panelin renk ve yazı tipleriyle üretilmiş geçici görsellerdir; resmî logo `assets/sablon/` altına konup `python3 tools/sablon_scale.py` çalıştırılır.
- **Eski gizli bilgiler:** Git geçmişinde gerçek SMTP şifreleri ve imza anahtarı (eski `_to_delete/otp-servisi.php`) ile v1.6 paketinin yönetici parolası açık durur. Repo herkese açık; bu bilgilerin değiştirilmesi ve reponun özel (private) yapılması önerilir.
- **SheetJS:** `xlsx@0.18.5`, npm'deki son sürümdür ve bilinen iki açığı vardır (CVE-2023-30533, CVE-2024-22363). Yalnızca panel içinde, danışmanın kendi seçtiği Excel dosyası okunurken etkilidir.
