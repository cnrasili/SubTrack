// Integration tests for categoryService require a live DB connection.
// Pure business logic for categories lives in validators — tested in subscriptionValidator tests.

describe('categoryService', () => {
  test.todo('getAllCategories returns all seeded categories');
  test.todo('createCategory inserts and returns the new record');
  test.todo('updateCategory changes name and color');
  test.todo('deleteCategory throws CATEGORY_HAS_SUBSCRIPTIONS when in use');
});
