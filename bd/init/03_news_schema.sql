-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS news CASCADE;

-- Table des news
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- Identifiant unique genere automatiquement
  title VARCHAR(150) NOT NULL,                                  -- Titre affiche
  content TEXT NULL,                                            -- Contenu de la news
  is_published BOOLEAN NOT NULL DEFAULT FALSE,                  -- Statut de publication
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),                -- Date de creation
  url_media VARCHAR(255) NOT NULL,                              -- URL/chemin du media associe
  description_media VARCHAR(255) NOT NULL,                      -- Texte alternatif / description courte
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL -- Reference l'utilisateur createur, NULL si supprime
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_news_created_at ON news(created_at);
CREATE INDEX idx_news_is_published ON news(is_published);
