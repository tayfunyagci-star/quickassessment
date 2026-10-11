/* =====================================================================
   SÜRÜM — tek kaynak. Panelin alt bilgisinde, üretilen anketlerde ve
   raporlarda bu değer yazılır. Her sürümde APP_CHANGELOG'a satır ekleyin.
   ===================================================================== */
const APP_VERSION = "2.0";
const APP_CHANGELOG = [
  { v:"2.0", date:"2026-10-11", notes:"Panel modüler kaynağa ve build'e taşındı; fontlar gömüldü, CSP ile ağ erişimi kapatıldı. Site yayını (OTP/e-posta servisi) kaldırıldı; anket yalnızca çevrimdışı çalışır. Panel içeriği parolayla şifreli gömülür (PBKDF2 600k / AES-256-GCM); isteğe bağlı iki adımlı doğrulama (TOTP) ve Kimlik Doğrulayıcı uygulaması. Açılış ekranı Değerlendirme Merkezi: sürükle-bırak ile anket analizi, Anket Üretimi, Soru Yönetimi. Müşteri anketi yalnız gereken metinleri taşır (kapsam planları önceden hesaplanır; ağırlık, mevzuat ve seçim kodu ankette yok); cevap dosyası yalnız soru kimliği, metin ve cevap içerir, puanlama değerleri panelde üretim kaydından veya bankadan okunur. Soru Yönetimi: soru ekleme/düzenleme/silme, ön koşullar, kapsam soruları; repodaki UCT çalışma kitaplarıyla uyumlu Excel ve JSON yedek içe/dışa aktarımı. Tutarsızlık analizine «aynı konuda çelişkili beyan» kuralı eklendi (ör. envanter yok ↔ varlık sahipleri atanmış)." }
];
