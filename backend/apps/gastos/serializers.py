"""
Serializadores para la aplicación de gastos.

Maneja la serialización y validación de categorías, gastos,
gastos automáticos y gastos deducibles.
"""

from rest_framework import serializers
from .models import CategoriaGasto, Gasto, GastoAutomatico, GastoDeducible


class CategoriaGastoSerializer(serializers.ModelSerializer):
    """
    Serializador de categorías de gasto.

    Serializa todos los campos de la categoría.
    """

    class Meta:
        model = CategoriaGasto
        fields = [
            "id",
            "nombre",
            "descripcion",
            "activa",
            "fecha_creacion",
            "fecha_actualizacion",
        ]
        read_only_fields = ["id", "fecha_creacion", "fecha_actualizacion"]

    def validate_nombre(self, value):
        """
        Validar que el nombre no esté vacío.

        Args:
            value: Nombre de la categoría

        Returns:
            str: Nombre validado

        Raises:
            serializers.ValidationError: Si el nombre está vacío
        """
        if not value.strip():
            raise serializers.ValidationError("El nombre de la categoría no puede estar vacío")

        return value.strip()


class CategoriaGastoListaSerializer(serializers.ModelSerializer):
    """
    Serializador simplificado para listas de categorías.
    """

    class Meta:
        model = CategoriaGasto
        fields = ["id", "nombre", "activa"]


class GastoSerializer(serializers.ModelSerializer):
    """
    Serializador de gasto.

    Incluye información de la categoría si existe.
    """

    categoria_info = CategoriaGastoListaSerializer(source="categoria", read_only=True)

    class Meta:
        model = Gasto
        fields = [
            "id",
            "descripcion",
            "valor",
            "categoria",
            "categoria_info",
            "fecha_creacion",
        ]
        read_only_fields = ["id", "fecha_creacion"]

    def validate_descripcion(self, value):
        """
        Validar que la descripción no esté vacía.

        Args:
            value: Descripción del gasto

        Returns:
            str: Descripción validada

        Raises:
            serializers.ValidationError: Si la descripción está vacía
        """
        if not value.strip():
            raise serializers.ValidationError("La descripción del gasto no puede estar vacía")

        return value.strip()

    def validate_valor(self, value):
        """
        Validar que el valor sea mayor a cero.

        Args:
            value: Valor del gasto

        Returns:
            Decimal: Valor validado

        Raises:
            serializers.ValidationError: Si el valor es cero o negativo
        """
        if value <= 0:
            raise serializers.ValidationError("El valor del gasto debe ser mayor a cero")

        return value


class GastoSimpleSerializer(serializers.ModelSerializer):
    """
    Serializador simple de gasto sin el reporte.

    Usado para incluir gastos en el serializador de reportes.
    """

    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)

    class Meta:
        model = Gasto
        fields = ["id", "descripcion", "valor", "categoria", "categoria_nombre"]


class GastoAutomaticoSerializer(serializers.ModelSerializer):
    """Serializador para gastos automáticos predefinidos."""

    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)

    class Meta:
        model = GastoAutomatico
        fields = ["id", "categoria", "categoria_nombre", "descripcion", "valor", "activo"]


class GastoDeducibleSerializer(serializers.ModelSerializer):
    """Serializador para categorías de gastos deducibles."""

    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)

    class Meta:
        model = GastoDeducible
        fields = ["id", "categoria", "categoria_nombre", "tipo", "descripcion", "activo"]
