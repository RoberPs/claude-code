-- Kōhi — esquema de la lista de espera
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  position INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
