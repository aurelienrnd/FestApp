/** Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`. */
export type UserRole = "admin" | "lineup" | "news";

/** Augmentation du type Express.Locals pour typer res.locals dans les middlewares et controllers. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: UserRole;
      userDisplayName?: string | null;
      sessionId?: string;
    }
  }
}

/** Type representant une ligne utilisateur retournee par la base de donnees. */
export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
};

/** Type representant une ligne de session retournee par la base de donnees. */
export type SessionRow = {
  id: string;
  revoked_at: Date | null;
  expires_at: Date;
};

/** Type representant une ligne utilisateur retournee par les requetes de liste. */
export type UserListRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  password_changed_at: string | null;
};

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
};

/** Type representant une ligne concert retournee par la base de donnees. */
export type ConcertRow = {
  id: string;
  artist_id: string;
  stage: string;
  start_time: string;
  end_time: string;
};

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

/** Type representant les informations de l'utilisateur connecte. */
export type UserInfoRow = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  password_changed_at: Date | null;
};
