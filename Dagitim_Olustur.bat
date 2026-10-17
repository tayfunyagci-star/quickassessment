@echo off
rem ==================================================================
rem  Analiz Paneli - Dagitim Olustur
rem  Cift tiklayin: dagitim_olustur.py penceresini konsolsuz acar.
rem  Python veya Node.js eksikse ne yapilacagini soyler.
rem ==================================================================
setlocal
cd /d "%~dp0"
title Analiz Paneli - Dagitim Olustur

if not exist "dagitim_olustur.py" goto betik_yok

node -v >nul 2>&1
if errorlevel 1 goto node_yok

rem 1) Python Launcher (python.org kurulumuyla gelir)
py -3 -c "import tkinter" >nul 2>&1
if not errorlevel 1 goto py_launcher

rem 2) PATH'teki python (Microsoft Store kisayolu tek basina hata dondurur)
python -c "import tkinter" >nul 2>&1
if not errorlevel 1 goto python_path

rem 3) Python var ama tkinter yok: konsol kipi
py -3 -c "import sys" >nul 2>&1
if not errorlevel 1 goto konsol_py
python -c "import sys" >nul 2>&1
if not errorlevel 1 goto konsol_python
goto python_yok

:py_launcher
start "" pyw -3 dagitim_olustur.py
exit /b 0

:python_path
set "PYEXE="
for /f "usebackq delims=" %%P in (`python -c "import sys; print(sys.executable)"`) do set "PYEXE=%%P"
if not defined PYEXE goto python_konsollu
set "PYW=%PYEXE:python.exe=pythonw.exe%"
if not exist "%PYW%" goto python_konsollu
start "" "%PYW%" dagitim_olustur.py
exit /b 0

:python_konsollu
python dagitim_olustur.py
if errorlevel 1 pause
exit /b

:konsol_py
echo Bu Python kurulumunda tkinter yok; konsol kipinde devam ediliyor.
echo.
py -3 dagitim_olustur.py --konsol
pause
exit /b

:konsol_python
echo Bu Python kurulumunda tkinter yok; konsol kipinde devam ediliyor.
echo.
python dagitim_olustur.py --konsol
pause
exit /b

:python_yok
echo.
echo   Python bulunamadi.
echo.
echo   1. https://www.python.org/downloads/ adresinden Python 3 indirin.
echo   2. Kurulumun ilk ekraninda "Add python.exe to PATH" kutusunu isaretleyin.
echo   3. Kurulum bitince bu dosyaya yeniden cift tiklayin.
echo.
pause
exit /b 1

:node_yok
echo.
echo   Node.js bulunamadi.
echo.
echo   1. https://nodejs.org adresinden LTS surumunu (20 veya ustu) indirip kurun.
echo   2. Kurulum bitince bu dosyaya yeniden cift tiklayin.
echo.
pause
exit /b 1

:betik_yok
echo.
echo   dagitim_olustur.py bu klasorde bulunamadi.
echo   Bu dosyayi repo kokunden (package.json'in yanindan) calistirin.
echo.
pause
exit /b 1
