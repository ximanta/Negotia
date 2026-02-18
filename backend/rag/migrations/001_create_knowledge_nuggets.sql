CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_nuggets (
    id UUID PRIMARY KEY,
    program_id_hash VARCHAR(128) NOT NULL,
    semantic_trigger TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    counsellor_response TEXT NOT NULL,
    technique_label VARCHAR(120) NOT NULL,
    source_agent VARCHAR(40) NOT NULL,
    persona_archetype VARCHAR(80) NOT NULL,
    outcome_metrics JSONB NOT NULL,
    similarity_score DOUBLE PRECISION NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_knowledge_nuggets_program_id_hash
    ON knowledge_nuggets (program_id_hash);

CREATE INDEX IF NOT EXISTS ix_knowledge_nuggets_persona_archetype
    ON knowledge_nuggets (persona_archetype);

CREATE INDEX IF NOT EXISTS ix_knowledge_nuggets_program_archetype
    ON knowledge_nuggets (program_id_hash, persona_archetype);
