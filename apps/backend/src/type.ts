/** Augmentation du type Express.Locals pour typer res.locals dans les middlewares et controllers. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: string;
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
  role: string;
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
};

/** Type representant les informations de l'utilisateur connecte. */
export type UserInfoRow = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};
