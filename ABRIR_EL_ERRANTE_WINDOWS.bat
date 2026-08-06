@echo off
cd /d "%~dp0"
python servidor_demo.py index.html
if errorlevel 1 pause
