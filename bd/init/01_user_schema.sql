-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- Pour les UUID aléatoires (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS citext;     -- Pour rendre les emails insensibles à la casse

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d’éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Type ENUM pour les rôles utilisateur — valeurs autorisées uniquement
CREATE TYPE user_role AS ENUM (‘admin’, ‘lineup’, ‘news’);

-- Table des utilisateurs administrateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Identifiant unique généré automatiquement
  email CITEXT NOT NULL UNIQUE,                         -- Email insensible à la casse, doit être unique
  password_hash VARCHAR(255) NOT NULL,                  -- Mot de passe chiffré (hashé en backend)
  display_name VARCHAR(100) NOT NULL,                   -- Nom affiché dans l’espace d’administration
  role user_role NOT NULL,                              -- Role de l’utilisateur (admin, lineup, news)
  password_changed_at TIMESTAMPTZ NULL,                 -- Date/heure du dernier changement de mot de passe
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- Date de création
);

-- //NOTE : Utiliser uniquement en phase de développement.
INSERT INTO users (email, password_hash, display_name, role, password_changed_at)
VALUES (
  'admin@example.com',
  '$2b$10$3Br0yYg6p5EclXJaHT/mpO0qq6A5niWuCpT8hM2FXlkl2YjOx.A7.', -- Hash bcrypt du mot de passe 'MyPassword'
  'Admin',
  'admin',
  NOW()
);


