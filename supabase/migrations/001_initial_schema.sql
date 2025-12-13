-- Chronos Atlas v2.0 - Modelo Cosmológico
-- Esquema con Jerarquía Espacial + Tiempo Relativo + Multiverso

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROJECTS (Contenedor raíz de usuario)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENTITIES (Modelo Jerárquico Cosmológico)
-- ============================================
-- Define QUÉ es algo y DÓNDE está en la jerarquía estructural.
-- Un "Espacio-Tiempo" (Timeline) es también una entidad con parent_id = Universo.

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Jerarquía Estructural
  parent_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'universe',    -- Contenedor raíz (leyes físicas)
    'spacetime',   -- Línea temporal / Realidad (What-If vive aquí)
    'galaxy',      -- Grupo de sistemas
    'system',      -- Sistema solar
    'planet',      -- Mundo
    'region',      -- Zona geográfica
    'character',   -- Personaje/Actor
    'item',        -- Objeto
    'rule'         -- Regla/Sistema de magia
  )),
  
  -- Configuración de Tiempo Relativo (Solo para contenedores espaciales)
  -- Ej: { "tick_multiplier": 1.0, "calendar": "earth_standard", "epoch_name": "Anno Domini" }
  time_config JSONB,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas jerárquicas
CREATE INDEX idx_entities_parent ON entities(parent_id);
CREATE INDEX idx_entities_project ON entities(project_id);
CREATE INDEX idx_entities_type ON entities(type);

-- ============================================
-- 3. FACTS (La Verdad en el Multiverso)
-- ============================================
-- Un hecho solo es verdad en un intervalo de tiempo Y dentro de un Espacio-Tiempo específico.
-- Ej: "El Rey Arthur está vivo" es TRUE en ST-Canon pero FALSE en ST-Alt.

CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  
  -- El Dato
  attribute VARCHAR(255) NOT NULL, -- 'name', 'status', 'position', 'hp', 'description'
  value JSONB NOT NULL,            -- { "string": "Arthur" } o { "status": "alive" }
  
  -- Coordenadas Temporales (Absolutas - Universal Ticks)
  valid_from_tick BIGINT,          -- Tick Universal de inicio
  valid_until_tick BIGINT,         -- Tick Universal de fin (NULL = actualidad)
  
  -- Coordenadas Dimensionales (La clave del What-If)
  -- Solo es verdad en esta Línea Temporal (Espacio-Tiempo)
  root_spacetime_id UUID NOT NULL REFERENCES entities(id),
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas temporales y dimensionales
CREATE INDEX idx_facts_entity ON facts(entity_id);
CREATE INDEX idx_facts_spacetime ON facts(root_spacetime_id);
CREATE INDEX idx_facts_temporal ON facts(valid_from_tick, valid_until_tick);
CREATE INDEX idx_facts_attribute ON facts(attribute);

-- Índice compuesto para query principal
CREATE INDEX idx_facts_query ON facts(entity_id, root_spacetime_id, valid_from_tick, valid_until_tick);

-- ============================================
-- 4. FUNCIONES DE CONSULTA TEMPORAL
-- ============================================

-- Obtener el estado de una entidad en un tick específico dentro de un Espacio-Tiempo
CREATE OR REPLACE FUNCTION get_entity_state(
  p_entity_id UUID,
  p_spacetime_id UUID,
  p_tick BIGINT
) RETURNS TABLE (attribute VARCHAR, value JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (f.attribute)
    f.attribute,
    f.value
  FROM facts f
  WHERE f.entity_id = p_entity_id
    AND f.root_spacetime_id = p_spacetime_id
    AND f.valid_from_tick <= p_tick
    AND (f.valid_until_tick IS NULL OR f.valid_until_tick > p_tick)
  ORDER BY f.attribute, f.valid_from_tick DESC;
END;
$$ LANGUAGE plpgsql;

-- Obtener todos los hijos de una entidad (para construir el árbol)
CREATE OR REPLACE FUNCTION get_entity_children(
  p_parent_id UUID
) RETURNS TABLE (
  id UUID,
  type VARCHAR,
  time_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.type, e.time_config
  FROM entities e
  WHERE e.parent_id = p_parent_id
  ORDER BY e.type, e.created_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo
CREATE POLICY "Allow all for development" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON entities FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON facts FOR ALL USING (true);
