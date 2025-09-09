import fetch from "node-fetch" // You may need to install this: npm install node-fetch

// This is the main function that will be executed
export default async function handler() {
  // --- IMPORTANT: CONFIGURE THESE VARIABLES ---
  const MEDUSA_BACKEND_URL = "http://localhost:9000" // The script runs inside the container, so it can use localhost
  const ADMIN_EMAIL = "admin@icfix.com" // The email of your admin user
  const ADMIN_PASSWORD = "admin123@" // The password of your admin user

  const VERCEL_REVALIDATE_URL = "https://icfix-medusa-storefront.vercel.app/api/revalidate"
  const REVALIDATE_SECRET = "ed81a378f205e1549695f6f74ebcbd0b1d0fd0ca8e66a1439c92531d27dbe615" // Replace with your actual secret
  // ------------------------------------------

  const fullUrl = `${VERCEL_REVALIDATE_URL}?secret=${REVALIDATE_SECRET}`
  const webhookEvents = ["product.created", "product.updated", "product.deleted"]
  let sessionCookie = ""

  console.log("Attempting to authenticate with the Medusa Admin API...")

  try {
    // 1. Authenticate to get a session cookie
    const authResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`)
    }

    const headers = authResponse.headers.raw()
    sessionCookie = headers["set-cookie"]?.[0] || ""
    if (!sessionCookie) {
      throw new Error("Could not get session cookie from auth response.")
    }
    console.log("Successfully authenticated.")

    // 2. Create the webhooks
    console.log("Creating webhooks for Vercel revalidation...")
    for (const event of webhookEvents) {
      const createResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie, // Use the authenticated session cookie
        },
        body: JSON.stringify({
          event_name: event,
          url: fullUrl,
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

