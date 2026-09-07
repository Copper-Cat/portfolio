@echo off
setlocal

set "FFMPEG=C:\Program Files\ffmpeg\bin\ffmpeg.exe"

REM ==========================================
REM Einstellungen
REM ==========================================

REM Qualität: 0-100
set "QUALITY=60"

REM Kompression: 0-6
set "COMPRESSION=6"

REM ==========================================
REM Eingabe pruefen
REM ==========================================

if "%~1"=="" (
    echo.
    echo Bitte eine animierte WebP-Datei auf diese BAT ziehen.
    echo.
    pause
    exit /b
)

REM ==========================================
REM Ausgabe
REM ==========================================

set "OUTPUT=%~dpn1_50percent.webp"

echo.
echo ==========================================
echo WebP wird verkleinert
echo ==========================================
echo.
echo Datei: %~nx1
echo Skalierung: 50%%
echo Qualitaet: %QUALITY%
echo.
echo ==========================================
echo.

"%FFMPEG%" -i "%~1" ^
    -vf "scale=iw/2:ih/2:flags=lanczos" ^
    -c:v libwebp ^
    -q:v %QUALITY% ^
    -compression_level %COMPRESSION% ^
    -loop 0 ^
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
    echo Neue Datei:
    echo %OUTPUT%
    echo.
)

pause