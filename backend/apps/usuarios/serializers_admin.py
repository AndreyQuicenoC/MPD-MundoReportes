"""
Serializadores adicionales para gestión de usuarios por administradores.

Incluye serializadores para CRUD completo de usuarios y gestión de perfil.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario


class AdminUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador completo de usuario para administradores.
    
    Permite ver y editar todos los campos del usuario.
    """
    
    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "nombre",
            "cedula",
            "edad",
            "fecha_ingreso",
            "fecha_fin",
            "rol",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]


class AdminCrearUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para que administradores creen nuevos usuarios.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    
    password_confirmacion = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    
    class Meta:
        model = Usuario
        fields = [
            "email",
            "nombre",
            "cedula",
            "edad",
            "fecha_ingreso",
            "fecha_fin",
            "password",
            "password_confirmacion",
            "rol",
            "is_active",
        ]
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan."""
        if attrs["password"] != attrs["password_confirmacion"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        return attrs
    
    def validate_cedula(self, value):
        """Validar que la cédula sea única si se proporciona."""
        if value and Usuario.objects.filter(cedula=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con esta cédula")
        return value
    
    def validate_fecha_fin(self, value):
        """Validar que fecha_fin sea posterior a fecha_ingreso."""
        fecha_ingreso = self.initial_data.get("fecha_ingreso")
        if value and fecha_ingreso and value < fecha_ingreso:
            raise serializers.ValidationError(
                "La fecha de fin debe ser posterior a la fecha de ingreso"
            )
        return value
    
    def create(self, validated_data):
        """Crear usuario con contraseña hasheada."""
        validated_data.pop("password_confirmacion")
        password = validated_data.pop("password")
        
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(password)
        usuario.save()
        
        return usuario


class AdminActualizarUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para que administradores actualicen usuarios existentes.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    
    password_confirmacion = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={"input_type": "password"},
    )
    
    class Meta:
        model = Usuario
        fields = [
            "email",
            "nombre",
            "cedula",
            "edad",
            "fecha_ingreso",
            "fecha_fin",
            "password",
            "password_confirmacion",
            "rol",
            "is_active",
        ]
    
    def validate(self, attrs):
        """Validar contraseñas si se están actualizando."""
        password = attrs.get("password")
        password_confirmacion = attrs.get("password_confirmacion")
        
        if password or password_confirmacion:
            if password != password_confirmacion:
                raise serializers.ValidationError(
                    {"password": "Las contraseñas no coinciden"}
                )
        
        return attrs
    
    def validate_cedula(self, value):
        """Validar que la cédula sea única si se está cambiando."""
        if value:
            usuario_id = self.instance.id if self.instance else None
            if (
                Usuario.objects.filter(cedula=value)
                .exclude(id=usuario_id)
                .exists()
            ):
                raise serializers.ValidationError(
                    "Ya existe un usuario con esta cédula"
                )
        return value
    
    def update(self, instance, validated_data):
        """Actualizar usuario, incluyendo contraseña si se proporciona."""
        password = validated_data.pop("password", None)
        validated_data.pop("password_confirmacion", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para que usuarios vean y editen su propio perfil.
    
    No permite editar email ni cédula.
    """
    
    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "nombre",
            "cedula",
            "edad",
            "fecha_ingreso",
            "fecha_fin",
            "rol",
            "date_joined",
            "last_login",
        ]
        read_only_fields = [
            "id",
            "email",
            "cedula",
            "rol",
            "date_joined",
            "last_login",
            "fecha_fin",
        ]


class CambiarContrasenaSerializer(serializers.Serializer):
    """
    Serializador para que usuarios cambien su propia contraseña.
    
    Requiere la contraseña actual para validar.
    """
    
    contrasena_actual = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    
    contrasena_nueva = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    
    contrasena_confirmacion = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    
    def validate_contrasena_actual(self, value):
        """Validar que la contraseña actual sea correcta."""
        usuario = self.context["request"].user
        if not usuario.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta")
        return value
    
    def validate(self, attrs):
        """Validar que las contraseñas nuevas coincidan."""
        if attrs["contrasena_nueva"] != attrs["contrasena_confirmacion"]:
            raise serializers.ValidationError(
                {"contrasena_nueva": "Las contraseñas no coinciden"}
            )
        return attrs
    
    def save(self, **kwargs):
        """Cambiar la contraseña del usuario."""
        usuario = self.context["request"].user
        usuario.set_password(self.validated_data["contrasena_nueva"])
        usuario.save()
        return usuario
