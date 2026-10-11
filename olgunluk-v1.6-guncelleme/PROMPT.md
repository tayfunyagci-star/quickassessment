# Görev: Hızlı Olgunluk Değerlendirmesi — v1.6 güncellemelerini repodaki sürümle karşılaştırarak, onayımla aktar

Bu repodaki **Hızlı Siber Güvenlik Olgunluk Değerlendirmesi** uygulaması, ayrı bir çalışma oturumunda `baseline/` altındaki dosyadan (v1.0) başlanarak v1.6'ya kadar geliştirildi. **Repodaki sürüm bu baz dosyayla birebir aynı değildir**; repoda o oturumda bilinmeyen değişiklikler olabilir. Bu nedenle değişiklikleri körlemesine kopyalama: önce üç yönlü karşılaştırma yap, sonra her değişiklik grubunu bana sorarak sırayla uygula.

## Paket içeriği

| Yol | İçerik |
|---|---|
| `src/` | Modüler kaynak: `core.js`, `full.js`, `report.js`, `htmlreport.js`, `totp.js`, `body.html`, `app.css`, `tokens.css`, `tema.js`, `questions.json`, `build.py`; Kimlik Doğrulayıcı için `auth.*`, `build_auth.py` |
| `template/Template_v2.dotx` | Word raporunun şablonu (kapak, fikri mülkiyet sayfası, alt bilgi, stiller). Build sırasında base64 olarak gömülür. |
| `tests/` | Playwright uçtan uca testleri (`t1`–`t8`) ve TOTP RFC 6238 test vektörleri (`totp_test.mjs`) |
| `baseline/Hizli_Olgunluk_Degerlendirmesi_v1.0_baz.html` | Geliştirmenin başladığı dosya (ortak ata). Repodaki sürümle karşılaştırmanın referansıdır. |
| `dist/` | Referans çıktılar: `Hizli_Olgunluk_Degerlendirmesi_v1.6.html`, `Kimlik_Dogrulayici_v1.0.html`, örnek HTML ve Word rapor. Build sonucunu bunlarla karşılaştır. |

## Çalışma şekli — önce karşılaştır, sonra sorarak ilerle

**Aşama 0 — Keşif (değişiklik yapma).** Repoyu incele: uygulamanın repodaki yeri, varsa build/CI, dizin yapısı, dal ve commit kuralları, README. Yeni bir dal aç (örn. `feature/olgunluk-v1.6`); bu aşamada dosyaya dokunma.

**Aşama 1 — Üç yönlü karşılaştırma raporu (değişiklik yapma).**
- **Taraflar:** ortak ata (`baseline/…v1.0_baz.html`), repodaki sürüm ve paketteki v1.6 (`src/` ile `dist/…v1.6.html`).
- **Yöntem:** Satır satır diff yerine işlev ve davranış düzeyinde karşılaştır. v1.6 modüler yapıda olduğu için satır diff'i anlamsız olur.
- **Rapor tablosu:** Her kalem şu sütunlarla yer alsın: *alan / baz / repo / v1.6 / durum / önerim*. Durum şunlardan biri olsun:
  - **Yalnız repoda:** Repoda bazdan sonra yapılmış, v1.6'da olmayan değişiklik (soru seti, metinler, mevzuat eşlemeleri, puanlama, arayüz, yeni özellik, hata düzeltmesi vb.). Bunlar **korunmalı** ve v1.6'ya taşınmalı.
  - **Yalnız v1.6'da:** Aşağıdaki sürüm özetindeki değişiklikler.
  - **Çakışma:** Aynı alan iki tarafta farklı değişmiş (ör. soru metni, etki seviyesi, mevzuat maddesi, parola, puanlama kuralı, rapor metni).
  - **Aynı:** Değişmemiş; kısaca say.
- **Özellikle karşılaştır:** `DEFAULT_QUESTIONS`, yani soru sayısı, id'ler, metinler, etki seviyeleri ve `regulatory` eşlemeleri. Soru id'leri ve sırası değişmişse bunu ayrıca belirt; uyumsuzluk kuralları (`RX`, `SCOPE_RULES`, `DEP_RULES` in `full.js`) soru id + anahtar kelimeyle eşlenir ve etkilenebilir.
- Raporu bana sun ve **dur**. Ondan sonraki her adım için onayımı bekle.

**Aşama 2 — Grup grup uygulama (her grup için ayrı onay).** Çakışmalarda hangi tarafın alınacağını tek tek sor; varsayılan olarak repodaki içeriği koru. Önerilen sıra:
1. Altyapı: modüler kaynak + build + bağımlılıklar + parolanın ortam değişkenine taşınması (aşağıdaki "Mutlaka düzelt").
2. Repoya özgü değişikliklerin v1.6 kaynağına taşınması (soru seti ve diğer "yalnız repoda" kalemleri).
3. v1.1: modül ayrımı, soru seti doğrulaması, Word rapor.
4. v1.2: TOTP iki adımlı doğrulama + Kimlik Doğrulayıcı.
5. v1.3: etki adları, öncelik sınıfları, bantlar, uyumsuzluk notları, gizlilik beyanı, CSP.
6. v1.4: arayüz / Değerlendirme Merkezi.
7. v1.5–v1.6: Soru No referansları, HTML infografik rapor.

Her grubun sonunda build al, ilgili testleri çalıştır, ne değiştiğini ve test sonucunu kısaca raporla, sonra bir sonraki grup için onay iste. Her grup ayrı commit olsun.

**Sürüm numarası:** Repodaki sürüm v1.0'dan farklıysa bu entegrasyonun sürümünü bana sor. Repoya özgü değişiklikler varken "v1.6" demek yanlış olabilir.

## Mimari (korunmalı)

- **Tek dosya, çevrimdışı.** Dağıtılan çıktı tek bir HTML'dir. Fontlar (IBM Plex Sans/Mono, Space Grotesk; latin + latin-ext), JSZip 3.10.1, SheetJS 0.18.5 *mini*, qrcode-generator 1.4.4 ve Word şablonu dosyanın içine gömülüdür. CDN yok.
- **CSP:** `connect-src 'none'` dahil, ağ erişimi kapalıdır. Raporda "kurumsal bilgiler hiçbir yapay zekâ platformuna aktarılmadı" beyanı buna dayanır; **gevşetme.**
- **İki modül, tek kaynak:**
  - `qaCore` (core.js): müşteri anketi ve ortak kod. Müşteri modülüne olduğu gibi gider. `regulatory` kelimesi geçmemeli; build bunu kontrol eder.
  - `data-full` işaretli tüm öğeler ve betikler (yönetim, puanlama, rapor, kütüphaneler, şablon, TOTP) yalnız dahili modülde bulunur.
  - Müşteri modülü, sayfanın ilk kaynağından (`window.__QA_PRISTINE`) `[data-full]` öğeleri silinerek üretilir. Ardından sızıntı kontrolü yapılır: `ADMIN_HASH`, `computeResults`, `QA_REPORT`, `JSZip`, `regulatory` vb. geçerse üretim durur.
  - `data-client` öğeleri (müşteri açılış ekranı) dahili modülde `html.mod-tam` ile gizlenir.
- **Sürüm tek kaynak:** `core.js` içindeki `APP_VERSION` ve `APP_CHANGELOG`. Ekranda sağ altta rozet olarak, raporlarda da yazılı.
- **Tasarım:** arayuz-tasarim-sistemi belirteçleri (`tokens.css` olduğu gibi). Koyu/aydınlık tema `html[data-theme]` + `localStorage["arayuz-tema"]` ile yönetilir. Arayüz veri paleti ıraksak mavi↔kırmızı; Word/HTML raporu ise kırmızı→yeşil (bilinçli; açık karar aşağıda).

## Sürüm özeti (CHANGELOG'a işle)

- **v1.1**
  - Word (DOCX) rapor `Template_v2.dotx` şablonundan üretiliyor; PDF raporu kaldırıldı.
  - Müşteri modülü fiziksel olarak ayrıştırıldı.
  - Yönetici girişi zorunlu hâle geldi.
  - Cevap dosyası soru setinin kopyasını ve SHA-256 parmak izini taşıyor; üretilen anketlerin soru setleri tarayıcıda kayıtlı tutuluyor. Soru seti uyuşmazlığında uyarı gösteriliyor.
  - Kütüphaneler ve fontlar gömüldü (çevrimdışı çalışır).
- **v1.2**
  - Yönetici girişine TOTP iki adımlı doğrulama eklendi (RFC 6238; SHA1, 6 hane, 30 sn, ±1 adım).
  - Gizli anahtar yönetici parolasıyla şifrelenip (PBKDF2-SHA256 250k → AES-256-GCM) `TOTP_VAULT` olarak dosyaya gömülüyor. Etkinleştirmek veya kapatmak uygulamanın kendi kopyasını yeniden indirir.
  - Aynı kod ikinci kez kullanılamıyor; 5 hatalı denemede giriş 5 dakika kilitleniyor.
  - Ayrı **Kimlik Doğrulayıcı** HTML uygulaması eklendi (`build_auth.py`).
- **v1.3**
  - Etki seviyeleri yeniden adlandırıldı: Çok Yüksek / Yüksek / Orta / Düşük Etki. Eski adlar `normalizeImpact` ile otomatik çevriliyor.
  - Öncelik sınıfları "1./2./3. Öncelik" oldu.
  - Seviye bantları asgari eşikle hizalandı: <2, 2–2,9, 3–3,9, 4–4,4, ≥4,5.
  - Cevaplar arası uyumsuzluk kontrolleri eklendi: kapsam çelişkisi, ön koşul, boyut farkı, yanıt örüntüsü (`detectInconsistencies`, sorular id + anahtar kelimeyle eşlenir). Raporda yalnız tespit varsa "Değerlendirme Notları" bölümü açılıyor.
  - Rapora veri gizliliği beyanı eklendi; ifadeler müşteriye karşı nazik dile çekildi.
- **v1.4**
  - Arayüz arayuz-tasarim-sistemi'ne geçirildi.
  - Dahili açılış ekranı "Değerlendirme Merkezi" oldu: anket değerlendirme (sürükle-bırak alanı + Dosya Seç düğmesi), soru yönetimi ve anket üretimi.
  - İç deneme değerlendirmesi ve örnek sonuç ekranının girişleri kaldırıldı.
- **v1.5**
  - Word raporunda kontrol geçen tablolara "Soru No" sütunu eklendi (EK-1 numaralandırması).
  - HTML infografik rapor eklendi (`htmlreport.js`): göstergeler, radar, ısı haritası, risk matrisi, öncelik şeritleri; bölüm/alan/soru arası çift yönlü iç bağlantılar; Soru/Cevap süzgeci.
- **v1.6** — HTML raporda regülasyon kartlarının durum rozeti tam genişlikte alta taşındı.

## Mutlaka düzelt

1. **Parola kaynak kodda açık:** `src/build.py` içinde `hashlib.sha256("qa-admin|tayfun2026")` var. Bunu ortam değişkenine (ör. `QA_ADMIN_PASSWORD`) veya CI secret'ına taşı. Değişken yoksa build hata versin. Parolayı repoya, commit mesajına veya loglara yazma. Git geçmişinde v1.0 HTML'i varsa parola (`ADMIN_PASSWORD = "tayfun2026"`) zaten geçmişte açık duruyor; bunu bana raporla, geçmişi kendiliğinden yeniden yazma.
2. **Yollar:** `build.py` kütüphaneleri `../libs` altında arar. Reponun yapısına göre yolları düzelt ve bağımlılıkları sabit sürümle tanımla:
   - `jszip@3.10.1` → `dist/jszip.min.js`
   - `xlsx@0.18.5` → `dist/xlsx.mini.min.js`
   - `qrcode-generator@1.4.4` → `qrcode.js`
   - `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `@fontsource/space-grotesk` (woff2, latin + latin-ext)
   Önerim: `package.json` devDependencies + `npm ci`; build betiği dosyaları `node_modules`'tan okusun.
3. Şablonun yolu `build.py`'ye argüman olarak geçiliyor. Repoda kalıcı bir konuma koy (ör. `assets/Template_v2.dotx`) ve varsayılan yap.
4. Testlerdeki `/opt/pw-browsers/chromium` ve göreli dosya yollarını reponun test düzenine uyarla. Varsa CI'a ekle.

## Kabul kriterleri

- [ ] `build` iki çıktı üretir: `Hizli_Olgunluk_Degerlendirmesi_v1.6.html` (~1,5 MB) ve `Kimlik_Dogrulayici_v1.0.html`.
- [ ] `node --check` her gömülü betikte geçer; tarayıcıda konsol hatası ve CSP ihlali yok.
- [ ] `totp_test.mjs`: RFC 6238 vektörlerinin hepsi (SHA1/256/512) geçer.
- [ ] Uçtan uca senaryolar (t1–t8 kapsamı):
  - Yönetici kapısı: parola yanlış/doğru ve `#admin` adresi.
  - Müşteri anketi üretimi; çıktıda sızıntı tokenı yok, CSP var.
  - Anket doldurma → şifreli cevap → sürükle-bırak veya dosya seçerek içe aktarma.
  - Soru seti eşleşme durumları: `issued` / `legacy` / `snapshot`.
  - Uyumsuzluk notları (29/30 tedarikçi, 24/25 yedek, 27/28 SOC, boyut farkı).
  - Word raporu: LibreOffice ile PDF'e dönüşür; Tablo 10/11'de "Soru No" var.
  - HTML rapor: kırık iç bağlantı 0.
  - 2FA kur → yeni dosyada parola + OTP ile giriş; aynı kodun tekrarı ve 5 hata kilidi.
  - Excel içe/dışa aktarım; etki adları yeni adlarla gelir.
- [ ] Build çıktısı, onaylanan repo-özgü farklar dışında işlev olarak `dist/` referanslarıyla aynı. Görsel karşılaştırma için Değerlendirme Merkezi, anket ekranı ve sonuç ekranının ekran görüntüsünü al.
- [ ] README güncellendi: build adımları, ortam değişkeni, sürüm kuralı, 2FA kurulum akışı, müşteri modülü üretimi.

## Dokunma

- Puanlama formülü (etki ağırlıkları 4/3/2/1, yanıtsız = 1, kapsam dışı hesaba katılmaz), seviye bantları ve öncelik kuralları.
- Rapor metinleri ve bölüm sırası; Word raporunun siyah-beyaz tablo + renkli grafik kuralı.
- Şifreleme parametreleri (cevap dosyası: PBKDF2 150k / AES-256-GCM; 8 haneli şifre bilerek değiştirilmedi).
- `questions.json`: paketteki dosya baz soru setinden türetildi (etki adları yeni adlara çevrildi, çift tırnaklar temizlendi). Repodaki soru seti farklıysa **repodakini esas al** ve yalnız bu iki dönüşümü ona uygula — önce bana sor.

## Açık kararlar (yalnız raporla, uygulama)

- Rapor grafiklerinin mavi↔kırmızı palete geçirilip geçirilmeyeceği.
- HTML rapor alt bilgisinde CyberArts künyesi var (Word şablonundan). Scale Teknoloji markasıyla kullanılacaksa değişmeli.
- v1.2'de 2FA kurulduysa, yeni sürüm dosyasında kurulum tekrarlanmalı. İstenirse eski dosyadan `TOTP_VAULT` taşıma aracı eklenebilir.

İş bitince (tüm onaylı gruplar uygulandıktan sonra): değişen dosyaların listesi, test çıktıları, varsa sapmalar ve açık kararlar için kısa bir özet ver. Commit ve PR açıklamalarını Türkçe yaz.
