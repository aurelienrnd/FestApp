// Type for DB user
export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
};

export type SessionRow = {
  id: string;
  revoked_at: Date | string | null;
  expires_at: Date | string;
};
