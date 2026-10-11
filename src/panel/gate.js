/* =====================================================================
   GİRİŞ KAPISI — dosyanın şifresiz tek parçası
   ---------------------------------------------------------------------
   Panelin tamamı (soru bankası, puanlama, anket şablonu, raporlar)
   build sırasında yönetici parolasıyla şifrelenip PAYLOAD olarak gömülür:
     PBKDF2-SHA256 (600 000 tur) → AES-256-GCM, içerik gzip'li.
   Parola dosyada hiçbir biçimde (açık metin ya da özet) bulunmaz; doğru
   parola yalnızca şifreli içeriğin çözülebilmesiyle anlaşılır.

   İki adımlı doğrulama (isteğe bağlı): TOTP gizli anahtarı aynı parolayla
   şifrelenip TOTP_VAULT olarak gömülür. Kurulu ise giriş için parolaya ek
   olarak Kimlik Doğrulayıcı'daki 6 haneli kod istenir; aynı kod ikinci kez
   kullanılamaz, 5 hatalı denemede giriş 5 dakika kilitlenir.
   Not: Çevrimdışı tek dosyada ikinci adım bir işletim kontrolüdür; dosyayı
   ve parolayı birlikte ele geçiren birine karşı kriptografik koruma parola
   şifrelemesidir.
   ===================================================================== */
const PAYLOAD = /*@PAYLOAD*/null/*@END_PAYLOAD*/;
const TOTP_VAULT = null;/*@END_TOTP*/

const GATE = (function(){
  const LS_LOCK = "aoc_gate_lock_v1", LS_TOTP_LAST = "aoc_totp_last_step_v1";
  const MAX_FAILS = 5, LOCK_MS = 5 * 60 * 1000;
  const GENERIC = "Parola veya doğrulama kodu hatalı.";

  const unb64 = s => { const b = atob(s); const a = new Uint8Array(b.length); for(let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };

  function lockState(){ try{ return JSON.parse(localStorage.getItem(LS_LOCK) || '{"fails":0,"until":0}'); }catch(e){ return { fails:0, until:0 }; } }
  function setLockState(st){ try{ localStorage.setItem(LS_LOCK, JSON.stringify(st)); }catch(e){} }
  function lastStep(){ try{ return parseInt(localStorage.getItem(LS_TOTP_LAST) || "0", 10) || 0; }catch(e){ return 0; } }
  function markStep(step){ try{ localStorage.setItem(LS_TOTP_LAST, String(step)); }catch(e){} }
  function lockedFor(){ const st = lockState(); return st.until && Date.now() < st.until ? st.until - Date.now() : 0; }
  function registerFail(){
    const st = lockState(); st.fails = (st.fails || 0) + 1;
    let msg = GENERIC;
    if(st.fails >= MAX_FAILS){ st.until = Date.now() + LOCK_MS; st.fails = 0; msg = "Çok fazla hatalı deneme. Giriş 5 dakika kilitlendi."; }
    setLockState(st);
    return msg;
  }

  async function payloadKey(password){
    const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name:"PBKDF2", salt: unb64(PAYLOAD.salt), iterations: PAYLOAD.iter, hash:"SHA-256" },
                                   km, { name:"AES-GCM", length:256 }, false, ["decrypt"]);
  }
  /* Parola doğruysa çözülmüş içerik metnini, değilse null döndürür. */
  async function openPayload(password){
    let plain;
    try{ plain = await crypto.subtle.decrypt({ name:"AES-GCM", iv: unb64(PAYLOAD.iv) }, await payloadKey(password), unb64(PAYLOAD.ct)); }
    catch(e){ return null; }
    if(!PAYLOAD.gz) return new TextDecoder().decode(plain);
    const stream = new Blob([plain]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  /* Parola + (kuruluysa) kod. Başarılıysa { ok, text, step } döner. */
  async function verify(password, code, vault){
    const text = await openPayload(password);
    if(text == null) return { ok:false, msg:GENERIC };
    if(!vault) return { ok:true, text };
    let secret;
    try{ secret = await QA_TOTP.openText(vault.box, password); }catch(e){ return { ok:false, msg:GENERIC }; }
    const step = await QA_TOTP.verify(secret, code, { window:1 });
    if(step == null) return { ok:false, msg:GENERIC };
    if(step <= lastStep()) return { ok:false, msg:"Bu kod zaten kullanıldı. Bir sonraki kodu bekleyin." };
    return { ok:true, text, step, secret };
  }

  /* Çözülmüş paneli sayfaya yerleştirir: önce gövde, sonra betik. */
  function mount(text){
    const app = JSON.parse(text);
    document.getElementById("appRoot").innerHTML = app.body;
    const s = document.createElement("script");
    s.textContent = app.script;
    document.body.appendChild(s);
    document.getElementById("gate").remove();
    document.documentElement.classList.add("authed");
  }

  async function login(){
    const err = document.getElementById("gateErr"), btn = document.getElementById("btnGate");
    const wait = lockedFor();
    if(wait){ err.textContent = `Giriş kilitli. ${Math.ceil(wait / 60000)} dakika sonra tekrar deneyin.`; return; }
    const pInp = document.getElementById("gatePw"), oInp = document.getElementById("gateOtp");
    if(!pInp.value){ err.textContent = "Parolayı girin."; pInp.focus(); return; }
    if(TOTP_VAULT && !oInp.value.trim()){ err.textContent = "Kimlik Doğrulayıcı'daki 6 haneli kodu girin."; oInp.focus(); return; }
    btn.disabled = true; err.textContent = ""; btn.textContent = "Açılıyor…";
    try{
      const r = await verify(pInp.value, oInp.value, TOTP_VAULT);
      pInp.value = ""; oInp.value = "";
      if(!r.ok){ err.textContent = r.msg === GENERIC ? registerFail() : r.msg; pInp.focus(); return; }
      if(r.step != null) markStep(r.step);
      setLockState({ fails:0, until:0 });
      mount(r.text);
    }catch(e){
      err.textContent = "Panel açılamadı: " + (e && e.message || e);
    }finally{
      if(document.getElementById("gate")){ btn.disabled = false; btn.textContent = "Giriş"; }
    }
  }

  /* Kasası değiştirilmiş kendi kopyası (2FA kur/kapat). Şifreli içerik aynen kalır. */
  function selfCopy(vault){
    const src = window.__QA_PRISTINE;
    if(!src) throw new Error("kaynak belge bulunamadı");
    const re = /const TOTP_VAULT = [\s\S]*?;\/\*@END_TOTP\*\//;
    if(!re.test(src)) throw new Error("kasa alanı bulunamadı");
    const json = vault ? JSON.stringify(vault).replace(/</g, "\\u003c") : "null";
    return src.replace(re, () => `const TOTP_VAULT = ${json};/*@END_TOTP*/`);
  }

  function init(){
    document.getElementById("gateVer").textContent = "v" + APP_VERSION;
    const otp = document.getElementById("gateOtp");
    otp.classList.toggle("hidden", !TOTP_VAULT);
    document.getElementById("gateHint").textContent = TOTP_VAULT
      ? "Parolanızı ve Kimlik Doğrulayıcı uygulamasındaki 6 haneli kodu girin."
      : "Panel bu dosyada şifreli olarak saklanır; açmak için parolanızı girin.";
    if(!PAYLOAD){ document.getElementById("gateErr").textContent = "Bu dosyada panel içeriği bulunamadı (build hatası)."; return; }
    if(!(window.crypto && crypto.subtle && window.DecompressionStream)){
      document.getElementById("gateErr").textContent = "Tarayıcınız gerekli şifreleme özelliklerini desteklemiyor. Güncel Chrome, Edge, Firefox veya Safari kullanın.";
      return;
    }
    document.getElementById("btnGate").addEventListener("click", login);
    [document.getElementById("gatePw"), otp].forEach(el => el.addEventListener("keydown", e => { if(e.key === "Enter") login(); }));
    document.getElementById("gatePw").focus();
  }

  return { init, verify, openPayload, markStep, lastStep, selfCopy, MAX_FAILS };
})();
