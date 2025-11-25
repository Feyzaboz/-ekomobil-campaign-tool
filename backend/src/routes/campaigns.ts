import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT c.*, e.name as event_name, e.description as event_description
       FROM campaigns c
       JOIN event_definitions e ON c.event_id = e.id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT c.*, e.name as event_name, e.description as event_description
       FROM campaigns c
       JOIN event_definitions e ON c.event_id = e.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, eventId, benefitType, maxUsageCount, estimatedPersonCount, platforms, startDate, endDate, status } = req.body;
    
    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const result = await query(
      `INSERT INTO campaigns (name, description, event_id, benefit_type, max_usage_count, estimated_person_count, platforms, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, eventId, benefitType, maxUsageCount || null, estimatedPersonCount || null, platforms, startDate, endDate, status || 'DRAFT']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, eventId, benefitType, maxUsageCount, estimatedPersonCount, platforms, startDate, endDate, status } = req.body;
    
    // Validate dates
    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const result = await query(
      `UPDATE campaigns 
       SET name = $1, description = $2, event_id = $3, benefit_type = $4, max_usage_count = $5, estimated_person_count = $6,
           platforms = $7, start_date = $8, end_date = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [name, description, eventId, benefitType, maxUsageCount || null, estimatedPersonCount || null, platforms, startDate, endDate, status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const original = await query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = original.rows[0];
    const result = await query(
      `INSERT INTO campaigns (name, description, event_id, benefit_type, max_usage_count, estimated_person_count, platforms, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        `${campaign.name} (Kopya)`,
        campaign.description,
        campaign.event_id,
        campaign.benefit_type,
        campaign.max_usage_count || null,
        campaign.estimated_person_count || null,
        campaign.platforms,
        campaign.start_date,
        campaign.end_date,
        'DRAFT'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate campaign' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM campaigns WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;

