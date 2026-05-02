const {
  toMonthly,
  calcMonthlyEquivalent,
  calcYearEndCost,
  calcRemainingThisMonth,
  findMostExpensive,
  calcInactiveWaste,
} = require('../src/services/subscriptionAnalyzer');

describe('subscriptionAnalyzer', () => {

  describe('toMonthly', () => {
    it('returns cost unchanged for monthly billing', () => {
      expect(toMonthly(30, 'monthly')).toBe(30);
    });

    it('returns cost divided by 12 for yearly billing', () => {
      expect(toMonthly(120, 'yearly')).toBe(10);
    });
  });

  describe('calcYearEndCost', () => {
    it('returns empty object for empty subscription list', () => {
      const result = calcYearEndCost([], new Date(2026, 4, 2));
      expect(result).toEqual({});
    });

    it('counts monthly payment occurrences from referenceDate to Dec 31', () => {
      const sub = { cost: 10, billing_period: 'monthly', next_payment_date: '2026-05-15', currency: 'TRY' };
      // May 15, Jun 15, Jul 15, Aug 15, Sep 15, Oct 15, Nov 15, Dec 15 = 8 charges
      const result = calcYearEndCost([sub], new Date(2026, 4, 2));
      expect(result).toEqual({ TRY: 80 });
    });

    it('advances past monthly payments to the next future occurrence', () => {
      const sub = { cost: 10, billing_period: 'monthly', next_payment_date: '2026-04-15', currency: 'TRY' };
      // Apr 15 is in the past → advances to May 15, then counts May–Dec = 8 charges
      const result = calcYearEndCost([sub], new Date(2026, 4, 2));
      expect(result).toEqual({ TRY: 80 });
    });

    it('includes yearly subscription when next_payment_date is within the remaining year', () => {
      const sub = { cost: 120, billing_period: 'yearly', next_payment_date: '2026-06-01', currency: 'USD' };
      const result = calcYearEndCost([sub], new Date(2026, 4, 2));
      expect(result).toEqual({ USD: 120 });
    });

    it('excludes yearly subscription when next_payment_date has already passed', () => {
      const sub = { cost: 120, billing_period: 'yearly', next_payment_date: '2026-01-01', currency: 'USD' };
      const result = calcYearEndCost([sub], new Date(2026, 4, 2));
      expect(result).toEqual({});
    });

    it('aggregates multiple subscriptions across different currencies', () => {
      const subs = [
        { cost: 10, billing_period: 'monthly', next_payment_date: '2026-12-01', currency: 'TRY' },
        { cost: 5,  billing_period: 'monthly', next_payment_date: '2026-12-01', currency: 'USD' },
      ];
      // Only Dec 1 remaining → 1 charge each
      const result = calcYearEndCost(subs, new Date(2026, 11, 1));
      expect(result).toEqual({ TRY: 10, USD: 5 });
    });
  });

  describe('calcRemainingThisMonth', () => {
    it('returns empty results when no subscriptions are due this month', () => {
      const sub = { cost: 20, billing_period: 'monthly', next_payment_date: '2026-06-15', currency: 'TRY' };
      const { subscriptions, totals } = calcRemainingThisMonth([sub], new Date(2026, 4, 2));
      expect(subscriptions).toHaveLength(0);
      expect(totals).toEqual({});
    });

    it('includes subscription when next_payment_date is within the current month', () => {
      const sub = { cost: 20, billing_period: 'monthly', next_payment_date: '2026-05-20', currency: 'TRY' };
      const { subscriptions } = calcRemainingThisMonth([sub], new Date(2026, 4, 2));
      expect(subscriptions).toHaveLength(1);
    });

    it('excludes subscription when next_payment_date is in the past', () => {
      const sub = { cost: 20, billing_period: 'monthly', next_payment_date: '2026-05-01', currency: 'TRY' };
      const { subscriptions } = calcRemainingThisMonth([sub], new Date(2026, 4, 2));
      expect(subscriptions).toHaveLength(0);
    });

    it('returns correct per-currency totals for due subscriptions', () => {
      const subs = [
        { cost: 15, billing_period: 'monthly', next_payment_date: '2026-05-10', currency: 'TRY' },
        { cost: 25, billing_period: 'monthly', next_payment_date: '2026-05-28', currency: 'TRY' },
      ];
      const { totals } = calcRemainingThisMonth(subs, new Date(2026, 4, 2));
      expect(totals).toEqual({ TRY: 40 });
    });
  });

  describe('findMostExpensive', () => {
    it('returns null for an empty list', () => {
      expect(findMostExpensive([])).toBeNull();
    });

    it('picks the subscription with the highest monthly-equivalent cost', () => {
      const subs = [
        { id: 1, cost: 120, billing_period: 'yearly' },  // monthly = 10
        { id: 2, cost: 15,  billing_period: 'monthly' }, // monthly = 15
      ];
      expect(findMostExpensive(subs).id).toBe(2);
    });
  });

  describe('calcMonthlyEquivalent', () => {
    it('groups monthly-equivalent costs by currency', () => {
      const subs = [
        { cost: 10, billing_period: 'monthly', currency: 'TRY' },
        { cost: 24, billing_period: 'yearly',  currency: 'TRY' },
        { cost: 5,  billing_period: 'monthly', currency: 'USD' },
      ];
      // TRY: 10 + (24/12) = 12, USD: 5
      expect(calcMonthlyEquivalent(subs)).toEqual({ TRY: 12, USD: 5 });
    });
  });

  describe('calcInactiveWaste', () => {
    it('returns empty object when all subscriptions are active', () => {
      const subs = [{ cost: 10, billing_period: 'monthly', is_active: 1, currency: 'TRY' }];
      expect(calcInactiveWaste(subs)).toEqual({});
    });

    it('normalizes yearly inactive subscriptions to monthly equivalent', () => {
      const subs = [
        { cost: 10,  billing_period: 'monthly', is_active: 1, currency: 'TRY' },
        { cost: 24,  billing_period: 'yearly',  is_active: 0, currency: 'TRY' },
      ];
      // Only the inactive yearly sub counts: 24/12 = 2
      expect(calcInactiveWaste(subs)).toEqual({ TRY: 2 });
    });
  });

});
