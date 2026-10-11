"""Dağıtım Oluştur — Analiz Paneli'ni kendi parolanızla derler.

Çalıştırma (repo kökünde):
    python dagitim_olustur.py            → pencere açılır
    python dagitim_olustur.py --konsol   → pencere yerine konsolda parola sorar

Ne yapar
  1. Node.js'in kurulu olduğunu denetler (20 veya üstü).
  2. Gerekirse bağımlılıkları kurar (npm ci).
  3. Paneli girdiğiniz parolayla derler; çıktıyı
     dagitim/Analiz_Paneli_v<sürüm>_<tarih>/ klasörüne yazar ve klasörü açar.

Parola yalnızca derleme sürecine ortam değişkeniyle (QA_ADMIN_PASSWORD) verilir;
komut satırında, günlükte veya herhangi bir dosyada yer almaz. dagitim/ klasörü
.gitignore'dadır — üretilen dosyalar repoya girmez.
Gereken: Python 3.8+ (Windows'ta tkinter standart kurulumla gelir), Node.js 20+.
"""
import datetime
import os
import queue
import re
import shutil
import subprocess
import sys
import threading

ROOT = os.path.dirname(os.path.abspath(__file__))
DAGITIM = os.path.join(ROOT, "dagitim")
MIN_LEN = 12
WIN = os.name == "nt"
NPM = "npm.cmd" if WIN else "npm"
NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0) if WIN else 0

OKUBENI = """ANALİZ PANELİ — DAĞITIM PAKETİ (v{surum}, {tarih})
=====================================================

Siber_Olgunluk_Analiz_Paneli.html
  Danışmanların kullanacağı panel. Tarayıcıda (Chrome, Edge, Firefox, Safari)
  çift tıklayarak açılır; internet bağlantısı gerekmez ve kullanmaz.
  Panel bu dosyada şifrelidir. Parolayı dosyayla AYNI KANALDAN göndermeyin
  (ör. dosya e-postayla, parola telefonla).

Kimlik_Dogrulayici.html
  İki adımlı doğrulama (TOTP) kodlarını üreten çevrimdışı uygulama.
  İsteğe bağlı kurulum: panelde «Güvenlik» → otpauth bağlantısını bu
  uygulamada «Hesap Ekle» ile ekleyin → 6 haneli kod + parola → «Doğrula ve
  Etkinleştir». İki adımlı doğrulama içeren YENİ panel dosyası iner; eski
  dosyayı silip yenisini kullanın.

Bu dosyalar müşteriye verilmez. Müşteriye giden anket, panelin «Anket Üretimi»
bölümünden kuruma özel olarak üretilir.
"""


# ---------------------------------------------------------------- yardımcılar
def run(cmd, env=None, log=print):
    """Komutu çalıştırır, çıktısını satır satır log'a aktarır; çıkış kodunu döndürür."""
    p = subprocess.Popen(cmd, cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                         text=True, encoding="utf-8", errors="replace", creationflags=NO_WINDOW)
    for line in p.stdout:
        line = line.rstrip()
        if line:
            log(line)
    return p.wait()


def node_version():
    try:
        out = subprocess.run(["node", "-v"], cwd=ROOT, capture_output=True, text=True, creationflags=NO_WINDOW)
        m = re.match(r"v(\d+)\.", out.stdout.strip())
        return int(m.group(1)) if m else None
    except OSError:
        return None


def app_version():
    try:
        with open(os.path.join(ROOT, "src", "panel", "version.js"), encoding="utf-8") as f:
            m = re.search(r'APP_VERSION\s*=\s*"([^"]+)"', f.read())
        return m.group(1) if m else "x"
    except OSError:
        return "x"


def strength(pw):
    """Kaba parola gücü: (etiket, 0–4)."""
    if not pw:
        return "—", 0
    kinds = sum(bool(re.search(r, pw)) for r in (r"[a-zçğıöşü]", r"[A-ZÇĞİÖŞÜ]", r"\d", r"[^\w]"))
    score = (len(pw) >= 12) + (len(pw) >= 16) + (kinds >= 3) + (kinds == 4)
    if len(pw) < MIN_LEN:
        return "çok kısa (en az %d karakter)" % MIN_LEN, 0
    return ["zayıf", "orta", "iyi", "güçlü", "çok güçlü"][score], score


def check_password(pw, pw2):
    if not pw:
        return "Parolayı girin."
    if len(pw) < MIN_LEN:
        return "Parola en az %d karakter olmalı." % MIN_LEN
    if pw != pw2:
        return "Parolalar aynı değil."
    if pw.strip() != pw:
        return "Parolanın başında veya sonunda boşluk olmamalı."
    return ""


# ---------------------------------------------------------------- derleme
def build_dagitim(password, log=print, reinstall=False):
    """Paneli verilen parolayla derler. Başarılıysa çıktı klasörünü döndürür, değilse hata fırlatır."""
    if not os.path.exists(os.path.join(ROOT, "package.json")):
        raise RuntimeError("Bu betik repo kökünde olmalı (package.json bulunamadı): " + ROOT)
    nv = node_version()
    if nv is None:
        raise RuntimeError("Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kurup bu programı yeniden açın.")
    if nv < 20:
        raise RuntimeError("Node.js %d bulundu; 20 veya üstü gerekli." % nv)
    log("Node.js v%d bulundu." % nv)

    need_install = reinstall or not all(os.path.exists(os.path.join(ROOT, "node_modules", d))
                                        for d in ("jszip", "xlsx", "qrcode-generator", "@fontsource"))
    if need_install:
        log("Bağımlılıklar kuruluyor (npm ci)…")
        env = dict(os.environ, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1")
        if run([NPM, "ci", "--no-audit", "--no-fund"], env=env, log=log) != 0:
            raise RuntimeError("npm ci başarısız oldu; yukarıdaki iletiyi inceleyin.")

    surum, tarih = app_version(), datetime.date.today().isoformat()
    out = os.path.join(DAGITIM, "Analiz_Paneli_v%s_%s" % (surum, tarih))
    tmp = out + ".yapim"
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp, exist_ok=True)
    log("Derleniyor: v%s → %s" % (surum, os.path.relpath(out, ROOT)))
    env = dict(os.environ, QA_ADMIN_PASSWORD=password)          # parola yalnızca ortam değişkeninde
    try:
        code = run(["node", os.path.join("scripts", "build.mjs"), "--out", tmp], env=env, log=log)
    finally:
        env.pop("QA_ADMIN_PASSWORD", None)
    if code != 0:
        shutil.rmtree(tmp, ignore_errors=True)
        raise RuntimeError("Derleme başarısız oldu; yukarıdaki iletiyi inceleyin.")
    for name in ("Siber_Olgunluk_Analiz_Paneli.html", "Kimlik_Dogrulayici.html"):
        p = os.path.join(tmp, name)
        if not os.path.exists(p) or os.path.getsize(p) < 10000:
            shutil.rmtree(tmp, ignore_errors=True)
            raise RuntimeError("Beklenen çıktı oluşmadı: " + name)
        with open(p, "rb") as f:
            if password.encode("utf-8") in f.read():                # olmamalı; son güvenlik denetimi
                shutil.rmtree(tmp, ignore_errors=True)
                raise RuntimeError("Güvenlik denetimi: parola çıktıda bulundu, dağıtım iptal edildi.")
    with open(os.path.join(tmp, "OKUBENI.txt"), "w", encoding="utf-8", newline="\r\n" if WIN else "\n") as f:
        f.write(OKUBENI.format(surum=surum, tarih=tarih))
    shutil.rmtree(out, ignore_errors=True)
    os.replace(tmp, out)
    log("Hazır: " + out)
    return out


def open_folder(path):
    try:
        if WIN:
            os.startfile(path)                                       # noqa: pylint (yalnız Windows)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
    except Exception:
        pass


# ---------------------------------------------------------------- arayüz
def gui():
    import tkinter as tk
    from tkinter import ttk, messagebox

    root = tk.Tk()
    root.title("Analiz Paneli — Dağıtım Oluştur")
    root.geometry("720x560")
    root.minsize(560, 460)
    try:
        ttk.Style().theme_use("vista" if WIN else "clam")
    except tk.TclError:
        pass

    frm = ttk.Frame(root, padding=18)
    frm.pack(fill="both", expand=True)
    ttk.Label(frm, text="Analiz Paneli — Dağıtım Oluştur", font=("Segoe UI", 14, "bold")).grid(row=0, column=0, columnspan=3, sticky="w")
    ttk.Label(frm, text="Panel v%s, girdiğiniz parolayla şifrelenip dagitim/ klasörüne derlenir. "
                        "Parola hiçbir dosyaya yazılmaz; unutulursa yeni parolayla yeniden derleyin." % app_version(),
              wraplength=660, foreground="#5B6472").grid(row=1, column=0, columnspan=3, sticky="w", pady=(4, 14))

    pw, pw2, show, reinst = tk.StringVar(), tk.StringVar(), tk.BooleanVar(value=False), tk.BooleanVar(value=False)
    ttk.Label(frm, text="Panel parolası").grid(row=2, column=0, sticky="w")
    e1 = ttk.Entry(frm, textvariable=pw, show="•", width=40)
    e1.grid(row=2, column=1, sticky="we", pady=3)
    ttk.Label(frm, text="Parola (tekrar)").grid(row=3, column=0, sticky="w")
    e2 = ttk.Entry(frm, textvariable=pw2, show="•", width=40)
    e2.grid(row=3, column=1, sticky="we", pady=3)
    lbl_str = ttk.Label(frm, text="Güç: —", foreground="#5B6472")
    lbl_str.grid(row=2, column=2, sticky="w", padx=10)

    def on_show():
        ch = "" if show.get() else "•"
        e1.configure(show=ch); e2.configure(show=ch)
    ttk.Checkbutton(frm, text="Parolayı göster", variable=show, command=on_show).grid(row=4, column=1, sticky="w")
    ttk.Checkbutton(frm, text="Bağımlılıkları yeniden kur (npm ci)", variable=reinst).grid(row=5, column=1, sticky="w")

    def on_pw(*_):
        label, sc = strength(pw.get())
        color = "#5B6472" if not pw.get() else ["#C4523A", "#C98A3B", "#C98A3B", "#1D8F74", "#1D8F74"][sc]
        lbl_str.configure(text="Güç: " + label, foreground=color)
    pw.trace_add("write", on_pw)

    btn = ttk.Button(frm, text="Dağıtımı Oluştur")
    btn.grid(row=6, column=1, sticky="w", pady=(12, 8))
    prog = ttk.Progressbar(frm, mode="indeterminate")
    prog.grid(row=6, column=2, sticky="we", padx=10)

    logbox = tk.Text(frm, height=14, wrap="word", font=("Consolas" if WIN else "Courier", 9), state="disabled",
                     background="#F5F7FA", relief="flat")
    logbox.grid(row=7, column=0, columnspan=3, sticky="nsew", pady=(6, 0))
    frm.columnconfigure(1, weight=1)
    frm.rowconfigure(7, weight=1)

    q = queue.Queue()

    def log(msg):
        q.put(("log", msg))

    def pump():
        try:
            while True:
                kind, val = q.get_nowait()
                if kind == "log":
                    logbox.configure(state="normal"); logbox.insert("end", val + "\n"); logbox.see("end"); logbox.configure(state="disabled")
                elif kind == "done":
                    prog.stop(); btn.configure(state="normal")
                    if val[0]:
                        open_folder(val[1])
                        messagebox.showinfo("Hazır", "Dağıtım oluşturuldu:\n" + val[1] +
                                            "\n\nPanel dosyasını danışmanlara verin; parolayı ayrı bir kanaldan iletin.")
                    else:
                        messagebox.showerror("Dağıtım oluşturulamadı", val[1])
        except queue.Empty:
            pass
        root.after(100, pump)

    def worker(password, reinstall):
        try:
            out = build_dagitim(password, log=log, reinstall=reinstall)
            q.put(("done", (True, out)))
        except Exception as ex:                                       # kullanıcıya gösterilir
            log("HATA: %s" % ex)
            q.put(("done", (False, str(ex))))

    def on_build():
        err = check_password(pw.get(), pw2.get())
        if err:
            messagebox.showwarning("Parola", err); return
        password = pw.get()
        pw.set(""); pw2.set("")                                       # alanlar hemen temizlenir
        btn.configure(state="disabled"); prog.start(12)
        logbox.configure(state="normal"); logbox.delete("1.0", "end"); logbox.configure(state="disabled")
        threading.Thread(target=worker, args=(password, reinst.get()), daemon=True).start()

    btn.configure(command=on_build)
    e2.bind("<Return>", lambda _e: on_build())
    e1.focus_set()
    root.after(100, pump)
    root.mainloop()


def konsol():
    import getpass
    p1 = getpass.getpass("Panel parolası: ")
    p2 = getpass.getpass("Parola (tekrar): ")
    err = check_password(p1, p2)
    if err:
        sys.exit(err)
    try:
        open_folder(build_dagitim(p1, reinstall="--npm-ci" in sys.argv))
    except Exception as ex:
        sys.exit("HATA: %s" % ex)


if __name__ == "__main__":
    if "--konsol" in sys.argv:
        konsol()
    else:
        try:
            gui()
        except ImportError:
            print("Bu Python kurulumunda tkinter yok; konsol kipine geçiliyor.")
            konsol()
