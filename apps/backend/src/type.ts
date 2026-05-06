// === EXPRESS ===

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

// === DB ===

/** Type representant une ligne utilisateur brute retournee par la base de donnees (usage interne). */
export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
};

/** Type representant une ligne de session retournee par la base de donnees. */
export type SessionRow = {
  id: string;
  revoked_at: Date | null;
  expires_at: Date;
};

/** Type representant une ligne concert retournee par la base de donnees. */
export type ConcertRow = {
  id: string;
  artist_id: string;
  stage: string;
  start_time: string;
  end_time: string;
};

// === USERS ===

/** Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`. */
export type UserRole = "admin" | "lineup" | "news";

/** Type representant une ligne utilisateur retournee par les requetes de liste. */
export type UserListRow = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  password_changed_at: string | null;
};

/** Type representant les informations de l'utilisateur connecte — retourne par GET /admin/auth/me. */
export type UserInfoRow = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  password_changed_at: string | null;
};

/** Type representant les champs utilisateur charges par le middleware auth. */
export type AuthUserRow = {
  id: string;
  display_name: string;
  role: UserRole;
};

// === ARTISTS ===

/** Type representant une ligne artiste retournee par les requetes de liste. */
export type ArtistListRow = {
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

/** Type representant une ligne artiste de la liste (sans bio, genre, origin, youtube_url, spotify_url, end_time) — retourne par GET /public/lineup. */
export type ArtistSummary = Omit<
  ArtistListRow,
  "bio" | "genre" | "origin" | "youtube_url" | "spotify_url" | "end_time"
>;

/** Type representant les champs artiste necessaires pour la gestion du fichier image. */
export type ArtistMediaRow = Pick<ArtistListRow, "id" | "url_media">;

/** Type representant les donnees artiste retournees par l'endpoint home. */
export type HomeArtistRow = Pick<
  ArtistListRow,
  | "id"
  | "name"
  | "stage"
  | "start_time"
  | "end_time"
  | "url_media"
  | "description_media"
>;

// === ARTICLES ===

/** Type representant une ligne article retournee par les requetes. */
export type ArticleRow = {
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

/** Type representant une ligne article de la liste (sans content ni user_id) — retourne par GET /public/news. */
export type ArticleSummaryRow = Omit<ArticleRow, "content" | "user_id">;

/** Type representant les donnees article retournees par l'endpoint home. */
export type HomeArticleRow = Pick<
  ArticleRow,
  "id" | "title" | "url_media" | "description_media" | "created_at"
>;

/** Type representant les champs article necessaires pour la gestion du fichier image. */
export type ArticleMediaRow = Pick<ArticleRow, "id" | "url_media">;
