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
  revoked_at: Date | string | null;
  expires_at: Date | string;
};
