-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- Pour les UUID aléatoires (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS citext;     -- Pour rendre les emails insensibles à la casse

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS users CASCADE;

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
);

-- Fonction pour mettre à jour updated_at lors d’un UPDATE
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();       -- Mise à jour automatique du timestamp
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour lancer update_timestamp a chaque modification de la table
CREATE TRIGGER tg_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();     -- Appelé automatiquement par PostgreSQL avant chaque UPDATE
