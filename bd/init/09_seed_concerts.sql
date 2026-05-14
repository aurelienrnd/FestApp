-- //NOTE : Utiliser uniquement en phase de developpement.

-- === 21 mai 2027 ===
INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'MainStage', '2027-05-21 18:00:00+00', '2027-05-21 19:00:00+00'
FROM artists WHERE name = 'Red Hot Chili Peppers';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'Tremplin', '2027-05-21 18:00:00+00', '2027-05-21 19:00:00+00'
FROM artists WHERE name = 'Foo Fighters';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'MainStage', '2027-05-21 19:00:00+00', '2027-05-21 20:00:00+00'
FROM artists WHERE name = 'Oasis';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'Tremplin', '2027-05-21 19:00:00+00', '2027-05-21 20:00:00+00'
FROM artists WHERE name = 'Guns N'' Roses';

-- === 22 mai 2027 ===
INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'MainStage', '2027-05-22 18:00:00+00', '2027-05-22 19:00:00+00'
FROM artists WHERE name = 'AC/DC';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'Tremplin', '2027-05-22 18:00:00+00', '2027-05-22 19:00:00+00'
FROM artists WHERE name = 'Pearl Jam';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'MainStage', '2027-05-22 19:00:00+00', '2027-05-22 20:00:00+00'
FROM artists WHERE name = 'Muse';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'Tremplin', '2027-05-22 19:00:00+00', '2027-05-22 20:00:00+00'
FROM artists WHERE name = 'Queens of the Stone Age';

-- === 23 mai 2027 ===
INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'MainStage', '2027-05-23 18:00:00+00', '2027-05-23 19:00:00+00'
FROM artists WHERE name = 'Arctic Monkeys';

INSERT INTO concerts (artist_id, stage, start_time, end_time)
SELECT id, 'Tremplin', '2027-05-23 18:00:00+00', '2027-05-23 19:00:00+00'
FROM artists WHERE name = 'The Strokes';
