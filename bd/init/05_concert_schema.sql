-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS concerts CASCADE;
DROP TYPE IF EXISTS concert_stage CASCADE;

-- Type ENUM pour les scenes du festival — valeurs autorisees uniquement
CREATE TYPE concert_stage AS ENUM ('MainStage', 'Tremplin');

-- Table des concerts
CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identifiant unique genere automatiquement
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE, -- Reference l'artiste
  stage concert_stage NOT NULL, -- Scene du festival
  start_time TIMESTAMPTZ NOT NULL, -- Date/heure de debut
  end_time TIMESTAMPTZ NOT NULL, -- Date/heure de fin

  -- Contraintes de coherence
  CONSTRAINT chk_concert_end_after_start CHECK (end_time > start_time),
  CONSTRAINT no_overlap_stage EXCLUDE USING gist (
    stage WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  ),
  CONSTRAINT no_overlap_artist EXCLUDE USING gist (
    artist_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_concerts_stage_start ON concerts(stage, start_time);
CREATE INDEX idx_concerts_start_time ON concerts(start_time);
