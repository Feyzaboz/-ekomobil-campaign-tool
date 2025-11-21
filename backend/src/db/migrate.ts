import { db, saveDB, query } from './connection';

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

    // Seed data
    await seedData();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
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

