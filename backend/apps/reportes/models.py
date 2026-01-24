"""
Modelos de la aplicación de reportes.

Define los modelos principales del sistema:
- ReporteDiario: Reporte diario de ventas y gastos
- VentaProducto: Cantidad vendida por producto en un reporte
"""

from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class ReporteDiario(models.Model):
    """
    Modelo de reporte diario.

    Representa un reporte de ventas y gastos de un día específico.
    Incluye cálculos automáticos de total de gastos y base siguiente.
    """

    fecha = models.DateField(
        verbose_name="fecha del reporte",
        unique=True,
        db_index=True,
        help_text="Fecha única del reporte",
    )

    base_inicial = models.DecimalField(
        verbose_name="base inicial",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base en efectivo al inicio del día",
    )

    venta_total = models.DecimalField(
        verbose_name="venta total",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total de ventas del día",
    )

    total_gastos = models.DecimalField(
        verbose_name="total de gastos",
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0)],
        help_text="Total de gastos del día (calculado automáticamente)",
    )

    entrega = models.DecimalField(
        verbose_name="entrega",
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=Decimal("0.00"),
        help_text="Dinero entregado/retirado del día",
    )

    base_siguiente = models.DecimalField(
        verbose_name="base del día siguiente",
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Base calculada para el día siguiente",
    )

    observacion = models.TextField(
        verbose_name="observación",
        blank=True,
        help_text="Observaciones o notas adicionales del día",
    )

    usuario_creacion = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.SET_NULL,
        null=True,
        related_name="reportes_creados",
        verbose_name="usuario que creó el reporte",
    )

    # Timestamps
    fecha_creacion = models.DateTimeField(
        verbose_name="fecha de creación", auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        verbose_name="fecha de actualización", auto_now=True
    )

    class Meta:
        verbose_name = "reporte diario"
        verbose_name_plural = "reportes diarios"
        ordering = ["-fecha"]
        indexes = [
            models.Index(fields=["-fecha"]),
            models.Index(fields=["fecha_creacion"]),
        ]

    def __str__(self):
        """Representación en string del reporte."""
        return f"Reporte {self.fecha} - Venta: ${self.venta_total:,.0f}"

    def calcular_total_gastos(self):
        """
        Calcular el total de gastos del día.

        Suma todos los gastos asociados al reporte.

        Returns:
            Decimal: Total de gastos
        """
        return self.gastos.aggregate(
            total=models.Sum("valor")
        )["total"] or Decimal("0.00")

    def calcular_base_siguiente(self):
        """
        Calcular la base del día siguiente.

        Fórmula: base_siguiente = base_inicial + venta - gastos - entrega

        Returns:
            Decimal: Base calculada para el día siguiente
        """
        return (
            self.base_inicial
            + self.venta_total
            - self.total_gastos
            - self.entrega
        )

    def save(self, *args, **kwargs):
        """
        Guardar el reporte.

        Calcula automáticamente total de gastos y base siguiente
        antes de guardar.
        """
        # Calcular total de gastos si el reporte ya existe
        if self.pk:
            self.total_gastos = self.calcular_total_gastos()

        # Calcular base del día siguiente
        self.base_siguiente = self.calcular_base_siguiente()

        super().save(*args, **kwargs)


class VentaProducto(models.Model):
    """
    Modelo de venta de producto.

    Representa la cantidad vendida de un producto específico
    en un reporte diario.
    """

    reporte = models.ForeignKey(
        ReporteDiario,
        on_delete=models.CASCADE,
        related_name="ventas_productos",
        verbose_name="reporte diario",
    )

    producto = models.ForeignKey(
        "productos.Producto",
        on_delete=models.PROTECT,
        related_name="ventas",
        verbose_name="producto",
    )

    cantidad = models.PositiveIntegerField(
        verbose_name="cantidad vendida",
        validators=[MinValueValidator(1)],
        help_text="Cantidad de unidades vendidas",
    )

    precio_unitario_momento = models.DecimalField(
        verbose_name="precio unitario en el momento de la venta",
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Precio del producto al momento de registrar la venta",
    )

    # Timestamps
    fecha_creacion = models.DateTimeField(
        verbose_name="fecha de creación", auto_now_add=True
    )

    class Meta:
        verbose_name = "venta de producto"
        verbose_name_plural = "ventas de productos"
        ordering = ["-fecha_creacion"]
        unique_together = [["reporte", "producto"]]
        indexes = [
            models.Index(fields=["reporte", "producto"]),
        ]

    def __str__(self):
        """Representación en string de la venta."""
        return f"{self.producto.nombre} x{self.cantidad} - Reporte {self.reporte.fecha}"

    @property
    def subtotal(self):
        """
        Calcular el subtotal de la venta.

        Returns:
            Decimal: Precio unitario * cantidad
        """
        return self.precio_unitario_momento * self.cantidad
