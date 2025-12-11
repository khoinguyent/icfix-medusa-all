import { model } from "@medusajs/framework/utils"

const HomepageSection = model.define("homepage_section", {
  id: model.id().primaryKey(),
  section_type: model.enum([
    "featured_products",
    "new_arrivals",
    "best_sellers",
    "categories",
    "testimonials",
    "promotional",
  ]),
  title: model.text(),
  subtitle: model.text().nullable(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  // For product sections
  collection_id: model.text().nullable(),
  category_id: model.text().nullable(),
  product_limit: model.number().nullable(),
  // For promotional sections
  promotional_banner_id: model.text().nullable(),
  // For categories section
  show_category_images: model.boolean().default(false),
  metadata: model.json().nullable(),
})

export default HomepageSection

