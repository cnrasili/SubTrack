const VALID_PERIODS = ['monthly', 'yearly'];
const VALID_CURRENCIES = ['TRY', 'USD', 'EUR'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Validates and sanitizes subscription input
function validateSubscription(data) {
  const errors = [];

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) errors.push('name is required');
  else if (name.length < 2) errors.push('name must be at least 2 characters');
  else if (name.length > 100) errors.push('name must be at most 100 characters');

  const cost = Number(data.cost);
  if (!data.cost && data.cost !== 0) errors.push('cost is required');
  else if (isNaN(cost) || cost <= 0) errors.push('cost must be a positive number');

  if (!data.billing_period) errors.push('billing_period is required');
  else if (!VALID_PERIODS.includes(data.billing_period)) errors.push('billing_period must be monthly or yearly');

  if (!data.next_payment_date) errors.push('next_payment_date is required');
  else if (!DATE_PATTERN.test(data.next_payment_date) || isNaN(Date.parse(data.next_payment_date))) {
    errors.push('next_payment_date must be a valid date in YYYY-MM-DD format');
  }

  const categoryId = Number(data.category_id);
  if (!data.category_id) errors.push('category_id is required');
  else if (!Number.isInteger(categoryId) || categoryId <= 0) errors.push('category_id must be a positive integer');

  const currency = data.currency ?? 'TRY';
  if (!VALID_CURRENCIES.includes(currency)) errors.push('currency must be TRY, USD, or EUR');

  const isActive = data.is_active !== undefined ? Number(data.is_active) : 1;
  if (![0, 1].includes(isActive)) errors.push('is_active must be 0 or 1');

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      name,
      cost,
      billing_period: data.billing_period,
      next_payment_date: data.next_payment_date,
      category_id: categoryId,
      currency,
      notes: typeof data.notes === 'string' ? data.notes.trim() : '',
      is_active: isActive,
    },
  };
}

module.exports = { validateSubscription };
