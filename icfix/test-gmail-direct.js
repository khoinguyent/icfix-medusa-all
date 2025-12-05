#!/usr/bin/env node

/**
 * Direct Gmail Test Script
 * Tests Gmail OAuth2 email sending without Medusa container
 * 
 * Usage: node test-gmail-direct.js recipient@example.com
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get recipient email from command line
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Usage: node test-gmail-direct.js recipient@example.com');
  process.exit(1);
}

// Check required environment variables
const requiredVars = ['GMAIL_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables in .env file:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease add these to icfix/.env file');
  console.error('See GMAIL_OAUTH2_QUICK_START.md for setup instructions');
  process.exit(1);
}

console.log('📧 Gmail Direct Test Script');
console.log('============================\n');
console.log(`From: ${process.env.GMAIL_USER}`);
console.log(`To: ${recipientEmail}\n`);

// Import Gmail service directly
const GmailNotificationService = require('./plugins/notification-gmail-oauth2/index.js');

// Create a mock container with logger
const mockContainer = {
  logger: console
};

// Create options from environment
const options = {
  user: process.env.GMAIL_USER,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  storeName: process.env.STORE_NAME || 'Your Store',
  storeUrl: process.env.STORE_URL || 'https://yourstore.com',
};

console.log('🔧 Initializing Gmail service...\n');

// Create service instance
const gmailService = new GmailNotificationService(mockContainer, options);

// Wait for initialization
setTimeout(async () => {
  try {
    console.log('\n📤 Sending test email...\n');
    
    // Send test order confirmation
    const result = await gmailService.sendNotification('order.placed', {
      email: recipientEmail,
      customerName: 'Test Customer',
      orderId: 'TEST-' + Date.now(),
      orderTotal: 9999, // $99.99 in cents
      currency: 'USD',
      storeUrl: process.env.STORE_URL || 'https://yourstore.com',
    });
    
    if (result) {
      console.log('\n✅ SUCCESS! Test email sent!');
      console.log('\n📋 Next steps:');
      console.log(`   1. Check inbox of ${recipientEmail}`);
      console.log('   2. Check spam/junk folder if not in inbox');
      console.log('   3. Email should be an order confirmation');
    } else {
      console.log('\n⚠️  Email sending returned false');
      console.log('Check the logs above for warnings');
    }
    
  } catch (error) {
    console.error('\n❌ Error sending test email:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}, 3000); // Wait 3 seconds for OAuth initialization

