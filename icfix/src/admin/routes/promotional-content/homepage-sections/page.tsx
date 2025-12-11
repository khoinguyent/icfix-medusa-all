import { Container, Heading, Button, Table, Badge, FocusModal, Input, Label, Checkbox, Select } from "@medusajs/ui"
import { Plus, Pencil, Trash, XMark } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

interface HomepageSection {
  id: string
  section_type: string
  title: string
  subtitle: string | null
  display_order: number
  is_active: boolean
  collection_id: string | null
  category_id: string | null
  product_limit: number | null
}

const HomepageSectionsManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["promotional-homepage-sections"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ sections: HomepageSection[] }>(
        "/admin/promotional-content/homepage-sections"
      )
      return response
    },
  })

  const sections: HomepageSection[] = data?.sections || []

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/admin/promotional-content/homepage-sections/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-homepage-sections"] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this homepage section?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2">Homepage Sections</Heading>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus /> Create Section
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No homepage sections found. Create your first section!
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sections.map((section) => (
              <Table.Row key={section.id}>
                <Table.Cell>
                  <Badge>{section.section_type}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <div className="font-medium">{section.title}</div>
                    {section.subtitle && (
                      <div className="text-sm text-gray-500">{section.subtitle}</div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{section.display_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={section.is_active ? "green" : "grey"}>
                    {section.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => setEditingSection(section)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingSection) && (
        <HomepageSectionFormModal
          section={editingSection}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingSection(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["promotional-homepage-sections"] })
            setIsCreateModalOpen(false)
            setEditingSection(null)
          }}
        />
      )}
    </div>
  )
}

// Homepage Section Form Modal
const HomepageSectionFormModal = ({
  section,
  onClose,
  onSuccess,
}: {
  section?: HomepageSection | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [formData, setFormData] = useState({
    section_type: section?.section_type || "featured_products",
    title: section?.title || "",
    subtitle: section?.subtitle || "",
    display_order: section?.display_order || 1,
    is_active: section?.is_active ?? true,
    product_limit: section?.product_limit || 8,
    collection_id: section?.collection_id || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(true)

  // Fetch collections for the dropdown
  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ collections: any[] }>(
        "/admin/collections"
      )
      return response
    },
  })

  const collections = collectionsData?.collections || []

  useEffect(() => {
    if (section) {
      setFormData({
        section_type: section.section_type || "featured_products",
        title: section.title || "",
        subtitle: section.subtitle || "",
        display_order: section.display_order || 1,
        is_active: section.is_active ?? true,
        product_limit: section.product_limit || 8,
        collection_id: section.collection_id || "",
      })
    }
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = section
        ? `/admin/promotional-content/homepage-sections/${section.id}`
        : "/admin/promotional-content/homepage-sections"

      // Clean up formData: convert empty strings to null for optional fields
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' && value.trim() === '' ? null : value
        ])
      ) as typeof formData;

      const response = await sdk.client.fetch(url, {
        method: "POST",
        body: cleanedFormData,
      })
      
      if (!response) {
        throw new Error("No response received from server")
      }
      
      onSuccess()
    } catch (error: any) {
      console.error("Error saving homepage section:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response,
      })
      
      let errorMessage = "Failed to save homepage section"
      if (error?.message) {
        errorMessage += `: ${error.message}`
      } else if (error?.status) {
        errorMessage += `: Server returned ${error.status} ${error.statusText || ""}`
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={(open) => !open && onClose()}>
      <FocusModal.Content>
        <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <div className="flex items-center gap-x-2">
              <FocusModal.Close asChild>
                <Button
                  variant="transparent"
                  size="small"
                  type="button"
                  className="text-ui-fg-subtle hover:text-ui-fg-base"
                >
                  <XMark />
                </Button>
              </FocusModal.Close>
              <span className="text-ui-fg-subtle text-small-regular">esc</span>
            </div>
          </FocusModal.Header>
          
          <FocusModal.Body className="flex flex-1 flex-col items-center overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
              <div>
                <Heading level="h1">
                  {section ? "Edit Homepage Section" : "Create Homepage Section"}
                </Heading>
              </div>
              
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Section Type *
                  </Label>
                </div>
                <Select
                  value={formData.section_type}
                  onValueChange={(value) => setFormData({ ...formData, section_type: value })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="featured_products">Featured Products</Select.Item>
                    <Select.Item value="new_arrivals">New Arrivals</Select.Item>
                    <Select.Item value="best_sellers">Best Sellers</Select.Item>
                    <Select.Item value="categories">Categories</Select.Item>
                    <Select.Item value="testimonials">Testimonials</Select.Item>
                    <Select.Item value="promotional">Promotional</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Title *
                  </Label>
                </div>
                <Input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Subtitle
                  </Label>
                </div>
                <Input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter section subtitle"
                />
              </div>

              {(formData.section_type === "featured_products" || formData.section_type === "new_arrivals" || formData.section_type === "best_sellers") && (
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Collection *
                    </Label>
                  </div>
                  <Select
                    value={formData.collection_id || undefined}
                    onValueChange={(value) => setFormData({ ...formData, collection_id: value })}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select a collection" />
                    </Select.Trigger>
                    <Select.Content>
                      {collections.length === 0 ? (
                        <div className="px-2 py-1.5 text-ui-fg-subtle text-small-regular">
                          No collections available. Create collections in Products → Collections.
                        </div>
                      ) : (
                        collections.map((collection) => (
                          <Select.Item key={collection.id} value={collection.id}>
                            {collection.title}
                          </Select.Item>
                        ))
                      )}
                    </Select.Content>
                  </Select>
                  <p className="text-ui-fg-subtle text-small-regular mt-1">
                    Select a collection to display its products. Create collections in Products → Collections.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Display Order
                    </Label>
                  </div>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Product Limit
                    </Label>
                  </div>
                  <Input
                    type="number"
                    value={formData.product_limit}
                    onChange={(e) => setFormData({ ...formData, product_limit: parseInt(e.target.value) || null })}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center gap-x-2">
                  <Checkbox
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  />
                  <Label size="small" weight="plus">
                    Active
                  </Label>
                </div>
              </div>
            </div>
          </FocusModal.Body>

          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button variant="secondary" size="small" disabled={isSubmitting}>
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button type="submit" size="small" isLoading={isSubmitting}>
                Save
              </Button>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default HomepageSectionsManagement

