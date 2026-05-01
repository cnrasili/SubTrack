CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cost REAL NOT NULL CHECK(cost > 0),
  billing_period TEXT NOT NULL CHECK(billing_period IN ('monthly', 'yearly')),
  next_payment_date TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK(currency IN ('TRY', 'USD', 'EUR')),
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
