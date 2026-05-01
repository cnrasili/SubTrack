const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');
const categoryService = require('../services/categoryService');
const summaryService = require('../services/summaryService');

router.get('/', (req, res) => {
  const subscriptions = subscriptionService.getAllSubscriptions({ is_active: 1 });
  const categoryMap = categoryService.getAllCategories().reduce((map, c) => {
    map[c.id] = c.name;
    return map;
  }, {});
  const enriched = subscriptions.map(s => ({ ...s, category_name: categoryMap[s.category_id] ?? null }));

  res.json({
    total_active: subscriptions.length,
    monthly: summaryService.getMonthlySummary(subscriptions),
    yearly: summaryService.getYearlySummary(subscriptions),
    by_category: summaryService.getSummaryByCategory(enriched),
  });
});

module.exports = router;
