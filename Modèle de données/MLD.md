# Modèle Logique de Données (MLD)

Notation : `#` = clé étrangère, `PK` = clé primaire, souligné implicite sur la 1ère colonne de chaque table.

```
USERS (
    id              PK,
    email,
    display_name,
    role,                     -- ENUM('admin','artists','news') -- inchangé
    email_verified,           -- NOUVEAU (Better Auth)
    image,                    -- NOUVEAU (Better Auth, nullable)
    password_changed_at,      -- conservé (info métier, plus utilisé par Better Auth lui-même)
    created_at,
    updated_at                -- NOUVEAU (Better Auth)
)
-- SUPPRIMÉ : password_hash (déplacé vers ACCOUNT.password)

SESSION (
    id              PK,
    #user_id         REF USERS(id),
    token,
    expires_at,
    ip_address,
    user_agent,
    created_at,
    updated_at
)
-- REMPLACE la table SESSIONS (revoked_at disparaît : Better Auth supprime la ligne au logout/à l'expiration)

ACCOUNT (
    id                          PK,
    #user_id                     REF USERS(id),
    provider_id,                -- 'credential' | 'google' (tâche 5)
    account_id,                 -- email pour credential, sub Google pour OAuth
    password,                   -- hash, NULL sauf provider_id = 'credential'
    access_token,                -- NULL sauf OAuth
    refresh_token,               -- NULL sauf OAuth
    access_token_expires_at,     -- NULL sauf OAuth
    created_at,
    updated_at
)
-- NOUVELLE TABLE (tâche 2, enrichie tâche 5)

VERIFICATION (
    id              PK,
    identifier,      -- email de l'utilisateur ciblé
    value,           -- token à usage unique
    expires_at,
    created_at
)
-- NOUVELLE TABLE (tâche 3 — reset password / vérification email)

TWO_FACTOR (
    id              PK,
    #user_id         REF USERS(id) UNIQUE,
    secret,
    backup_codes
)
-- NOUVELLE TABLE (tâche 4)

NEWS (
    id              PK,
    title,
    content,
    is_published,
    url_media,
    description_media,
    created_at,
    #user_id         REF USERS(id) NULLABLE
)
-- INCHANGÉ

ARTISTS (
    id              PK,
    name,
    genre,
    origin,
    bio,
    url_media,
    description_media,
    youtube_url,
    spotify_url,
    is_featured
)
-- INCHANGÉ

CONCERTS (
    id              PK,
    #artist_id       REF ARTISTS(id),
    stage,
    start_time,
    end_time
)
-- INCHANGÉ
```

## Synthèse des changements par rapport au MLD actuel

| Table | Changement |
|---|---|
| `USERS` | `-password_hash`, `+email_verified`, `+image`, `+updated_at` |
| `SESSION` | remplace `SESSIONS` ; `-revoked_at`, `+token`, `+ip_address`, `+user_agent`, `+updated_at` |
| `ACCOUNT` | nouvelle table |
| `VERIFICATION` | nouvelle table |
| `TWO_FACTOR` | nouvelle table |
| `NEWS`, `ARTISTS`, `CONCERTS` | aucun changement |
