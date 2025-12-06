import { listRegions } from "@lib/data/regions"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import SkeletonFeaturedProducts from "@modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import { Suspense } from "react"

// dynamicParams defaults to true in Docker mode (runtime SSR)
// Set to false only for static export builds

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export async function generateStaticParams() {
  try {
    const { locales } = await import("@/i18n/config");
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )
    // Return combinations of locale and countryCode
    return locales.flatMap((locale) =>
      countryCodes.map((countryCode) => ({ locale, countryCode }))
    )
  } catch (error) {
    console.warn("generateStaticParams for home page failed, returning default:", error)
    // Return default combinations if regions fetch fails
    return [
      { locale: "en", countryCode: "vn" },
      { locale: "vi", countryCode: "vn" },
    ]
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  return (
    <div className="flex flex-col gap-y-2 m-2">
      <Hero />
      <Suspense fallback={<SkeletonFeaturedProducts />}>
        <FeaturedProducts countryCode={countryCode} />
      </Suspense>
    </div>
  )
}
