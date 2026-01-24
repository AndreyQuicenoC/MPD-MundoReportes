"""
Serializadores para la aplicación de usuarios.

Maneja la serialización y validación de datos de usuarios,
incluyendo registro, login y perfil.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador básico de usuario.

    Muestra información del usuario sin datos sensibles.
    """

    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre", "rol", "is_active", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class RegistroSerializer(serializers.ModelSerializer):
    """
    Serializador para registro de nuevos usuarios.

    Valida email, contraseña y datos básicos.
    Solo administradores pueden crear usuarios.
    """

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password], style={"input_type": "password"}
    )

    password_confirmacion = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = Usuario
        fields = ["email", "nombre", "password", "password_confirmacion", "rol"]

    def validate(self, attrs):
        """
        Validar que las contraseñas coincidan.

        Args:
            attrs: Atributos del serializador

        Returns:
            dict: Atributos validados

        Raises:
            serializers.ValidationError: Si las contraseñas no coinciden
        """
        if attrs["password"] != attrs["password_confirmacion"]:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})

        return attrs

    def create(self, validated_data):
        """
        Crear un nuevo usuario.

        Args:
            validated_data: Datos validados

        Returns:
            Usuario: Instancia del usuario creado
        """
        # Remover confirmación de contraseña
        validated_data.pop("password_confirmacion")

        # Crear usuario usando el manager
        user = Usuario.objects.create_user(
            email=validated_data["email"],
            nombre=validated_data["nombre"],
            password=validated_data["password"],
            rol=validated_data.get("rol", Usuario.ROL_USUARIO),
        )

        return user


class CambioPasswordSerializer(serializers.Serializer):
    """
    Serializador para cambio de contraseña.

    Permite a un usuario cambiar su propia contraseña.
    """

    password_actual = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    password_nueva = serializers.CharField(
        required=True, write_only=True, validators=[validate_password], style={"input_type": "password"}
    )

    password_confirmacion = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )

    def validate_password_actual(self, value):
        """
        Validar que la contraseña actual sea correcta.

        Args:
            value: Contraseña actual proporcionada

        Returns:
            str: Contraseña validada

        Raises:
            serializers.ValidationError: Si la contraseña es incorrecta
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta")
        return value

    def validate(self, attrs):
        """
        Validar que las contraseñas nuevas coincidan.

        Args:
            attrs: Atributos del serializador

        Returns:
            dict: Atributos validados

        Raises:
            serializers.ValidationError: Si las contraseñas no coinciden
        """
        if attrs["password_nueva"] != attrs["password_confirmacion"]:
            raise serializers.ValidationError(
                {"password_nueva": "Las contraseñas nuevas no coinciden"}
            )

        return attrs

    def save(self, **kwargs):
        """
        Guardar la nueva contraseña.

        Returns:
            Usuario: Usuario con contraseña actualizada
        """
        user = self.context["request"].user
        user.set_password(self.validated_data["password_nueva"])
        user.save()
        return user


class PerfilSerializer(serializers.ModelSerializer):
    """
    Serializador para el perfil del usuario autenticado.

    Permite ver y actualizar datos básicos del perfil.
    """

    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre", "rol", "date_joined", "last_login"]
        read_only_fields = ["id", "email", "rol", "date_joined", "last_login"]
