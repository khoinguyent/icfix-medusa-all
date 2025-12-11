"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronUpMini, ChevronDownMini } from "@medusajs/icons"
import { useState, useRef, useEffect } from "react"

type CategoryDropdownHeaderProps = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryDropdownHeader({
  categories,
}: CategoryDropdownHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  if (displayCategories.length === 0) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-colors font-medium text-sm text-neutral-900"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="All Categories"
      >
        {/* Hamburger icon */}
        <svg
          className="w-5 h-5 text-neutral-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span>All Categories</span>
        {isOpen ? (
          <ChevronUpMini className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDownMini className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <ul className="py-2">
            {displayCategories.map((category) => {
              const productCount = category.products?.length || 0
              return (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    onClick={() => setIsOpen(false)}
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

