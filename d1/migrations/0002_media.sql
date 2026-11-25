-- Images uploaded from the console when no R2 bucket is bound.
-- D1 limits a row to about 2 MB, so the console shrinks photos before upload.
CREATE TABLE IF NOT EXISTS media (
  key        TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  data       BLOB NOT NULL,
  size       INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
