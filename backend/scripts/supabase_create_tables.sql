-- Script SQL para crear las nuevas tablas en Supabase
-- Ejecutar en el editor SQL de Supabase

-- Crear tabla gastos_gastoautomatico
CREATE TABLE IF NOT EXISTS gastos_gastoautomatico (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria_id BIGINT NOT NULL REFERENCES gastos_categoriagasto(id) ON DELETE CASCADE
);

-- Crear índice para gastos_gastoautomatico
CREATE INDEX IF NOT EXISTS gastos_gast_categor_2388e8_idx ON gastos_gastoautomatico(categoria_id, activo);

-- Crear tabla gastos_gastodeducible
CREATE TABLE IF NOT EXISTS gastos_gastodeducible (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL DEFAULT 'ingreso',
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria_id BIGINT NOT NULL UNIQUE REFERENCES gastos_categoriagasto(id) ON DELETE CASCADE,
    CONSTRAINT gastos_tipo_check CHECK (tipo IN ('transferencia', 'ahorro', 'ingreso'))
);

-- Crear índice para gastos_gastodeducible
CREATE INDEX IF NOT EXISTS gastos_gast_activo_2c618b_idx ON gastos_gastodeducible(activo, tipo);

-- Comando para ver si las tablas existen y su estructura:
-- SELECT * FROM information_schema.tables WHERE table_name IN ('gastos_gastoautomatico', 'gastos_gastodeducible');
-- \d gastos_gastoautomatico;
-- \d gastos_gastodeducible;
