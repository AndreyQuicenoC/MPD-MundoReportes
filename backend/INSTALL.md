# Instalación del Backend

## Requisitos
- Python 3.11+
- PostgreSQL 14+
- pip

## Pasos

### 1. Crear entorno virtual
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos

Crear base de datos PostgreSQL:
```sql
CREATE DATABASE mundo_reporte;
CREATE USER mundo_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE mundo_reporte TO mundo_user;
```

### 4. Variables de entorno

Crear archivo `.env` en la raíz del backend:

```env
# Django
SECRET_KEY=tu_secret_key_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=mundo_reporte
DB_USER=mundo_user
DB_PASSWORD=tu_password_seguro
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 5. Migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear superusuario
```bash
python manage.py createsuperuser
```

### 7. Ejecutar servidor
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## Verificación

- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/schema/swagger-ui/
- API Root: http://localhost:8000/api/

## Ejecutar tests
```bash
pytest
```

## Checks de calidad
```bash
# Format code
black .

# Check linting
flake8

# Run all checks
black . && flake8 && pytest
```
