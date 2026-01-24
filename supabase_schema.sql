-- ================================================================
-- MUNDO REPORTE - SCHEMA SQL PARA SUPABASE
-- ================================================================
-- Este archivo contiene el esquema completo de la base de datos
-- para el proyecto Mundo Reporte.
-- 
-- INSTRUCCIONES:
-- 1. Abre el SQL Editor en tu proyecto de Supabase
-- 2. Copia y pega todo este contenido
-- 3. Ejecuta el script completo
-- 4. Configura las variables de entorno en el archivo .env
-- ================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- TABLA: auth_group (Django auth)
-- ================================================================
CREATE TABLE IF NOT EXISTS auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_group_name_idx ON auth_group(name);

-- ================================================================
-- TABLA: auth_permission (Django auth)
-- ================================================================
CREATE TABLE IF NOT EXISTS django_content_type (
    id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE(app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL REFERENCES django_content_type(id),
    codename VARCHAR(100) NOT NULL,
    UNIQUE(content_type_id, codename)
);

CREATE INDEX IF NOT EXISTS auth_permission_content_type_id_idx ON auth_permission(content_type_id);

-- ================================================================
-- TABLA: auth_group_permissions (Django auth)
-- ================================================================
CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(group_id, permission_id)
);

CREATE INDEX IF NOT EXISTS auth_group_permissions_group_id_idx ON auth_group_permissions(group_id);
CREATE INDEX IF NOT EXISTS auth_group_permissions_permission_id_idx ON auth_group_permissions(permission_id);

-- ================================================================
-- TABLA: usuarios_usuario (Usuarios personalizados)
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios_usuario (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    edad INTEGER CHECK (edad >= 0),
    fecha_ingreso DATE,
    fecha_fin DATE,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS usuarios_usuario_email_idx ON usuarios_usuario(email);
CREATE INDEX IF NOT EXISTS usuarios_usuario_rol_idx ON usuarios_usuario(rol);
CREATE INDEX IF NOT EXISTS usuarios_usuario_is_active_idx ON usuarios_usuario(is_active);

-- ================================================================
-- TABLA: usuarios_usuario_groups (Many-to-Many)
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios_usuario_groups (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios_usuario(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, group_id)
);

CREATE INDEX IF NOT EXISTS usuarios_usuario_groups_usuario_id_idx ON usuarios_usuario_groups(usuario_id);
CREATE INDEX IF NOT EXISTS usuarios_usuario_groups_group_id_idx ON usuarios_usuario_groups(group_id);

-- ================================================================
-- TABLA: usuarios_usuario_user_permissions (Many-to-Many)
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios_usuario_user_permissions (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios_usuario(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, permission_id)
);

CREATE INDEX IF NOT EXISTS usuarios_usuario_user_permissions_usuario_id_idx ON usuarios_usuario_user_permissions(usuario_id);
CREATE INDEX IF NOT EXISTS usuarios_usuario_user_permissions_permission_id_idx ON usuarios_usuario_user_permissions(permission_id);

-- ================================================================
-- TABLA: productos_producto (Catálogo de productos)
-- ================================================================
CREATE TABLE IF NOT EXISTS productos_producto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) UNIQUE NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS productos_producto_nombre_idx ON productos_producto(nombre);
CREATE INDEX IF NOT EXISTS productos_producto_activo_idx ON productos_producto(activo);
CREATE INDEX IF NOT EXISTS productos_producto_nombre_trgm_idx ON productos_producto USING gin(nombre gin_trgm_ops);

-- ================================================================
-- TABLA: gastos_categoriagasto (Categorías de gastos)
-- ================================================================
CREATE TABLE IF NOT EXISTS gastos_categoriagasto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS gastos_categoriagasto_nombre_idx ON gastos_categoriagasto(nombre);
CREATE INDEX IF NOT EXISTS gastos_categoriagasto_activa_idx ON gastos_categoriagasto(activa);

-- ================================================================
-- TABLA: reportes_reportediario (Reportes diarios)
-- ================================================================
CREATE TABLE IF NOT EXISTS reportes_reportediario (
    id SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    base_inicial NUMERIC(12, 2) NOT NULL CHECK (base_inicial >= 0),
    venta_total NUMERIC(12, 2) NOT NULL CHECK (venta_total >= 0),
    total_gastos NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_gastos >= 0),
    entrega NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (entrega >= 0),
    base_siguiente NUMERIC(12, 2) NOT NULL DEFAULT 0,
    observacion TEXT,
    usuario_creacion_id INTEGER REFERENCES usuarios_usuario(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reportes_reportediario_fecha_idx ON reportes_reportediario(fecha DESC);
CREATE INDEX IF NOT EXISTS reportes_reportediario_fecha_creacion_idx ON reportes_reportediario(fecha_creacion);
CREATE INDEX IF NOT EXISTS reportes_reportediario_usuario_creacion_id_idx ON reportes_reportediario(usuario_creacion_id);

-- ================================================================
-- TABLA: gastos_gasto (Gastos individuales)
-- ================================================================
CREATE TABLE IF NOT EXISTS gastos_gasto (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reportes_reportediario(id) ON DELETE CASCADE,
    descripcion VARCHAR(200) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    categoria_id INTEGER REFERENCES gastos_categoriagasto(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS gastos_gasto_reporte_id_idx ON gastos_gasto(reporte_id);
CREATE INDEX IF NOT EXISTS gastos_gasto_categoria_id_idx ON gastos_gasto(categoria_id);
CREATE INDEX IF NOT EXISTS gastos_gasto_fecha_creacion_idx ON gastos_gasto(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS gastos_gasto_reporte_categoria_idx ON gastos_gasto(reporte_id, categoria_id);

-- ================================================================
-- TABLA: reportes_ventaproducto (Ventas de productos)
-- ================================================================
CREATE TABLE IF NOT EXISTS reportes_ventaproducto (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER NOT NULL REFERENCES reportes_reportediario(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos_producto(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 1),
    precio_unitario_momento NUMERIC(10, 2) NOT NULL CHECK (precio_unitario_momento >= 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reporte_id, producto_id)
);

CREATE INDEX IF NOT EXISTS reportes_ventaproducto_reporte_id_idx ON reportes_ventaproducto(reporte_id);
CREATE INDEX IF NOT EXISTS reportes_ventaproducto_producto_id_idx ON reportes_ventaproducto(producto_id);
CREATE INDEX IF NOT EXISTS reportes_ventaproducto_fecha_creacion_idx ON reportes_ventaproducto(fecha_creacion DESC);

-- ================================================================
-- TABLAS ADICIONALES DE DJANGO
-- ================================================================

-- Django migrations
CREATE TABLE IF NOT EXISTS django_migrations (
    id SERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Django admin log
CREATE TABLE IF NOT EXISTS django_admin_log (
    id SERIAL PRIMARY KEY,
    action_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL,
    content_type_id INTEGER REFERENCES django_content_type(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES usuarios_usuario(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS django_admin_log_content_type_id_idx ON django_admin_log(content_type_id);
CREATE INDEX IF NOT EXISTS django_admin_log_user_id_idx ON django_admin_log(user_id);

-- Django sessions
CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS django_session_expire_date_idx ON django_session(expire_date);

-- ================================================================
-- FUNCIONES Y TRIGGERS
-- ================================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER update_productos_producto_updated_at
    BEFORE UPDATE ON productos_producto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_categoriagasto_updated_at
    BEFORE UPDATE ON gastos_categoriagasto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_reportediario_updated_at
    BEFORE UPDATE ON reportes_reportediario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- DATOS INICIALES
-- ================================================================

-- Insertar categorías de gasto por defecto
INSERT INTO gastos_categoriagasto (nombre, descripcion, activa) VALUES
    ('Servicios', 'Pago de servicios públicos (luz, agua, internet, etc.)', true),
    ('Nómina', 'Pago de salarios y prestaciones', true),
    ('Compras', 'Compras de inventario y materiales', true),
    ('Mantenimiento', 'Gastos de mantenimiento y reparaciones', true),
    ('Transporte', 'Gastos de transporte y logística', true),
    ('Otros', 'Gastos varios no clasificados', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo (pinturas)
INSERT INTO productos_producto (nombre, precio_unitario, activo) VALUES
    ('Pintura Blanca 1/4', 25000, true),
    ('Pintura Blanca 1 Galón', 85000, true),
    ('Pintura Azul 1/4', 28000, true),
    ('Pintura Roja 1/4', 28000, true),
    ('Pintura Verde 1/4', 28000, true),
    ('Thinner 1/4', 15000, true),
    ('Thinner 1 Galón', 50000, true),
    ('Brocha 2 pulgadas', 8000, true),
    ('Brocha 4 pulgadas', 12000, true),
    ('Rodillo pequeño', 10000, true),
    ('Rodillo grande', 18000, true),
    ('Lija 80', 2000, true),
    ('Lija 120', 2000, true),
    ('Masilla 1/4', 12000, true)
ON CONFLICT (nombre) DO NOTHING;

-- ================================================================
-- COMENTARIOS
-- ================================================================
COMMENT ON TABLE usuarios_usuario IS 'Usuarios del sistema con autenticación personalizada';
COMMENT ON TABLE productos_producto IS 'Catálogo de productos del almacén';
COMMENT ON TABLE gastos_categoriagasto IS 'Categorías reutilizables para clasificar gastos';
COMMENT ON TABLE reportes_reportediario IS 'Reportes diarios de ventas y gastos';
COMMENT ON TABLE gastos_gasto IS 'Gastos individuales asociados a reportes';
COMMENT ON TABLE reportes_ventaproducto IS 'Registro de cantidades vendidas por producto';

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
-- El esquema ha sido creado exitosamente.
-- Ahora configura las variables de entorno en el archivo .env
-- con los datos de conexión de tu proyecto Supabase.
-- ================================================================
