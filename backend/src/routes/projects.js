const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// List every project the user owns or is a member of, with task counts.
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.*,
              COUNT(t.id)::int AS task_count,
              COUNT(t.id) FILTER (WHERE t.status = 'DONE')::int AS completed_tasks
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.owner_id = $1 OR pm.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not load projects' });
  }
});

// Create a project and add the creator as its owner member, atomically.
router.post('/', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO projects(name, description, owner_id) VALUES($1, $2, $3) RETURNING *',
      [name.trim(), description, req.user.id]
    );
    const project = rows[0];
    await client.query(
      'INSERT INTO project_members(project_id, user_id, role) VALUES($1, $2, $3)',
      [project.id, req.user.id, 'owner']
    );
    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ message: 'Could not create project' });
  } finally {
    client.release();
  }
});

// Project detail: the project itself plus its tasks and members.
router.get('/:id', async (req, res) => {
  try {
    const project = (
      await db.query(
        `SELECT p.*, u.name AS owner_name
         FROM projects p
         JOIN users u ON u.id = p.owner_id
         WHERE p.id = $1
           AND (p.owner_id = $2 OR EXISTS(
             SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $2
           ))`,
        [req.params.id, req.user.id]
      )
    ).rows[0];

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = (
      await db.query(
        `SELECT t.*, u.name AS assignee_name
         FROM tasks t
         LEFT JOIN users u ON u.id = t.assignee_id
         WHERE t.project_id = $1
         ORDER BY t.created_at DESC`,
        [req.params.id]
      )
    ).rows;

    const members = (
      await db.query(
        `SELECT u.id, u.name, u.email, pm.role
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         WHERE pm.project_id = $1
         ORDER BY u.name`,
        [req.params.id]
      )
    ).rows;

    res.json({ ...project, tasks, members });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not load project' });
  }
});

// Only the owner can add members, and only existing users can be added.
router.post('/:id/members', async (req, res) => {
  try {
    const { email } = req.body;
    const project = (
      await db.query('SELECT * FROM projects WHERE id=$1 AND owner_id=$2', [req.params.id, req.user.id])
    ).rows[0];
    if (!project) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    const user = (
      await db.query('SELECT id, name, email FROM users WHERE email=$1', [
        String(email || '').toLowerCase().trim(),
      ])
    ).rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found. Ask them to register first.' });
    }

    await db.query(
      'INSERT INTO project_members(project_id, user_id) VALUES($1, $2) ON CONFLICT DO NOTHING',
      [project.id, user.id]
    );
    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not add member' });
  }
});

module.exports = router;
