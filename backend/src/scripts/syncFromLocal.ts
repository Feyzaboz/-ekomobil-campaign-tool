import axios from 'axios';

// Local backend URL (5176 portundaki frontend'in backend'i)
const LOCAL_API_URL = 'http://localhost:3001/api';

// Production backend URL - buraya deploy edilen backend URL'ini yazın
const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://your-backend-url.railway.app/api';

async function syncFromLocal() {
  console.log('Syncing data from local backend to production...');
  console.log(`Local: ${LOCAL_API_URL}`);
  console.log(`Production: ${PRODUCTION_API_URL}\n`);

  try {
    // Fetch categories from local
    console.log('Fetching categories from local...');
    const categoriesResponse = await axios.get(`${LOCAL_API_URL}/categories`);
    const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
    console.log(`Found ${categories.length} categories\n`);

    // Sync Categories to production
    console.log('Syncing categories to production...');
    for (const category of categories) {
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
            console.error(`✗ Failed to update category ${category.name}`);
          }
        } else {
          console.error(`✗ Failed to sync category ${category.name}:`, error.message);
        }
      }
    }

    // Fetch brands from local
    console.log('\nFetching brands from local...');
    const brandsResponse = await axios.get(`${LOCAL_API_URL}/brands`);
    const brands = Array.isArray(brandsResponse.data) ? brandsResponse.data : [];
    console.log(`Found ${brands.length} brands\n`);

    // Sync Brands to production
    console.log('Syncing brands to production...');
    for (const brand of brands) {
      try {
        const response = await axios.post(`${PRODUCTION_API_URL}/brands`, {
          name: brand.name,
          status: brand.status,
          categoryId: brand.category_id || null,
        });
        const brandId = response.data.id;
        console.log(`✓ Synced brand: ${brand.name} (ID: ${brandId})`);

        // Fetch and sync brand offers
        try {
          const offersResponse = await axios.get(`${LOCAL_API_URL}/brands/${brand.id}/offers`);
          const offers = Array.isArray(offersResponse.data) ? offersResponse.data : [];
          
          for (const offer of offers) {
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
        } catch (offersError) {
          console.error(`  ✗ Failed to fetch offers for ${brand.name}`);
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
            console.error(`✗ Failed to update brand ${brand.name}`);
          }
        } else {
          console.error(`✗ Failed to sync brand ${brand.name}:`, error.message);
        }
      }
    }

    // Fetch and sync category offers
    console.log('\nFetching category offers from local...');
    for (const category of categories) {
      try {
        const offersResponse = await axios.get(`${LOCAL_API_URL}/categories/${category.id}/offers`);
        const offers = Array.isArray(offersResponse.data) ? offersResponse.data : [];
        
        for (const offer of offers) {
          try {
            await axios.post(`${PRODUCTION_API_URL}/categories/${category.id}/offers`, {
              integratorId: offer.integrator_id,
              ekomobilRate: offer.ekomobil_rate,
              userRate: offer.user_rate,
              isActive: offer.is_active,
            });
            console.log(`✓ Synced category offer for ${category.name}`);
          } catch (error: any) {
            if (error.response?.status !== 409) {
              console.error(`✗ Failed to sync category offer for ${category.name}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error(`✗ Failed to fetch offers for category ${category.name}`);
      }
    }

    console.log('\n✅ Sync completed!');
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

syncFromLocal();

