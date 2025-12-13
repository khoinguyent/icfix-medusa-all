import { HttpTypes } from "@medusajs/types"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import React, { Suspense } from "react"
import ProductActionsEnhanced from "@modules/products/components/product-actions-enhanced"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="flex flex-col gap-8 my-4">
      {/* First Section: Image and Product Info */}
      <div
        className="content-container grid grid-cols-1 lg:grid-cols-2 gap-8 w-full"
        data-testid="product-container"
      >
        {/* Left: Image Gallery */}
        <div className="w-full">
          <ImageGallery product={product} />
        </div>

        {/* Right: Product Info and Actions */}
        <div className="flex flex-col gap-6 w-full">
          <ProductInfo product={product} />
          <ProductActionsEnhanced 
            product={product} 
            region={region}
          />
        </div>
      </div>

      {/* Second Section: Product Details Tabs */}
      <div className="content-container">
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      <div
        className="content-container"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
