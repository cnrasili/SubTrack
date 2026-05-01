CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6c757d',
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

CREATE TABLE IF NOT EXISTS budgets (
  currency TEXT PRIMARY KEY CHECK(currency IN ('TRY', 'USD', 'EUR')),
  amount REAL NOT NULL CHECK(amount > 0)
);

CREATE TABLE IF NOT EXISTS subscription_price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  old_cost REAL NOT NULL,
  new_cost REAL NOT NULL,
  old_currency TEXT NOT NULL,
  new_currency TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
