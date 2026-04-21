-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS artists CASCADE;

-- Table des artistes
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Identifiant unique genere automatiquement
  name CITEXT NOT NULL CHECK (char_length(name) >= 2),  -- Nom de l'artiste
  genre VARCHAR(60) NOT NULL,                           -- Genre musical
  origin VARCHAR(80) NOT NULL,                          -- Origine/pays/ville
  bio TEXT NOT NULL,                                    -- Biographie
  url_media VARCHAR(255) NOT NULL,                      -- URL/chemin du media associe
  description_media VARCHAR(255) NOT NULL,              -- Texte alternatif / description courte
  youtube_url VARCHAR(255),                             -- Lien YouTube (optionnel)
  spotify_url VARCHAR(255)                              -- Lien Spotify (optionnel)
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_name ON artists(name);

-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO artists (name, genre, origin, bio, url_media, description_media, youtube_url, spotify_url)
VALUES (
  'Red Hot Chili Peppers',
  'Rock',
  'Etats-Unis, Los Angeles',
  'Formés à Los Angeles en 1983, les Red Hot Chili Peppers ont révolutionné la scène rock en fusionnant punk, funk et metal avec une énergie scénique rarement égalée. Autour de la voix de Anthony Kiedis, de la basse légendaire de Flea, de la guitare de John Frusciante et de la batterie de Chad Smith, le groupe a enchaîné les albums cultes — Blood Sugar Sex Magik, Californication, Stadium Arcadium. Trois décennies de carrière, des millions de disques vendus, des stades combles aux quatre coins du monde et un son immédiatement reconnaissable qui a marqué plusieurs générations de fans. Leur passage à Vindhellfest s''annonce comme un moment rare et inoubliable.',
  'https://www.franceinfo.fr/pictures/wgYIq-vpdl_9MeEJWHXBaIz0ns8/186x42:2836x1535/2656x1494/filters:format(avif):quality(50)/2022/04/01/phpPAEw95.jpg',
  'Photo promo du groupe Red Hot Chili Peppers',
  'https://www.youtube.com/@RedHotChiliPeppers',
  'https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5'
);
INSERT INTO artists (name, genre, origin, bio, url_media, description_media, youtube_url, spotify_url)
VALUES (
  'Foo Fighters',
  'Rock',
  'Etats-Unis, Seattle',
  'Fondés en 1994 par Dave Grohl au lendemain de la dissolution de Nirvana, les Foo Fighters sont devenus l''un des groupes de rock les plus importants de leur génération. De leur premier album éponyme enregistré en solo par Grohl jusqu''aux productions orchestrales de Medicine at Midnight, le groupe n''a cessé de repousser les frontières du rock alternatif tout en conservant des hymnes imparables et une générosité sur scène hors du commun. Dix Grammy Awards, des concerts légendaires au Wembley Stadium et une fidélité sans faille à leur public font des Foo Fighters une présence incontournable sur n''importe quelle affiche de festival.',
  'https://images.rtl.fr/~c/1540v1026/rtl2/www/1480371-foo-fighters.jpg',
  'Photo promo du groupe Foo Fighters',
  'https://www.youtube.com/@foofighters',
  'https://open.spotify.com/artist/7jy3rLJdDQY21OgRLCZ9sD'
);
