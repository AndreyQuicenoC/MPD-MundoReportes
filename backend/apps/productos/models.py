"""
Modelos de la aplicación de productos.

Define el catálogo de productos del almacén con
su información y precio unitario.
"""

from django.db import models
from django.core.validators import MinValueValidator


class Producto(models.Model):
    """
    Modelo de producto.

    Representa un producto del catálogo del almacén de pinturas.
    Incluye nombre, precio unitario y estado activo.
    """

    nombre = models.CharField(
        verbose_name="nombre del producto",
        max_length=200,
        unique=True,
        help_text="Nombre único del producto",
    )

    precio_unitario = models.DecimalField(
        verbose_name="precio unitario",
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Precio de venta por unidad en pesos colombianos",
    )

    activo = models.BooleanField(
        verbose_name="activo",
        default=True,
        help_text="Indica si el producto está activo para ventas",
    )

    # Timestamps
    fecha_creacion = models.DateTimeField(
        verbose_name="fecha de creación", auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        verbose_name="fecha de actualización", auto_now=True
    )

    class Meta:
        verbose_name = "producto"
        verbose_name_plural = "productos"
        ordering = ["nombre"]
        indexes = [
            models.Index(fields=["nombre"]),
            models.Index(fields=["activo"]),
        ]

    def __str__(self):
        """Representación en string del producto."""
        estado = "activo" if self.activo else "inactivo"
        return f"{self.nombre} - ${self.precio_unitario:,.0f} ({estado})"
