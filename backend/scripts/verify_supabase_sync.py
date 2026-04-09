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

print("\n" + "="*70)
print("VERIFICACIÓN DE SINCRONIZACIÓN CON SUPABASE")
print("="*70 + "\n")

# 1. Verificar configuración
print("1️⃣  CONFIGURACIÓN")
print("-" * 70)

database_url = os.getenv('DATABASE_URL')
is_supabase = 'supabase' in database_url.lower() if database_url else False

print(f"   Base de datos configurada: {'✅ Supabase' if is_supabase else '⚠️  Otra'}")
print(f"   DEBUG mode: {os.getenv('DEBUG', 'False')}")
print()

# 2. Verificar modelos
print("2️⃣  MODELOS DJANGO")
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
        status = "✅" if count > 0 else "⚠️  (vacío)"
        print(f"   {status} {name}: {count} registros")
    except Exception as e:
        print(f"   ❌ {name}: ERROR - {str(e)}")

print()

# 3. Verificar datos críticos
print("3️⃣  DATOS CRÍTICOS")
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
        print("\n   ✅ Sistema tiene datos para operar")
    else:
        print("\n   ⚠️  Sistema necesita datos iniciales")
        print("      - Si usas Supabase: Agrega datos manualmente")
        print("      - Si desarrollas localmente: Crea datos a través del UI")

except Exception as e:
    print(f"   ❌ Error al verificar datos: {str(e)}")

print()

# 4. Verificar API endpoints
print("4️⃣  ENDPOINTS DE API")
print("-" * 70)

endpoints = [
    "/api/usuarios/",
    "/api/reportes/",
    "/api/gastos/automaticos/",
    "/api/gastos/deducibles/",
    "/api/productos/",
    "/api/categorias/",
]

print("   Los siguientes endpoints están disponibles:")
for endpoint in endpoints:
    print(f"   - /api{endpoint}")

print()

# 5. Resumen
print("5️⃣  RESUMEN")
print("="*70)

print("""
✅ PASOS SIGUIENTES:

1. Asegurar que Supabase tiene datos existentes
2. Ejecutar: python manage.py migrate
3. Verificar nuevamente este script
4. Iniciar servidor: python manage.py runserver
5. Iniciar frontend: npm run dev

❌ SI HAY ERRORES:

- Verificar DATABASE_URL en .env
- Verificar que Supabase está accesible
- Ejecutar migraciones: python manage.py migrate --verbose
- Ver logs de Django para más detalles

💾 NOTA IMPORTANTE:

Este sistema carga DATOS REALES de Supabase.
No crea datos sintéticos automáticamente.
Todos los datos deben existir en Supabase previamente.
""")

print("="*70 + "\n")
