import { db } from '../db/connection';
import axios from 'axios';

// Production backend URL - buraya deploy edilen backend URL'ini yazın
const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://your-backend-url.railway.app/api';

async function syncToProduction() {
  console.log('Syncing data to production backend...');
  // Use db directly from connection

  try {
    // Sync Categories
    console.log('Syncing categories...');
    for (const category of db.categories) {
      try {
        await axios.post(`${PRODUCTION_API_URL}/categories`, {
          name: category.name,
          code: category.code,
          status: category.status,
        });
        console.log(`✓ Synced category: ${category.name}`);
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          // Category already exists, try to update
          try {
            await axios.put(`${PRODUCTION_API_URL}/categories/${category.id}`, {
              name: category.name,
              code: category.code,
              status: category.status,
            });
            console.log(`✓ Updated category: ${category.name}`);
          } catch (updateError) {
            console.error(`✗ Failed to update category ${category.name}:`, updateError);
          }
        } else {
          console.error(`✗ Failed to sync category ${category.name}:`, error.message);
        }
      }
    }

    // Sync Brands
    console.log('\nSyncing brands...');
    for (const brand of db.brands) {
      try {
        const response = await axios.post(`${PRODUCTION_API_URL}/brands`, {
          name: brand.name,
          status: brand.status,
          categoryId: brand.category_id || null,
        });
        const brandId = response.data.id;
        console.log(`✓ Synced brand: ${brand.name} (ID: ${brandId})`);

        // Sync brand offers
        const brandOffers = db.brand_offers.filter((bo: any) => bo.brand_id === brand.id);
        for (const offer of brandOffers) {
          try {
            await axios.post(`${PRODUCTION_API_URL}/brands/${brandId}/offers`, {
              integratorId: offer.integrator_id,
              ekomobilRate: offer.ekomobil_rate,
              userRate: offer.user_rate,
              isActive: offer.is_active,
              isBestOffer: offer.is_best_offer,
              validFrom: offer.valid_from || null,
              validTo: offer.valid_to || null,
            });
            console.log(`  ✓ Synced offer for ${brand.name}`);
          } catch (offerError: any) {
            if (offerError.response?.status !== 409) {
              console.error(`  ✗ Failed to sync offer for ${brand.name}:`, offerError.message);
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          // Brand already exists, try to update
          try {
            await axios.put(`${PRODUCTION_API_URL}/brands/${brand.id}`, {
              name: brand.name,
              status: brand.status,
              categoryId: brand.category_id || null,
            });
            console.log(`✓ Updated brand: ${brand.name}`);
          } catch (updateError) {
            console.error(`✗ Failed to update brand ${brand.name}:`, updateError);
          }
        } else {
          console.error(`✗ Failed to sync brand ${brand.name}:`, error.message);
        }
      }
    }

    // Sync Category Offers
    console.log('\nSyncing category offers...');
    for (const categoryOffer of db.category_offers) {
      try {
        await axios.post(`${PRODUCTION_API_URL}/categories/${categoryOffer.category_id}/offers`, {
          integratorId: categoryOffer.integrator_id,
          ekomobilRate: categoryOffer.ekomobil_rate,
          userRate: categoryOffer.user_rate,
          isActive: categoryOffer.is_active,
        });
        console.log(`✓ Synced category offer for category ID ${categoryOffer.category_id}`);
      } catch (error: any) {
        if (error.response?.status !== 409) {
          console.error(`✗ Failed to sync category offer:`, error.message);
        }
      }
    }

    console.log('\n✅ Sync completed!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncToProduction();

