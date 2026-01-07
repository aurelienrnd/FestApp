-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS sessions CASCADE;

-- Table des role utilisateur
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Identifiant unique généré automatiquement
  code VARCHAR(50) NOT NULL UNIQUE,                        -- Code unique (ex. admin, editor).
  label VARCHAR(80) NOT NULL,                              -- Libellé lisible (ex. “Administrateur”).
  CONSTRAINT roles_code_format CHECK (code ~ '^[a-z_]+$')  -- Interdit l'utilisation d'un numero;
);

-- Ajout des roles dans la table
INSERT INTO roles (code, label) VALUES
('admin', 'Administrateur'),
('programateur', 'Chargé de programmation')
ON CONFLICT (code) DO NOTHING; -- ne prends pas en compte la ligne code si sa valeur existe deja, evite de planter