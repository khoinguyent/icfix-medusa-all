"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronUpMini, ChevronDownMini } from "@medusajs/icons"
import { useState, useRef, useEffect } from "react"

type CategoryDropdownProps = {
  categories: HttpTypes.StoreProductCategory[]
  defaultLabel?: string
}

export default function CategoryDropdown({
  categories,
  defaultLabel = "All Categories",
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter to only show top-level categories (no parent)
  const topLevelCategories = categories.filter((cat) => {
    const hasParentId = cat.parent_category_id !== null && 
                       cat.parent_category_id !== undefined && 
                       cat.parent_category_id !== ""
    const hasParentObject = cat.parent_category !== null && 
                            cat.parent_category !== undefined
    return !hasParentId && !hasParentObject
  })

  // Use all categories if no top-level ones found
  const displayCategories = topLevelCategories.length > 0 ? topLevelCategories : categories

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleCategoryClick = (categoryHandle: string, categoryName: string) => {
    setSelectedCategory(categoryName)
    setIsOpen(false)
  }

  const displayText = selectedCategory || defaultLabel

  if (displayCategories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-neutral-500 text-sm">
          No categories available.
        </p>
      </div>
    )
  }

  return (
    <div className="relative inline-block w-full max-w-xs" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium text-neutral-900 truncate">
          {displayText}
        </span>
        {isOpen ? (
          <ChevronUpMini className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        ) : (
          <ChevronDownMini className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-2">
            {displayCategories.map((category) => {
              const productCount = category.products?.length || 0
              return (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    onClick={() => handleCategoryClick(category.handle, category.name)}
                    className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      {productCount > 0 && (
                        <span className="text-xs text-neutral-500 ml-2">
                          ({productCount})
                        </span>
                      )}
                    </div>
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

