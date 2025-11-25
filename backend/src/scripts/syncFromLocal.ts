import axios from 'axios';

// Local backend URL (5176 portundaki frontend'in backend'i)
const LOCAL_API_URL = 'http://localhost:3001/api';

// Production backend URL - Render.com
const PRODUCTION_API_URL = process.env.PRODUCTION_API_URL || 'https://ekomobil-campaign-tool.onrender.com/api';

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
          // Brand already exists, try to update and sync offers
          try {
            // First, get the production brand ID by name
            const existingBrandsResponse = await axios.get(`${PRODUCTION_API_URL}/brands?search=${encodeURIComponent(brand.name)}`);
            const existingBrand = Array.isArray(existingBrandsResponse.data) 
              ? existingBrandsResponse.data.find((b: any) => b.name === brand.name)
              : null;
            
            if (existingBrand) {
              // Update brand info
              await axios.put(`${PRODUCTION_API_URL}/brands/${existingBrand.id}`, {
                name: brand.name,
                status: brand.status,
                categoryId: brand.category_id || null,
              });
              console.log(`✓ Updated brand: ${brand.name}`);

              // Fetch and sync brand offers
              try {
                const offersResponse = await axios.get(`${LOCAL_API_URL}/brands/${brand.id}/offers`);
                const offers = Array.isArray(offersResponse.data) ? offersResponse.data : [];
                
                // Get existing offers from production
                const existingOffersResponse = await axios.get(`${PRODUCTION_API_URL}/brands/${existingBrand.id}/offers`);
                const existingOffers = Array.isArray(existingOffersResponse.data) ? existingOffersResponse.data : [];
                
                for (const offer of offers) {
                  // Check if offer already exists (by integrator_id)
                  const existingOffer = existingOffers.find((eo: any) => eo.integrator_id === offer.integrator_id);
                  
                  try {
                    if (existingOffer) {
                      // Update existing offer
                      await axios.put(`${PRODUCTION_API_URL}/brands/${existingBrand.id}/offers/${existingOffer.id}`, {
                        integratorId: offer.integrator_id,
                        ekomobilRate: offer.ekomobil_rate,
                        userRate: offer.user_rate,
                        isActive: offer.is_active,
                        isBestOffer: offer.is_best_offer,
                        validFrom: offer.valid_from || null,
                        validTo: offer.valid_to || null,
                      });
                      console.log(`  ✓ Updated offer for ${brand.name}`);
                    } else {
                      // Create new offer
                      await axios.post(`${PRODUCTION_API_URL}/brands/${existingBrand.id}/offers`, {
                        integratorId: offer.integrator_id,
                        ekomobilRate: offer.ekomobil_rate,
                        userRate: offer.user_rate,
                        isActive: offer.is_active,
                        isBestOffer: offer.is_best_offer,
                        validFrom: offer.valid_from || null,
                        validTo: offer.valid_to || null,
                      });
                      console.log(`  ✓ Synced offer for ${brand.name}`);
                    }
                  } catch (offerError: any) {
                    if (offerError.response?.status !== 409) {
                      console.error(`  ✗ Failed to sync offer for ${brand.name}:`, offerError.message);
                    }
                  }
                }
              } catch (offersError) {
                console.error(`  ✗ Failed to fetch offers for ${brand.name}`);
              }
            } else {
              console.error(`✗ Could not find existing brand ${brand.name} in production`);
            }
          } catch (updateError: any) {
            console.error(`✗ Failed to update brand ${brand.name}:`, updateError.message);
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

    // Sync Events
    console.log('\nFetching events from local...');
    const eventsResponse = await axios.get(`${LOCAL_API_URL}/events`);
    const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
    console.log(`Found ${events.length} events\n`);

    console.log('Syncing events to production...');
    for (const event of events) {
      try {
        await axios.post(`${PRODUCTION_API_URL}/events`, {
          name: event.name,
          description: event.description,
          minAppOpenCount: event.min_app_open_count || null,
          appOpenWindowDays: event.app_open_window_days || null,
          minRefundCount: event.min_refund_count || null,
          refundWindowDays: event.refund_window_days || null,
          extraFilters: event.extra_filters || null,
        });
        console.log(`✓ Synced event: ${event.name}`);
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          // Event already exists, try to update
          try {
            await axios.put(`${PRODUCTION_API_URL}/events/${event.id}`, {
              name: event.name,
              description: event.description,
              minAppOpenCount: event.min_app_open_count || null,
              appOpenWindowDays: event.app_open_window_days || null,
              minRefundCount: event.min_refund_count || null,
              refundWindowDays: event.refund_window_days || null,
              extraFilters: event.extra_filters || null,
            });
            console.log(`✓ Updated event: ${event.name}`);
          } catch (updateError) {
            console.error(`✗ Failed to update event ${event.name}`);
          }
        } else {
          console.error(`✗ Failed to sync event ${event.name}:`, error.message);
        }
      }
    }

    // Sync Campaigns
    console.log('\nFetching campaigns from local...');
    const campaignsResponse = await axios.get(`${LOCAL_API_URL}/campaigns`);
    const campaigns = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
    console.log(`Found ${campaigns.length} campaigns\n`);

    console.log('Syncing campaigns to production...');
    for (const campaign of campaigns) {
      try {
        await axios.post(`${PRODUCTION_API_URL}/campaigns`, {
          name: campaign.name,
          description: campaign.description,
          eventId: campaign.event_id,
          benefitType: campaign.benefit_type,
          benefitValue: campaign.benefit_value || null,
          platforms: campaign.platforms || [],
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          status: campaign.status || 'DRAFT',
        });
        console.log(`✓ Synced campaign: ${campaign.name}`);
      } catch (error: any) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          // Campaign already exists, try to update
          try {
            await axios.put(`${PRODUCTION_API_URL}/campaigns/${campaign.id}`, {
              name: campaign.name,
              description: campaign.description,
              eventId: campaign.event_id,
              benefitType: campaign.benefit_type,
              benefitValue: campaign.benefit_value || null,
              platforms: campaign.platforms || [],
              startDate: campaign.start_date,
              endDate: campaign.end_date,
              status: campaign.status || 'DRAFT',
            });
            console.log(`✓ Updated campaign: ${campaign.name}`);
          } catch (updateError) {
            console.error(`✗ Failed to update campaign ${campaign.name}`);
          }
        } else {
          console.error(`✗ Failed to sync campaign ${campaign.name}:`, error.message);
        }
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

