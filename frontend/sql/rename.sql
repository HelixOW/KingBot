-- SQLite
BEGIN TRANSACTION;

ALTER TABLE box_units RENAME TO old_table;

CREATE TABLE box_units
(
  user_id TEXT,
  guild TEXT,
  unit_id INTEGER,
  amount INTEGER
);

INSERT INTO box_units SELECT * FROM old_table;

COMMIT;