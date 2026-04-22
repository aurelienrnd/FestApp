-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS artists CASCADE;

-- Table des artistes
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Identifiant unique genere automatiquement
  name CITEXT NOT NULL CHECK (char_length(name) >= 2),  -- Nom de l'artiste
  genre VARCHAR(60) NOT NULL,                           -- Genre musical
  origin VARCHAR(80) NOT NULL,                          -- Origine/pays/ville
  bio TEXT NOT NULL,                                    -- Biographie
  url_media VARCHAR(255) NOT NULL,                      -- URL/chemin du media associe
  description_media VARCHAR(255) NOT NULL,              -- Texte alternatif / description courte
  youtube_url VARCHAR(255),                             -- Lien YouTube (optionnel)
  spotify_url VARCHAR(255)                              -- Lien Spotify (optionnel)
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_name ON artists(name);
