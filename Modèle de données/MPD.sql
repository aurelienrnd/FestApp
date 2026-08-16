-- ============================================================================
-- Modele Physique de Donnees (MPD) - Phase 1 : Migration Better Auth
-- ============================================================================
-- Ce fichier documente le schema cible PostgreSQL apres migration. Il n'est
-- PAS branche sur bd/init/ (qui reste la source de verite executee au boot) :
-- une fois la tache 2 du Kanban validee, ce contenu remplacera/completera
-- 01_user_schema.sql et 02_sessions_schema.sql, et de nouveaux fichiers
-- (ex: 02b_account_schema.sql, 02c_verification_schema.sql, 02d_two_factor_schema.sql)
-- seront crees a partir des blocs ci-dessous.
-- ============================================================================

-- Extensions necessaires (deja presentes dans le projet)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ----------------------------------------------------------------------------
-- USERS (adaptee au schema Better Auth - tache 2)
-- Conservee (pas de renommage) pour ne pas perdre les comptes existants.
-- Mapping Better Auth : modelName "users", fields { name: display_name }
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'artists', 'news'); -- inchange

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 CITEXT NOT NULL UNIQUE,
  display_name          CITEXT NOT NULL UNIQUE CHECK (char_length(display_name) >= 2), -- = "name" cote Better Auth
  role                  user_role NOT NULL,
  email_verified        BOOLEAN NOT NULL DEFAULT FALSE,          -- NOUVEAU : requis par Better Auth
  image                 VARCHAR(255) NULL,                       -- NOUVEAU : requis par Better Auth (non utilise par FestApp)
  password_changed_at   TIMESTAMPTZ NULL,                        -- conserve (info d'audit metier)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()        -- NOUVEAU : requis par Better Auth
  -- SUPPRIME : password_hash -> deplace dans account.password
);

-- ----------------------------------------------------------------------------
-- SESSION (remplace la table "sessions" actuelle)
-- ----------------------------------------------------------------------------
CREATE TABLE session (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,          -- NOUVEAU : identifiant de session cote client
  expires_at  TIMESTAMPTZ NOT NULL,
  ip_address  VARCHAR(45) NULL,                      -- NOUVEAU
  user_agent  VARCHAR(255) NULL,                     -- NOUVEAU
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),     -- NOUVEAU (rotation geree par Better Auth)

  CONSTRAINT chk_session_expires_after_created CHECK (expires_at > created_at)
  -- SUPPRIME : revoked_at -> Better Auth supprime la ligne au logout/expiration
);

CREATE INDEX idx_session_user_id ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_expires_at ON session(expires_at);

-- ----------------------------------------------------------------------------
-- ACCOUNT (nouvelle table - tache 2, enrichie tache 5 pour Google OAuth)
-- Une ligne = une methode d'authentification pour un utilisateur.
-- ----------------------------------------------------------------------------
CREATE TABLE account (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id               VARCHAR(50) NOT NULL,       -- 'credential' | 'google'
  account_id                VARCHAR(255) NOT NULL,      -- email (credential) ou sub Google (oauth)
  password                  VARCHAR(255) NULL,          -- hash, uniquement si provider_id = 'credential'
  access_token              TEXT NULL,                  -- uniquement OAuth (tache 5)
  refresh_token             TEXT NULL,                  -- uniquement OAuth (tache 5)
  access_token_expires_at   TIMESTAMPTZ NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_account_provider UNIQUE (provider_id, account_id)
);

CREATE INDEX idx_account_user_id ON account(user_id);

-- ----------------------------------------------------------------------------
-- VERIFICATION (nouvelle table - tache 3 : flux "mot de passe oublie" natif)
-- ----------------------------------------------------------------------------
CREATE TABLE verification (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier  VARCHAR(255) NOT NULL,   -- email cible
  value       VARCHAR(255) NOT NULL,   -- token a usage unique
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_identifier ON verification(identifier);

-- ----------------------------------------------------------------------------
-- TWO_FACTOR (nouvelle table - tache 4 : plugin 2FA TOTP pour les comptes admin)
-- ----------------------------------------------------------------------------
CREATE TABLE two_factor (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret        VARCHAR(255) NOT NULL,   -- secret TOTP
  backup_codes  TEXT NOT NULL            -- codes de secours (JSON/liste chiffree)
);

-- ----------------------------------------------------------------------------
-- Tables metier inchangees (rappel des FK impactees par la migration)
-- ----------------------------------------------------------------------------
-- news.user_id            REFERENCES users(id) ON DELETE SET NULL  -- inchange
-- concerts.artist_id      REFERENCES artists(id) ON DELETE CASCADE -- inchange
