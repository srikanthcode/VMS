const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ success: false, message: 'Duplicate entry', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
