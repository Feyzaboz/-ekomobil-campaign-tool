import { db, saveDB } from '../db/connection';

async function updateBrandEkomobilRates() {
  console.log('Updating all brand ekomobil rates to 5% (0.05)...');
  
  const brandOffers = db.brand_offers;
  const now = new Date().toISOString();
  let updatedCount = 0;
  let skippedCount = 0;

  console.log(`Found ${brandOffers.length} brand offers`);

  for (const offer of brandOffers) {
    try {
      const oldRate = offer.ekomobil_rate;
      // Check if already 5%
      if (Math.abs(oldRate - 0.05) < 0.001) {
        skippedCount++;
        continue;
      }
      
      // Directly update the offer in the database object
      offer.ekomobil_rate = 0.05;
      offer.updated_at = now;
      
      updatedCount++;
      console.log(`✓ Updated brand offer ID ${offer.id} (brand_id: ${offer.brand_id}) from ${(oldRate * 100).toFixed(2)}% to 5%`);
    } catch (error) {
      console.error(`✗ Failed to update brand offer ID ${offer.id}:`, error);
    }
  }

  // Save the database
  saveDB();

  console.log(`\n✅ Update completed!`);
  console.log(`- Updated offers: ${updatedCount}`);
  console.log(`- Already 5% (skipped): ${skippedCount}`);
  console.log(`- Total brand offers: ${brandOffers.length}`);
}

updateBrandEkomobilRates();

