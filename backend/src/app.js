const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger.json');
const app = express();

app.use(express.static(path.join(__dirname, '../../frontend')));

app.use(express.json());

const categoryRoutes = require('./routes/categories');
const subscriptionRoutes = require('./routes/subscriptions');
const summaryRoutes = require('./routes/summary');
const budgetRoutes = require('./routes/budgets');

app.use('/api/categories', categoryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
});

module.exports = app;
