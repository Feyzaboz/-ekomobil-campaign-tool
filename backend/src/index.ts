import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db/connection';

// Routes
import integratorsRouter from './routes/integrators';
import brandsRouter from './routes/brands';
import categoriesRouter from './routes/categories';
import campaignsRouter from './routes/campaigns';
import announcementsRouter from './routes/announcements';
import eventsRouter from './routes/events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/integrators', integratorsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/events', eventsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

