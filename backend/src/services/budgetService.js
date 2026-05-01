const db = require('../db/database');

// Returns all budget limits
function getAllBudgets() {
  return db.prepare('SELECT * FROM budgets').all();
}

// Inserts or replaces the budget limit for a currency
function setBudget(currency, amount) {
  db.prepare('INSERT OR REPLACE INTO budgets (currency, amount) VALUES (?, ?)').run(currency, amount);
  return db.prepare('SELECT * FROM budgets WHERE currency = ?').get(currency);
}

// Deletes budget for a currency; returns null if not found
function deleteBudget(currency) {
  const existing = db.prepare('SELECT * FROM budgets WHERE currency = ?').get(currency);
  if (!existing) return null;
  db.prepare('DELETE FROM budgets WHERE currency = ?').run(currency);
  return { deleted: true };
}

module.exports = { getAllBudgets, setBudget, deleteBudget };
