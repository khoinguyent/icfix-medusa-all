/**
 * Seed Products and Categories for Local Development
 * Runs inside the backend container using Medusa workflows
 */

const path = require('path');

// This script should be run from /app/.medusa/server directory
// It uses the compiled Medusa code to seed data

async function seedData() {
  try {
    // Import Medusa and workflows
    const { createProductCategoriesWorkflow, createProductsWorkflow } = require('@medusajs/medusa/core-flows');
    
    console.log('🌱 Starting to seed products and categories...');
    
    // This would require the Medusa container to be available
    // For now, we'll use a different approach - direct SQL or API calls
    console.log('Note: Full seeding requires running the TypeScript seed script.');
    console.log('For now, using SQL-based approach for basic data.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for use in other scripts
module.exports = { seedData };
