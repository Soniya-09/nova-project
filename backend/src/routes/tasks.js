const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// A user can touch a project's tasks if they own it or are a member of it.
async function canAccess(projectId, userId) {
  const { rows } = await db.query(
    `SELECT p.id, p.owner_id
     FROM projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
     WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
    [projectId, userId]
  );
  return rows[0];
}

router.post('/', async (req, res) => {
  try {
    const {
      project_id,
      title,
      description = '',
      status = 'TODO',
      priority = 'MEDIUM',
      assignee_id = null,
      due_date = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!(await canAccess(project_id, req.user.id))) {
      return res.status(403).json({ message: 'No access to project' });
    }

    const { rows } = await db.query(
      `INSERT INTO tasks(project_id, title, description, status, priority, assignee_id, due_date)
       VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [project_id, title.trim(), description, status, priority, assignee_id || null, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not create task' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const task = (await db.query('SELECT * FROM tasks WHERE id=$1', [req.params.id])).rows[0];
    if (!task || !(await canAccess(task.project_id, req.user.id))) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const fields = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date'];
    const updates = [];
    const values = [];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        values.push(req.body[field] ?? null);
        updates.push(`${field}=$${values.length}`);
      }
    }
    if (!updates.length) return res.json(task);

    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id=$${values.length} RETURNING *`,
      values
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = (await db.query('SELECT * FROM tasks WHERE id=$1', [req.params.id])).rows[0];
    if (!task || !(await canAccess(task.project_id, req.user.id))) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await db.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not delete task' });
  }
});

module.exports = router;
