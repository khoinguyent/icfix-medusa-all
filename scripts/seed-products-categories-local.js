/**
 * Seed Products and Categories for Local Development
 * This script uses the Medusa API to create products and categories
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9002';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

async function seedCategories() {
  const categories = [
    { name: 'Smartphones', is_active: true, description: 'Latest smartphones and mobile devices' },
    { name: 'Accessories', is_active: true, description: 'Phone cases, chargers, and more' },
    { name: 'Components', is_active: true, description: 'Phone batteries, screens, and replacement parts' },
    { name: 'Laptops', is_active: true, description: 'Laptops and computing devices' },
  ];

  const createdCategories = [];
  
  for (const category of categories) {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/product-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-medusa-access-token': ADMIN_API_KEY,
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        const data = await response.json();
        createdCategories.push(data.product_category);
        console.log(`✓ Created category: ${category.name}`);
      } else {
        const error = await response.text();
        console.error(`✗ Failed to create category ${category.name}:`, error);
      }
    } catch (error) {
      console.error(`✗ Error creating category ${category.name}:`, error.message);
    }
  }

  return createdCategories;
}

async function seedProducts(categories) {
  // This is a simplified version - full product creation would require more complex API calls
  console.log('Product seeding requires admin authentication and complex API calls.');
  console.log('Please use the admin UI or run the TypeScript seed script in development mode.');
}

async function main() {
  console.log('🌱 Seeding categories and products...');
  
  if (!ADMIN_API_KEY) {
    console.error('⚠️  ADMIN_API_KEY not set. Skipping API-based seeding.');
    console.log('💡 Tip: Create an admin user and get the API key from admin settings.');
    return;
  }

  const categories = await seedCategories();
  console.log(`✓ Created ${categories.length} categories`);
  
  // Products require more complex setup (variants, prices, etc.)
  // Better to use the compiled seed script or admin UI
  await seedProducts(categories);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedCategories, seedProducts };
