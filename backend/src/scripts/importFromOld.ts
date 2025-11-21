import { db, saveDB } from '../db/connection';
import fs from 'fs';
import path from 'path';

// This script imports data from the old campaign management panel
// It reads from localStorage dump or a JSON file

interface OldCampaign {
  id: string;
  title: string;
  subtitle: string;
  conditions: string;
  platforms: ('android' | 'ios')[];
  events: EventCondition[];
  benefit?: string;
}

interface EventCondition {
  id: string;
  type: 'app_open' | 'package_return';
  operator: 'and' | 'or';
  period: number;
  threshold: number;
}

// Categories from marketplace CMS (port 5173)
const marketplaceCategories = [
  { name: 'tekstil', code: 'TEXTILE' },
  { name: 'market', code: 'MARKET' },
  { name: 'teknoloji', code: 'TECHNOLOGY' },
  { name: 'kozmetik', code: 'COSMETICS' },
  { name: 'gıda', code: 'FOOD' },
  { name: 'diğer', code: 'OTHER' },
];

// Brands from marketplace CMS (port 5173) - from storage.ts
const marketplaceBrands = [
  // Market kategorisi
  { name: 'CARREFOUR', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'A101', category: 'market', partnerCompany: 'Multinet', iwalletCashback: 0, userCashback: 5 },
  { name: 'YUNUS MARKET', category: 'market', partnerCompany: 'Metropol', iwalletCashback: 0, userCashback: 5 },
  { name: 'ÇAĞRI MARKET', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'HAPPY CENTER', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'KİM', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'ÇETİNKAYA', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'HOTİÇ', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'KİĞILI', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'ABDULLAH KİĞILI', category: 'market', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  // Tekstil kategorisi
  { name: 'KOTON', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'HATEMOĞLU', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'JOURNEY', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'DAMAT&TWEEN', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'DS DAMAT', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'İPEKYOL', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'TWIST', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'ADİL IŞIK', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'SÜVARİ', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'SİTARE', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'AYAKKABI DÜNYASI', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'EKOL', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'FLO', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'INSTREET', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'MAVİ', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'JACK AND JONES', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'US POLO ASSN.', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'CACHAREL', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'PIERRE CARDİN', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'AYDINLI', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'NETWORK', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'DİVARASE', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'GENCALLAR', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'PAULMARK', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'MUDO', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'MADAME COCO', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'GENPA', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  { name: 'MUDO CONCEPT', category: 'tekstil', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  // Kozmetik kategorisi
  { name: 'VOUS KOZMETİK', category: 'kozmetik', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
  // Teknoloji kategorisi
  { name: 'TEKNOSA', category: 'teknoloji', partnerCompany: 'iwallet', iwalletCashback: 0, userCashback: 5 },
];

// Map marketplace category names to our category codes
const categoryMap: Record<string, string> = {
  'market': 'MARKET',
  'tekstil': 'TEXTILE',
  'teknoloji': 'TECHNOLOGY',
  'kozmetik': 'COSMETICS',
  'gıda': 'FOOD',
  'diğer': 'OTHER',
};

// Map partner company names to integrator IDs
function getIntegratorId(partnerCompany: string): number | null {
  const integratorMap: Record<string, string> = {
    'iwallet': 'IWALLET',
    'multinet': 'MULTINET',
    'metropol': 'METROPOL',
  };
  
  const code = integratorMap[partnerCompany.toLowerCase()];
  if (!code) return null;
  
  const integrator = db.integrators.find(i => i.code === code);
  return integrator ? integrator.id : null;
}

async function importData() {
  console.log('Importing categories and brands from marketplace CMS (port 5173)...');

  // Clear existing data first (optional - comment out if you want to keep existing)
  // db.categories = [];
  // db.brands = [];
  // db.brand_offers = [];
  // db.category_offers = [];

  // Import categories
  const existingCategories = db.categories.map(c => c.code.toLowerCase());
  let categoryIdMap: Record<string, number> = {};

  for (const cat of marketplaceCategories) {
    const catKey = cat.code.toLowerCase();
    if (!existingCategories.includes(catKey)) {
      const newId = db.categories.length > 0 ? Math.max(...db.categories.map(c => c.id || 0)) + 1 : 1;
      db.categories.push({
        id: newId,
        name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
        code: cat.code,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      categoryIdMap[cat.code.toLowerCase()] = newId;
      categoryIdMap[cat.name.toLowerCase()] = newId;
      console.log(`Added category: ${cat.name} (${cat.code})`);
    } else {
      const existing = db.categories.find(c => c.code.toLowerCase() === catKey);
      if (existing) {
        categoryIdMap[cat.code.toLowerCase()] = existing.id;
        categoryIdMap[cat.name.toLowerCase()] = existing.id;
      }
    }
  }

  // Import brands with their offers
  const existingBrands = db.brands.map(b => b.name.toLowerCase());
  
  for (const brand of marketplaceBrands) {
    const brandKey = brand.name.toLowerCase();
    if (!existingBrands.includes(brandKey)) {
      // Map category name to our category code
      const categoryCode = categoryMap[brand.category] || brand.category.toUpperCase();
      const categoryId = categoryIdMap[categoryCode.toLowerCase()] || categoryIdMap[brand.category.toLowerCase()];
      
      if (categoryId) {
        const newId = db.brands.length > 0 ? Math.max(...db.brands.map(b => b.id || 0)) + 1 : 1;
        db.brands.push({
          id: newId,
          name: brand.name,
          status: 'ACTIVE',
          category_id: categoryId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log(`Added brand: ${brand.name} (${brand.category})`);

        // Add brand offer for the partner company
        const integratorId = getIntegratorId(brand.partnerCompany);
        if (integratorId) {
          const offerId = db.brand_offers.length > 0 
            ? Math.max(...db.brand_offers.map(bo => bo.id || 0)) + 1 
            : 1;
          
          db.brand_offers.push({
            id: offerId,
            brand_id: newId,
            integrator_id: integratorId,
            ekomobil_rate: brand.iwalletCashback / 100, // Convert percentage to decimal
            user_rate: brand.userCashback / 100,
            is_active: true,
            is_best_offer: false,
            valid_from: undefined,
            valid_to: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          console.log(`  Added brand offer: ${brand.name} - ${brand.partnerCompany} (${brand.userCashback}%)`);
        }
      }
    }
  }

  // Add category offers (default rates)
  // Note: Marketplace CMS uses defaultCashback per category, we'll apply it to all integrators
  // If marketplace has specific rates, we use those; otherwise default: 5% ekomobil, 3% user
  const integrators = db.integrators;
  if (integrators.length > 0) {
    for (const category of db.categories) {
      // Check if marketplace category has defaultCashback
      const marketplaceCat = marketplaceCategories.find(c => 
        c.code.toLowerCase() === category.code.toLowerCase() || 
        c.name.toLowerCase() === category.name.toLowerCase()
      );
      
      // Default: 5% ekomobil, 3% user (marketplace doesn't specify ekomobil rate, so we estimate)
      const defaultUserRate = 0.03; // 3%
      const defaultEkomobilRate = 0.05; // 5%
      
      for (const integrator of integrators) {
        const existingOffer = db.category_offers.find(
          co => co.category_id === category.id && co.integrator_id === integrator.id
        );
        
        if (!existingOffer) {
          const newId = db.category_offers.length > 0 
            ? Math.max(...db.category_offers.map(co => co.id || 0)) + 1 
            : 1;
          
          db.category_offers.push({
            id: newId,
            category_id: category.id,
            integrator_id: integrator.id,
            ekomobil_rate: defaultEkomobilRate,
            user_rate: defaultUserRate,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          console.log(`Added category offer: ${category.name} - ${integrator.name} (${(defaultUserRate * 100).toFixed(0)}%)`);
        }
      }
    }
  }

  saveDB();
  console.log('Import completed!');
  console.log(`Total categories: ${db.categories.length}`);
  console.log(`Total brands: ${db.brands.length}`);
  console.log(`Total brand offers: ${db.brand_offers.length}`);
  console.log(`Total category offers: ${db.category_offers.length}`);
}

if (require.main === module) {
  importData().then(() => process.exit(0));
}

export { importData };

