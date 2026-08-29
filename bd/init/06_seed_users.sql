-- //NOTE : Utiliser uniquement en phase de developpement.
-- Le role et le mot de passe (table "account") seront ajoutes une fois le plugin
-- admin et le hasher personnalise configures dans apps/backend/src/lib/auth.ts.
-- Pour l'instant on seed uniquement les lignes "user" necessaires aux FK (news.user_id).
INSERT INTO "user" (name, email, "emailVerified")
VALUES ('Admin', 'admin@example.com', true);

INSERT INTO "user" (name, email, "emailVerified")
VALUES ('Artists Manager', 'artists@example.com', true);

INSERT INTO "user" (name, email, "emailVerified")
VALUES ('News Editor', 'news@example.com', true);
