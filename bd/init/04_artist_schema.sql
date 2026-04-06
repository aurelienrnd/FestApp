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
  'Groupe de rock melant riffs lourds et funcky.',
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
  'Groupe de rock alternatif connu pour ses refrains puissants et ses concerts endiables.',
  'https://images.rtl.fr/~c/1540v1026/rtl2/www/1480371-foo-fighters.jpg',
  'Photo promo du groupe Foo Fighters',
  'https://www.youtube.com/@foofighters',
  'https://open.spotify.com/artist/7jy3rLJdDQY21OgRLCZ9sD'
);
