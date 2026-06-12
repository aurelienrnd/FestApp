/* === USERS === */

/** Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`. */
export type UserRole = "admin" | "artists" | "news";

/** Type representant une ligne utilisateur retournee par l'API. */
export type UserItem = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  password_changed_at: string | null;
};

/** Type representant l'utilisateur connecte retourne par GET /admin/auth/me. */
export type AdminUser = Omit<UserItem, "created_at" | "password_changed_at">;

/** Type representant la reponse de GET /admin/auth/me. */
export type AdminAuthMeResponse = {
  user: AdminUser;
  mustChangePassword: boolean;
};

/* === NEWS === */

/** Type representant une ligne news retournee par l'API. */
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

/** Type representant les donnees news retournees par l'endpoint home. */
export type HomeNews = Pick<
  NewsItem,
  "id" | "title" | "url_media" | "description_media" | "created_at"
>;

/* === ARTISTS === */

/** Type representant une ligne artiste retournee par l'API. */
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
  is_featured: boolean;
  stage: string | null;
  start_time: string | null;
  end_time: string | null;
};

/** Type representant les donnees artiste retournees par l'endpoint home. */
export type HomeArtist = Pick<
  ArtistItem,
  | "id"
  | "name"
  | "stage"
  | "start_time"
  | "end_time"
  | "url_media"
  | "description_media"
>;

/* === UI === */

/** Type d'un element de navigation — label affiché, chemin, état actif et callback optionnel. */
export type NavItem = {
  label?: string;
  labelBtn?: string;
  path?: string;
  active?: boolean;
  value?: string;
  role?: string;
  desc?: string;
  onClick?: () => void;
};

/* === API === */

/** Type representant une reponse API generique avec un message optionnel. */
export type ApiMessageResponse = {
  message?: string;
};

/** Type representant une reponse API de creation ou modification — message + entite retournee. */
export type CreateApiResponse<T> = { message: string } & T;
