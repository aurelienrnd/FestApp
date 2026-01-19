-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS sessions CASCADE;

-- Table des sessions utilisateur
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- Identifiant unique généré automatiquement
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Référence à l’utilisateur, suppression en cascade
  expires_at TIMESTAMPTZ NOT NULL,                              -- Date/heure d’expiration de la session
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),                -- Date de création
  revoked_at TIMESTAMPTZ NULL,                                  -- Date/heure de révocation de la session (NULL si active)
  
  -- Contraintes de cohérence
  CONSTRAINT chk_session_expires_after_created CHECK (expires_at > created_at), -- La session doit expirer après sa création
  CONSTRAINT chk_session_revoked_after_created CHECK (revoked_at IS NULL OR revoked_at >= created_at) -- La session révoquée doit l’être après sa création
);

-- Indexes pour optimiser les requêtes courantes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked_at ON sessions(revoked_at);
