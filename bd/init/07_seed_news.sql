-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Ouverture de la billetterie',
  'La billetterie du Vindhellfest ouvre officiellement ses portes aujourd hui, et avec elle, une nouvelle page s ecrit pour le festival de metal le plus attendu de la region. Les pass week-end sont disponibles en quantite strictement limitee, et au vu de l engouement suscite par la programmation de cette edition, nous vous conseillons vivement de ne pas attendre.

Cette annee, trois types de pass sont proposes : le pass journee, le pass week-end et le fameux pass VIP qui donne acces aux zones backstage, a une restauration premium et a des rencontres organisees avec certains artistes. Les tarifs ont ete maintenus au meme niveau que l an dernier malgre la hausse du cout des productions, un effort delibere de notre part pour rendre l evenement accessible au plus grand nombre.

La billetterie en ligne est disponible sur notre site officiel. Une file d attente virtuelle sera mise en place en cas d afflux important. Les achats peuvent etre effectues par carte bancaire ou virement. Aucune vente ne sera effectuee aux guichets physiques avant le jour J. Les billets sont nominatifs et non echangeables.

Pour les groupes de dix personnes ou plus, un tarif degressif est applicable sur demande aupres de notre equipe. Les scolaires et les demandeurs d emploi beneficient egalement d un tarif reduit sur presentation d un justificatif valide. N hesitez pas a consulter notre FAQ pour toutes les questions relatives aux remboursements et aux echanges.',
  TRUE,
  now() - INTERVAL '5 days',
  '/uploads/news/36991bf8-0c09-4ddf-8f62-bfd6f81f58d7.webp',
  'Billets de concert Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Nouvelle tete d affiche',
  'Nous sommes heureux de vous annoncer l ajout d un nouvel artiste exceptionnel a la programmation du festival. Plus d informations a venir tres prochainement sur son identite et son creneau exact dans le programme.

Ce que nous pouvons deja vous dire, c est qu il s agit d un groupe qui n a pas joue en France depuis plusieurs annees, et dont le retour sur scene est l un des evenements les plus commentes dans la presse musicale specialisee depuis le debut de l annee. Les rumeurs vont bon train sur les reseaux sociaux, et nous ne ferons rien pour les eteindre.

La revelation officielle aura lieu dans les prochains jours via nos canaux habituels : site web, newsletter et reseaux sociaux. Si vous n etes pas encore abonne a notre newsletter, c est le moment ideal pour le faire afin d etre parmi les premiers informes.

Nous profitons de cette annonce pour remercier l ensemble de notre communaute pour son soutien et sa patience. Construire une programmation de cette qualite demande du temps, des negociations complexes et parfois des rebondissements de derniere minute. Votre enthousiasme est notre moteur.',
  FALSE,
  now() - INTERVAL '1 day',
  '/uploads/news/d61a5775-c160-45ce-b922-7d8d1f2344d8.webp',
  'Photo promo du nouvel artiste invite au Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Le programme complet est devoile',
  'Vindhellfest est fier de devoiler sa programmation complete pour cette nouvelle edition. Dix groupes d exception se succederont sur deux scenes pendant deux jours intenses, offrant un voyage musical sans equivalent dans la region. Du grunge de Seattle au hard rock australien, en passant par la Britpop manchesterienne et l indie rock new-yorkais, cette edition s annonce comme la plus ambitieuse de l histoire du festival.

La scene principale accueillera les headliners chaque soir a partir de vingt heures. Red Hot Chili Peppers et Oasis se partageront les deux soirees phares, encadres par des groupes de la trempe de AC/DC, Guns N Roses et Pearl Jam. La scene secondaire, elle, sera consacree aux groupes au son plus indie et alternatif : Arctic Monkeys, Muse, The Strokes, Queens of the Stone Age et Foo Fighters s y produiront en fin d apres-midi.

Les horaires definitifs seront publies dans les prochains jours. Un effort particulier a ete fait cette annee pour eviter les chevauchements entre les artistes les plus attendus, une demande recurrente de notre communaute depuis l edition precedente. Chaque concert durera entre soixante-quinze et cent vingt minutes selon les groupes.

L application officielle du festival sera mise a jour avec le programme complet et la carte du site avant la fin de la semaine. Vous pourrez y construire votre programme personnalise, activer des rappels et partager votre planning avec vos amis. Telechargez-la des maintenant sur les stores pour ne rien manquer.',
  TRUE,
  now() - INTERVAL '4 days',
  '/uploads/news/72eb723b-6810-4156-ba3f-045b84bdc4b6.webp',
  'Vue de la scene principale du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Infos pratiques : acces et stationnement',
  'Le site du Vindhellfest est accessible en transports en commun depuis le centre-ville en moins de vingt minutes. Deux lignes de bus desservent directement l entree principale du festival : la ligne 12 depuis la gare centrale et la ligne 7 depuis la place de la Republique. Les frequences seront renforcees les deux jours du festival avec un passage toutes les dix minutes a partir de seize heures.

Des navettes speciales seront egalement mises en place au depart de six points de ralliement repartis dans l agglomeration. Ces navettes sont incluses dans le prix du billet festival sur presentation de votre pass. Le detail des points de depart et des horaires sera publie sur notre site deux semaines avant l evenement.

Pour les festivaliers venant en voiture, un parking gratuit d une capacite de deux mille places est disponible a dix minutes a pied de l entree principale. Ce parking est surveille en continu et accessible des quatorze heures les deux jours du festival. Nous encourageons vivement le covoiturage : une rubrique dediee est disponible sur notre site pour mettre en relation conducteurs et passagers.

Les cyclistes disposeront d un parking velo securise et gratuit a proximite immediate de l entree. Des bornes de recharge pour velos electriques seront disponibles sur place. Concernant l accessibilite, le site est entierement amenage pour les personnes a mobilite reduite. Des places de parking reservees PMR sont disponibles sur demande prealable a notre equipe. Un espace d accueil specifique sera mis en place a l entree pour orienter et accompagner les festivaliers ayant des besoins particuliers.',
  TRUE,
  now() - INTERVAL '3 days',
  '/uploads/news/3359a403-b41f-46cd-a2c5-257989945aec.webp',
  'Acces et transports pour le Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Oasis de retour : une exclusivite Vindhellfest',
  'C est officiel et definitif : Oasis fouleront la scene principale du Vindhellfest pour l une de leurs rarissimes dates europeennes de cette annee. Liam et Noel Gallagher, reunis apres quinze ans de silence et d une brouille qui semblait irreparable, promettent un set exceptionnel construit autour des classiques qui ont marque au fer rouge toute une generation de fans de rock britannique.

Leur retour sur scene en 2025 a deja fait trembler les stades de Londres, Manchester et Glasgow. Le groupe a retrouve une cohesion et une energie que beaucoup pensaient a jamais perdues. Les critiques les plus severes ont ete contraints de reconnaitre que la reformation d Oasis n est pas un simple exercice nostalgique mais bel et bien un retour artistique a part entiere, avec une setlist minutieusement construite qui traverse l integralite de leur discographie.

Vindhellfest est l un des rares festivals europeens a avoir obtenu une date dans leur tournee. C est le fruit de deux ans de negociation et d un engagement financier considerable de notre part. Nous avons fait ce choix parce que nous croyons que certains concerts appartiennent a l histoire, et que c en sera un.

Wonderwall, Champagne Supernova, Don t Look Back in Anger, Live Forever, Some Might Say — la setlist probable, telle qu elle a ete jouee lors des premieres dates de la tournee, fait deja frissonner les plus blasés des spectateurs. Les pass sont encore disponibles mais partent a un rythme soutenu. Ne remettez pas votre decision a demain.',
  TRUE,
  now() - INTERVAL '10 days',
  '/uploads/news/8d68c3de-45e3-409a-ab4e-a9e09c51a033.webp',
  'Photo de scene du groupe Oasis',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Les coulisses du festival : rencontre avec l equipe',
  'Derriere chaque edition de Vindhellfest se cache une equipe passionnee qui travaille toute l annee pour offrir une experience inoubliable a des milliers de festivaliers. Nous sommes alles a la rencontre des equipes scene, securite et restauration pour comprendre l envers du decor d un evenement de cette envergure, souvent invisible aux yeux du public.

L equipe technique, composee de trente-cinq personnes permanentes et de plus de deux cents intermittents, commence son travail six mois avant le festival. La construction de la scene principale necessite a elle seule quatre-vingt-dix tonnes de structure metallique et trois kilometres de cables. Le systeme son, dernier cri, est capable de diffuser un signal de qualite uniforme jusqu a cinq cents metres du bord de scene, un defi acoustique considerable compte tenu de la configuration du site.

L equipe securite, dirigee par un ancien responsable des grands stades parisiens, coordonne une centaine d agents repartis sur l ensemble du site. Un poste de commandement centralise surveille en temps reel les flux de festivaliers grace a un systeme de cameras et de comptage automatique. Des protocoles d urgence sont testes et mis a jour chaque annee en collaboration avec les services de secours locaux.

Cote restauration, c est une veritable organisation logistique. Les vingt-deux stands du festival representent plus de trois cents personnes mobilisees, des centaines de tonnes de denrees et une chaine du froid a maintenir sur tout le week-end. Le responsable de la coordination nous confie que le plus grand defi est d anticipier les pics de demande entre les concerts, quand dix mille personnes cherchent a manger en meme temps.

Rencontrer ces hommes et ces femmes, c est comprendre que Vindhellfest n est pas seulement une affiche musicale mais une veritable entreprise humaine, construite sur la passion et le professionnalisme d une communaute entiere.',
  TRUE,
  now() - INTERVAL '8 days',
  '/uploads/news/f2b70de1-3dcb-4fed-abe1-9ca10d4fa901.webp',
  'Equipe backstage du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Restauration : les meilleurs stands du festival',
  'Cette annee, Vindhellfest mise sur une offre gastronomique a la hauteur de sa programmation musicale. Fini le temps des hot-dogs insipides et des frites molles servies dans des barquettes en plastique : cette edition voit debarquer vingt-deux stands de qualite, selectionnees apres un appel a candidatures rigoureux aupres de producteurs et restaurateurs locaux.

La carte est volontairement eclectique. On y trouve des burgers artisanaux elabores par un boucher primeur de la region, des tacos au pulled pork marine douze heures, des falafels croustillants accompagnes de leur sauce maison, une plancha de fruits de mer, et un stand de cuisine japonaise street food tenu par un chef ayant travaille dans plusieurs restaurants etoiles. Chaque stand a fourni une carte lisible et des prix affiches clairement.

Pour les festivaliers vegetariens et vegans, une section dediee regroupe six stands proposant exclusivement des recettes sans viande ni produits d origine animale. Un effort particulier a ete fait pour que ces options soient aussi gourmandes et soignees que les autres — plus question de se contenter d une salade verte quand on ne mange pas de viande.

Les boissons ne sont pas en reste : une brasserie artisanale locale sera presente avec cinq bieres brassees specialement pour l occasion. Des cocktails sans alcool elabores a partir de sirops de fruits regionaux seront egalement proposes. Toutes les boissons sont servies dans des gobelets consignes, une initiative que nous reconductons apres son succes lors de la derniere edition.

Voici notre selection des cinq incontournables a ne pas manquer : le burger Black Sabbath du stand Forge & Braise, les gyozas frits du stand Tokyo District, le tiramisu maison du stand Dolce Vita, le curry de pois chiches du stand Bombay Street, et le plateau de charcuterie locale du stand Terroir. Bonne degustation.',
  FALSE,
  now() - INTERVAL '2 days',
  '/uploads/news/5fc9d873-86c0-45e7-b83a-96869b3e89f5.webp',
  'Stands de restauration du festival',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Retour sur la premiere edition de Vindhellfest',
  'Il y a un an, Vindhellfest ouvrait ses portes pour la premiere fois, et avec elles, une vision : celle d un festival de rock et de metal ancre dans son territoire, exigeant sur la qualite de sa programmation, et attentif au confort de ses festivaliers. Un an apres, il est temps de faire le bilan de cette edition fondatrice qui a pose les bases d un evenement appele, nous en sommes convaincus, a grandir encore.

Cinq mille deux cents festivaliers avaient repondu present pour cette nuit historique, un chiffre que nous n osions pas esperer pour une premiere edition. Les retours ont ete unanimes : une organisation soignee, une sono impeccable, une ambiance unique. La presse musicale regionale et nationale s est fait l echo de cet enthousiasme, plusieurs titres qualifiant Vindhellfest de revelation de la saison festival.

Les artistes eux-memes ont exprime leur satisfaction. Plusieurs d entre eux nous ont contactes dans les semaines suivantes pour nous faire part de leur interet pour une date lors de prochaines editions. C est la plus belle recompense que l on puisse recevoir quand on organise un festival : que les artistes aient envie de revenir.

Les couacs, il y en a eu, comme dans toute premiere edition. Une file d attente trop longue a l entree les deux premieres heures, un stand de restauration en rupture de stock des dix-neuf heures, un probleme de signalisation qui a gene l acces au parking. Nous avons pris note de chaque retour negatif, et chacun de ces points a ete traite dans la preparation de la presente edition.

Cette premiere edition restera dans nos memoires comme un moment de grace collective. Une poignee de passionnes qui ont decide de creer quelque chose, et des milliers de personnes qui ont dit oui. Merci a vous tous.',
  TRUE,
  now() - INTERVAL '365 days',
  '/uploads/news/0c327982-c511-4861-9d51-7b71e9eca8a9.webp',
  'Foule lors de la premiere edition du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Developpement durable : nos engagements pour cette edition',
  'Vindhellfest s engage concretement et publiquement pour reduire son empreinte ecologique lors de cette edition. Organiser un festival de cette envergure a un cout environnemental reel, que nous ne cherchons pas a minimiser. Notre demarche consiste a le mesurer avec precision, a le reduire la ou c est possible, et a compenser ce qui ne peut pas l etre.

Premiere mesure phare : la generalisation des gobelets consignes sur l ensemble du site. Lors de la derniere edition, nous avions collecte plus de quatre-vingt-dix pour cent des gobelets distribues. Cette annee, nous visons les cent pour cent grace a un systeme de caution renforce et a des points de collecte mieux repartis. Les dechets plastiques a usage unique seront bannis de tous les stands de restauration, remplaces par des contenants compostables ou reutilisables.

Le tri selectif sera renforce avec soixante points de collecte repartis sur le site, chacun clairement identifie par couleur et par picto. Une equipe de mediateurs eco-festival sera presente tout le week-end pour accompagner les festivaliers dans leurs gestes de tri et repondre a leurs questions. Les dechets collectes seront traites par une entreprise d economie sociale et solidaire locale.

Cote approvisionnement, plus de soixante pour cent des denrees servies sur le festival proviendront de producteurs situes dans un rayon de deux cents kilometres. Un bilan carbone complet sera realise par un cabinet independant apres l evenement et publie dans son integralite sur notre site, y compris les donnees qui nous sont defavorables. Nous croyons que la transparence est la premiere condition de la credibilite.

Enfin, un partenariat a ete conclu avec une association de reforestation locale pour planter un arbre par tranche de cinquante billets vendus. Au rythme des ventes actuelles, ce sont plus de deux cents arbres qui seront plantes dans les forets regionales au cours des prochains mois. Un petit geste, mais un geste reel.',
  TRUE,
  now() - INTERVAL '6 days',
  '/uploads/news/ffd7451f-c59e-43fb-b8c1-4984cba2fc6a.webp',
  'Initiatives eco-responsables du Vindhellfest',
  id FROM users WHERE email = 'admin@example.com';

INSERT INTO news (title, content, is_published, created_at, url_media, description_media, user_id)
SELECT
  'Concours : gagnez vos pass VIP pour le festival',
  'Pour celebrer l ouverture imminente du festival et remercier notre communaute pour son soutien sans faille, Vindhellfest offre trois paires de pass VIP a ses fans les plus fideles. Ces pass donnent acces a l ensemble du site pendant les deux jours du festival, incluant les zones backstage, la restauration premium, le salon VIP et une rencontre organisee avec deux artistes de la programmation.

Pour participer, rien de plus simple. Rendez-vous sur notre compte Instagram, Facebook ou Twitter, likez la publication dediee au concours, partagez-la en story ou en publication publique, et taguez deux amis avec qui vous aimeriez vivre cette experience. Les trois gagnants seront tires au sort parmi tous les participants ayant rempli ces conditions, sur l ensemble des plateformes cumulees.

Le concours est ouvert jusqu au vendredi de la semaine prochaine a vingt-trois heures cinquante-neuf. Les gagnants seront annonces le samedi matin via une story et un post dedie, puis contactes directement par message prive pour organiser la remise des pass. Les pass sont nominatifs et ne peuvent pas etre revendus ou cedes a un tiers.

Une seule participation par compte est autorisee. Les comptes crees apres la publication du concours ne seront pas eligibles. Tout participant dont le compte est prive ou dont le partage n est pas visible publiquement au moment du tirage au sort sera disqualifie. Pour toute question, notre equipe est disponible par message prive ou via le formulaire de contact du site.

Bonne chance a tous, et que les meilleurs gagnent. Ou plutot : que les plus chanceux gagnent, puisque c est un tirage au sort. Mais soyons honnetes — vous meritez tous de venir.',
  FALSE,
  now() - INTERVAL '12 hours',
  '/uploads/news/51e7de18-c3de-4b1e-a730-f0e899872289.webp',
  'Pass VIP Vindhellfest a gagner',
  id FROM users WHERE email = 'admin@example.com';
