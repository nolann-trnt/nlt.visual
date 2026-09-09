@echo off
cd /d "%~dp0"
python ajouter_match.py
if errorlevel 1 pause
