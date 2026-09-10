require('dotenv').config();

const express = require('express');
const cors = require('cors');

const auth = require('./routes/auth');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');
const db = require('./db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/tasks', tasks);

// Catch-all error handler — keeps stack traces out of the response.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`NOVA API running on port ${port}`));
