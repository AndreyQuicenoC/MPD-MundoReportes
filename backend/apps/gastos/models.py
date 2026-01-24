"""
Modelos de la aplicación de gastos.

Define categorías de gastos y gastos individuales
asociados a reportes diarios.
"""

from django.db import models
from django.core.validators import MinValueValidator


class CategoriaGasto(models.Model):
    """
    Modelo de categoría de gasto.

    Categorías reutilizables para clasificar gastos.
    Ejemplos: Servicios, Nómina, Compras, etc.
    """

    nombre = models.CharField(
        verbose_name="nombre de la categoría",
        max_length=100,
        unique=True,
        help_text="Nombre único de la categoría",
    )

    descripcion = models.TextField(
        verbose_name="descripción",
        blank=True,
        help_text="Descripción opcional de la categoría",
    )

    activa = models.BooleanField(
        verbose_name="activa",
        default=True,
        help_text="Indica si la categoría está activa",
    )

    # Timestamps
    fecha_creacion = models.DateTimeField(
        verbose_name="fecha de creación", auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        verbose_name="fecha de actualización", auto_now=True
    )

    class Meta:
        verbose_name = "categoría de gasto"
        verbose_name_plural = "categorías de gastos"
        ordering = ["nombre"]
        indexes = [
            models.Index(fields=["nombre"]),
            models.Index(fields=["activa"]),
        ]

    def __str__(self):
        """Representación en string de la categoría."""
        estado = "activa" if self.activa else "inactiva"
        return f"{self.nombre} ({estado})"


class Gasto(models.Model):
    """
    Modelo de gasto individual.

    Representa un gasto asociado a un reporte diario.
    La categoría es opcional pero recomendada.
    """

    reporte = models.ForeignKey(
        "reportes.ReporteDiario",
        on_delete=models.CASCADE,
        related_name="gastos",
        verbose_name="reporte diario",
    )

    descripcion = models.CharField(
        verbose_name="descripción",
        max_length=200,
        help_text="Descripción breve del gasto",
    )

    valor = models.DecimalField(
        verbose_name="valor",
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Valor del gasto en pesos colombianos",
    )

    categoria = models.ForeignKey(
        CategoriaGasto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gastos",
        verbose_name="categoría",
        help_text="Categoría del gasto (opcional)",
    )

    # Timestamps
    fecha_creacion = models.DateTimeField(
        verbose_name="fecha de creación", auto_now_add=True
    )

    class Meta:
        verbose_name = "gasto"
        verbose_name_plural = "gastos"
        ordering = ["-fecha_creacion"]
        indexes = [
            models.Index(fields=["reporte", "categoria"]),
            models.Index(fields=["-fecha_creacion"]),
        ]

    def __str__(self):
        """Representación en string del gasto."""
        categoria_str = f" - {self.categoria.nombre}" if self.categoria else ""
        return f"{self.descripcion}: ${self.valor:,.0f}{categoria_str}"
