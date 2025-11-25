import { db, saveDB, query, getDb } from './connection';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Initializing database...');
    
    // Tables are already initialized in connection.ts
    // Just ensure they exist
    if (!db.integrators) db.integrators = [];
    if (!db.categories) db.categories = [];
    if (!db.brands) db.brands = [];
    if (!db.brand_offers) db.brand_offers = [];
    if (!db.category_offers) db.category_offers = [];
    if (!db.event_definitions) db.event_definitions = [];
    if (!db.campaigns) db.campaigns = [];
    if (!db.announcements) db.announcements = [];
    
    saveDB();
    console.log('Database initialized successfully');

    // If database is empty or has only seed data (4 brands), restore from seed file (for production deploys)
    const hasOnlySeedData = db.brands.length <= 4 && db.categories.length <= 3;
    
    if (db.brands.length === 0 && db.categories.length === 0 || hasOnlySeedData) {
      // Try multiple possible paths for seed file
      const possiblePaths = [
        path.join(__dirname, '../../data/db-seed.json'), // Development
        path.join(process.cwd(), 'data/db-seed.json'), // Production (from backend/)
        path.join(process.cwd(), 'backend/data/db-seed.json'), // Production (from root)
        path.join(process.cwd(), 'src/../data/db-seed.json'), // Production (from dist/)
      ];
      
      let seedDbPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          seedDbPath = possiblePath;
          console.log('Found seed file at:', seedDbPath);
          break;
        }
      }
      
      if (seedDbPath) {
        try {
          console.log('Database is empty or has only seed data, restoring from seed file...');
          const seedData = fs.readFileSync(seedDbPath, 'utf-8');
          const seedDb = JSON.parse(seedData);
          
          // Restore all data from seed
          db.integrators = seedDb.integrators || [];
          db.categories = seedDb.categories || [];
          db.brands = seedDb.brands || [];
          db.brand_offers = seedDb.brand_offers || [];
          db.category_offers = seedDb.category_offers || [];
          db.event_definitions = seedDb.event_definitions || [];
          db.campaigns = seedDb.campaigns || [];
          db.announcements = seedDb.announcements || [];
          
          saveDB();
          console.log(`✅ Restored from seed: ${db.brands.length} brands, ${db.categories.length} categories, ${db.event_definitions.length} events, ${db.campaigns.length} campaigns`);
        } catch (error) {
          console.error('Error restoring from seed file:', error);
          // Fallback to basic seed only if completely empty
          if (db.brands.length === 0) {
            await seedData();
          }
        }
      } else {
        console.log('Seed file not found, using basic seed data');
        // No seed file, use basic seed only if completely empty
        if (db.brands.length === 0) {
          await seedData();
        }
      }
    } else {
      // Database has data, update seed file periodically (every hour) for future deploys
      // This ensures the seed file stays up-to-date with production data
      const lastSeedUpdate = process.env.LAST_SEED_UPDATE ? parseInt(process.env.LAST_SEED_UPDATE) : 0;
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (now - lastSeedUpdate > oneHour) {
        await saveSeedFile();
        process.env.LAST_SEED_UPDATE = now.toString();
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

async function saveSeedFile() {
  try {
    const seedDbPath = path.join(__dirname, '../../data/db-seed.json');
    const dataDir = path.dirname(seedDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(seedDbPath, JSON.stringify(getDb(), null, 2));
    console.log('Seed file saved for future deploys');
  } catch (error) {
    console.error('Error saving seed file:', error);
  }
}

async function seedData() {
  // Check if data already exists
  if (db.integrators.length > 0) {
    console.log('Seed data already exists, skipping...');
    return;
  }

  console.log('Seeding initial data...');

  // Seed Integrators
  db.integrators.push({ id: 1, name: 'iWallet', code: 'IWALLET', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.integrators.push({ id: 2, name: 'Multinet', code: 'MULTINET', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.integrators.push({ id: 3, name: 'Metropol', code: 'METROPOL', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

  // Seed Categories
  db.categories.push({ id: 1, name: 'Market', code: 'MARKET', status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.categories.push({ id: 2, name: 'Tekstil', code: 'TEXTILE', status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.categories.push({ id: 3, name: 'Kozmetik', code: 'COSMETICS', status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

  // Seed some Brands
  db.brands.push({ id: 1, name: 'Carrefour', status: 'ACTIVE', category_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.brands.push({ id: 2, name: 'A101', status: 'ACTIVE', category_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.brands.push({ id: 3, name: 'Kiğılı', status: 'ACTIVE', category_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db.brands.push({ id: 4, name: 'Pierre Cardin', status: 'ACTIVE', category_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

  saveDB();
  console.log('Seed data completed');
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

export { runMigrations };

