import { model } from "@medusajs/framework/utils"

const ServiceFeature = model.define("service_feature", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  icon_url: model.text().nullable(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default ServiceFeature

