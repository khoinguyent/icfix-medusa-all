import { SearchResult } from "@lib/data/search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Suspense } from "react"

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  totalHits: number
  isLoading?: boolean
}

const SearchResults = ({ results, query, totalHits, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">
          No products match your search for "{query}". Try adjusting your search terms.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Search results for "{query}"
        </h2>
        <p className="text-sm text-gray-500">
          {totalHits} {totalHits === 1 ? "product" : "products"} found
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((product) => (
          <LocalizedClientLink
            key={product.id}
            href={`/products/${product.handle}`}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {product.title}
              </h3>
              {product.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
              )}
              {product.variants && product.variants.length > 0 && (
                <p className="mt-1 text-sm font-medium text-gray-900">
                  ${product.variants[0].price / 100}
                </p>
              )}
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default SearchResults
