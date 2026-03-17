/** Type representant une ligne utilisateur retournee par l'API. */
export type UserListRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
  password_changed_at?: string | null;
};

/** Type representant une ligne artiste retournee par l'API. */
export type ArtistListRow = {
  id: string;
  name: string;
  genre: string;
  origin: string;
  bio: string;
  url_media: string;
  description_media: string;
};
