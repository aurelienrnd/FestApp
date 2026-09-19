/* === EXPRESS === */

/** Augmentation du type Express.Locals pour typer res.locals dans les middlewares et controllers. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: UserRole;
      sessionId?: string;
    }
  }
}

/* === USERS === */

/** Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`. */
export type UserRole = "admin" | "artists" | "news";

/* === NEWS === */

/** Type representant les donnees completes d'une news — partage avec le front. */
export type NewsItem = {
  id: string;
  title: string;
  content: string | null;
  is_published: boolean;
  created_at: string;
  url_media: string;
  description_media: string;
  author_name: string | null;
};

/** Type representant les champs news necessaires pour la gestion du fichier image. */
export type NewsMediaRow = Pick<NewsItem, "id" | "url_media">;

/* === ARTISTS === */

/** Type representant les donnees completes d'un artiste — partage avec le front. */
export type ArtistItem = {
  id: string;
  name: string;
  genre: string;
  origin: string;
  bio: string;
  url_media: string;
  description_media: string;
  youtube_url: string | null;
  spotify_url: string | null;
  stage: string | null;
  start_time: string | null;
  end_time: string | null;
  is_featured: boolean;
};

/** Type representant les champs artiste necessaires pour la gestion du fichier image. */
export type ArtistMediaRow = Pick<ArtistItem, "id" | "url_media">;

/* === CONCERTS === */

/** Type representant une ligne concert retournee par la base de donnees. */
export type ConcertRow = {
  id: string;
  artist_id: string;
  stage: string;
  start_time: string;
  end_time: string;
};
