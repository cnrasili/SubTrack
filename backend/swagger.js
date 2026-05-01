const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SubTrack API',
      version: '1.0.0',
      description: 'Subscription and recurring expense tracker REST API',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Entertainment' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Netflix' },
            cost: { type: 'number', example: 12.99 },
            billing_period: { type: 'string', enum: ['monthly', 'yearly'] },
            next_payment_date: { type: 'string', format: 'date', example: '2026-05-15' },
            category_id: { type: 'integer', example: 1 },
            currency: { type: 'string', enum: ['TRY', 'USD', 'EUR'] },
            notes: { type: 'string', example: 'Family plan' },
            is_active: { type: 'integer', enum: [0, 1] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'CATEGORY_NOT_FOUND' },
            message: { type: 'string', example: 'Category not found' },
          },
        },
      },
    },
    paths: {
      '/api/categories': {
        get: {
          summary: 'Get all categories',
          tags: ['Categories'],
          responses: {
            200: { description: 'List of categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
          },
        },
        post: {
          summary: 'Create a category',
          tags: ['Categories'],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Entertainment' } } } } } },
          responses: {
            201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/categories/{id}': {
        get: {
          summary: 'Get a category by ID',
          tags: ['Categories'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Category found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          summary: 'Update a category',
          tags: ['Categories'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Health' } } } } } },
          responses: {
            200: { description: 'Category updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          summary: 'Delete a category',
          tags: ['Categories'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Category deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
            404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Category has active subscriptions', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/subscriptions': {
        get: {
          summary: 'Get all subscriptions',
          tags: ['Subscriptions'],
          parameters: [
            { in: 'query', name: 'category_id', schema: { type: 'integer' } },
            { in: 'query', name: 'billing_period', schema: { type: 'string', enum: ['monthly', 'yearly'] } },
            { in: 'query', name: 'is_active', schema: { type: 'integer', enum: [0, 1] } },
            { in: 'query', name: 'q', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of subscriptions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Subscription' } } } } },
          },
        },
        post: {
          summary: 'Create a subscription',
          tags: ['Subscriptions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'cost', 'billing_period', 'next_payment_date', 'category_id'],
                  properties: {
                    name: { type: 'string', example: 'Netflix' },
                    cost: { type: 'number', example: 12.99 },
                    billing_period: { type: 'string', enum: ['monthly', 'yearly'] },
                    next_payment_date: { type: 'string', format: 'date', example: '2026-05-15' },
                    category_id: { type: 'integer', example: 1 },
                    currency: { type: 'string', enum: ['TRY', 'USD', 'EUR'] },
                    notes: { type: 'string' },
                    is_active: { type: 'integer', enum: [0, 1] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Subscription created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/subscriptions/upcoming': {
        get: {
          summary: 'Get subscriptions due within N days',
          tags: ['Subscriptions'],
          parameters: [{ in: 'query', name: 'days', schema: { type: 'integer', default: 7 } }],
          responses: {
            200: { description: 'Upcoming subscriptions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Subscription' } } } } },
            400: { description: 'Invalid days parameter', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/subscriptions/{id}': {
        get: {
          summary: 'Get a subscription by ID',
          tags: ['Subscriptions'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Subscription found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
            404: { description: 'Subscription not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          summary: 'Update a subscription',
          tags: ['Subscriptions'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
          responses: {
            200: { description: 'Subscription updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subscription' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Subscription not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          summary: 'Delete a subscription',
          tags: ['Subscriptions'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Subscription deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
            404: { description: 'Subscription not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/summary': {
        get: {
          summary: 'Get cost summary grouped by currency and category',
          tags: ['Summary'],
          responses: {
            200: {
              description: 'Summary data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      total_active: { type: 'integer' },
                      monthly: { type: 'object', example: { TRY: 150.0, USD: 9.99 } },
                      yearly: { type: 'object', example: { TRY: 1800.0, USD: 119.88 } },
                      by_category: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            category_id: { type: 'integer' },
                            category_name: { type: 'string' },
                            count: { type: 'integer' },
                            monthly: { type: 'object' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
