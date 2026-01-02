// Type for DB user
export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  active: boolean;
};
