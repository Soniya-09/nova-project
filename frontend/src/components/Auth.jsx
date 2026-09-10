import { useState } from 'react';
import { api } from '../api';

export function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      localStorage.setItem('nova_token', data.token);
      localStorage.setItem('nova_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo">NOVA</div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">Plan. Collaborate. Deliver.</p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            minLength="6"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {err && <div className="error">{err}</div>}
          <button>{mode === 'login' ? 'Sign in' : 'Register'}</button>
        </form>

        <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
