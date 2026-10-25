-- migrate:up
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM users
    GROUP BY LOWER(BTRIM(nickname))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce unique nicknames: rename existing duplicate nicknames first';
  END IF;
END $$;

CREATE UNIQUE INDEX users_nickname_normalized_unique_idx
  ON users (LOWER(BTRIM(nickname)));

-- migrate:down
DROP INDEX IF EXISTS users_nickname_normalized_unique_idx;