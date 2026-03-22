-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS articles CASCADE;

-- Table des articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- Identifiant unique genere automatiquement
  title VARCHAR(150) NOT NULL,                                  -- Titre affiche
  content TEXT NULL,                                            -- Contenu de l'article
  is_published BOOLEAN NOT NULL DEFAULT FALSE,                  -- Statut de publication
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),                -- Date de creation
  url_media VARCHAR(255) NOT NULL,                              -- URL/chemin du media associe
  description_media VARCHAR(255) NOT NULL,                      -- Texte alternatif / description courte
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL -- Reference l'utilisateur createur, NULL si supprime
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_is_published ON articles(is_published);

-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Premier article',
  'Ceci est un article de demonstration.',
  TRUE,
  now(),
  '/media/articles/premier-article.jpg',
  'Photo principale de l''article de demonstration',
  id FROM users WHERE email = 'admin@example.com';
