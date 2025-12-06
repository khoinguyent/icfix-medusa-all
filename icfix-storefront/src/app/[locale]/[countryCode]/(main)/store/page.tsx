export async function generateStaticParams() {
  try {
    const { listRegions } = await import("@lib/data/regions");
    const { locales } = await import("@/i18n/config");
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    );
    // Return combinations of locale and countryCode
    return locales.flatMap((locale) =>
      countryCodes.map((countryCode) => ({ locale, countryCode }))
    );
  } catch (error) {
    console.warn("generateStaticParams for store page failed, returning default:", error);
    // Return default combinations if regions fetch fails
    return [
      { locale: "en", countryCode: "vn" },
      { locale: "vi", countryCode: "vn" },
    ];
  }
}

import { listCategories } from "@lib/data/categories"
import { retrieveCustomer } from "@lib/data/customer"
import { searchProducts } from "@lib/data/search"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SearchResults from "@modules/store/components/search-results"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreBreadcrumb from "@modules/store/components/store-breadcrumb"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { Metadata } from "next"
import { Suspense } from "react"

// dynamicParams defaults to true in Docker mode (runtime SSR)
// Set to false only for static export builds

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, q } = searchParams

  const sort = sortBy || "created_at"
  const pageNumber = page ? parseInt(page) : 1
  const searchQuery = q || ""

  const categories = await listCategories()
  const customer = await retrieveCustomer()

  // If there's a search query, perform search
  let searchResults = null
  if (searchQuery.trim()) {
    searchResults = await searchProducts(searchQuery, {
      limit: 20,
      offset: (pageNumber - 1) * 20,
    })
  }

  return (
    <div className="bg-neutral-100">
      <div
        className="flex flex-col py-6 content-container gap-4"
        data-testid="category-container"
      >
        <StoreBreadcrumb />
        <div className="flex flex-col small:flex-row small:items-start gap-3">
          <RefinementList sortBy={sort} categories={categories} />
          <div className="w-full">
            {searchQuery.trim() ? (
              <SearchResults
                results={searchResults?.hits || []}
                query={searchQuery}
                totalHits={searchResults?.totalHits || 0}
              />
            ) : (
              <Suspense fallback={<SkeletonProductGrid />}>
                <PaginatedProducts
                  sortBy={sort}
                  page={pageNumber}
                  countryCode={params.countryCode}
                  customer={customer}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
;``
