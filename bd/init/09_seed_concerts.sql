-- //NOTE : Utiliser uniquement en phase de developpement.
INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'main-stage',
  now() + interval '1 day',
  now() + interval '1 day 1 hour'
FROM artists
WHERE name = 'Red Hot Chili Peppers';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'second-stage',
  now() + interval '1 day',
  now() + interval '1 day 1 hour'
FROM artists
WHERE name = 'Foo Fighters';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'main-stage',
  now() + interval '1 day 1 hour',
  now() + interval '1 day 2 hours'
FROM artists
WHERE name = 'Oasis';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'second-stage',
  now() + interval '1 day 1 hour',
  now() + interval '1 day 2 hours'
FROM artists
WHERE name = 'Guns N'' Roses';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'main-stage',
  now() + interval '1 day 2 hours',
  now() + interval '1 day 3 hours'
FROM artists
WHERE name = 'AC/DC';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'second-stage',
  now() + interval '1 day 2 hours',
  now() + interval '1 day 3 hours'
FROM artists
WHERE name = 'Pearl Jam';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'main-stage',
  now() + interval '2 days',
  now() + interval '2 days 1 hour'
FROM artists
WHERE name = 'Muse';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'second-stage',
  now() + interval '2 days',
  now() + interval '2 days 1 hour'
FROM artists
WHERE name = 'Queens of the Stone Age';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'main-stage',
  now() + interval '2 days 1 hour',
  now() + interval '2 days 2 hours'
FROM artists
WHERE name = 'Arctic Monkeys';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT
  id,
  'second-stage',
  now() + interval '2 days 1 hour',
  now() + interval '2 days 2 hours'
FROM artists
WHERE name = 'The Strokes';
