const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');
const { validateSubscription } = require('../validators/subscriptionValidator');

// Must be defined before /:id to prevent "upcoming" being matched as an id
router.get('/upcoming', (req, res) => {
  const days = Number(req.query.days ?? 7);
  if (isNaN(days) || days < 1) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'days must be a positive number' });
  }
  res.json(subscriptionService.getUpcomingPayments(days));
});

router.get('/', (req, res) => {
  const filters = {
    category_id: req.query.category_id,
    billing_period: req.query.billing_period,
    is_active: req.query.is_active !== undefined ? Number(req.query.is_active) : undefined,
    q: req.query.q,
  };
  res.json(subscriptionService.getAllSubscriptions(filters));
});

router.get('/:id/history', (req, res) => {
  const subscription = subscriptionService.getSubscriptionById(req.params.id);
  if (!subscription) return res.status(404).json({ error: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
  res.json(subscriptionService.getPriceHistory(req.params.id));
});

router.get('/:id', (req, res) => {
  const subscription = subscriptionService.getSubscriptionById(req.params.id);
  if (!subscription) return res.status(404).json({ error: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
  res.json(subscription);
});

router.post('/', (req, res) => {
  const validation = validateSubscription(req.body);
  if (!validation.valid) return res.status(400).json({ error: 'VALIDATION_ERROR', message: validation.errors.join(', ') });
  res.status(201).json(subscriptionService.createSubscription(validation.data));
});

router.put('/:id', (req, res) => {
  const validation = validateSubscription(req.body);
  if (!validation.valid) return res.status(400).json({ error: 'VALIDATION_ERROR', message: validation.errors.join(', ') });
  const updated = subscriptionService.updateSubscription(req.params.id, validation.data);
  if (!updated) return res.status(404).json({ error: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = subscriptionService.deleteSubscription(req.params.id);
  if (!result) return res.status(404).json({ error: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
  res.json({ message: 'Subscription deleted' });
});

module.exports = router;
