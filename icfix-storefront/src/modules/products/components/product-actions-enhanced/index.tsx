"use client"

import { addToCartEventBus } from "@lib/data/cart-event-bus"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import ShoppingBag from "@modules/common/icons/shopping-bag"
// Heart icon component (since lucide-react might not be available)
const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)
import React, { useMemo, useState, useEffect } from "react"
import ProductVariantSelector from "../product-variant-selector"

type ProductActionsEnhancedProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

const ProductActionsEnhanced = ({
  product,
  region,
}: ProductActionsEnhancedProps) => {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | undefined>
  >({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Find variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return product.variants?.[0]
    }

    if (product.options?.length === 0) {
      return product.variants[0]
    }

    // Find variant that matches all selected options
    return product.variants.find((variant) => {
      if (!variant.options) return false

      return product.options?.every((option) => {
        const selectedValue = selectedOptions[option.title ?? ""]
        if (!selectedValue) return false

        return variant.options?.some(
          (vo) => vo.option?.title === option.title && vo.value === selectedValue
        )
      })
    })
  }, [product, selectedOptions])

  // Get price for selected variant
  const price = useMemo(() => {
    return getProductPrice({
      product,
      variantId: selectedVariant?.id,
    })
  }, [product, selectedVariant])

  const displayPrice = price?.variantPrice || price?.cheapestPrice
  const inStock = (selectedVariant?.inventory_quantity ?? 0) > 0

  // Initialize with first variant's options if available
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
      const firstVariant = product.variants[0]
      if (firstVariant.options) {
        const initialOptions: Record<string, string | undefined> = {}
        firstVariant.options.forEach((vo) => {
          if (vo.option?.title && vo.value) {
            initialOptions[vo.option.title] = vo.value
          }
        })
        setSelectedOptions(initialOptions)
      }
    }
  }, [product.variants])

  const handleOptionChange = (optionTitle: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionTitle]: value,
    }))
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta
      const maxQuantity = selectedVariant?.inventory_quantity ?? 1
      return Math.max(1, Math.min(newQuantity, maxQuantity))
    })
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || !inStock) return

    setIsAdding(true)

    addToCartEventBus.emitCartAdd({
      lineItems: [
        {
          productVariant: selectedVariant,
          quantity,
        },
      ],
      regionId: region.id,
    })

    setIsAdding(false)
  }

  const handlePurchaseNow = async () => {
    await handleAddToCart()
    // TODO: Navigate to checkout after adding to cart
    // For now, just add to cart - user can proceed to checkout from cart
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Variant Selection */}
      {product.options && product.options.length > 0 && (
        <ProductVariantSelector
          product={product}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
          disabled={isAdding}
        />
      )}

      {/* Quantity Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isAdding}
            className={clx(
              "w-10 h-10 rounded-md border-2 flex items-center justify-center font-semibold text-lg transition-colors",
              quantity <= 1 || isAdding
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={selectedVariant?.inventory_quantity ?? 1}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1
              const max = selectedVariant?.inventory_quantity ?? 1
              setQuantity(Math.max(1, Math.min(val, max)))
            }}
            className="w-16 h-10 text-center border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
            disabled={isAdding}
          />
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={
              quantity >= (selectedVariant?.inventory_quantity ?? 1) || isAdding
            }
            className={clx(
              "w-10 h-10 rounded-md border-2 flex items-center justify-center font-semibold text-lg transition-colors",
              quantity >= (selectedVariant?.inventory_quantity ?? 1) || isAdding
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePurchaseNow}
          disabled={!selectedVariant || !inStock || isAdding}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          isLoading={isAdding}
        >
          Purchase Now
        </Button>
        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariant || !inStock || isAdding}
          variant="secondary"
          className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 font-semibold"
          isLoading={isAdding}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
        <button
          className="w-12 h-12 rounded-md border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          <HeartIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export default ProductActionsEnhanced
