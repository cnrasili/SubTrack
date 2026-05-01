// Validates and sanitizes category input
function validateCategory(data) {
  const errors = [];
  const name = typeof data.name === 'string' ? data.name.trim() : '';

  if (!name) errors.push('name is required');
  else if (name.length < 2) errors.push('name must be at least 2 characters');
  else if (name.length > 50) errors.push('name must be at most 50 characters');

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, data: { name } };
}

module.exports = { validateCategory };
