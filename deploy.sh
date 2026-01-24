#!/bin/bash

# Script de despliegue automatizado - Mundo Reporte

set -e  # Salir si hay errores

echo "🚀 Iniciando despliegue de Mundo Reporte v1.1.0..."

# Verificar que existan las variables de entorno
if [ ! -f backend/.env ]; then
    echo "❌ Error: No existe backend/.env"
    echo "👉 Copia backend/.env.example a backend/.env y configura las variables"
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "❌ Error: No existe frontend/.env"
    echo "👉 Copia frontend/.env.example a frontend/.env y configura las variables"
    exit 1
fi

echo "✅ Archivos .env encontrados"

# Backend
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
pip install -r requirements.txt

echo ""
echo "🔄 Ejecutando migraciones..."
python manage.py migrate --noinput

echo ""
echo "📁 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo ""
echo "✅ Backend configurado correctamente"

# Frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

echo ""
echo "🏗️  Compilando frontend para producción..."
npm run build

echo ""
echo "✅ Frontend compilado correctamente"

echo ""
echo "================================================"
echo "✨ Despliegue completado exitosamente"
echo "================================================"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  gunicorn config.wsgi:application --bind 0.0.0.0:8000"
echo ""
echo "Frontend:"
echo "  Los archivos están en: frontend/build/"
echo "  Configura tu servidor web para servir esta carpeta"
echo ""
