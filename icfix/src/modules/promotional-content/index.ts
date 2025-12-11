import PromotionalContentService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PROMOTIONAL_CONTENT_MODULE = "promotionalContent"

export default Module(PROMOTIONAL_CONTENT_MODULE, {
  service: PromotionalContentService,
})

