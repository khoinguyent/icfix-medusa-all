import { asFunction } from "awilix"

export default async function gmailNotificationLoader(container: any) {
  const logger = container.resolve("logger")
  
  logger.info("🔄 Gmail notification loader starting...")
  
  try {
    const configModule = container.resolve("configModule")
    
    logger.info("📦 Importing Gmail service from plugin...")
    // Import the Gmail service from the plugin
    const GmailNotificationService = require("medusa-plugin-notification-gmail-oauth2")
    
    logger.info("⚙️  Getting plugin configuration...")
    // Get Gmail plugin options from config
    const gmailPluginConfig = configModule.plugins.find(
      (p: any) => p.resolve === "medusa-plugin-notification-gmail-oauth2"
    )
    
    const options = gmailPluginConfig?.options || {}
    logger.info("📝 Plugin options:", JSON.stringify(Object.keys(options)))
    
    logger.info("🔧 Registering service in container...")
    // Register Gmail service in the container
    container.register({
      gmailNotificationService: asFunction((cradle: any) => {
        logger.info("🏗️  Creating Gmail service instance...")
        return new GmailNotificationService(cradle, options)
      }).singleton(),
    })
    
    logger.info("✅ Gmail Notification Service registered via application loader")
  } catch (error: any) {
    logger.error("❌ Failed to load Gmail notification service:", error?.message || error)
    logger.error("Stack:", error?.stack)
  }
}

