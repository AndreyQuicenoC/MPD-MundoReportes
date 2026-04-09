"""
Comando para crear usuario de prueba y datos sintéticos.
Uso: python manage.py crear_datos_prueba
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.usuarios.models import Usuario
from apps.productos.models import Producto
from apps.gastos.models import CategoriaGasto, GastoAutomatico, Gasto
from apps.reportes.models import ReporteDiario, VentaProducto
import random

class Command(BaseCommand):
    help = 'Crea usuarios, productos, categorías y reportes de prueba'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando creacion de datos de prueba...'))

        # 1. Crear usuario de prueba
        try:
            # Generar cédula única
            cedula_unica = str(random.randint(1000000000, 9999999999))

            usuario, created = Usuario.objects.get_or_create(
                email='usuario@prueba.com',
                defaults={
                    'nombre': 'Usuario Prueba',
                    'cedula': cedula_unica,
                    'edad': 35,
                    'rol': 'usuario',
                    'is_active': True,
                }
            )
            if created:
                usuario.set_password('123456789')
                usuario.save()
                self.stdout.write(self.style.SUCCESS(f'[OK] Usuario creado: {usuario.email} (contraseña: 123456789)'))
            else:
                self.stdout.write(self.style.WARNING(f'[EXISTE] Usuario ya existe: {usuario.email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Error al crear usuario: {e}'))
            return

        # 2. Crear categorías de gastos
        categorias_data = [
            'Transporte',
            'Alimentación',
            'Servicios',
            'Mantenimiento',
            'Publicidad',
            'Otros'
        ]
        categorias = []
        for nombre in categorias_data:
            cat, created = CategoriaGasto.objects.get_or_create(
                nombre=nombre
            )
            categorias.append(cat)
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Categoria creada: {nombre}'))

        # 3. Crear productos
        productos_data = [
            {'nombre': 'Pintura Blanca Interior', 'precio': 45000},
            {'nombre': 'Pintura Roja Interior', 'precio': 48000},
            {'nombre': 'Pintura Azul Exterior', 'precio': 55000},
            {'nombre': 'Pintura Verde', 'precio': 50000},
            {'nombre': 'Brocha grande', 'precio': 12000},
            {'nombre': 'Brocha pequeña', 'precio': 5000},
            {'nombre': 'Rodillo', 'precio': 8000},
            {'nombre': 'Masking tape', 'precio': 6000},
        ]
        productos = []
        for prod_data in productos_data:
            prod, created = Producto.objects.get_or_create(
                nombre=prod_data['nombre'],
                defaults={
                    'precio_unitario': prod_data['precio'],
                    'activo': True,
                }
            )
            productos.append(prod)
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Producto creado: {prod.nombre}'))

        # 4. Crear gastos automáticos
        gastos_auto_data = [
            {'descripcion': 'Arriendo local mensual', 'valor': 1500000, 'categoria': categorias[2]},
            {'descripcion': 'Servicios (agua, luz, internet)', 'valor': 350000, 'categoria': categorias[2]},
            {'descripcion': 'Salario personal', 'valor': 2000000, 'categoria': categorias[3]},
            {'descripcion': 'Gasolina transporte', 'valor': 200000, 'categoria': categorias[0]},
        ]
        for gasto_data in gastos_auto_data:
            gasto_auto, created = GastoAutomatico.objects.get_or_create(
                descripcion=gasto_data['descripcion'],
                defaults={
                    'valor': gasto_data['valor'],
                    'categoria': gasto_data['categoria'],
                    'activo': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Gasto automatico creado: {gasto_auto.descripcion}'))

        # 5. Crear reportes de prueba (últimos 10 días)
        for dias_atras in range(10):
            fecha = timezone.now().date() - timedelta(days=dias_atras)

            # Saltar si ya existe reporte para esta fecha
            if ReporteDiario.objects.filter(fecha=fecha, usuario_creacion=usuario).exists():
                continue

            # Valores aleatorios
            base_inicial = random.randint(500000, 2000000)
            venta_total = random.randint(800000, 5000000)
            total_gastos = random.randint(200000, 1000000)
            entrega = random.randint(100000, 800000)
            base_siguiente = base_inicial + venta_total - total_gastos - entrega

            try:
                reporte = ReporteDiario.objects.create(
                    usuario_creacion=usuario,
                    fecha=fecha,
                    base_inicial=base_inicial,
                    venta_total=venta_total,
                    total_gastos=total_gastos,
                    entrega=entrega,
                    base_siguiente=max(0, base_siguiente),
                    observacion=f'Reporte de {fecha.strftime("%d/%m/%Y")}'
                )

                # Crear gastos asociados
                for _ in range(random.randint(2, 5)):
                    gasto_val = random.randint(50000, 300000)
                    Gasto.objects.create(
                        reporte=reporte,
                        descripcion=f'Gasto aleatorio {_+1}',
                        valor=gasto_val,
                        categoria=random.choice(categorias)
                    )

                # Crear ventas de productos
                for _ in range(random.randint(3, 8)):
                    producto = random.choice(productos)
                    cantidad = random.randint(1, 20)
                    VentaProducto.objects.create(
                        reporte=reporte,
                        producto=producto,
                        cantidad=cantidad,
                        precio_unitario_momento=producto.precio_unitario
                    )

                self.stdout.write(self.style.SUCCESS(f'[OK] Reporte creado para {fecha}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'[ERROR] Error al crear reporte: {e}'))

        self.stdout.write(self.style.SUCCESS('\n[LISTO] Datos de prueba creados exitosamente'))
        self.stdout.write(self.style.SUCCESS('Credenciales: usuario@prueba.com / 123456789'))
