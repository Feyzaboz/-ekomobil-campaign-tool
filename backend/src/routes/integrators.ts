import { Router } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM integrators ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrators' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM integrators WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integrator not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrator' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    const result = await query(
      'INSERT INTO integrators (name, code, is_active) VALUES ($1, $2, $3) RETURNING *',
      [name, code, isActive ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Integrator code already exists' });
    }
    res.status(500).json({ error: 'Failed to create integrator' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    const result = await query(
      'UPDATE integrators SET name = $1, code = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, code, isActive, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integrator not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Integrator code already exists' });
    }
    res.status(500).json({ error: 'Failed to update integrator' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM integrators WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integrator not found' });
    }
    res.json({ message: 'Integrator deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete integrator' });
  }
});

export default router;

