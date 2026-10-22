@echo off
rem Fabrique le site et l'ouvre dans le navigateur pour le tester avant de publier.
cd /d "%~dp0"
python -m pip install -q -r requirements-build.txt
python build.py
if errorlevel 1 (
  echo.
  echo La construction a echoue. Lis le message ci-dessus.
  pause
  exit /b 1
)
start "Serveur NLT.Visual (fermer cette fenetre pour arreter)" python -m http.server 8123 --directory _site
timeout /t 2 /nobreak >nul
start "" http://localhost:8123
