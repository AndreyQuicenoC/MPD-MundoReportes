import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.reportes.models import ReporteDiario
from datetime import datetime

# Contar reportes
total = ReporteDiario.objects.count()
print(f"Total reportes en BD: {total}")

# Reportes del mes actual
hoy = datetime.now().date()
primer_dia = hoy.replace(day=1)
reportes_mes = ReporteDiario.objects.filter(fecha__gte=primer_dia, fecha__lte=hoy)
print(f"\nReportes del mes actual ({primer_dia} a {hoy}): {reportes_mes.count()}")

for r in reportes_mes:
    print(f"  - ID: {r.id}, Fecha: {r.fecha}, Venta: ${r.venta_total}, Gastos: ${r.total_gastos}")

# Todos los reportes
print(f"\nTodos los reportes:")
for r in ReporteDiario.objects.all():
    print(f"  - ID: {r.id}, Fecha: {r.fecha}, Venta: ${r.venta_total}, Gastos: ${r.total_gastos}")

# Probar estadísticas
print("\n=== Probando ServicioEstadisticas ===")
from apps.estadisticas.services import ServicioEstadisticas

try:
    ventas = ServicioEstadisticas.estadisticas_ventas(primer_dia, hoy)
    print(f"✅ Ventas mes: ${ventas['total_ventas']}")
    print(f"   Total reportes: {ventas.get('total_reportes', 'NO EXISTE')}")
    print(f"   Cantidad reportes: {ventas.get('cantidad_reportes', 'NO EXISTE')}")
except Exception as e:
    print(f"❌ Error en estadisticas_ventas: {e}")

try:
    gastos = ServicioEstadisticas.estadisticas_gastos(primer_dia, hoy)
    print(f"✅ Gastos mes: ${gastos['total_gastos']}")
except Exception as e:
    print(f"❌ Error en estadisticas_gastos: {e}")
