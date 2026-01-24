"""
Serializadores para la aplicación de productos.

Maneja la serialización y validación de datos de productos.
"""

from rest_framework import serializers
from .models import Producto


class ProductoSerializer(serializers.ModelSerializer):
    """
    Serializador de productos.

    Serializa todos los campos del producto para la API.
    """

    class Meta:
        model = Producto
        fields = [
            "id",
            "nombre",
            "precio_unitario",
            "activo",
            "fecha_creacion",
            "fecha_actualizacion",
        ]
        read_only_fields = ["id", "fecha_creacion", "fecha_actualizacion"]

    def validate_nombre(self, value):
        """
        Validar que el nombre no esté vacío y sea único.

        Args:
            value: Nombre del producto

        Returns:
            str: Nombre validado

        Raises:
            serializers.ValidationError: Si el nombre está vacío
        """
        if not value.strip():
            raise serializers.ValidationError("El nombre del producto no puede estar vacío")

        return value.strip()

    def validate_precio_unitario(self, value):
        """
        Validar que el precio sea mayor o igual a cero.

        Args:
            value: Precio unitario

        Returns:
            Decimal: Precio validado

        Raises:
            serializers.ValidationError: Si el precio es negativo
        """
        if value < 0:
            raise serializers.ValidationError("El precio unitario no puede ser negativo")

        return value


class ProductoListaSerializer(serializers.ModelSerializer):
    """
    Serializador simplificado para listas de productos.

    Solo incluye campos esenciales para visualización en listas.
    """

    class Meta:
        model = Producto
        fields = ["id", "nombre", "precio_unitario", "activo"]
