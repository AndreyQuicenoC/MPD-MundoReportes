@echo off
REM Script para iniciar el servidor backend Django
echo Iniciando servidor backend...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python manage.py runserver
pause
