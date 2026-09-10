import { useEffect, useState } from 'react';
import { api } from '../api';
import { Project } from './Project';

export function Dashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [err, setErr] = useState('');

  async function load() {
    try {
      setProjects(await api('/projects'));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api('/projects', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', description: '' });
      setShowNewProject(false);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  const totalTasks = projects.reduce((sum, p) => sum + p.task_count, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completed_tasks, 0);

  return (
    <div>
      <header>
        <div>
          <span className="logo small">NOVA</span>
          <span className="muted">Team Productivity</span>
        </div>
        <div className="header-right">
          Hi, {user.name}
          <button className="ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <div className="top">
          <div>
            <h1>Projects</h1>
            <p className="muted">Manage your team's work in one place.</p>
          </div>
          <button onClick={() => setShowNewProject(true)}>+ New project</button>
        </div>

        {err && <div className="error">{err}</div>}

        <div className="stats">
          <div>
            <b>{projects.length}</b>
            <span>Projects</span>
          </div>
          <div>
            <b>{totalTasks}</b>
            <span>Total tasks</span>
          </div>
          <div>
            <b>{completedTasks}</b>
            <span>Completed</span>
          </div>
        </div>

        <div className="grid">
          {projects.map((p) => {
            const progress = p.task_count ? Math.round((p.completed_tasks / p.task_count) * 100) : 0;
            const status = !p.task_count
              ? 'No tasks yet'
              : p.completed_tasks === p.task_count
                ? 'Completed'
                : 'In progress';

            return (
              <div className="card" key={p.id} onClick={() => setSelected(p.id)}>
                <div className="card-head">
                  <h3>{p.name}</h3>
                  <span>
                    {p.completed_tasks}/{p.task_count}
                  </span>
                </div>
                <p>{p.description || 'No description'}</p>
                <div className="progress">
                  <i style={{ width: `${progress}%` }} />
                </div>
                <small>{status}</small>
              </div>
            );
          })}
        </div>
      </main>

      {showNewProject && (
        <div className="modal">
          <form className="modal-card" onSubmit={create}>
            <h2>New project</h2>
            <input
              placeholder="Project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="actions">
              <button type="button" className="ghost" onClick={() => setShowNewProject(false)}>
                Cancel
              </button>
              <button>Create project</button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <Project
          id={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}
