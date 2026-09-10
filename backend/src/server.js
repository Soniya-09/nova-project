require('dotenv').config();

const express = require('express');
const cors = require('cors');

const auth = require('./routes/auth');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');
const db = require('./db');
const migrate = require('./migrate');

const app = express();

// CLIENT_URL may be a bare host (e.g. when injected by a host's
// fromService env var) or a full origin (local dev) — normalize both.
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const clientOrigin = clientUrl.startsWith('http') ? clientUrl : `https://${clientUrl}`;

app.use(cors({ origin: clientOrigin }));
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

(async () => {
  try {
    await migrate();
    app.listen(port, () => console.log(`NOVA API running on port ${port}`));
  } catch (e) {
    console.error('Startup migration failed:', e);
    process.exit(1);
  }
})();
