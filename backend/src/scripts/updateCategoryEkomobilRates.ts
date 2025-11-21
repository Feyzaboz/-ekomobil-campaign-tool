import { query } from '../db/connection';

async function updateCategoryEkomobilRates() {
  console.log('Updating all category ekomobil rates to 5% (0.05)...');
  
  // First, get all category offers
  const result = await query('SELECT * FROM category_offers', []);
  const categoryOffers = result.rows;
  const now = new Date().toISOString();
  let updatedCount = 0;

  console.log(`Found ${categoryOffers.length} category offers`);

  for (const offer of categoryOffers) {
    try {
      await query(
        `UPDATE category_offers 
         SET ekomobil_rate = $1, updated_at = $2
         WHERE id = $3 RETURNING *`,
        [0.05, now, offer.id]
      );
      updatedCount++;
      console.log(`✓ Updated category offer ID ${offer.id} (category_id: ${offer.category_id})`);
    } catch (error) {
      console.error(`✗ Failed to update category offer ID ${offer.id}:`, error);
    }
  }

  console.log(`\n✅ Update completed!`);
  console.log(`- Updated offers: ${updatedCount}`);
  console.log(`- Total category offers: ${categoryOffers.length}`);
}

updateCategoryEkomobilRates();

