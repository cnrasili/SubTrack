// Returns monthly cost equivalent for a single subscription
function normalizeToMonthly(cost, billing_period) {
  return billing_period === 'yearly' ? cost / 12 : cost;
}

// Returns total monthly cost grouped by currency
function getMonthlySummary(subscriptions) {
  const totals = {};
  for (const sub of subscriptions) {
    const monthly = normalizeToMonthly(sub.cost, sub.billing_period);
    totals[sub.currency] = (totals[sub.currency] ?? 0) + monthly;
  }
  return totals;
}

// Returns total yearly cost grouped by currency
function getYearlySummary(subscriptions) {
  const monthly = getMonthlySummary(subscriptions);
  const result = {};
  for (const [currency, amount] of Object.entries(monthly)) {
    result[currency] = amount * 12;
  }
  return result;
}

// Returns cost breakdown grouped by category_id
function getSummaryByCategory(subscriptions) {
  const groups = {};
  for (const sub of subscriptions) {
    if (!groups[sub.category_id]) {
      groups[sub.category_id] = {
        category_id: sub.category_id,
        category_name: sub.category_name ?? null,
        count: 0,
        monthly: {},
      };
    }
    const group = groups[sub.category_id];
    group.count++;
    const monthly = normalizeToMonthly(sub.cost, sub.billing_period);
    group.monthly[sub.currency] = (group.monthly[sub.currency] ?? 0) + monthly;
  }
  return Object.values(groups);
}

module.exports = { normalizeToMonthly, getMonthlySummary, getYearlySummary, getSummaryByCategory };
