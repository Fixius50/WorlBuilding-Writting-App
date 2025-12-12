// Supabase Schema for Chronos Atlas
// Run: supabase start && supabase db reset

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROJECTS (Root container)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENTITIES (The container for all world elements)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('actor', 'location', 'item', 'rule')),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TIMELINES (Realities/Multiverse)
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES timelines(id) ON DELETE SET NULL,
  is_divergent BOOLEAN DEFAULT FALSE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TIMELINE_MEMBERSHIPS (Who exists in which reality)
CREATE TABLE timeline_memberships (
  timeline_id UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  spawn_date INTEGER, -- Game tick when entity appears in this timeline
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dead', 'hidden')),
  PRIMARY KEY (timeline_id, entity_id)
);

-- 5. FACTS (The truth in time - EAV Temporal model)
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  attribute VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  -- Temporal dimension
  valid_from_game_tick INTEGER,
  valid_until_game_tick INTEGER, -- NULL = forever
  timeline_id UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for temporal queries
CREATE INDEX idx_facts_entity ON facts(entity_id);
CREATE INDEX idx_facts_timeline ON facts(timeline_id);
CREATE INDEX idx_facts_temporal ON facts(valid_from_game_tick, valid_until_game_tick);
CREATE INDEX idx_facts_attribute ON facts(attribute);

-- Composite index for common query pattern
CREATE INDEX idx_facts_entity_timeline_temporal ON facts(entity_id, timeline_id, valid_from_game_tick, valid_until_game_tick);

-- Function to get entity state at a specific game tick
CREATE OR REPLACE FUNCTION get_entity_state(
  p_entity_id UUID,
  p_timeline_id UUID,
  p_game_tick INTEGER
) RETURNS TABLE (attribute VARCHAR, value JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (f.attribute)
    f.attribute,
    f.value
  FROM facts f
  WHERE f.entity_id = p_entity_id
    AND f.timeline_id = p_timeline_id
    AND f.valid_from_game_tick <= p_game_tick
    AND (f.valid_until_game_tick IS NULL OR f.valid_until_game_tick > p_game_tick)
  ORDER BY f.attribute, f.valid_from_game_tick DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
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

-- Row Level Security (RLS) - Enable for multi-user support
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;

-- Policies (for now, allow all for development)
CREATE POLICY "Allow all for development" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON entities FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON timelines FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON timeline_memberships FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON facts FOR ALL USING (true);
