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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()        -- Date de création
);


INSERT INTO users (email, password_hash, display_name, is_active, must_change_password)
VALUES (
  'admin@example.com',
  '$2b$10$GwPZLi7S9h9O/Y9zljjQzesw2SIUr3APiro6Yz3/HamsQN.TyPj.C', -- Hash bcrypt du mot de passe 'MyPassword'
  'Admin',
  TRUE,
  FALSE
);