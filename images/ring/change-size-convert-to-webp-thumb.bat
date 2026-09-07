@echo off
setlocal

REM ==========================================
REM Einstellungen
REM ==========================================

set "FFMPEG=C:\Program Files\ffmpeg\bin\ffmpeg.exe"
set "QUALITY=80"

REM ==========================================
REM Eingabedatei pruefen
REM ==========================================

if "%~1"=="" (
    echo.
    echo Bitte ein PNG oder JPG auf diese BAT-Datei ziehen.
    echo.
    pause
    exit /b
)

REM ==========================================
REM Ausgabe
REM ==========================================

set "OUTPUT=%~dp1\01_thumb.webp"

echo.
echo ==========================================
echo Bild wird konvertiert
echo ==========================================
echo.
echo Eingabe: %~nx1
echo Ausgabe: 01_thumb.webp
echo Groesse: 720 x 309 px
echo Qualitaet: %QUALITY%
echo.
echo ==========================================
echo.

"%FFMPEG%" -i "%~1" ^
    -vf "scale=720:309:force_original_aspect_ratio=increase,crop=720:309" ^
    -c:v libwebp ^
    -q:v %QUALITY% ^
    -compression_level 6 ^
    -y ^
    "%OUTPUT%"

if errorlevel 1 (
    echo.
    echo FEHLER bei der Konvertierung!
) else (
    echo.
    echo ==========================================
    echo Fertig!
    echo ==========================================
    echo.
    echo Erstellt:
    echo %OUTPUT%
    echo.
)

pause