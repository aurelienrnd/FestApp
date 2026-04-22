-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- Pour les UUID aleatoires (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS citext;     -- Pour rendre les emails insensibles a la casse

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Type ENUM pour les roles utilisateur -- valeurs autorisees uniquement
CREATE TYPE user_role AS ENUM ('admin', 'lineup', 'news');

-- Table des utilisateurs administrateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Identifiant unique genere automatiquement
  email CITEXT NOT NULL UNIQUE,                         -- Email insensible a la casse, doit etre unique
  password_hash VARCHAR(255) NOT NULL,                  -- Mot de passe chiffre (hashe en backend)
  display_name VARCHAR(100) NOT NULL,                   -- Nom affiche dans l'espace d'administration
  role user_role NOT NULL,                              -- Role de l'utilisateur (admin, lineup, news)
  password_changed_at TIMESTAMPTZ NULL,                 -- Date/heure du dernier changement de mot de passe
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- Date de creation
);
