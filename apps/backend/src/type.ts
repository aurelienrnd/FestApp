/* === EXPRESS === */

/** Augmentation du type Express.Locals pour typer res.locals dans les middlewares et controllers. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: UserRole;
      userDisplayName?: string;
      sessionId?: string;
    }
  }
}

/* === USERS === */

// Type representant une ligne de la table users retournee par la base de donnees. */
export type UserCredentialsRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
};

// Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`.
export type UserRole = "admin" | "lineup" | "news";

/** Type representant les donnees utilisateur retournees par les endpoints de liste/CRUD — partage avec le front. */
export type UserItem = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  password_changed_at: string | null;
};

/* === SESSIONS === */

/** Type representant une ligne de session retournee par la base de donnees. */
export type SessionRow = {
  id: string;
  revoked_at: Date | null;
  expires_at: Date;
};

/* === ARTICLES === */

/** Type representant les donnees completes d'un article — partage avec le front. */
export type ArticleItem = {
  id: string;
  title: string;
  content: string | null;
  is_published: boolean;
  created_at: string;
  url_media: string;
  description_media: string;
  user_id: string | null;
  author_name: string | null;
};

/** Type representant les champs article necessaires pour la gestion du fichier image. */
export type ArticleMediaRow = Pick<ArticleItem, "id" | "url_media">;

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
