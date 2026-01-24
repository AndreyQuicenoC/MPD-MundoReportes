"""
Servicio para gestión de usuarios.

Proporciona funciones auxiliares para operaciones con usuarios.
"""

from django.contrib.auth import get_user_model

Usuario = get_user_model()


def crear_usuario_operario(email, nombre, cedula, password, edad=None, fecha_ingreso=None):
    """
    Crear un usuario operario.
    
    Args:
        email: Correo electrónico del usuario
        nombre: Nombre completo
        cedula: Número de cédula
        password: Contraseña
        edad: Edad del usuario (opcional)
        fecha_ingreso: Fecha de ingreso (opcional)
    
    Returns:
        Usuario: Instancia del usuario creado
    """
    usuario = Usuario.objects.create_user(
        email=email,
        nombre=nombre,
        cedula=cedula,
        password=password,
        edad=edad,
        fecha_ingreso=fecha_ingreso,
        rol=Usuario.ROL_USUARIO,
    )
    return usuario


def obtener_usuarios_activos():
    """
    Obtener todos los usuarios activos que pueden acceder al sistema.
    
    Returns:
        QuerySet: Usuarios activos sin fecha de fin vencida
    """
    from datetime import date
    
    return Usuario.objects.filter(
        is_active=True
    ).exclude(
        fecha_fin__lt=date.today()
    )


def verificar_acceso_usuario(usuario):
    """
    Verificar si un usuario puede acceder al sistema.
    
    Args:
        usuario: Instancia del usuario
    
    Returns:
        tuple: (puede_acceder: bool, mensaje: str)
    """
    if not usuario.is_active:
        return False, "Usuario desactivado"
    
    from datetime import date
    if usuario.fecha_fin and date.today() > usuario.fecha_fin:
        return False, "Período de acceso finalizado"
    
    return True, "Acceso permitido"
