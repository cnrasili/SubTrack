// Pure analysis functions — no DB access, inputs are plain subscription objects

// Returns the monthly-equivalent cost for a single subscription
function toMonthly(cost, billing_period) {
  return billing_period === 'yearly' ? cost / 12 : cost;
}

// Returns monthly-equivalent cost grouped by currency
function calcMonthlyEquivalent(subscriptions) {
  const totals = {};
  for (const sub of subscriptions) {
    totals[sub.currency] = (totals[sub.currency] ?? 0) + toMonthly(sub.cost, sub.billing_period);
  }
  return totals;
}

// Returns annual projection (monthly equivalent * 12) grouped by currency
function calcAnnualProjection(subscriptions) {
  const monthly = calcMonthlyEquivalent(subscriptions);
  const result = {};
  for (const [currency, amount] of Object.entries(monthly)) {
    result[currency] = amount * 12;
  }
  return result;
}

// Returns total cost per currency from referenceDate to December 31st of the same year,
// assuming no subscriptions are cancelled.
// Monthly subs: counts actual payment occurrences in [ref, Dec 31].
// Yearly subs: charged once if next_payment_date falls in [ref, Dec 31].
function calcYearEndCost(subscriptions, referenceDate = new Date()) {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const yearEnd = new Date(ref.getFullYear(), 11, 31);
  const totals = {};

  for (const sub of subscriptions) {
    const [y, mo, d] = sub.next_payment_date.split('-').map(Number);
    let chargeDate = new Date(y, mo - 1, d);

    if (sub.billing_period === 'monthly') {
      while (chargeDate < ref) {
        chargeDate.setMonth(chargeDate.getMonth() + 1);
      }
      let charges = 0;
      const cursor = new Date(chargeDate);
      while (cursor <= yearEnd) {
        charges++;
        cursor.setMonth(cursor.getMonth() + 1);
      }
      if (charges > 0) {
        totals[sub.currency] = (totals[sub.currency] ?? 0) + sub.cost * charges;
      }
    } else {
      if (chargeDate >= ref && chargeDate <= yearEnd) {
        totals[sub.currency] = (totals[sub.currency] ?? 0) + sub.cost;
      }
    }
  }
  return totals;
}

// Returns subscriptions whose next_payment_date falls within the current calendar month
// (from referenceDate to the last day of that month), along with per-currency totals.
function calcRemainingThisMonth(subscriptions, referenceDate = new Date()) {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const monthEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);

  const due = subscriptions.filter(s => {
    const [y, mo, d] = s.next_payment_date.split('-').map(Number);
    const next = new Date(y, mo - 1, d);
    return next >= ref && next <= monthEnd;
  });

  const totals = {};
  for (const sub of due) {
    totals[sub.currency] = (totals[sub.currency] ?? 0) + sub.cost;
  }

  return { subscriptions: due, totals };
}

// Returns the subscription with the highest monthly-equivalent cost.
// Returns null for an empty list.
function findMostExpensive(subscriptions) {
  if (subscriptions.length === 0) return null;
  return subscriptions.reduce((champion, sub) =>
    toMonthly(sub.cost, sub.billing_period) > toMonthly(champion.cost, champion.billing_period)
      ? sub
      : champion
  );
}

// Returns the monthly-equivalent cost of inactive subscriptions per currency.
// Shows how much paused subscriptions would cost if reactivated.
function calcInactiveWaste(subscriptions) {
  const totals = {};
  for (const sub of subscriptions.filter(s => !s.is_active)) {
    totals[sub.currency] = (totals[sub.currency] ?? 0) + toMonthly(sub.cost, sub.billing_period);
  }
  return totals;
}

module.exports = {
  toMonthly,
  calcMonthlyEquivalent,
  calcAnnualProjection,
  calcYearEndCost,
  calcRemainingThisMonth,
  findMostExpensive,
  calcInactiveWaste,
};
