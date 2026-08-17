<?php
/**
 * SCALE TEKNOLOJİ — SİTE GENELİ OTP + TALEP + DEĞERLENDİRME SERVİSİ (tek dosya)
 * ====================================================================
 * Bu servis sitenin tamamı tarafından paylaşılır:
 *   /yukumluluk/      → doğrulama kodu, lead kaydı, talep formları
 *   /degerlendirme/   → hızlı değerlendirme anketinin şifreli cevap paketi
 *
 * KURULUM (Hostinger):
 *  1) Bu dosyayı sitenin KÖK klasörüne (index.html ile aynı yere) yükleyin.
 *     Mail şablonları da aynı klasörde olmalıdır:
 *       mail-sablonu-dogrulama-kodu.html
 *       mail-sablonu-talep.html · mail-sablonu-talep-teyit.html
 *       mail-sablonu-degerlendirme.html · mail-sablonu-degerlendirme-teyit.html
 *     Alt klasörlerdeki sayfalar servise "../otp-servisi.php" ile erişir.
 *  2) SMTP_SIFRE alanına noreply@scaleteknoloji.com posta kutusunun şifresini yazın.
 *  3) GIZLI_ANAHTAR alanına rastgele uzun bir metin yazın (40+ karakter).
 *  4) TEST: Bu dosyayı tarayıcıda GET ile açın (…/otp-servisi.php) —
 *     {"ok":true,"servis":"ayakta",...} JSON'u görmelisiniz.
 *
 * API (JSON POST):
 *  {action:"send",   email}                    → {ok:true, token, exp}
 *  {action:"verify", email, code, token, exp}  → {ok:true} | {ok:false, error}
 *  {action:"lead",   ...profil alanları}       → {ok:true}  (veri/leads.jsonl'e ekler)
 *  {action:"degerlendirme", email, telefon, kurum, code, token, exp,
 *                     dosyaAdi, zarf, ozet}      → {ok:true}
 *        Şifreli anket paketini doğrulanmış e-posta ile birlikte TALEP_ALICI
 *        adresine EK olarak gönderir ve veri/degerlendirme/ altına kaydeder.
 *        Paketin açma şifresi sunucuya HİÇBİR ZAMAN gönderilmez.
 *
 * Not: PHP 7.0 ve üzeri tüm sürümlerle uyumludur (ok-fonksiyonu vb. yeni sözdizimi
 * bilinçli olarak kullanılmamıştır).
 */

/* ================= AYARLAR =================
   DİKKAT: Şifre ve anahtarı TEK TIRNAK içinde tutun. Çift tırnak kullanılırsa
   içlerindeki $ karakteri PHP tarafından değişken sanılır ve servis 500 hatasıyla
   çöker (bu, ilk kurulumda yaşanan hatanın nedeniydi). */
const SMTP_SUNUCU   = 'smtp.hostinger.com';
const SMTP_PORT     = 465;                          // SSL
const SMTP_KULLANICI= 'noreply@scaleteknoloji.com';
const SMTP_SIFRE    = '07Ek4220.';
const GONDEREN_AD   = 'Scale Teknoloji ve Danışmanlık';
const GIZLI_ANAHTAR = 'K9#mP2$vX7!zQ1@wN8*bY3(cT6)xS0_dG5-hJ2+kF1=aE9^uI4';
const GECERLILIK_DK = 10;                           // kod geçerlilik süresi (dakika)
const SAATLIK_LIMIT = 5;                            // aynı e-postaya saatte en çok kod

/* Talep akışı (Danışmanlık Al / Fiyat Teklifi / Toplantı Planla):
   müşteriyle gelen-giden tüm talep e-postaları webrequest hesabını kullanır.
   TALEP_SMTP_SIFRE'ye webrequest posta kutusunun şifresini yazın (hPanel → E-postalar).
   Şifre boş bırakılırsa talep mailleri geçici olarak noreply hesabından gönderilir. */
const TALEP_ALICI        = 'webrequest@scaleteknoloji.com'; // taleplerin düştüğü kutu
const TALEP_SMTP_KULLANICI = 'webrequest@scaleteknoloji.com';
const TALEP_SMTP_SIFRE     = '07Ek4220.';                            // <-- webrequest kutusunun şifresi (TEK TIRNAK içinde)

/* Hızlı Değerlendirme anketi: şifreli cevap paketinin düştüğü kutu ve
   kabul edilen azami paket boyutu (base64 şifreli metin, bayt). */
const DEG_ALICI      = TALEP_ALICI;
const DEG_MAX_BAYT   = 4 * 1024 * 1024;
/* =========================================== */

ini_set("display_errors", "0");
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");

/* Ölümcül hatalar sessiz 500 yerine JSON dönsün (teşhis kolaylığı) */
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e["type"], array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR), true)) {
        if (!headers_sent()) { http_response_code(500); header("Content-Type: application/json; charset=utf-8"); }
        echo json_encode(array("ok" => false, "error" => "Sunucu hatası: " . $e["message"] . " (satır " . $e["line"] . ")"), JSON_UNESCAPED_UNICODE);
    }
});

function yanit($arr, $kod = 200) { http_response_code($kod); echo json_encode($arr, JSON_UNESCAPED_UNICODE); exit; }

/* Sağlık kontrolü: tarayıcıdan GET ile açılınca durum raporu */
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    yanit(array(
        "ok"          => true,
        "servis"      => "ayakta",
        "php"         => PHP_VERSION,
        "smtp_ayarli" => SMTP_SIFRE !== "BURAYA-POSTA-SIFRESI",
        "sablon_var"  => is_file(__DIR__ . "/mail-sablonu-dogrulama-kodu.html"),
        "sablon_degerlendirme" => is_file(__DIR__ . "/mail-sablonu-degerlendirme.html"),
        "ssl_destegi" => in_array("ssl", stream_get_transports(), true),
        "talep_hesabi_ayarli" => TALEP_SMTP_SIFRE !== "",
    ));
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") yanit(array("ok" => false, "error" => "Yalnızca GET (durum) ve POST kabul edilir."), 405);

$girdi = json_decode(file_get_contents("php://input"), true);
if (!is_array($girdi) || empty($girdi["action"])) yanit(array("ok" => false, "error" => "Geçersiz istek."), 400);

$action = $girdi["action"];
$email  = isset($girdi["email"]) ? strtolower(trim($girdi["email"])) : "";

/* ---------- yardımcılar ---------- */
function gecici($ad) { return sys_get_temp_dir() . "/scale_otp_" . $ad; }

function hiz_limiti_asildi($email) {
    $dosya = gecici("hiz_" . md5($email));
    $kayitlar = is_file($dosya) ? array_filter(explode("\n", file_get_contents($dosya))) : array();
    $simdi = time();
    $taze = array();
    foreach ($kayitlar as $t) { if (($simdi - (int)$t) < 3600) $taze[] = (int)$t; }
    if (count($taze) >= SAATLIK_LIMIT) return true;
    $taze[] = $simdi;
    file_put_contents($dosya, implode("\n", $taze));
    return false;
}

function imza($email, $kod, $exp) { return hash_hmac("sha256", $email . "|" . $kod . "|" . $exp, GIZLI_ANAHTAR); }

/* $ekler: array( array("ad"=>"dosya.json", "mime"=>"application/json", "icerik"=>"<ham veri>") , ... )
   Ek verilmezse tek parçalı text/html, verilirse multipart/mixed gövde kurulur. */
function smtp_gonder($aliciEmail, $konu, $htmlGovde, &$hata, $replyTo = null, $hesap = null, $sifre = null, $ekler = array()) {
    if ($hesap === null || $sifre === null || $sifre === "") { $hesap = SMTP_KULLANICI; $sifre = SMTP_SIFRE; }
    $sock = @stream_socket_client("ssl://" . SMTP_SUNUCU . ":" . SMTP_PORT, $errno, $errstr, 15);
    if (!$sock) { $hata = "SMTP bağlantısı kurulamadı: $errstr"; return false; }
    stream_set_timeout($sock, 15);
    $oku = function () use ($sock) {
        $satir = "";
        while (($s = fgets($sock, 512)) !== false) { $satir = $s; if (strlen($s) < 4 || $s[3] !== "-") break; }
        return $satir;
    };
    $komut = function ($cmd, $beklenen) use ($sock, $oku, &$hata) {
        if ($cmd !== null) fwrite($sock, $cmd . "\r\n");
        $cevap = $oku();
        if (strpos($cevap, (string)$beklenen) !== 0) { $hata = "SMTP hatası: " . trim($cevap); return false; }
        return true;
    };
    $alan = explode("@", $hesap); $alan = $alan[1];
    if (!$komut(null, 220)) return false;
    if (!$komut("EHLO " . $alan, 250)) return false;
    if (!$komut("AUTH LOGIN", 334)) return false;
    if (!$komut(base64_encode($hesap), 334)) return false;
    if (!$komut(base64_encode($sifre), 235)) { $hata = "SMTP kimlik doğrulaması başarısız (" . $hesap . ") — şifre ayarını kontrol edin."; return false; }
    if (!$komut("MAIL FROM:<" . $hesap . ">", 250)) return false;
    if (!$komut("RCPT TO:<" . $aliciEmail . ">", 250)) return false;
    if (!$komut("DATA", 354)) return false;
    $b = "=?UTF-8?B?"; $s = "?=";
    $baslik  = "From: " . $b . base64_encode(GONDEREN_AD) . $s . " <" . $hesap . ">\r\n";
    $baslik .= "To: <" . $aliciEmail . ">\r\n";
    $baslik .= "Subject: " . $b . base64_encode($konu) . $s . "\r\n";
    if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $baslik .= "Reply-To: <" . $replyTo . ">\r\n";
    $baslik .= "MIME-Version: 1.0\r\n";
    $baslik .= "Date: " . date("r") . "\r\nMessage-ID: <" . bin2hex(random_bytes(12)) . "@" . $alan . ">\r\n";

    if (empty($ekler)) {
        $baslik .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
        $govde = chunk_split(base64_encode($htmlGovde), 76, "\r\n");
    } else {
        $sinir = "=_scale_" . bin2hex(random_bytes(12));
        $baslik .= "Content-Type: multipart/mixed; boundary=\"" . $sinir . "\"\r\n";
        $govde  = "Bu ileti MIME biçimindedir.\r\n\r\n";
        $govde .= "--" . $sinir . "\r\n";
        $govde .= "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
        $govde .= chunk_split(base64_encode($htmlGovde), 76, "\r\n");
        foreach ($ekler as $ek) {
            $ekAd   = preg_replace('/[^A-Za-z0-9._-]+/', '_', $ek["ad"]);
            $ekMime = isset($ek["mime"]) ? $ek["mime"] : "application/octet-stream";
            $govde .= "\r\n--" . $sinir . "\r\n";
            $govde .= "Content-Type: " . $ekMime . "; name=\"" . $ekAd . "\"\r\n";
            $govde .= "Content-Transfer-Encoding: base64\r\n";
            $govde .= "Content-Disposition: attachment; filename=\"" . $ekAd . "\"\r\n\r\n";
            $govde .= chunk_split(base64_encode($ek["icerik"]), 76, "\r\n");
        }
        $govde .= "\r\n--" . $sinir . "--\r\n";
    }
    fwrite($sock, $baslik . "\r\n" . $govde . "\r\n.\r\n");
    if (!$komut(null, 250)) return false;
    fwrite($sock, "QUIT\r\n");
    fclose($sock);
    return true;
}

/* ---------- SEND: kod üret + e-posta gönder ---------- */
if ($action === "send") {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) yanit(array("ok" => false, "error" => "Geçersiz e-posta adresi."), 400);
    if (hiz_limiti_asildi($email)) yanit(array("ok" => false, "error" => "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin."), 429);

    $kod = str_pad((string)random_int(0, 999999), 6, "0", STR_PAD_LEFT);
    $exp = time() + GECERLILIK_DK * 60;
    $token = imza($email, $kod, $exp);

    /* Kodun hangi akış için istendiği, e-posta konusunda ve şablonda görünür. */
    $baglam    = isset($girdi["baglam"]) ? (string)$girdi["baglam"] : "yukumluluk";
    $baglamAd  = ($baglam === "degerlendirme") ? "Scale Hızlı Değerlendirme" : "Scale Yükümlülük Kataloğu";

    $sablon = __DIR__ . "/mail-sablonu-dogrulama-kodu.html";
    if (is_file($sablon)) {
        $html = file_get_contents($sablon);
        $html = str_replace(
            array("{{KOD}}", "{{EPOSTA}}", "{{GECERLILIK}}", "{{YIL}}", "{{BAGLAM}}"),
            array($kod, htmlspecialchars($email), GECERLILIK_DK . " dakika", date("Y"), htmlspecialchars($baglamAd)),
            $html
        );
    } else {
        $html = "<p>Doğrulama kodunuz: <b style='font-size:22px'>$kod</b> (geçerlilik: " . GECERLILIK_DK . " dakika)</p>";
    }

    $hata = "";
    if (!smtp_gonder($email, "Doğrulama kodunuz: $kod — " . $baglamAd, $html, $hata))
        yanit(array("ok" => false, "error" => ($hata !== "" ? $hata : "E-posta gönderilemedi.")), 502);

    yanit(array("ok" => true, "token" => $token, "exp" => $exp));
}

/* ---------- VERIFY: kodu doğrula (tek kullanımlık) ---------- */
if ($action === "verify") {
    $kod   = preg_replace("/\D/", "", isset($girdi["code"]) ? $girdi["code"] : "");
    $token = isset($girdi["token"]) ? $girdi["token"] : "";
    $exp   = (int)(isset($girdi["exp"]) ? $girdi["exp"] : 0);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($kod) !== 6 || $token === "") yanit(array("ok" => false, "error" => "Eksik bilgi."), 400);
    if (time() > $exp) yanit(array("ok" => false, "error" => "Kodun süresi doldu. Lütfen yeniden gönderin."));
    if (!hash_equals(imza($email, $kod, $exp), $token)) yanit(array("ok" => false, "error" => "Kod hatalı."));
    $kullanildi = gecici("used_" . md5($token));
    if (is_file($kullanildi)) yanit(array("ok" => false, "error" => "Bu kod zaten kullanıldı. Lütfen yeniden gönderin."));
    file_put_contents($kullanildi, (string)time());
    yanit(array("ok" => true));
}

/* ---------- TALEP: Danışmanlık Al / Fiyat Teklifi / Toplantı Planla ---------- */
if ($action === "talep") {
    $izinli = array("Danışmanlık Talebi", "Fiyat Teklifi Talebi", "Toplantı Talebi");
    $tur = isset($girdi["tur"]) ? trim($girdi["tur"]) : "";
    if (!in_array($tur, $izinli, true)) yanit(array("ok" => false, "error" => "Geçersiz talep türü."), 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) yanit(array("ok" => false, "error" => "Geçersiz e-posta adresi."), 400);
    if (hiz_limiti_asildi("talep_" . $email)) yanit(array("ok" => false, "error" => "Çok fazla talep gönderildi. Lütfen bir süre sonra tekrar deneyin."), 429);

    $g = function ($k, $vars = "-") use ($girdi) { $v = isset($girdi[$k]) ? trim((string)$girdi[$k]) : ""; return $v !== "" ? $v : $vars; };
    $hizmet  = mb_substr($g("hizmet", "Genel görüşme"), 0, 200);
    $telefon = mb_substr($g("telefon"), 0, 40);
    $mesaj   = mb_substr($g("mesaj", "(mesaj bırakılmadı)"), 0, 2000);
    $sektor  = mb_substr($g("sektor"), 0, 80);
    $yuk     = (int)$g("yukumluluk", "0");
    $cezai   = (int)$g("cezai", "0");
    $tarih   = date("d.m.Y H:i");

    /* kayıt (e-posta gönderilemese bile talep kaybolmaz) */
    $dizin = __DIR__ . "/veri";
    if (!is_dir($dizin)) { mkdir($dizin, 0750, true); file_put_contents($dizin . "/.htaccess", "Require all denied\nDeny from all\n"); }
    file_put_contents($dizin . "/talepler.jsonl", json_encode(array(
        "tur" => $tur, "email" => $email, "telefon" => $telefon, "hizmet" => $hizmet,
        "mesaj" => $mesaj, "sektor" => $sektor, "yukumluluk" => $yuk, "cezai" => $cezai,
        "kayit_zamani" => date("c"),
    ), JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

    /* şirkete bildirim */
    $ara = array("{{TALEP_TURU}}", "{{EPOSTA}}", "{{TELEFON}}", "{{HIZMET}}", "{{SEKTOR}}",
                 "{{YUKUMLULUK}}", "{{CEZAI}}", "{{MESAJ}}", "{{TARIH}}", "{{YIL}}");
    $deg = array(htmlspecialchars($tur), htmlspecialchars($email), htmlspecialchars($telefon),
                 htmlspecialchars($hizmet), htmlspecialchars($sektor), (string)$yuk, (string)$cezai,
                 nl2br(htmlspecialchars($mesaj)), $tarih, date("Y"));
    $tpl = __DIR__ . "/mail-sablonu-talep.html";
    $html = is_file($tpl) ? str_replace($ara, $deg, file_get_contents($tpl))
          : "<p><b>$tur</b> — $email / $telefon<br>Hizmet: $hizmet<br>Mesaj: " . nl2br(htmlspecialchars($mesaj)) . "</p>";
    $hata = "";
    if (!smtp_gonder(TALEP_ALICI, "Yeni " . $tur . " — " . $email, $html, $hata, $email, TALEP_SMTP_KULLANICI, TALEP_SMTP_SIFRE))
        yanit(array("ok" => false, "error" => ($hata !== "" ? $hata : "Talep e-postası gönderilemedi.")), 502);

    /* müşteriye teyit (başarısız olsa da talep tamamlanmış sayılır) */
    $tpl2 = __DIR__ . "/mail-sablonu-talep-teyit.html";
    if (is_file($tpl2)) {
        $html2 = str_replace($ara, $deg, file_get_contents($tpl2));
        $h2 = "";
        smtp_gonder($email, "Talebinizi aldık — Scale Teknoloji ve Danışmanlık", $html2, $h2, TALEP_ALICI, TALEP_SMTP_KULLANICI, TALEP_SMTP_SIFRE);
    }
    yanit(array("ok" => true));
}

/* ---------- LEAD: profil kaydı (veri/leads.jsonl) ---------- */
if ($action === "lead") {
    $dizin = __DIR__ . "/veri";
    if (!is_dir($dizin)) { mkdir($dizin, 0750, true); file_put_contents($dizin . "/.htaccess", "Require all denied\nDeny from all\n"); }
    unset($girdi["action"]);
    $girdi["ip_hash"] = md5(isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : "");
    $girdi["kayit_zamani"] = date("c");
    file_put_contents($dizin . "/leads.jsonl", json_encode($girdi, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    yanit(array("ok" => true));
}

/* ---------- DEĞERLENDİRME: hızlı değerlendirme anketinin şifreli cevap paketi ----------
   Akış: ziyaretçi anketi bitirir → e-posta adresine kod gider (action:"send") →
   kod bu istekte doğrulanır → şifreli paket EK olarak DEG_ALICI adresine gönderilir
   ve sunucuda saklanır. Paketi açan şifre istemcide kalır; buraya asla gelmez. */
if ($action === "degerlendirme") {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) yanit(array("ok" => false, "error" => "Geçersiz e-posta adresi."), 400);
    if (hiz_limiti_asildi("deg_" . $email)) yanit(array("ok" => false, "error" => "Çok fazla gönderim yapıldı. Lütfen bir süre sonra tekrar deneyin."), 429);

    /* --- doğrulama kodu (tek kullanımlık) --- */
    $kod   = preg_replace("/\D/", "", isset($girdi["code"]) ? $girdi["code"] : "");
    $token = isset($girdi["token"]) ? $girdi["token"] : "";
    $exp   = (int)(isset($girdi["exp"]) ? $girdi["exp"] : 0);
    if (strlen($kod) !== 6 || $token === "") yanit(array("ok" => false, "error" => "Doğrulama kodu eksik."), 400);
    if (time() > $exp) yanit(array("ok" => false, "error" => "Kodun süresi doldu. Lütfen yeniden gönderin."));
    if (!hash_equals(imza($email, $kod, $exp), $token)) yanit(array("ok" => false, "error" => "Kod hatalı."));
    $kullanildi = gecici("used_" . md5($token));
    if (is_file($kullanildi)) yanit(array("ok" => false, "error" => "Bu kod zaten kullanıldı. Lütfen yeniden gönderin."));

    /* --- şifreli paket --- */
    $zarf = isset($girdi["zarf"]) ? $girdi["zarf"] : null;
    if (!is_array($zarf) || empty($zarf["ciphertext"]) || empty($zarf["salt"]) || empty($zarf["iv"]))
        yanit(array("ok" => false, "error" => "Şifreli paket eksik veya bozuk."), 400);
    $zarfJson = json_encode($zarf, JSON_UNESCAPED_UNICODE);
    if (strlen($zarfJson) > DEG_MAX_BAYT)
        yanit(array("ok" => false, "error" => "Şifreli paket kabul edilen boyutu aşıyor."), 413);

    $g = function ($k, $vars = "-") use ($girdi) { $v = isset($girdi[$k]) ? trim((string)$girdi[$k]) : ""; return $v !== "" ? $v : $vars; };
    $telefon = mb_substr($g("telefon"), 0, 40);
    $kurum   = mb_substr($g("kurum", "(belirtilmedi)"), 0, 160);
    $ozet    = (isset($girdi["ozet"]) && is_array($girdi["ozet"])) ? $girdi["ozet"] : array();
    $oz      = function ($k, $vars = "-") use ($ozet) { return isset($ozet[$k]) && $ozet[$k] !== "" ? (string)$ozet[$k] : $vars; };

    $dosyaAdi = preg_replace('/[^A-Za-z0-9._-]+/', '_', $g("dosyaAdi", "Siber_Olgunluk_Cevaplari.json"));
    if (substr($dosyaAdi, -5) !== ".json") $dosyaAdi .= ".json";
    $tarih = date("d.m.Y H:i");

    /* --- kayıt (e-posta gönderilemese bile paket kaybolmasın) --- */
    $dizin = __DIR__ . "/veri/degerlendirme";
    if (!is_dir($dizin)) { @mkdir($dizin, 0750, true); }
    $htacc = __DIR__ . "/veri/.htaccess";
    if (!is_file($htacc)) @file_put_contents($htacc, "Require all denied\nDeny from all\n");
    $kayitAdi = date("Ymd_His") . "_" . substr(md5($email . $zarf["ciphertext"]), 0, 8) . ".json";
    @file_put_contents($dizin . "/" . $kayitAdi, json_encode(array(
        "email" => $email, "telefon" => $telefon, "kurum" => $kurum,
        "dosyaAdi" => $dosyaAdi, "ozet" => $ozet, "zarf" => $zarf,
        "ip_hash" => md5(isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : ""),
        "kayit_zamani" => date("c"),
    ), JSON_UNESCAPED_UNICODE), LOCK_EX);

    /* --- danışman ekibine bildirim + şifreli paket eki --- */
    $ara = array("{{KURUM}}", "{{EPOSTA}}", "{{TELEFON}}", "{{TAKSONOMI}}", "{{ALAN_SAYISI}}",
                 "{{SORU_SAYISI}}", "{{BANKA}}", "{{DOSYA}}", "{{TARIH}}", "{{YIL}}");
    $deg = array(htmlspecialchars($kurum), htmlspecialchars($email), htmlspecialchars($telefon),
                 htmlspecialchars($oz("taksonomi")), htmlspecialchars($oz("alanSayisi")),
                 htmlspecialchars($oz("soruSayisi")), htmlspecialchars($oz("bankaSurumu")),
                 htmlspecialchars($dosyaAdi), $tarih, date("Y"));
    $tpl = __DIR__ . "/mail-sablonu-degerlendirme.html";
    $html = is_file($tpl) ? str_replace($ara, $deg, file_get_contents($tpl))
          : "<p><b>Yeni hızlı değerlendirme paketi</b><br>Kurum: " . htmlspecialchars($kurum) .
            "<br>E-posta: " . htmlspecialchars($email) . "<br>Telefon: " . htmlspecialchars($telefon) .
            "<br>Dosya: " . htmlspecialchars($dosyaAdi) . "</p>";

    $ekler = array(array("ad" => $dosyaAdi, "mime" => "application/json", "icerik" => $zarfJson));
    $hata = "";
    if (!smtp_gonder(DEG_ALICI, "Hızlı Değerlendirme paketi — " . $kurum . " (" . $email . ")",
                     $html, $hata, $email, TALEP_SMTP_KULLANICI, TALEP_SMTP_SIFRE, $ekler))
        yanit(array("ok" => false, "error" => ($hata !== "" ? $hata : "Paket e-postası gönderilemedi.")), 502);

    /* Kod ancak paket başarıyla iletildikten sonra tüketilir; böylece geçici bir
       SMTP hatasında ziyaretçi aynı kodla yeniden deneyebilir. */
    @file_put_contents($kullanildi, (string)time());

    /* --- ziyaretçiye teyit (başarısız olsa da gönderim tamamlanmış sayılır) --- */
    $tpl2 = __DIR__ . "/mail-sablonu-degerlendirme-teyit.html";
    if (is_file($tpl2)) {
        $h2 = "";
        smtp_gonder($email, "Değerlendirme paketiniz bize ulaştı — Scale Bilgi Güvenliği",
                    str_replace($ara, $deg, file_get_contents($tpl2)), $h2, DEG_ALICI,
                    TALEP_SMTP_KULLANICI, TALEP_SMTP_SIFRE);
    }
    yanit(array("ok" => true, "kayit" => $kayitAdi));
}

yanit(array("ok" => false, "error" => "Bilinmeyen işlem."), 400);
