const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const tokenFor = (user) => jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a 6+ character password are required' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email', [name.trim(), email.toLowerCase().trim(), hash]);
    const user = rows[0];
    res.status(201).json({ user, token: tokenFor(user) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Email is already registered' });
    console.error(e); res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [String(email || '').toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
    const safe = { id: user.id, name: user.name, email: user.email };
    res.json({ user: safe, token: tokenFor(safe) });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Login failed' }); }
});
module.exports = router;
