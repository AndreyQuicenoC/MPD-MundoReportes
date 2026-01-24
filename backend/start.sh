#!/bin/bash

echo "🔄 Ejecutando migraciones..."
python manage.py migrate --noinput

echo "� Creando usuario de prueba..."
python manage.py crear_usuario_prueba

echo "�📁 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "🚀 Iniciando servidor..."
gunicorn config.wsgi:application
