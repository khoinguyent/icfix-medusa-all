import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { Sparkles } from "@medusajs/icons"
import { useState } from "react"
import BannersManagement from "./banners/page"
import ServiceFeaturesManagement from "./service-features/page"
import TestimonialsManagement from "./testimonials/page"
import HomepageSectionsManagement from "./homepage-sections/page"

const PromotionalContentPage = () => {
  const [activeTab, setActiveTab] = useState<"banners" | "features" | "testimonials" | "sections">("banners")

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Promotional Content</Heading>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("banners")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "banners"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "features"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Service Features
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "testimonials"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sections"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Homepage Sections
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "banners" && <BannersManagement />}
        {activeTab === "features" && <ServiceFeaturesManagement />}
        {activeTab === "testimonials" && <TestimonialsManagement />}
        {activeTab === "sections" && <HomepageSectionsManagement />}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Promotional Content",
  icon: Sparkles,
})

export default PromotionalContentPage
