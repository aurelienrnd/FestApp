-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL,                              -- id provenant de la table users
  role_id UUID NOT NULL,                              -- id provenant de la table role 
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),      -- Date d’attribution du rôle.  
  PRIMARY KEY (user_id, role_id),                     -- Id primaire composée de role_id et permission_id pour empêcher les doublons

  -- Supprime toute la ligne si un des parents est supprimé
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- aide postgre a trouver la table par correspondance
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);