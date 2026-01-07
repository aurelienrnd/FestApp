-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de développement.
-- Elle supprime la table si elle existe déjà, afin d'éviter des erreurs lors des modifications du schéma.
DROP TABLE IF EXISTS sessions CASCADE;

-- Jointure des table role et permission
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL,                              -- id provenant de la table role 
  permission_id UUID NOT NULL,                        -- id provenant de la table permissions
  PRIMARY KEY (role_id, permission_id),               -- Id primaire composée de role_id et permission_id pour empêcher les doublons

    -- Supprime toute la ligne si un des parents est supprimé
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,             
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

--// TODO ajout des permissions a chaque role 
-- Ajout des permissions au role admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING; -- ne prends pas en compte la ligne code si sa valeur existe deja, evite de planter


-- Ajout des permissions au role programateur
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'article:create',
  'article:update',
  'user:read'
)
WHERE r.code = 'programateur'
ON CONFLICT DO NOTHING; -- ne prends pas en compte la ligne code si sa valeur existe deja, evite de planter

