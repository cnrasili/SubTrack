// Integration tests for subscriptionService require a live DB connection.
// Pure business logic (cost analysis, projections) is unit-tested in subscriptionAnalyzer.test.js.

describe('subscriptionService', () => {
  test.todo('createSubscription inserts and returns the new record');
  test.todo('updateSubscription records price history when cost changes');
  test.todo('deleteSubscription returns null for a non-existent id');
  test.todo('getUpcomingPayments returns only subscriptions within the given day window');
});
