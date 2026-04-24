-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Ouverture de la billetterie',
  'La billetterie du Vindhellfest ouvre officiellement ses portes. Les pass week-end sont disponibles en quantite limitee. Rendez-vous sur notre site pour reserver vos places avant epuisement du stock.',
  TRUE,
  now() - INTERVAL '5 days',
  '/uploads/articles/36991bf8-0c09-4ddf-8f62-bfd6f81f58d7.webp',
  'Billets de concert Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Nouvelle tete d affiche',
  'Nous sommes heureux de vous annoncer l ajout d un nouvel artiste exceptionnel a la programmation du festival. Plus d informations a venir tres prochainement.',
  FALSE,
  now() - INTERVAL '1 day',
  '/uploads/articles/d61a5775-c160-45ce-b922-7d8d1f2344d8.webp',
  'Photo promo du nouvel artiste invite au Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Le programme complet est devoile',
  'Vindhellfest est fier de devoiler sa programmation complete. Dix groupes exceptionnels se succederont sur deux scenes pendant deux jours. Du grunge de Seattle au hard rock australien, en passant par la Britpop manchesterienne et l indie rock new-yorkais, cette edition s annonce comme la plus ambitieuse de l histoire du festival.',
  TRUE,
  now() - INTERVAL '4 days',
  '/uploads/articles/72eb723b-6810-4156-ba3f-045b84bdc4b6.webp',
  'Vue de la scene principale du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Infos pratiques : acces et stationnement',
  'Le site du Vindhellfest est accessible en transports en commun depuis le centre-ville. Des navettes speciales seront mises en place les deux jours du festival. Un parking gratuit est disponible a 10 minutes a pied de l entree principale. Nous encourageons le covoiturage et les transports doux.',
  TRUE,
  now() - INTERVAL '3 days',
  '/uploads/articles/3359a403-b41f-46cd-a2c5-257989945aec.webp',
  'Acces et transports pour le Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Oasis de retour : une exclusivite Vindhellfest',
  'C est officiel : Oasis fouleront la scene principale du Vindhellfest pour l une de leurs rarissimes dates europeennes. Liam et Noel Gallagher, reunis apres quinze ans de silence, promettent un set exceptionnel avec les classiques qui ont marque une generation. Les pass sont encore disponibles mais partent tres vite.',
  TRUE,
  now() - INTERVAL '10 days',
  '/uploads/articles/8d68c3de-45e3-409a-ab4e-a9e09c51a033.webp',
  'Photo de scene du groupe Oasis',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Les coulisses du festival : rencontre avec l equipe',
  'Derriere chaque edition de Vindhellfest se cache une equipe passionnee qui travaille toute l annee pour offrir une experience inoubliable. Nous sommes alles a la rencontre des equipes scene, securite et restauration pour comprendre l envers du decor d un evenement de cette envergure.',
  TRUE,
  now() - INTERVAL '8 days',
  '/uploads/articles/f2b70de1-3dcb-4fed-abe1-9ca10d4fa901.webp',
  'Equipe backstage du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Restauration : les meilleurs stands du festival',
  'Cette annee, Vindhellfest mise sur une offre gastronomique a la hauteur de sa programmation. Burgers artisanaux, cuisine du monde, options vegetariennes et vegan — plus de vingt stands de restauration seront presents sur le site. Voici notre selection des incontournables a ne pas manquer.',
  FALSE,
  now() - INTERVAL '2 days',
  '/uploads/articles/5fc9d873-86c0-45e7-b83a-96869b3e89f5.webp',
  'Stands de restauration du festival',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Retour sur la premiere edition de Vindhellfest',
  'Il y a un an, Vindhellfest ouvrait ses portes pour la premiere fois. Retour en images et en emotions sur une edition fondatrice qui a pose les bases d un festival appele a grandir. Plus de cinq mille festivaliers avaient repondu present pour cette nuit historique.',
  TRUE,
  now() - INTERVAL '365 days',
  '/uploads/articles/0c327982-c511-4861-9d51-7b71e9eca8a9.webp',
  'Foule lors de la premiere edition du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Developpement durable : nos engagements pour cette edition',
  'Vindhellfest s engage concretement pour reduire son empreinte ecologique. Gobelets consignes, tri selectif renforce, fournisseurs locaux privilegies et bilan carbone publie apres l evenement — decouvrez toutes les actions mises en place pour faire de cette edition une fete responsable.',
  TRUE,
  now() - INTERVAL '6 days',
  '/uploads/articles/ffd7451f-c59e-43fb-b8c1-4984cba2fc6a.webp',
  'Initiatives eco-responsables du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Concours : gagnez vos pass VIP pour le festival',
  'Pour celebrer l ouverture du festival, Vindhellfest offre trois paires de pass VIP a ses fans les plus fideles. Rendez-vous sur nos reseaux sociaux pour participer au concours. Les gagnants seront tires au sort parmi tous les participants et contactes par email dans les 48 heures.',
  FALSE,
  now() - INTERVAL '12 hours',
  '/uploads/articles/51e7de18-c3de-4b1e-a730-f0e899872289.webp',
  'Pass VIP Vindhellfest a gagner',
  id FROM users WHERE email = 'admin@example.com';
