"""
Manejador personalizado de excepciones para la API.

Este módulo proporciona un manejador de excepciones centralizado
que formatea los errores de manera consistente y evita exponer
detalles internos del sistema al cliente.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones.

    Formatea todas las excepciones con una estructura consistente
    y evita exponer información sensible del sistema.
    """
    # Llamar al manejador por defecto primero
    response = exception_handler(exc, context)

    if response is not None:
        # Formatear respuesta de error de manera consistente
        custom_response = {"error": True, "mensaje": None, "detalles": {}}

        if isinstance(response.data, dict):
            # Si hay un mensaje general, usarlo
            if "detail" in response.data:
                custom_response["mensaje"] = str(response.data["detail"])
            else:
                custom_response["mensaje"] = "Error en la solicitud"

            # Incluir detalles de validación si existen
            custom_response["detalles"] = {
                key: value for key, value in response.data.items() if key != "detail"
            }
        else:
            custom_response["mensaje"] = str(response.data)

        response.data = custom_response

    return response
