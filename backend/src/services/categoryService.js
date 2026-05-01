const db = require('../db/database');

// Returns all categories ordered by name
function getAllCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
}

// Returns single category or null if not found
function getCategoryById(id) {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) ?? null;
}

// Creates a new category and returns it
function createCategory(data) {
  const now = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO categories (name, created_at) VALUES (?, ?)'
  ).run(data.name, now);
  return getCategoryById(result.lastInsertRowid);
}

// Updates category name and returns updated row, or null if not found
function updateCategory(id, data) {
  if (!getCategoryById(id)) return null;
  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(data.name, id);
  return getCategoryById(id);
}

// Deletes a category; returns null if not found, throws if subscriptions exist
function deleteCategory(id) {
  if (!getCategoryById(id)) return null;

  const linked = db.prepare(
    'SELECT COUNT(*) as count FROM subscriptions WHERE category_id = ?'
  ).get(id);

  if (linked.count > 0) {
    const err = new Error('Category has active subscriptions');
    err.code = 'CATEGORY_HAS_SUBSCRIPTIONS';
    throw err;
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return { deleted: true };
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
