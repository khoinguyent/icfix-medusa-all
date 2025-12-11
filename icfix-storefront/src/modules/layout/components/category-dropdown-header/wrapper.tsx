import { listCategories } from "@lib/data/categories"
import CategoryDropdownHeader from "./index"

export async function CategoryDropdownHeaderWrapper() {
  const categories = await listCategories().catch(() => [])

  return <CategoryDropdownHeader categories={categories} />
}

export default CategoryDropdownHeaderWrapper

