/** Les rôles utilisateur autorisés — miroir du type ENUM PostgreSQL `user_role`. */
export type UserRole = "admin" | "lineup" | "news";

/** Type representant une ligne utilisateur retournee par l'API. */
export type UserListRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  password_changed_at?: string | null;
};

/** Type representant une ligne article retournee par l'API. */
export type ArticleRow = {
  id: string;
  title: string;
  content: string | null;
  is_published: boolean;
  created_at: string;
  url_media: string;
  description_media: string;
  author_name: string | null;
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
  youtube_url: string | null;
  spotify_url: string | null;
  is_featured: boolean;
  stage: string | null;
  start_time: string | null;
  end_time: string | null;
};

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

/** Type representant les donnees article retournees par l'endpoint home. */
export type HomeArticleRow = Pick<
  ArticleRow,
  "id" | "title" | "url_media" | "description_media" | "created_at"
>;

/** Type representant les donnees agregees retournees par GET /public/home. */
export type HomeData = {
  artists: HomeArtistRow[];
  articles: HomeArticleRow[];
};
