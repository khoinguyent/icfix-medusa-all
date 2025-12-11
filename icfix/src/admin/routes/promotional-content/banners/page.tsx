import { Container, Heading, Button, Table, Badge, Toast, FocusModal, Input, Label, Select, Checkbox } from "@medusajs/ui"
import { Plus, Pencil, Trash, XMark } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  position: string
  is_active: boolean
  display_order: number
  image_url: string
  link_type: string | null
  link_value: string | null
}

const BannersManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["promotional-banners"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ banners: Banner[] }>(
        "/admin/promotional-content/banners"
      )
      return response
    },
  })

  const banners: Banner[] = data?.banners || []

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/admin/promotional-content/banners/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-banners"] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2">Hero Banners</Heading>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus /> Create Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No banners found. Create your first banner!
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Image</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Position</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {banners.map((banner) => (
              <Table.Row key={banner.id}>
                <Table.Cell>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-20 h-12 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/80x48"
                    }}
                  />
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <div className="font-medium">{banner.title}</div>
                    {banner.subtitle && (
                      <div className="text-sm text-gray-500">{banner.subtitle}</div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{banner.position}</Table.Cell>
                <Table.Cell>{banner.display_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={banner.is_active ? "green" : "grey"}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => setEditingBanner(banner)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleDelete(banner.id)}
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
      <BannerFormModal
        open={isCreateModalOpen || !!editingBanner}
        banner={editingBanner}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingBanner(null)
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["promotional-banners"] })
          setIsCreateModalOpen(false)
          setEditingBanner(null)
        }}
      />
    </div>
  )
}

// Banner Form Modal Component
const BannerFormModal = ({
  open,
  banner,
  onClose,
  onSuccess,
}: {
  open: boolean
  banner?: Banner | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    description: banner?.description || "",
    image_url: banner?.image_url || "",
    mobile_image_url: banner?.mobile_image_url || "",
    position: banner?.position || "hero",
    display_order: banner?.display_order || 1,
    is_active: banner?.is_active ?? true,
    link_type: banner?.link_type || "",
    link_value: banner?.link_value || "",
    button_text: banner?.button_text || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when banner changes
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        description: (banner as any).description || "",
        image_url: banner.image_url || "",
        mobile_image_url: (banner as any).mobile_image_url || "",
        position: banner.position || "hero",
        display_order: banner.display_order || 1,
        is_active: banner.is_active ?? true,
        link_type: banner.link_type || "",
        link_value: banner.link_value || "",
        button_text: (banner as any).button_text || "",
      })
    } else if (!open) {
      // Reset form when modal closes
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        mobile_image_url: "",
        position: "hero",
        display_order: 1,
        is_active: true,
        link_type: "",
        link_value: "",
        button_text: "",
      })
    }
  }, [banner, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = banner
        ? `/admin/promotional-content/banners/${banner.id}`
        : "/admin/promotional-content/banners"

      // Clean up form data: convert empty strings to null for optional fields
      const cleanedData = {
        ...formData,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        mobile_image_url: formData.mobile_image_url || null,
        link_type: formData.link_type || null,
        link_value: formData.link_value || null,
        button_text: formData.button_text || null,
      }

      // SDK automatically handles JSON stringification, so pass the object directly
      const response = await sdk.client.fetch(url, {
        method: "POST",
        body: cleanedData,
      })
      
      if (!response) {
        throw new Error("No response received from server")
      }
      
      onSuccess()
    } catch (error: any) {
      console.error("Error saving banner:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response,
      })
      
      let errorMessage = "Failed to save banner"
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
                  {banner ? "Edit Banner" : "Create Banner"}
                </Heading>
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
                  placeholder="Enter banner title"
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
                  placeholder="Enter banner subtitle"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Image URL *
                  </Label>
                </div>
                <Input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Mobile Image URL
                  </Label>
                </div>
                <Input
                  type="url"
                  value={formData.mobile_image_url}
                  onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                  placeholder="https://example.com/mobile-image.jpg"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Description
                  </Label>
                </div>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter banner description"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Button Text
                  </Label>
                </div>
                <Input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="e.g., Shop Now, Learn More"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Link Type
                  </Label>
                </div>
                <Select
                  value={formData.link_type || ""}
                  onValueChange={(value) => setFormData({ ...formData, link_type: value || null })}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select link type" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="product">Product</Select.Item>
                    <Select.Item value="collection">Collection</Select.Item>
                    <Select.Item value="category">Category</Select.Item>
                    <Select.Item value="external">External URL</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              {formData.link_type && (
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      {formData.link_type === "external" ? "External URL" : `${formData.link_type.charAt(0).toUpperCase() + formData.link_type.slice(1)} Handle/ID`}
                    </Label>
                  </div>
                  <Input
                    type="text"
                    value={formData.link_value}
                    onChange={(e) => setFormData({ ...formData, link_value: e.target.value })}
                    placeholder={
                      formData.link_type === "external"
                        ? "https://example.com"
                        : formData.link_type === "product"
                        ? "product-handle"
                        : formData.link_type === "collection"
                        ? "collection-handle"
                        : "category-handle"
                    }
                  />
                  <p className="text-ui-fg-subtle text-small-regular mt-1">
                    {formData.link_type === "external"
                      ? "Enter the full URL (e.g., https://example.com)"
                      : `Enter the ${formData.link_type} handle (e.g., product-handle, collection-handle)`}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Position *
                  </Label>
                </div>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="hero">Hero</Select.Item>
                    <Select.Item value="homepage">Homepage</Select.Item>
                    <Select.Item value="category">Category</Select.Item>
                    <Select.Item value="product">Product</Select.Item>
                    <Select.Item value="sidebar">Sidebar</Select.Item>
                  </Select.Content>
                </Select>
              </div>

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
                <div className="flex items-end">
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
            </div>
          </FocusModal.Body>

          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button
                  variant="secondary"
                  size="small"
                  type="button"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button
                type="submit"
                size="small"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {banner ? "Save" : "Create"}
              </Button>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default BannersManagement
