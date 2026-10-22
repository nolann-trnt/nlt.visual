@echo off
cd /d "%~dp0"
python -m pip install -r requirements.txt
python -m pip install -r ..\..\requirements-build.txt
pause
