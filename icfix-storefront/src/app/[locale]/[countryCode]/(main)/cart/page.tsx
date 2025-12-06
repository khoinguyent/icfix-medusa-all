export async function generateStaticParams() {
  try {
    const { listRegions } = await import("@lib/data/regions");
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    );
    return countryCodes.map((countryCode) => ({ countryCode }));
  } catch (error) {
    console.warn("generateStaticParams for cart page failed, returning default:", error);
    return [{ countryCode: "vn" }];
  }
}

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { CartProvider } from "@lib/context/cart-context"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  return (
    <CartProvider cart={cart}>
      <CartTemplate cart={cart} customer={customer} />
    </CartProvider>
  )
}
