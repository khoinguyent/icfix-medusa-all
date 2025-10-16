#!/usr/bin/env node

/**
 * Gmail OAuth2 Integration Test Script
 * 
 * Tests the Gmail notification service to ensure it's properly configured
 * and can send emails.
 * 
 * Usage:
 *   node test-gmail.js [recipient-email]
 * 
 * If no recipient email is provided, uses the sender email (sends to yourself)
 */

require('dotenv').config()

async function testGmailIntegration() {
  console.log('🚀 Gmail OAuth2 Integration Test\n')
  console.log('='.repeat(60))
  
  // Check environment variables
  console.log('\n📋 Step 1: Checking environment variables...\n')
  
  const requiredVars = {
    GMAIL_USER: process.env.GMAIL_USER,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  }
  
  let missingVars = false
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`   ❌ ${key}: Not set`)
      missingVars = true
    } else {
      // Mask sensitive values
      const displayValue = ['GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'].includes(key)
        ? value.substring(0, 10) + '...' + value.substring(value.length - 10)
        : value
      console.log(`   ✅ ${key}: ${displayValue}`)
    }
  }
  
  if (missingVars) {
    console.log('\n❌ Missing required environment variables!')
    console.log('\nPlease set the following in your .env file:')
    console.log('   - GMAIL_USER')
    console.log('   - GOOGLE_CLIENT_ID')
    console.log('   - GOOGLE_CLIENT_SECRET')
    console.log('   - GOOGLE_REFRESH_TOKEN')
    console.log('\nSee GMAIL_OAUTH2_SETUP_GUIDE.md for detailed instructions.')
    process.exit(1)
  }
  
  console.log('\n✅ All environment variables are set!')
  
  // Import and initialize service
  console.log('\n📋 Step 2: Initializing Gmail service...\n')
  
  let GmailProvider
  try {
    GmailProvider = require('./plugins/notification-gmail-oauth2/dist/services/gmail-provider').default
  } catch (error) {
    console.log('   ❌ Failed to load Gmail provider. Plugin may not be built.')
    console.log('   💡 Run: cd plugins/notification-gmail-oauth2 && npm install && npm run build')
    console.log('\n   Error:', error.message)
    process.exit(1)
  }
  
  const container = {
    logger: {
      info: (...args) => console.log('   ℹ️ ', ...args),
      error: (...args) => console.error('   ❌', ...args),
      warn: (...args) => console.warn('   ⚠️ ', ...args),
      debug: (...args) => console.log('   🔍', ...args),
    }
  }
  
  const gmailService = new GmailProvider(container, {
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    storeName: process.env.STORE_NAME || 'Your Store',
    storeUrl: process.env.STORE_URL || 'https://yourstore.com',
  })
  
  // Wait for initialization
  console.log('   ⏳ Waiting for service to initialize...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Test email sending
  console.log('\n📋 Step 3: Sending test email...\n')
  
  const recipientEmail = process.argv[2] || process.env.GMAIL_USER
  console.log(`   📧 Recipient: ${recipientEmail}`)
  console.log(`   📤 Sender: ${process.env.GMAIL_USER}`)
  console.log(`   📝 Template: Order Confirmation`)
  console.log('')
  
  try {
    const result = await gmailService.sendNotification('order.placed', {
      email: recipientEmail,
      customerName: 'Test Customer',
      orderId: 'TEST-' + Date.now(),
      orderTotal: 4999, // $49.99 in cents
      currency: 'USD',
      storeUrl: process.env.STORE_URL || 'https://yourstore.com',
    })
    
    if (result) {
      console.log('   ✅ Test email sent successfully!')
      console.log('\n📋 Step 4: Verify email delivery...\n')
      console.log(`   1. Check inbox of ${recipientEmail}`)
      console.log(`   2. Check spam/junk folder if not in inbox`)
      console.log(`   3. Verify all variables are replaced (no {{}} placeholders)`)
      console.log(`   4. Check email formatting looks professional`)
      console.log('\n✅ Test completed successfully!')
      console.log('\n' + '='.repeat(60))
      console.log('\n🎉 Gmail integration is working!\n')
      process.exit(0)
    } else {
      console.log('   ❌ Test email failed to send')
      console.log('\n📋 Troubleshooting:\n')
      console.log('   1. Check the error messages above')
      console.log('   2. Verify OAuth credentials are correct')
      console.log('   3. Ensure Gmail API is enabled in Google Cloud Console')
      console.log('   4. Try regenerating the refresh token')
      console.log('\nSee GMAIL_OAUTH2_SETUP_GUIDE.md for detailed troubleshooting.')
      process.exit(1)
    }
  } catch (error) {
    console.log('   ❌ Error sending test email:', error.message)
    console.log('\n📋 Troubleshooting:\n')
    console.log('   1. Check error message above for specific issue')
    console.log('   2. Verify all OAuth2 credentials are correct')
    console.log('   3. Ensure Gmail API is enabled')
    console.log('   4. Check that refresh token is still valid')
    console.log('   5. Try regenerating credentials if error persists')
    console.log('\nSee GMAIL_OAUTH2_SETUP_GUIDE.md Section "Troubleshooting"')
    process.exit(1)
  }
}

// Run the test
testGmailIntegration().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})

