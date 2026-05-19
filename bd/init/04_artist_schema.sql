-- Extensions necessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- //NOTE : Utiliser uniquement en phase de developpement.
-- Elle supprime la table si elle existe deja, afin d'eviter des erreurs lors des modifications du schema.
DROP TABLE IF EXISTS artists CASCADE;

-- Table des artistes
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),             -- Identifiant unique genere automatiquement
  name VARCHAR(150) NOT NULL CHECK (char_length(name) >= 2), -- Nom de l'artiste, sensible a la casse
  genre VARCHAR(60) NOT NULL,                                -- Genre musical
  origin VARCHAR(80) NOT NULL,                               -- Origine/pays/ville
  bio TEXT NOT NULL,                                         -- Biographie
  url_media VARCHAR(255) NOT NULL,                           -- URL/chemin du media associe
  description_media VARCHAR(255) NOT NULL,                   -- Texte alternatif / description courte
  youtube_url VARCHAR(255),                                  -- Lien YouTube (optionnel)
  spotify_url VARCHAR(255),                                  -- Lien Spotify (optionnel)
  is_featured BOOLEAN NOT NULL DEFAULT FALSE                 -- Mis en avant sur la page d'accueil (max 2)
);

-- Indexes pour optimiser les requetes courantes
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_artists_is_featured ON artists(is_featured);

-- Trigger : limite a 2 le nombre d'artistes mis en avant simultanement
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = TRUE THEN -- Si l'artiste est mis en avant
    IF (SELECT COUNT(*) FROM artists WHERE is_featured = TRUE AND id != NEW.id) >= 2 THEN -- Verifie le nombre d'artistes deja mis en avant (exclut l'artiste en cours de modification)
      RAISE EXCEPTION 'featured_limit_reached'; -- Lève une exception si la limite est atteinte
    END IF;
  END IF;
  RETURN NEW; -- Retourne la ligne modifiée pour l'insertion ou la mise à jour
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_featured_limit -- Nom du trigger
BEFORE INSERT OR UPDATE ON artists
FOR EACH ROW EXECUTE FUNCTION check_featured_limit();
