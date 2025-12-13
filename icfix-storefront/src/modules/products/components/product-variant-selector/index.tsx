"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type ProductVariantSelectorProps = {
  product: HttpTypes.StoreProduct
  selectedOptions: Record<string, string | undefined>
  onOptionChange: (optionTitle: string, value: string) => void
  disabled?: boolean
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  selectedOptions,
  onOptionChange,
  disabled = false,
}) => {
  if (!product.options || product.options.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {product.options.map((option) => {
        if (!option.title || !option.values || option.values.length === 0) {
          return null
        }

        const isColorOption = option.title.toLowerCase().includes("color") || 
                            option.title.toLowerCase().includes("colour")
        const currentValue = selectedOptions[option.title]

        return (
          <div key={option.id} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              {option.title}:
            </label>
            
            {isColorOption ? (
              // Color options as circles
              <div className="flex gap-3 flex-wrap">
                {option.values.map((value) => {
                  const isSelected = currentValue === value.value
                  // Try to extract color from value or use a default
                  const colorName = value.value?.toLowerCase() || ""
                  const colorMap: Record<string, string> = {
                    black: "#000000",
                    white: "#FFFFFF",
                    gray: "#808080",
                    grey: "#808080",
                    silver: "#C0C0C0",
                    red: "#FF0000",
                    blue: "#0000FF",
                    green: "#008000",
                    yellow: "#FFFF00",
                    orange: "#FFA500",
                    pink: "#FFC0CB",
                    purple: "#800080",
                  }
                  
                  const colorHex = colorMap[colorName] || "#CCCCCC"
                  
                  return (
                    <button
                      key={value.id}
                      onClick={() => !disabled && onOptionChange(option.title!, value.value!)}
                      disabled={disabled}
                      className={clx(
                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-200 scale-110"
                          : "border-gray-300 hover:border-gray-400 hover:scale-105"
                      )}
                      style={{ backgroundColor: colorHex }}
                      aria-label={`Select ${value.value}`}
                      title={value.value || ""}
                    >
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-white drop-shadow-lg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              // Other options (like Size) as buttons
              <div className="flex gap-2 flex-wrap">
                {option.values.map((value) => {
                  const isSelected = currentValue === value.value
                  
                  return (
                    <button
                      key={value.id}
                      onClick={() => !disabled && onOptionChange(option.title!, value.value!)}
                      disabled={disabled}
                      className={clx(
                        "px-4 py-2 rounded-md border-2 text-sm font-medium transition-all",
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      )}
                      aria-label={`Select ${value.value}`}
                    >
                      {value.value}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProductVariantSelector
