const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const { validateCategory } = require('../validators/categoryValidator');

router.get('/', (req, res) => {
  res.json(categoryService.getAllCategories());
});

router.get('/:id', (req, res) => {
  const category = categoryService.getCategoryById(req.params.id);
  if (!category) return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
  res.json(category);
});

router.post('/', (req, res) => {
  const validation = validateCategory(req.body);
  if (!validation.valid) return res.status(400).json({ error: 'VALIDATION_ERROR', message: validation.errors.join(', ') });
  res.status(201).json(categoryService.createCategory(validation.data));
});

router.put('/:id', (req, res) => {
  const validation = validateCategory(req.body);
  if (!validation.valid) return res.status(400).json({ error: 'VALIDATION_ERROR', message: validation.errors.join(', ') });
  const updated = categoryService.updateCategory(req.params.id, validation.data);
  if (!updated) return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  try {
    const result = categoryService.deleteCategory(req.params.id);
    if (!result) return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    if (err.code === 'CATEGORY_HAS_SUBSCRIPTIONS') {
      return res.status(409).json({ error: err.code, message: err.message });
    }
    throw err;
  }
});

module.exports = router;
