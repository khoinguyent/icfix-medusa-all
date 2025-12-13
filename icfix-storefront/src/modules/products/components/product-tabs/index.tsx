"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import Markdown from "react-markdown"
import { useState } from "react"
import { clx } from "@medusajs/ui"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState("Description")

  const tabs = [
    {
      id: "Description",
      label: "Description",
      component: <ProductSpecsTab product={product} />,
    },
    {
      id: "Additional Information",
      label: "Additional Information",
      component: <ProductSpecificationsTab product={product} />,
    },
  ]

  return (
    <div className="w-full bg-gray-50 rounded-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clx(
              "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  )
}

const ProductSpecsTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-base text-gray-700">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications:</h3>
      <div className="space-y-4">
        <Markdown
          components={{
            p: ({ children }) => (
              <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl text-gray-900 my-4 font-semibold">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg text-gray-900 mb-2 font-semibold">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="text-gray-700">{children}</li>
            ),
          }}
        >
          {product.description || "No description available."}
        </Markdown>
      </div>
    </div>
  )
}

const ProductSpecificationsTab = ({ product }: ProductTabsProps) => {
  const hasSpecs = product.weight || product.height || product.width || product.length || product.metadata

  if (!hasSpecs) {
    return (
      <div className="text-base text-gray-700">
        <p>No additional information available.</p>
      </div>
    )
  }

  return (
    <div className="text-base">
      <div className="space-y-4">
        {product.weight && (
          <div className="flex gap-4 py-2 border-b border-gray-200">
            <span className="font-semibold text-gray-900 min-w-[150px]">Weight:</span>
            <span className="text-gray-700">{product.weight} grams</span>
          </div>
        )}
        {(product.height || product.width || product.length) && (
          <div className="flex gap-4 py-2 border-b border-gray-200">
            <span className="font-semibold text-gray-900 min-w-[150px]">Dimensions:</span>
            <span className="text-gray-700">
              {product.height}mm × {product.width}mm × {product.length}mm
            </span>
          </div>
        )}
        {product.metadata &&
          Object.entries(product.metadata).map(([key, value]) => (
            <div key={key} className="flex gap-4 py-2 border-b border-gray-200 last:border-0">
              <span className="font-semibold text-gray-900 min-w-[150px] capitalize">
                {key.replace(/_/g, " ")}:
              </span>
              <span className="text-gray-700">{value as string}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ProductTabs
