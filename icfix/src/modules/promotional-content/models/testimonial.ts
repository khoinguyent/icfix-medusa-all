import { model } from "@medusajs/framework/utils"

const Testimonial = model.define("testimonial", {
  id: model.id().primaryKey(),
  customer_name: model.text(),
  customer_title: model.text().nullable(),
  customer_avatar_url: model.text().nullable(),
  rating: model.number(), // 1-5
  comment: model.text(),
  display_order: model.number().default(0),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default Testimonial

