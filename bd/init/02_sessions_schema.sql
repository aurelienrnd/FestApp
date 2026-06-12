-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d’eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS sessions CASCADE;

-- Table des sessions utilisateur
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- Identifiant unique genere automatiquement
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Reference a l’utilisateur, suppression en cascade
  expires_at TIMESTAMPTZ NOT NULL,                              -- Date/heure d’expiration de la session
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),                -- Date de creation
  revoked_at TIMESTAMPTZ NULL,                                  -- Date/heure de revocation de la session (NULL si active)

  -- Contraintes de coherence
  CONSTRAINT chk_session_expires_after_created CHECK (expires_at > created_at), -- La session doit expirer apres sa creation
  CONSTRAINT chk_session_revoked_after_created CHECK (revoked_at IS NULL OR revoked_at >= created_at) -- La session revoquee doit l’etre apres sa creation
);

-- Indexes pour optimiser les requêtes courantes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked_at ON sessions(revoked_at);
