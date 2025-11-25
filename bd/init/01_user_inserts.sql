INSERT INTO users (email, password_hash, display_name)
VALUES (
  'mail@user.local',
  'MyPassword',          -- //NOTE temporaire, remplacé par un hash bcrypt côté backend plus tard
  'MyDisplayName'
);
