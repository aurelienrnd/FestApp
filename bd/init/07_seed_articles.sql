-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Ouverture de la billetterie',
  'La billetterie du Vindhellfest ouvre officiellement ses portes. Les pass week-end sont disponibles en quantite limitee. Rendez-vous sur notre site pour reserver vos places avant epuisement du stock.',
  TRUE,
  now() - INTERVAL '5 days',
  'https://media.istockphoto.com/id/827671152/fr/photo/shady-caract%C3%A8re-scalping-une-paire-de-billets-de-concert.jpg?s=2048x2048&w=is&k=20&c=kdscpCW8NLziB3B5t6E9UlBwTDLOMzAN7xHvK3NWyU0=',
  'Billets de concert Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Nouvelle tete d affiche',
  'Nous sommes heureux de vous annoncer l ajout d un nouvel artiste exceptionnel a la programmation du festival. Plus d informations a venir tres prochainement.',
  FALSE,
  now() - INTERVAL '1 day',
  'https://www.rollingstone.fr/wp-content/uploads/2024/01/The-Black-Keys-2024-by-Jim-Herrington-3.jpg',
  'Photo promo du nouvel artiste invite au Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Le programme complet est devoile',
  'Vindhellfest est fier de devoiler sa programmation complete. Dix groupes exceptionnels se succederont sur deux scenes pendant deux jours. Du grunge de Seattle au hard rock australien, en passant par la Britpop manchesterienne et l indie rock new-yorkais, cette edition s annonce comme la plus ambitieuse de l histoire du festival.',
  TRUE,
  now() - INTERVAL '4 days',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1280',
  'Vue de la scene principale du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Infos pratiques : acces et stationnement',
  'Le site du Vindhellfest est accessible en transports en commun depuis le centre-ville. Des navettes speciales seront mises en place les deux jours du festival. Un parking gratuit est disponible a 10 minutes a pied de l entree principale. Nous encourageons le covoiturage et les transports doux.',
  TRUE,
  now() - INTERVAL '3 days',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280',
  'Acces et transports pour le Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Oasis de retour : une exclusivite Vindhellfest',
  'C est officiel : Oasis fouleront la scene principale du Vindhellfest pour l une de leurs rarissimes dates europeennes. Liam et Noel Gallagher, reunis apres quinze ans de silence, promettent un set exceptionnel avec les classiques qui ont marque une generation. Les pass sont encore disponibles mais partent tres vite.',
  TRUE,
  now() - INTERVAL '10 days',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Oasis_-_Lollapalooza_Chile_2023_%28cropped%29.jpg/1280px-Oasis_-_Lollapalooza_Chile_2023_%28cropped%29.jpg',
  'Photo de scene du groupe Oasis',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Les coulisses du festival : rencontre avec l equipe',
  'Derriere chaque edition de Vindhellfest se cache une equipe passionnee qui travaille toute l annee pour offrir une experience inoubliable. Nous sommes alles a la rencontre des equipes scene, securite et restauration pour comprendre l envers du decor d un evenement de cette envergure.',
  TRUE,
  now() - INTERVAL '8 days',
  'https://images.unsplash.com/photo-1540039155733-5bb30b4f5e62?w=1280',
  'Equipe backstage du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Restauration : les meilleurs stands du festival',
  'Cette annee, Vindhellfest mise sur une offre gastronomique a la hauteur de sa programmation. Burgers artisanaux, cuisine du monde, options vegetariennes et vegan — plus de vingt stands de restauration seront presents sur le site. Voici notre selection des incontournables a ne pas manquer.',
  FALSE,
  now() - INTERVAL '2 days',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1280',
  'Stands de restauration du festival',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Retour sur la premiere edition de Vindhellfest',
  'Il y a un an, Vindhellfest ouvrait ses portes pour la premiere fois. Retour en images et en emotions sur une edition fondatrice qui a pose les bases d un festival appele a grandir. Plus de cinq mille festivaliers avaient repondu present pour cette nuit historique.',
  TRUE,
  now() - INTERVAL '365 days',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1280',
  'Foule lors de la premiere edition du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Developpement durable : nos engagements pour cette edition',
  'Vindhellfest s engage concretement pour reduire son empreinte ecologique. Gobelets consignes, tri selectif renforce, fournisseurs locaux privilegies et bilan carbone publie apres l evenement — decouvrez toutes les actions mises en place pour faire de cette edition une fete responsable.',
  TRUE,
  now() - INTERVAL '6 days',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1280',
  'Initiatives eco-responsables du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO articles (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Concours : gagnez vos pass VIP pour le festival',
  'Pour celebrer l ouverture du festival, Vindhellfest offre trois paires de pass VIP a ses fans les plus fideles. Rendez-vous sur nos reseaux sociaux pour participer au concours. Les gagnants seront tires au sort parmi tous les participants et contactes par email dans les 48 heures.',
  FALSE,
  now() - INTERVAL '12 hours',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1280',
  'Pass VIP Vindhellfest a gagner',
  id FROM users WHERE email = 'admin@example.com';
