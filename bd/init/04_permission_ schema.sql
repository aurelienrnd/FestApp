-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS sessions CASCADE;

-- Table des permission utilisateur
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),      -- Identifiant unique généré automatiquement
  code VARCHAR(100) NOT NULL UNIQUE,                  -- Droit atomique unique (ex. article:create).
  label VARCHAR(150) NOT NULL,                        -- Description lisible de la permission.
  CONSTRAINT permissions_code_format
    CHECK (code ~ '^[a-z0-9_]+(:[a-z0-9_]+){1,2}$')   -- oblige l'utilisation d'un format type mot:mot
);

--//TODO ajouter les permission  
-- Ajout des permissions dans la table
INSERT INTO permissions (code, label) VALUES
('article:create', 'Créer un article'),
('article:update', 'Modifier un article'),
('article:delete', 'Supprimer un article'),
('user:read', 'Lire les utilisateurs'),
('user:update', 'Modifier un utilisateur')
ON CONFLICT (code) DO NOTHING; -- ne prends pas en compte la ligne code si sa valeur existe deja, evite de planter