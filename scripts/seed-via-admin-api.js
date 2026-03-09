/**
 * Seed Categories and Products via Admin API
 * This script uses HTTP requests to the Admin API
 */

const http = require('http');

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9002';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@icfix.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123@';

function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 9002,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in...');
  const response = await makeRequest('POST', '/admin/auth/token', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (response.status === 200 && response.data.user) {
    const cookies = response.headers['set-cookie'] || [];
    const cookieString = cookies.join('; ');
    console.log('✓ Login successful');
    return cookieString;
  } else {
    throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
  }
}

async function createCategory(cookies, categoryData) {
  const response = await makeRequest('POST', '/admin/product-categories', categoryData, cookies);
  if (response.status === 200 && response.data.product_category) {
    return response.data.product_category;
  } else {
    throw new Error(`Failed to create category: ${JSON.stringify(response.data)}`);
  }
}

async function createProduct(cookies, productData) {
  const response = await makeRequest('POST', '/admin/products', productData, cookies);
  if (response.status === 200 && response.data.product) {
    return response.data.product;
  } else {
    throw new Error(`Failed to create product: ${JSON.stringify(response.data)}`);
  }
}

async function main() {
  try {
    console.log('🌱 Starting to seed categories and products via Admin API...\n');

    // Login
    const cookies = await login();

    // Create Categories
    console.log('\n📁 Creating categories...');
    const categories = [
      { name: 'Smartphones', is_active: true, description: 'Latest smartphones and mobile devices' },
      { name: 'Accessories', is_active: true, description: 'Phone cases, chargers, and more' },
      { name: 'Components', is_active: true, description: 'Phone batteries, screens, and replacement parts' },
      { name: 'Laptops', is_active: true, description: 'Laptops and computing devices' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      try {
        const category = await createCategory(cookies, cat);
        createdCategories.push(category);
        console.log(`  ✓ Created category: ${cat.name}`);
      } catch (error) {
        console.log(`  ⚠️  Category ${cat.name} may already exist or error: ${error.message}`);
      }
    }

    console.log(`\n✓ Created ${createdCategories.length} categories\n`);

    // Get shipping profile ID (we'll need this for products)
    // For now, we'll skip product creation as it requires more complex setup
    // Products can be created via Admin UI or the full seed script

    console.log('✅ Categories seeding completed!');
    console.log('\n💡 Tip: Create products via Admin UI at http://localhost:3001');
    console.log('   Or run the full seed script in development mode');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { login, createCategory, createProduct };
