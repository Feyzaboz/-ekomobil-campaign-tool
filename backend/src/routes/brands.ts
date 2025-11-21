import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT b.*, c.name as category_name 
      FROM brands b 
      LEFT JOIN categories c ON b.category_id = c.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push(`b.status = $${params.length + 1}`);
      params.push(status);
    }
    if (search) {
      conditions.push(`b.name ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY b.name';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT b.*, c.name as category_name FROM brands b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, status, categoryId } = req.body;
    const result = await query(
      'INSERT INTO brands (name, status, category_id) VALUES ($1, $2, $3) RETURNING *',
      [name, status || 'ACTIVE', categoryId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, status, categoryId } = req.body;
    const result = await query(
      'UPDATE brands SET name = $1, status = $2, category_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, status, categoryId || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM brands WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Brand Offers
router.get('/:id/offers', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT bo.*, i.name as integrator_name, i.code as integrator_code
       FROM brand_offers bo
       JOIN integrators i ON bo.integrator_id = i.id
       WHERE bo.brand_id = $1
       ORDER BY bo.is_best_offer DESC, bo.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand offers' });
  }
});

router.post('/:id/offers', async (req: Request, res: Response) => {
  try {
    const { integratorId, ekomobilRate, userRate, isActive, isBestOffer, validFrom, validTo } = req.body;
    
    // If setting as best offer, unset others
    if (isBestOffer) {
      await query(
        'UPDATE brand_offers SET is_best_offer = false WHERE brand_id = $1 AND is_active = true',
        [req.params.id]
      );
    }

    const result = await query(
      `INSERT INTO brand_offers (brand_id, integrator_id, ekomobil_rate, user_rate, is_active, is_best_offer, valid_from, valid_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.id, integratorId, ekomobilRate, userRate, isActive ?? true, isBestOffer ?? false, validFrom || null, validTo || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand offer' });
  }
});

router.put('/:id/offers/:offerId', async (req: Request, res: Response) => {
  try {
    const { integratorId, ekomobilRate, userRate, isActive, isBestOffer, validFrom, validTo } = req.body;
    
    // If setting as best offer, unset others
    if (isBestOffer) {
      await query(
        'UPDATE brand_offers SET is_best_offer = false WHERE brand_id = $1 AND id != $2 AND is_active = true',
        [req.params.id, req.params.offerId]
      );
    }

    const result = await query(
      `UPDATE brand_offers 
       SET integrator_id = $1, ekomobil_rate = $2, user_rate = $3, is_active = $4, is_best_offer = $5, 
           valid_from = $6, valid_to = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND brand_id = $9 RETURNING *`,
      [integratorId, ekomobilRate, userRate, isActive, isBestOffer, validFrom || null, validTo || null, req.params.offerId, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand offer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand offer' });
  }
});

router.delete('/:id/offers/:offerId', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM brand_offers WHERE id = $1 AND brand_id = $2 RETURNING *',
      [req.params.offerId, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand offer not found' });
    }
    res.json({ message: 'Brand offer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand offer' });
  }
});

export default router;

