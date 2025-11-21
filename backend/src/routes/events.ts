import { Router } from 'express';
import { query } from '../db/connection';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM event_definitions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event definitions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM event_definitions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event definition not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event definition' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, minAppOpenCount, appOpenWindowDays, minRefundCount, refundWindowDays, extraFilters } = req.body;
    const result = await query(
      `INSERT INTO event_definitions (name, description, min_app_open_count, app_open_window_days, min_refund_count, refund_window_days, extra_filters)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, minAppOpenCount || null, appOpenWindowDays || null, minRefundCount || null, refundWindowDays || null, extraFilters ? JSON.stringify(extraFilters) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event definition' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, minAppOpenCount, appOpenWindowDays, minRefundCount, refundWindowDays, extraFilters } = req.body;
    const result = await query(
      `UPDATE event_definitions 
       SET name = $1, description = $2, min_app_open_count = $3, app_open_window_days = $4, 
           min_refund_count = $5, refund_window_days = $6, extra_filters = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, description, minAppOpenCount || null, appOpenWindowDays || null, minRefundCount || null, refundWindowDays || null, extraFilters ? JSON.stringify(extraFilters) : null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event definition not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event definition' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Check if event is used in campaigns
    const campaignCheck = await query('SELECT COUNT(*) FROM campaigns WHERE event_id = $1', [req.params.id]);
    if (parseInt(campaignCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete event definition that is used in campaigns' });
    }

    const result = await query('DELETE FROM event_definitions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event definition not found' });
    }
    res.json({ message: 'Event definition deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event definition' });
  }
});

export default router;

