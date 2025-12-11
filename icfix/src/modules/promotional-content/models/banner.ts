import { model } from "@medusajs/framework/utils"

const PromotionalBanner = model.define("promotional_banner", {
  id: model.id().primaryKey(),
  title: model.text(),
  subtitle: model.text().nullable(),
  description: model.text().nullable(),
  image_url: model.text(),
  mobile_image_url: model.text().nullable(),
  link_type: model.enum(["product", "collection", "category", "external"]).nullable(),
  link_value: model.text().nullable(),
  button_text: model.text().nullable(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  start_date: model.dateTime().nullable(),
  end_date: model.dateTime().nullable(),
  position: model.enum(["hero", "homepage", "category", "product", "sidebar"]).default("homepage"),
  metadata: model.json().nullable(),
})

export default PromotionalBanner

