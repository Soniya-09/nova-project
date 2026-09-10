import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_TASK = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  assignee_id: '',
  due_date: '',
};

export function Project({ id, onClose }) {
  const [project, setProject] = useState(null);
  const [task, setTask] = useState(EMPTY_TASK);
  const [memberEmail, setMemberEmail] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      setProject(await api(`/projects/${id}`));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addTask(e) {
    e.preventDefault();
    try {
      await api('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...task, project_id: id, assignee_id: task.assignee_id || null }),
      });
      setTask(EMPTY_TASK);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function updateTask(taskId, patch) {
    try {
      await api(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(patch) });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function removeTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    await api(`/tasks/${taskId}`, { method: 'DELETE' });
    load();
  }

  async function addMember(e) {
    e.preventDefault();
    try {
      await api(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: memberEmail }),
      });
      setMemberEmail('');
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  if (!project) {
    return (
      <div className="modal">
        <div className="modal-card">
          <p>{err || 'Loading...'}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="project-modal">
        <div className="project-top">
          <div>
            <h2>{project.name}</h2>
            <p className="muted">{project.description}</p>
          </div>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <div className="columns">
          <section>
            <h3>Tasks</h3>

            <form className="task-form" onSubmit={addTask}>
              <input
                placeholder="Task title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
              />
              <input
                placeholder="Description"
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
              />
              <div className="row">
                <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })}>
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                </select>
                <select
                  value={task.assignee_id}
                  onChange={(e) => setTask({ ...task, assignee_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {project.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={task.due_date}
                  onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                />
              </div>
              <button>Add task</button>
            </form>

            {project.tasks.map((t) => (
              <div className="task" key={t.id}>
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.description}</p>
                  <small>
                    {t.priority} · {t.assignee_name || 'Unassigned'}
                    {t.due_date ? ` · Due ${t.due_date}` : ''}
                  </small>
                </div>
                <div className="task-actions">
                  <select value={t.status} onChange={(e) => updateTask(t.id, { status: e.target.value })}>
                    <option>TODO</option>
                    <option>IN_PROGRESS</option>
                    <option>DONE</option>
                  </select>
                  <button className="danger" onClick={() => removeTask(t.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <aside>
            <h3>Members</h3>
            <form onSubmit={addMember}>
              <input
                type="email"
                placeholder="member@email.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
              />
              <button>Add member</button>
            </form>
            {project.members.map((m) => (
              <div className="member" key={m.id}>
                <b>{m.name}</b>
                <small>
                  {m.email} · {m.role}
                </small>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
