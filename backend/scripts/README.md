# Scripts de Backend

Este directorio contiene scripts útiles para el desarrollo y despliegue del backend.

## Scripts Disponibles

### deploy.sh
- **Descripción**: Script de despliegue para producción
- **Uso**: `./deploy.sh`
- **Requisitos**: Git, acceso a repositorio remoto
- **Función**: Compilar, preparar y desplegar el backend a Render

## Comandos de Django

### Crear datos de prueba
```bash
python manage.py crear_datos_prueba
```
Crea un usuario de prueba y datos sintéticos para desarrollo.

**Credenciales de prueba:**
- Email: usuario@prueba.com
- Contraseña: 123456789

### Ejecutar migraciones
```bash
python manage.py migrate
```

### Crear superusuario
```bash
python manage.py createsuperuser
```

### Ejecutar servidor de desarrollo
```bash
python manage.py runserver
```

### Compilar assets estáticos
```bash
python manage.py collectstatic
```
