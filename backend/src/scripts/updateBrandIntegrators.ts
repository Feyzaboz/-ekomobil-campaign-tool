import { db, saveDB, query } from '../db/connection';

async function updateBrandIntegrators() {
  console.log('Updating all brand integrators to iwallet...');

  // Get iwallet integrator ID
  const iwalletResult = await query('SELECT id FROM integrators WHERE code = ?', ['IWALLET']);
  if (iwalletResult.rows.length === 0) {
    console.error('iWallet integrator not found!');
    process.exit(1);
  }
  const iwalletId = iwalletResult.rows[0].id;
  console.log(`iWallet integrator ID: ${iwalletId}`);

  // Get all brands
  const brandsResult = await query('SELECT id FROM brands');
  const brands = brandsResult.rows;
  console.log(`Found ${brands.length} brands`);

  let updated = 0;
  let created = 0;

  for (const brand of brands) {
    // Check if brand has any offers
    const offersResult = await query('SELECT * FROM brand_offers WHERE brand_id = ?', [brand.id]);
    
    if (offersResult.rows.length === 0) {
      // Create new offer with iwallet
      await query(
        `INSERT INTO brand_offers (brand_id, integrator_id, ekomobil_rate, user_rate, is_active, is_best_offer)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [brand.id, iwalletId, 0, 0.05, true, true]
      );
      created++;
      console.log(`Created iwallet offer for brand ID ${brand.id}`);
    } else {
      // Update all offers to use iwallet integrator
      for (const offer of offersResult.rows) {
        if (offer.integrator_id !== iwalletId) {
          await query(
            'UPDATE brand_offers SET integrator_id = ? WHERE id = ?',
            [iwalletId, offer.id]
          );
          updated++;
          console.log(`Updated offer ID ${offer.id} for brand ID ${brand.id} to iwallet`);
        }
      }
      
      // If no offer is marked as best, mark the first one
      const hasBestOffer = offersResult.rows.some((o: any) => o.is_best_offer);
      if (!hasBestOffer && offersResult.rows.length > 0) {
        await query(
          'UPDATE brand_offers SET is_best_offer = ? WHERE id = ?',
          [true, offersResult.rows[0].id]
        );
      }
    }
  }

  saveDB();
  console.log(`\nUpdate completed!`);
  console.log(`- Updated offers: ${updated}`);
  console.log(`- Created offers: ${created}`);
  console.log(`- Total brands processed: ${brands.length}`);
}

if (require.main === module) {
  updateBrandIntegrators().then(() => process.exit(0));
}

export { updateBrandIntegrators };

