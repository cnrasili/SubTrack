const express = require('express');
const app = express();

app.use(express.json());

const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
});

module.exports = app;
