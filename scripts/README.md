# Scripts de Prueba - Mundo Reporte

Este directorio contiene scripts especializados para probar las diferentes funcionalidades del sistema.

## Prerrequisitos

Asegúrate de tener el backend corriendo en `http://localhost:8000`:

```bash
cd backend
venv\Scripts\python.exe manage.py runserver
```

## Scripts Disponibles

### 1. test_usuarios_api.py

Prueba completa del sistema de usuarios incluyendo:

- ✅ Login de administrador
- ✅ Creación de usuarios operarios
- ✅ Login de operarios
- ✅ Obtención de perfil
- ✅ Actualización de perfil
- ✅ Cambio de contraseña
- ✅ Listado de usuarios (admin)
- ✅ Estadísticas de usuarios
- ✅ Edición de usuarios (admin)
- ✅ Desactivación de usuarios

**Ejecutar:**

```bash
cd backend
venv\Scripts\python.exe ..\scripts\test_usuarios_api.py
```

### 2. test_perfil.py

Prueba enfocada en el módulo de perfil:

- ✅ Autenticación
- ✅ Obtener perfil
- ✅ Actualizar nombre
- ✅ Actualizar edad
- ✅ Cambiar contraseña (exitoso)
- ✅ Cambiar contraseña con contraseña incorrecta (debe fallar)
- ✅ Intentar cambiar email (debe ser rechazado)
- ✅ Intentar cambiar cédula (debe ser rechazada)

**Ejecutar:**

```bash
cd backend
venv\Scripts\python.exe ..\scripts\test_perfil.py
```

## Formato de Salida

Los scripts utilizan códigos de color para facilitar la lectura:

- 🟢 Verde: Prueba exitosa
- 🔴 Rojo: Prueba fallida
- 🔵 Azul: Información
- 🟡 Amarillo: Advertencias

## Códigos de Salida

- `0`: Todas las pruebas pasaron
- `1`: Una o más pruebas fallaron

## Ejemplos de Uso

### Ejecutar todas las pruebas de usuarios:

```bash
cd backend
venv\Scripts\python.exe ..\scripts\test_usuarios_api.py
```

### Ejecutar solo pruebas de perfil:

```bash
cd backend
venv\Scripts\python.exe ..\scripts\test_perfil.py
```

### En CI/CD:

```bash
# Si alguna prueba falla, el script retorna código de salida 1
venv\Scripts\python.exe ..\scripts\test_usuarios_api.py && echo "Todas las pruebas pasaron"
```

## Notas Importantes

1. **Credenciales por defecto**: Los scripts usan las credenciales del superusuario por defecto:
   - Email: `andreyquic@gmail.com`
   - Password: `11Bakuarya11`

2. **Usuario de prueba**: El script `test_usuarios_api.py` crea un usuario de prueba que luego desactiva. Si el script falla a mitad de ejecución, es posible que el usuario quede en la base de datos.

3. **Base de datos**: Los scripts modifican la base de datos. Se recomienda ejecutarlos en un ambiente de desarrollo.

4. **Backend debe estar corriendo**: Todos los scripts requieren que el servidor backend esté corriendo en `http://localhost:8000`.

## Troubleshooting

### Error de conexión

```
Error en login: HTTPConnectionPool(host='localhost', port=8000)
```

**Solución**: Asegúrate de que el backend esté corriendo.

### Error 401 Unauthorized

```
Login falló: 401
```

**Solución**: Verifica las credenciales del superusuario o créalo nuevamente:

```bash
cd backend
venv\Scripts\python.exe manage.py crear_superusuario
```

### Error 404 Not Found

```
Error: 404 - /api/auth/perfil/
```

**Solución**: Verifica que las rutas del backend estén correctamente configuradas en `config/urls.py`.
