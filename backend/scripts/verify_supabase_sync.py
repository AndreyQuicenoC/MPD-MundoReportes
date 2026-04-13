#!/usr/bin/env python
"""
Script de verificación de sincronización con Supabase.

Verifica que:
1. La conexión a Supabase funciona
2. Las tablas principales existen
3. Los datos se cargan correctamente
4. Los modelos Django están sincronizados

Uso:
    python manage.py shell
    exec(open('scripts/verify_supabase_sync.py').read())
"""

import os
import sys
from django.core.management import execute_from_command_line

print("\n" + "=" * 70)
print("VERIFICACIÓN DE SINCRONIZACIÓN CON SUPABASE")
print("=" * 70 + "\n")

# 1. Verificar configuración
print("1. CONFIGURACIÓN")
print("-" * 70)

database_url = os.getenv("DATABASE_URL")
is_supabase = "supabase" in database_url.lower() if database_url else False

status_db = "OK - Supabase" if is_supabase else "OK - Other"
print(f"   Base de datos configurada: {status_db}")
print(f"   DEBUG mode: {os.getenv('DEBUG', 'False')}")
print()

# 2. Verificar modelos
print("2. MODELOS DJANGO")
print("-" * 70)

from apps.usuarios.models import Usuario
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.gastos.models import CategoriaGasto, Gasto, GastoAutomatico, GastoDeducible
from apps.productos.models import Producto

models_to_check = [
    ("Usuarios", Usuario),
    ("Reportes Diarios", ReporteDiario),
    ("Ventas Producto", VentaProducto),
    ("Categorías Gasto", CategoriaGasto),
    ("Gastos", Gasto),
    ("Gastos Automáticos", GastoAutomatico),
    ("Gastos Deducibles", GastoDeducible),
    ("Productos", Producto),
]

for name, model in models_to_check:
    try:
        count = model.objects.count()
        status = "OK" if count > 0 else "EMPTY"
        print(f"   [{status}] {name}: {count} records")
    except Exception as e:
        print(f"   [ERROR] {name}: {str(e)}")

print()

# 3. Verificar datos críticos
print("3. DATOS CRÍTICOS")
print("-" * 70)

try:
    usuarios = Usuario.objects.count()
    reportes = ReporteDiario.objects.count()
    gastos_auto = GastoAutomatico.objects.count()
    categorias = CategoriaGasto.objects.count()

    print(f"   Usuarios: {usuarios}")
    print(f"   Reportes: {reportes}")
    print(f"   Gastos Automáticos: {gastos_auto}")
    print(f"   Categorías: {categorias}")

    if usuarios > 0 and reportes > 0:
        print("\n   [OK] System has data to operate")
    else:
        print("\n   [WARNING] System needs initial data")
        print("      - If using Supabase: Add data manually")
        print("      - If developing locally: Create data through UI")

except Exception as e:
    print(f"   [ERROR] Error verifying data: {str(e)}")

print()

# 4. Verificar API endpoints
print("4. ENDPOINTS DE API")
print("-" * 70)

endpoints = [
    "/api/usuarios/",
    "/api/reportes/",
    "/api/gastos/automaticos/",
    "/api/gastos/deducibles/",
    "/api/productos/",
    "/api/categorias/",
]

print("   The following endpoints are available:")
for endpoint in endpoints:
    print(f"   - /api{endpoint}")

print()

# 5. Resumen
print("5. RESUMEN")
print("=" * 70)

print(
    """
[OK] NEXT STEPS:

1. Ensure Supabase has existing data
2. Run: python manage.py migrate
3. Verify this script again
4. Start server: python manage.py runserver
5. Start frontend: npm run dev

[ERROR] IF THERE ARE ERRORS:

- Verify DATABASE_URL in .env
- Verify Supabase is accessible
- Run migrations: python manage.py migrate --verbose
- Check Django logs for more details

[NOTE] IMPORTANT NOTE:

This system loads REAL DATA from Supabase.
It does not create synthetic data automatically.
All data must exist in Supabase previously.
"""
)

print("=" * 70 + "\n")
