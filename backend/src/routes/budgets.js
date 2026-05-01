const express = require('express');
const router = express.Router();
const budgetService = require('../services/budgetService');

const VALID_CURRENCIES = ['TRY', 'USD', 'EUR'];

router.get('/', (req, res) => {
  res.json(budgetService.getAllBudgets());
});

router.put('/:currency', (req, res) => {
  const currency = req.params.currency.toUpperCase();
  if (!VALID_CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'currency must be TRY, USD, or EUR' });
  }
  const amount = parseFloat(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'amount must be a positive number' });
  }
  res.json(budgetService.setBudget(currency, amount));
});

router.delete('/:currency', (req, res) => {
  const result = budgetService.deleteBudget(req.params.currency.toUpperCase());
  if (!result) return res.status(404).json({ error: 'BUDGET_NOT_FOUND', message: 'Budget not found' });
  res.json({ message: 'Budget removed' });
});

module.exports = router;
