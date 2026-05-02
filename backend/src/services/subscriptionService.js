const db = require('../db/database');

const SORTABLE_COLUMNS = new Set(['name', 'cost', 'next_payment_date', 'created_at']);

// Builds and runs a filtered + sorted SELECT query for subscriptions
function getAllSubscriptions(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.category_id) {
    conditions.push('category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.billing_period) {
    conditions.push('billing_period = ?');
    params.push(filters.billing_period);
  }
  if (filters.is_active !== undefined) {
    conditions.push('is_active = ?');
    params.push(filters.is_active);
  }
  if (filters.q) {
    conditions.push('name LIKE ?');
    params.push(`%${filters.q}%`);
  }

  const sortColumn = SORTABLE_COLUMNS.has(filters.sort_by) ? filters.sort_by : 'next_payment_date';
  const sortOrder = (filters.order || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.prepare(`SELECT * FROM subscriptions ${where} ORDER BY ${sortColumn} ${sortOrder}`).all(...params);
}

// Returns single subscription or null if not found
function getSubscriptionById(id) {
  return db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id) ?? null;
}

// Creates a new subscription and returns it
function createSubscription(data) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO subscriptions
      (name, cost, billing_period, next_payment_date, category_id, currency, notes, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.name, data.cost, data.billing_period, data.next_payment_date,
    data.category_id, data.currency, data.notes ?? '', data.is_active ?? 1, now, now
  );
  return getSubscriptionById(result.lastInsertRowid);
}

// Updates subscription; records price history if cost changed
function updateSubscription(id, data) {
  const existing = getSubscriptionById(id);
  if (!existing) return null;
  const now = new Date().toISOString();

  const update = db.transaction(() => {
    if (data.cost !== existing.cost) {
      db.prepare(`
        INSERT INTO subscription_price_history
          (subscription_id, old_cost, new_cost, old_currency, new_currency, changed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, existing.cost, data.cost, existing.currency, data.currency ?? existing.currency, now);
    }
    db.prepare(`
      UPDATE subscriptions
      SET name = ?, cost = ?, billing_period = ?, next_payment_date = ?,
          category_id = ?, currency = ?, notes = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.name, data.cost, data.billing_period, data.next_payment_date,
      data.category_id, data.currency, data.notes ?? '', data.is_active ?? 1, now, id
    );
  });

  update();
  return getSubscriptionById(id);
}

// Returns price history for a subscription ordered by most recent first
function getPriceHistory(id) {
  return db.prepare(`
    SELECT * FROM subscription_price_history
    WHERE subscription_id = ?
    ORDER BY changed_at DESC
  `).all(id);
}

// Deletes subscription and returns null if not found
function deleteSubscription(id) {
  if (!getSubscriptionById(id)) return null;
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);
  return { deleted: true };
}

// Returns active subscriptions with next_payment_date within the next N days
function getUpcomingPayments(days) {
  return db.prepare(`
    SELECT * FROM subscriptions
    WHERE is_active = 1
      AND next_payment_date >= date('now')
      AND next_payment_date <= date('now', ? || ' days')
    ORDER BY next_payment_date ASC
  `).all(`+${days}`);
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getUpcomingPayments,
  getPriceHistory,
};
