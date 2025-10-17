import { asFunction } from "awilix"

export default async function gmailNotificationLoader(container: any) {
  try {
    const logger = container.resolve("logger")
    const configModule = container.resolve("configModule")
    
    // Import the Gmail service from the plugin
    const GmailNotificationService = require("medusa-plugin-notification-gmail-oauth2")
    
    // Get Gmail plugin options from config
    const gmailPluginConfig = configModule.plugins.find(
      (p: any) => p.resolve === "medusa-plugin-notification-gmail-oauth2"
    )
    
    const options = gmailPluginConfig?.options || {}
    
    // Register Gmail service in the container
    container.register({
      gmailNotificationService: asFunction((cradle: any) => {
        return new GmailNotificationService(cradle, options)
      }).singleton(),
    })
    
    logger.info("✅ Gmail Notification Service registered via application loader")
  } catch (error: any) {
    const logger = container.resolve("logger")
    logger.error("❌ Failed to load Gmail notification service:", error?.message || error)
  }
}

