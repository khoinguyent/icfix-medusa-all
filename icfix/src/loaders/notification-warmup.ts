import type { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function notificationWarmupLoader({ container }: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Opt-in warmup to avoid sending unexpected emails
  const warmupTo = process.env.EMAIL_WARMUP_TO || process.env.GMAIL_USER
  const enable = process.env.EMAIL_WARMUP_ON_START === "true"

  if (!enable) {
    logger.info("[notification-warmup] Skipped (set EMAIL_WARMUP_ON_START=true to enable)")
    return
  }

  try {
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)

    if (!warmupTo) {
      logger.warn("[notification-warmup] No EMAIL_WARMUP_TO or GMAIL_USER set; skipping")
      return
    }

    logger.info("[notification-warmup] Initializing email provider via warmup send...")

    await notificationModuleService.createNotifications({
      to: warmupTo,
      channel: "email",
      template: "orderPlaced", // our provider supports raw html via data.html as well
      data: {
        subject: "Warmup: Medusa Notification Provider",
        html: "<p>This is an automatic warmup to initialize the Gmail provider.</p>",
      },
    })

    logger.info("[notification-warmup] Warmup completed")
  } catch (e: any) {
    logger.warn(`[notification-warmup] Warmup failed: ${e?.message || e}`)
  }
}


