#!/bin/bash

echo "Ejecutando migraciones..."
python manage.py migrate --noinput

echo "Recolectando archivos estaticos..."
python manage.py collectstatic --noinput

echo "Iniciando servidor..."
gunicorn config.wsgi:application
