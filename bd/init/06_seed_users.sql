-- //NOTE : Utiliser uniquement en phase de developpement.
-- Mot de passe des 3 comptes : "Password123!"
-- Hash genere via better-auth/crypto (hashPassword), meme format que celui utilise par
-- Better Auth pour /api/auth/sign-in/email (scrypt, verifie par ctx.context.password.verify).

-- === user ===
INSERT INTO "user" (name, email, "emailVerified", role)
VALUES ('Admin', 'admin@example.com', true, 'admin');

INSERT INTO "user" (name, email, "emailVerified", role)
VALUES ('Artists Manager', 'artists@example.com', true, 'artists');

INSERT INTO "user" (name, email, "emailVerified", role)
VALUES ('News Editor', 'news@example.com', true, 'news');

-- === account ===
-- Compte "credential" (email/mot de passe) pour chaque user.
-- issuer = 'local:credential' et accountId = userId : convention interne de Better Auth
-- pour les comptes email/password (cf. createLocalAccountIssuer("credential")).
INSERT INTO account (issuer, "accountId", "providerId", "userId", password, "updatedAt")
SELECT 'local:credential', id::text, 'credential', id,
  '0e88447bf8ba4e7e8b4c2ec80733d21d:509cc561ad7d524afb323c8ec4a4a73db5a318315f016f03d1d16cf5d01b75497adfced230f8272cbff5d09143e813cfd24e2f567d501ac12aa09f9ab24009b1',
  now()
FROM "user" WHERE email = 'admin@example.com';

INSERT INTO account (issuer, "accountId", "providerId", "userId", password, "updatedAt")
SELECT 'local:credential', id::text, 'credential', id,
  '4d8356ce7fdcf6c83d93684f53c93fdb:dc40436f0df3b9841088a125ae61287ee3fb1776aca8377328725ce464f93332e309a1bf7741623fec29e4f19668c326821d8102f1bd78e6eced96349250fcf1',
  now()
FROM "user" WHERE email = 'artists@example.com';

INSERT INTO account (issuer, "accountId", "providerId", "userId", password, "updatedAt")
SELECT 'local:credential', id::text, 'credential', id,
  '759c8c2f370c1b37aa87b45e23a19c49:1802c66cff28bf9e6f27a95abf00d4b3fac0304f0306295d2efdfce012498ad9df043825d5e2549a904a30c37c61a000047ca7c7e85322073924f411ce36d5e8',
  now()
FROM "user" WHERE email = 'news@example.com';

-- === session ===
-- Donnees illustratives uniquement : sans le cookie de session correspondant cote
-- navigateur, ces lignes ne permettent pas de se connecter directement en tant que
-- cet utilisateur. Se connecter via /api/auth/sign-in/email cree une vraie session.
INSERT INTO session ("expiresAt", token, "updatedAt", "ipAddress", "userAgent", "userId")
SELECT now() + interval '30 days', 'seed-session-token-admin', now(), '127.0.0.1', 'seed-script', id
FROM "user" WHERE email = 'admin@example.com';

INSERT INTO session ("expiresAt", token, "updatedAt", "ipAddress", "userAgent", "userId")
SELECT now() + interval '30 days', 'seed-session-token-artists', now(), '127.0.0.1', 'seed-script', id
FROM "user" WHERE email = 'artists@example.com';

INSERT INTO session ("expiresAt", token, "updatedAt", "ipAddress", "userAgent", "userId")
SELECT now() + interval '30 days', 'seed-session-token-news', now(), '127.0.0.1', 'seed-script', id
FROM "user" WHERE email = 'news@example.com';

-- === verification ===
-- Exemple de token de reset password (illustratif). Convention Better Auth :
-- identifier = 'reset-password:<token>', value = userId (cf. password.mjs createVerificationValue).
INSERT INTO verification (identifier, value, "expiresAt")
SELECT 'reset-password:seed-token-admin', id::text, now() + interval '1 hour'
FROM "user" WHERE email = 'admin@example.com';
