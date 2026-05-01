const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// Validates and sanitizes category input
function validateCategory(data) {
  const errors = [];
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const color = typeof data.color === 'string' ? data.color.trim() : '#6c757d';

  if (!name) errors.push('name is required');
  else if (name.length < 2) errors.push('name must be at least 2 characters');
  else if (name.length > 50) errors.push('name must be at most 50 characters');

  if (!HEX_COLOR_RE.test(color)) errors.push('color must be a valid hex color (e.g. #ff0000)');

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, data: { name, color } };
}

module.exports = { validateCategory };
