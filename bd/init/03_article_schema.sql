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
  'Ouverture de la billetterie',
  'La billetterie du Vindhellfest ouvre officiellement ses portes. Les pass week-end sont disponibles en quantite limitee. Rendez-vous sur notre site pour reserver vos places avant epuisement du stock.',
  TRUE,
  now() - INTERVAL '5 days',
  'https://media.istockphoto.com/id/827671152/fr/photo/shady-caract%C3%A8re-scalping-une-paire-de-billets-de-concert.jpg?s=2048x2048&w=is&k=20&c=kdscpCW8NLziB3B5t6E9UlBwTDLOMzAN7xHvK3NWyU0=',
  'Billets de concert Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Nouvelle tete d affiche',
  'Nous sommes heureux de vous annoncer l ajout d un nouvel artiste exceptionnel a la programmation du festival. Plus d informations a venir tres prochainement.',
  FALSE,
  now() - INTERVAL '1 day',
  'https://www.rollingstone.fr/wp-content/uploads/2024/01/The-Black-Keys-2024-by-Jim-Herrington-3.jpg',
  'Photo promo du nouvel artiste invite au Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';
