const {
  normalizeToMonthly,
  getMonthlySummary,
  getYearlySummary,
  getSummaryByCategory,
} = require('../src/services/summaryService');

describe('summaryService', () => {

  describe('normalizeToMonthly', () => {
    it('returns cost unchanged for monthly billing', () => {
      expect(normalizeToMonthly(50, 'monthly')).toBe(50);
    });

    it('returns cost divided by 12 for yearly billing', () => {
      expect(normalizeToMonthly(240, 'yearly')).toBe(20);
    });
  });

  describe('getMonthlySummary', () => {
    it('returns empty object for empty subscription list', () => {
      expect(getMonthlySummary([])).toEqual({});
    });

    it('groups monthly totals by currency', () => {
      const subs = [
        { cost: 10, billing_period: 'monthly', currency: 'TRY' },
        { cost: 20, billing_period: 'monthly', currency: 'TRY' },
        { cost: 5,  billing_period: 'monthly', currency: 'USD' },
      ];
      expect(getMonthlySummary(subs)).toEqual({ TRY: 30, USD: 5 });
    });

    it('normalizes yearly subscriptions when calculating monthly total', () => {
      const subs = [
        { cost: 120, billing_period: 'yearly',  currency: 'TRY' }, // 10/month
        { cost: 30,  billing_period: 'monthly', currency: 'TRY' }, // 30/month
      ];
      expect(getMonthlySummary(subs)).toEqual({ TRY: 40 });
    });
  });

  describe('getYearlySummary', () => {
    it('returns monthly totals multiplied by 12', () => {
      const subs = [{ cost: 10, billing_period: 'monthly', currency: 'TRY' }];
      expect(getYearlySummary(subs)).toEqual({ TRY: 120 });
    });
  });

  describe('getSummaryByCategory', () => {
    it('groups subscriptions by category_id with correct counts', () => {
      const subs = [
        { cost: 10, billing_period: 'monthly', currency: 'TRY', category_id: 1, category_name: 'Streaming' },
        { cost: 20, billing_period: 'monthly', currency: 'TRY', category_id: 1, category_name: 'Streaming' },
        { cost: 5,  billing_period: 'monthly', currency: 'USD', category_id: 2, category_name: 'Cloud' },
      ];
      const result = getSummaryByCategory(subs);
      expect(result).toHaveLength(2);
      const streaming = result.find(g => g.category_id === 1);
      expect(streaming.count).toBe(2);
      expect(streaming.monthly.TRY).toBe(30);
    });
  });

});
