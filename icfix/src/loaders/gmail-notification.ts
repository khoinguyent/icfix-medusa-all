import { asFunction } from "awilix"
import type { MedusaContainer } from "@medusajs/framework/types"

// Import the Gmail service from the plugin
const GmailNotificationService = require("medusa-plugin-notification-gmail-oauth2")

export default async function gmailNotificationLoader(
  container: MedusaContainer
) {
  try {
    const logger = container.resolve("logger")
    const configModule = container.resolve("configModule")
    
    // Get Gmail plugin options from config
    const gmailPluginConfig = configModule.plugins.find(
      (p: any) => p.resolve === "medusa-plugin-notification-gmail-oauth2"
    )
    
    const options = gmailPluginConfig?.options || {}
    
    // Register Gmail service in the container
    container.register({
      gmailNotificationService: asFunction((cradle) => {
        return new GmailNotificationService(cradle, options)
      }).singleton(),
    })
    
    logger.info("✅ Gmail Notification Service registered in container")
  } catch (error: any) {
    const logger = container.resolve("logger")
    logger.error("❌ Failed to load Gmail notification service:", error.message)
    logger.error(error)
  }
}

