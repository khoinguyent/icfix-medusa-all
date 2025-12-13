import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { clx } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const price = getProductPrice({
    product,
  })

  const displayPrice = price?.cheapestPrice
  const hasDiscount = displayPrice?.price_type === "sale"
  const discountPercentage = displayPrice?.percentage_diff
    ? Math.round(parseFloat(displayPrice.percentage_diff))
    : null

  // Calculate inventory
  const inventoryQuantity = product.variants?.reduce(
    (acc, variant) => acc + (variant.inventory_quantity ?? 0),
    0
  ) || 0
  const inStock = inventoryQuantity > 0

  return (
    <div id="product-info" className="flex flex-col gap-6 w-full">
      {/* Product Name with Discount Badge */}
      <div className="flex items-start gap-3">
        <h1
          className="text-3xl md:text-4xl font-bold text-gray-900 flex-1"
          data-testid="product-title"
        >
          {product.title}
        </h1>
        {hasDiscount && discountPercentage && (
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md whitespace-nowrap">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Reviews and Stock Status */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Star Rating - placeholder (no reviews in DB) */}
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-5 h-5 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">(4 customer reviews)</span>
        </div>

        {/* Stock Status */}
        {inStock && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleSolid className="w-5 h-5" />
            <span className="text-sm font-medium">In Stock</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-600">Price:</span>
          {hasDiscount && displayPrice?.original_price && (
            <span className="text-lg text-gray-500 line-through">
              {displayPrice.original_price}
            </span>
          )}
          <span
            className={clx("text-3xl font-bold", {
              "text-blue-600": hasDiscount,
              "text-gray-900": !hasDiscount,
            })}
            data-testid="product-price"
          >
            {displayPrice?.calculated_price || "N/A"}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-600">
          <CheckCircleSolid className="w-5 h-5" />
          <span className="text-sm">Free delivery available</span>
        </div>
        {hasDiscount && discountPercentage && (
          <div className="flex items-center gap-2 text-blue-600">
            <CheckCircleSolid className="w-5 h-5" />
            <span className="text-sm">Sales {discountPercentage}% Off Use Code: PROMO{discountPercentage}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo

