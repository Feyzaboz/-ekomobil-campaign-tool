import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT a.*, c.name as campaign_name
       FROM announcements a
       LEFT JOIN campaigns c ON a.target_campaign_id = c.id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT a.*, c.name as campaign_name
       FROM announcements a
       LEFT JOIN campaigns c ON a.target_campaign_id = c.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subtitle, body, termsAndConditions, imageUrl, targetCampaignId, targetPlatforms, scheduledAt, expiresAt, status } = req.body;
    
    const result = await query(
      `INSERT INTO announcements (title, subtitle, body, terms_and_conditions, image_url, target_campaign_id, target_platforms, scheduled_at, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, subtitle, body, termsAndConditions, imageUrl || null, targetCampaignId || null, targetPlatforms, scheduledAt, expiresAt || null, status || 'DRAFT']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, subtitle, body, termsAndConditions, imageUrl, targetCampaignId, targetPlatforms, scheduledAt, expiresAt, status } = req.body;
    
    const result = await query(
      `UPDATE announcements 
       SET title = $1, subtitle = $2, body = $3, terms_and_conditions = $4, image_url = $5, 
           target_campaign_id = $6, target_platforms = $7, scheduled_at = $8, expires_at = $9, 
           status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, subtitle, body, termsAndConditions, imageUrl || null, targetCampaignId || null, targetPlatforms, scheduledAt, expiresAt || null, status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `UPDATE announcements 
       SET status = 'ACTIVE', scheduled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate announcement' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM announcements WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;

