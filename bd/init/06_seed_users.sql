-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO users (email, password_hash, display_name, role, password_changed_at)
VALUES (
  'admin@example.com',
  '$2b$10$3Br0yYg6p5EclXJaHT/mpO0qq6A5niWuCpT8hM2FXlkl2YjOx.A7.', -- Hash bcrypt du mot de passe 'MyPassword'
  'Admin',
  'admin',
  NOW()
);

INSERT INTO users (email, password_hash, display_name, role, password_changed_at)
VALUES (
  'artists@example.com',
  '$2b$10$3Br0yYg6p5EclXJaHT/mpO0qq6A5niWuCpT8hM2FXlkl2YjOx.A7.', -- Hash bcrypt du mot de passe 'MyPassword'
  'artists Manager',
  'artists',
  NOW()
);

INSERT INTO users (email, password_hash, display_name, role, password_changed_at)
VALUES (
  'news@example.com',
  '$2b$10$3Br0yYg6p5EclXJaHT/mpO0qq6A5niWuCpT8hM2FXlkl2YjOx.A7.', -- Hash bcrypt du mot de passe 'MyPassword'
  'News Editor',
  'news',
  NOW()
);
