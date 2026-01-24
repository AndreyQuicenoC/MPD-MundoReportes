# Script PowerShell para iniciar el servidor backend Django
Write-Host "Iniciando servidor backend..." -ForegroundColor Green

# Cambiar al directorio del script
Set-Location $PSScriptRoot

# Activar entorno virtual
& .\venv\Scripts\Activate.ps1

# Iniciar servidor Django
python manage.py runserver
