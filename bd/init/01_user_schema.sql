-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- Pour les UUID aleatoires (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS citext;     -- Pour rendre les emails insensibles a la casse

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Type ENUM pour les roles utilisateur -- valeurs autorisees uniquement
CREATE TYPE user_role AS ENUM ('admin', 'artists', 'news');

-- Table des utilisateurs administrateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Identifiant unique généré automatiquement
  email CITEXT NOT NULL UNIQUE,                         -- Email insensible à la casse, doit être unique
  password_hash VARCHAR(255) NOT NULL,                  -- Mot de passe chiffré (hashé en backend)
  display_name VARCHAR(100) NOT NULL,                   -- Nom affiché dans l’espace d’administration
  is_active BOOLEAN NOT NULL DEFAULT TRUE,              -- Permet de désactiver un compte sans le supprimer
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,  -- Mot de passe provisoire : changement obligatoire au prochain login
  password_changed_at TIMESTAMPTZ NULL,                 -- Date/heure du dernier changement de mot de passe
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),        -- Date de création
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- Dernière mise à jour (mise à jour via trigger)
);
