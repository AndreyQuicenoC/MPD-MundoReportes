"""
Serializadores para la aplicación de reportes.

Maneja la serialización compleja de reportes con gastos
y ventas de productos anidados.
"""

from rest_framework import serializers
from decimal import Decimal
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.gastos.serializers import GastoSimpleSerializer
from apps.productos.models import Producto


class VentaProductoSerializer(serializers.ModelSerializer):
    """
    Serializador de venta de producto.

    Incluye información del producto y cálculo de subtotal.
    """

    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = VentaProducto
        fields = [
            "id",
            "producto",
            "producto_nombre",
            "cantidad",
            "precio_unitario_momento",
            "subtotal",
        ]
        read_only_fields = ["id", "precio_unitario_momento"]


class VentaProductoInputSerializer(serializers.Serializer):
    """
    Serializador para input de ventas de productos.

    Usado al crear/actualizar reportes.
    """

    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.filter(activo=True))
    cantidad = serializers.IntegerField(min_value=1)

    def validate_cantidad(self, value):
        """
        Validar que la cantidad sea un entero positivo.

        Args:
            value: Cantidad a validar

        Returns:
            int: Cantidad validada

        Raises:
            serializers.ValidationError: Si la cantidad no es válida
        """
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1")
        return value


class GastoInputSerializer(serializers.Serializer):
    """
    Serializador para input de gastos.

    Usado al crear/actualizar reportes.
    """

    descripcion = serializers.CharField(max_length=200)
    valor = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))
    categoria = serializers.IntegerField(required=False, allow_null=True)

    def validate_descripcion(self, value):
        """Validar que la descripción no esté vacía."""
        if not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía")
        return value.strip()


class ReporteDiarioSerializer(serializers.ModelSerializer):
    """
    Serializador completo de reporte diario.

    Incluye gastos y ventas de productos anidados.
    """

    gastos = GastoSimpleSerializer(many=True, read_only=True)
    ventas_productos = VentaProductoSerializer(many=True, read_only=True)
    usuario_nombre = serializers.CharField(source="usuario_creacion.nombre", read_only=True)

    class Meta:
        model = ReporteDiario
        fields = [
            "id",
            "fecha",
            "base_inicial",
            "venta_total",
            "total_gastos",
            "entrega",
            "base_siguiente",
            "observacion",
            "usuario_creacion",
            "usuario_nombre",
            "fecha_creacion",
            "fecha_actualizacion",
            "gastos",
            "ventas_productos",
        ]
        read_only_fields = [
            "id",
            "total_gastos",
            "base_siguiente",
            "usuario_creacion",
            "fecha_creacion",
            "fecha_actualizacion",
        ]


class ReporteDiarioListaSerializer(serializers.ModelSerializer):
    """
    Serializador simplificado para lista de reportes.

    Solo incluye campos esenciales para visualización en listas.
    """

    usuario_nombre = serializers.CharField(source="usuario_creacion.nombre", read_only=True)

    class Meta:
        model = ReporteDiario
        fields = [
            "id",
            "fecha",
            "base_inicial",
            "venta_total",
            "total_gastos",
            "base_siguiente",
            "usuario_nombre",
            "fecha_creacion",
        ]


class CrearReporteDiarioSerializer(serializers.Serializer):
    """
    Serializador para crear un nuevo reporte diario.

    Acepta datos del reporte, gastos y ventas de productos.
    """

    # Datos del reporte
    fecha = serializers.DateField()
    base_inicial = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0"))
    venta_total = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0"))
    entrega = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0"),
        default=Decimal("0.00"),
    )
    observacion = serializers.CharField(required=False, allow_blank=True, default="")

    # Datos anidados
    gastos = GastoInputSerializer(many=True, required=False, default=list)
    ventas_productos = VentaProductoInputSerializer(many=True, required=False, default=list)

    def validate_fecha(self, value):
        """
        Validar que no exista un reporte para la fecha.

        Args:
            value: Fecha a validar

        Returns:
            date: Fecha validada

        Raises:
            serializers.ValidationError: Si ya existe un reporte
        """
        # Solo validar en creación, no en actualización
        if not self.instance and ReporteDiario.objects.filter(fecha=value).exists():
            raise serializers.ValidationError(f"Ya existe un reporte para la fecha {value}")
        return value


class ActualizarReporteDiarioSerializer(serializers.Serializer):
    """
    Serializador para actualizar un reporte existente.

    Permite actualizar datos del reporte, gastos y ventas.
    """

    fecha = serializers.DateField(required=False)
    base_inicial = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0"), required=False
    )
    venta_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0"), required=False
    )
    entrega = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0"), required=False
    )
    observacion = serializers.CharField(required=False, allow_blank=True)

    gastos = GastoInputSerializer(many=True, required=False)
    ventas_productos = VentaProductoInputSerializer(many=True, required=False)

    def validate_fecha(self, value):
        """
        Validar que no exista otro reporte con la misma fecha.
        Excluye el reporte actual que se está actualizando.

        Args:
            value: Fecha a validar

        Returns:
            date: Fecha validada

        Raises:
            serializers.ValidationError: Si ya existe otro reporte con esa fecha
        """
        # Se asume que el ID del reporte se pasa en el contexto
        reporte_id = self.context.get('reporte_id')

        if reporte_id:
            # Excluir el reporte actual
            if ReporteDiario.objects.filter(fecha=value).exclude(id=reporte_id).exists():
                raise serializers.ValidationError(f"Ya existe otro reporte para la fecha {value}")
        else:
            # Si no hay ID, validar que no exista ninguno
            if ReporteDiario.objects.filter(fecha=value).exists():
                raise serializers.ValidationError(f"Ya existe un reporte para la fecha {value}")

        return value
