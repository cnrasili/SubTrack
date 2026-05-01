const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../../subtrack.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);

// Enable foreign key enforcement
db.pragma('foreign_keys = ON');

// Create tables from schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Migrate price history table: replace single currency column with old_currency + new_currency
const histCols = db.pragma('table_info(subscription_price_history)').map(c => c.name);
if (histCols.includes('currency') && !histCols.includes('old_currency')) {
  db.exec(`
    DROP TABLE subscription_price_history;
    CREATE TABLE subscription_price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER NOT NULL,
      old_cost REAL NOT NULL,
      new_cost REAL NOT NULL,
      old_currency TEXT NOT NULL,
      new_currency TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    );
  `);
}

// Insert seed data if tables are empty
const seed = db.transaction(() => {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count > 0) return;

  const insertCategory = db.prepare(
    'INSERT INTO categories (name, created_at) VALUES (?, ?)'
  );
  const now = new Date().toISOString();

  const categories = ['Entertainment', 'Cloud & Storage', 'Health', 'Education', 'Productivity'];
  categories.forEach((name) => insertCategory.run(name, now));

  const entertainmentId = db.prepare("SELECT id FROM categories WHERE name = 'Entertainment'").get().id;
  const cloudId = db.prepare("SELECT id FROM categories WHERE name = 'Cloud & Storage'").get().id;

  const insertSubscription = db.prepare(`
    INSERT INTO subscriptions
      (name, cost, billing_period, next_payment_date, category_id, currency, notes, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const subscriptions = [
    { name: 'Netflix', cost: 99.90, period: 'monthly', date: '2026-05-15', cat: entertainmentId, currency: 'TRY', notes: '' },
    { name: 'Spotify', cost: 49.99, period: 'monthly', date: '2026-05-10', cat: entertainmentId, currency: 'TRY', notes: '' },
    { name: 'Google One', cost: 29.99, period: 'monthly', date: '2026-05-20', cat: cloudId, currency: 'TRY', notes: '100 GB plan' },
  ];

  subscriptions.forEach((s) => {
    insertSubscription.run(s.name, s.cost, s.period, s.date, s.cat, s.currency, s.notes, 1, now, now);
  });
});

seed();

module.exports = db;
