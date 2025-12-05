import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import GmailNotificationService from "./service"

/**
 * Gmail OAuth2 Notification Module Provider
 * 
 * This module provider integrates Gmail with Medusa's notification system
 * using OAuth2 authentication for secure email sending.
 */
export default ModuleProvider(Modules.NOTIFICATION, {
  services: [GmailNotificationService],
})

