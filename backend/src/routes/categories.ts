import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, status } = req.body;
    const result = await query(
      'INSERT INTO categories (name, code, status) VALUES ($1, $2, $3) RETURNING *',
      [name, code, status || 'ACTIVE']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category code already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, code, status } = req.body;
    const result = await query(
      'UPDATE categories SET name = $1, code = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, code, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category code already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Category Offers
router.get('/:id/offers', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT co.*, i.name as integrator_name, i.code as integrator_code
       FROM category_offers co
       JOIN integrators i ON co.integrator_id = i.id
       WHERE co.category_id = $1
       ORDER BY co.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category offers' });
  }
});

router.post('/:id/offers', async (req: Request, res: Response) => {
  try {
    const { integratorId, ekomobilRate, userRate, isActive } = req.body;
    const result = await query(
      `INSERT INTO category_offers (category_id, integrator_id, ekomobil_rate, user_rate, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, integratorId, ekomobilRate, userRate, isActive ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category offer' });
  }
});

router.put('/:id/offers/:offerId', async (req: Request, res: Response) => {
  try {
    const { integratorId, ekomobilRate, userRate, isActive } = req.body;
    const result = await query(
      `UPDATE category_offers 
       SET integrator_id = $1, ekomobil_rate = $2, user_rate = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND category_id = $6 RETURNING *`,
      [integratorId, ekomobilRate, userRate, isActive, req.params.offerId, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category offer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category offer' });
  }
});

router.delete('/:id/offers/:offerId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM category_offers WHERE id = $1 AND category_id = $2 RETURNING *',
      [req.params.offerId, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category offer not found' });
    }
    res.json({ message: 'Category offer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category offer' });
  }
});

export default router;

