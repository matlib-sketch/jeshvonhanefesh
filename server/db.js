import pkg from 'pg'
const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const query = (text, params) => pool.query(text, params)

export const initSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY,
      name        TEXT NOT NULL,
      color       TEXT NOT NULL DEFAULT '#1e3a5f',
      pin_hash    TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS entries (
      user_id            UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date               TEXT    NOT NULL,
      scores             JSONB   NOT NULL DEFAULT '{}',
      journal            TEXT    NOT NULL DEFAULT '',
      week_middah_focus  INTEGER,
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      updated_at         TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, date)
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data     JSONB NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS goals (
      id          TEXT PRIMARY KEY,
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data        JSONB NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}
