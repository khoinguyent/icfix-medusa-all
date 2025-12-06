export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Account",
  description: "Your account overview and settings.",
}

export default async function AccountPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  // This page will be handled by the parallel routes in the layout
  // The layout will show either @dashboard or @login based on customer status
  return null
}
