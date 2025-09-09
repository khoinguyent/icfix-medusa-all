import fetch from "node-fetch" // If missing: npm install node-fetch

// This is the main function that will be executed
export default async function handler() {
  // --- IMPORTANT: CONFIGURE THESE VARIABLES ---
  const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000" // Inside container this is fine
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "<PUT_ADMIN_API_KEY_HERE>"

  const VERCEL_REVALIDATE_URL = "https://icfix-medusa-storefront.vercel.app/api/revalidate"
  const REVALIDATE_SECRET = "ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615" // Replace with your actual secret
  // ------------------------------------------

  const fullUrl = `${VERCEL_REVALIDATE_URL}?secret=${REVALIDATE_SECRET}`
  const webhookEvents = ["product.created", "product.updated", "product.deleted"]
  console.log("Creating webhooks using Admin API key...")

  try {
    // Create or upsert the webhooks directly with Admin API key
    console.log("Creating webhooks for Vercel revalidation...")
    for (const event of webhookEvents) {
      const createResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        body: JSON.stringify({
          name: `vercel-revalidate-${event}`,
          url: fullUrl,
          http_method: "POST",
          events: [event],
        }),
      })

      if (!createResponse.ok) {
        const errorBody = await createResponse.text()
        throw new Error(`Failed to create webhook for ${event}: ${errorBody}`)
      }
      console.log(`Successfully created webhook for event: ${event}`)
    }

    console.log("All webhooks created successfully via Admin API!")
  } catch (error) {
    console.error("Error during webhook creation process:", error)
  }
}

// Immediately invoke the handler when the script is run
handler()

