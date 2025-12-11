import { Container, Heading, Button, Table, Badge, FocusModal, Input, Label, Checkbox } from "@medusajs/ui"
import { Plus, Pencil, Trash, XMark } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

interface ServiceFeature {
  id: string
  title: string
  description: string | null
  icon_url: string | null
  display_order: number
  is_active: boolean
}

const ServiceFeaturesManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<ServiceFeature | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["promotional-service-features"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ features: ServiceFeature[] }>(
        "/admin/promotional-content/service-features"
      )
      return response
    },
  })

  const features: ServiceFeature[] = data?.features || []

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/admin/promotional-content/service-features/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-service-features"] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service feature?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2">Service Features</Heading>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus /> Create Feature
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : features.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No service features found. Create your first feature!
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Icon</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {features.map((feature) => (
              <Table.Row key={feature.id}>
                <Table.Cell>
                  {feature.icon_url ? (
                    <img
                      src={feature.icon_url}
                      alt={feature.title}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  )}
                </Table.Cell>
                <Table.Cell className="font-medium">{feature.title}</Table.Cell>
                <Table.Cell>{feature.description || "-"}</Table.Cell>
                <Table.Cell>{feature.display_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={feature.is_active ? "green" : "grey"}>
                    {feature.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => setEditingFeature(feature)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleDelete(feature.id)}
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
      {(isCreateModalOpen || editingFeature) && (
        <ServiceFeatureFormModal
          feature={editingFeature}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingFeature(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["promotional-service-features"] })
            setIsCreateModalOpen(false)
            setEditingFeature(null)
          }}
        />
      )}
    </div>
  )
}

// Service Feature Form Modal
const ServiceFeatureFormModal = ({
  feature,
  onClose,
  onSuccess,
}: {
  feature?: ServiceFeature | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [formData, setFormData] = useState({
    title: feature?.title || "",
    description: feature?.description || "",
    icon_url: feature?.icon_url || "",
    display_order: feature?.display_order || 1,
    is_active: feature?.is_active ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title || "",
        description: feature.description || "",
        icon_url: feature.icon_url || "",
        display_order: feature.display_order || 1,
        is_active: feature.is_active ?? true,
      })
    }
  }, [feature])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = feature
        ? `/admin/promotional-content/service-features/${feature.id}`
        : "/admin/promotional-content/service-features"

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
      console.error("Error saving service feature:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response,
      })
      
      let errorMessage = "Failed to save service feature"
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
                  {feature ? "Edit Service Feature" : "Create Service Feature"}
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
                  placeholder="Enter feature title"
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
                  placeholder="Enter feature description"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Icon URL
                  </Label>
                </div>
                <Input
                  type="url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
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

export default ServiceFeaturesManagement

