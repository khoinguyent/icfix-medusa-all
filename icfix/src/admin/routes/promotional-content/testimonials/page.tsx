import { Container, Heading, Button, Table, Badge, FocusModal, Input, Label, Checkbox, Select, Textarea } from "@medusajs/ui"
import { Plus, Pencil, Trash, XMark } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

interface Testimonial {
  id: string
  customer_name: string
  customer_title: string | null
  customer_avatar_url: string | null
  rating: number
  comment: string
  display_order: number
  is_active: boolean
}

const TestimonialsManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["promotional-testimonials"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ testimonials: Testimonial[] }>(
        "/admin/promotional-content/testimonials"
      )
      return response
    },
  })

  const testimonials: Testimonial[] = data?.testimonials || []

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/admin/promotional-content/testimonials/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotional-testimonials"] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2">Customer Testimonials</Heading>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus /> Create Testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No testimonials found. Create your first testimonial!
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Rating</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {testimonials.map((testimonial) => (
              <Table.Row key={testimonial.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {testimonial.customer_avatar_url ? (
                      <img
                        src={testimonial.customer_avatar_url}
                        alt={testimonial.customer_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    )}
                    <div>
                      <div className="font-medium">{testimonial.customer_name}</div>
                      {testimonial.customer_title && (
                        <div className="text-sm text-gray-500">{testimonial.customer_title}</div>
                      )}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell className="max-w-md">
                  <p className="truncate">{testimonial.comment}</p>
                </Table.Cell>
                <Table.Cell>{testimonial.display_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={testimonial.is_active ? "green" : "grey"}>
                    {testimonial.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => setEditingTestimonial(testimonial)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleDelete(testimonial.id)}
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
      {(isCreateModalOpen || editingTestimonial) && (
        <TestimonialFormModal
          testimonial={editingTestimonial}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingTestimonial(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["promotional-testimonials"] })
            setIsCreateModalOpen(false)
            setEditingTestimonial(null)
          }}
        />
      )}
    </div>
  )
}

// Testimonial Form Modal
const TestimonialFormModal = ({
  testimonial,
  onClose,
  onSuccess,
}: {
  testimonial?: Testimonial | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [formData, setFormData] = useState({
    customer_name: testimonial?.customer_name || "",
    customer_title: testimonial?.customer_title || "",
    customer_avatar_url: testimonial?.customer_avatar_url || "",
    rating: testimonial?.rating || 5,
    comment: testimonial?.comment || "",
    display_order: testimonial?.display_order || 1,
    is_active: testimonial?.is_active ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (testimonial) {
      setFormData({
        customer_name: testimonial.customer_name || "",
        customer_title: testimonial.customer_title || "",
        customer_avatar_url: testimonial.customer_avatar_url || "",
        rating: testimonial.rating || 5,
        comment: testimonial.comment || "",
        display_order: testimonial.display_order || 1,
        is_active: testimonial.is_active ?? true,
      })
    }
  }, [testimonial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = testimonial
        ? `/admin/promotional-content/testimonials/${testimonial.id}`
        : "/admin/promotional-content/testimonials"

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
      console.error("Error saving testimonial:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response,
      })
      
      let errorMessage = "Failed to save testimonial"
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
                  {testimonial ? "Edit Testimonial" : "Create Testimonial"}
                </Heading>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Customer Name *
                    </Label>
                  </div>
                  <Input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Customer Title
                    </Label>
                  </div>
                  <Input
                    type="text"
                    value={formData.customer_title}
                    onChange={(e) => setFormData({ ...formData, customer_title: e.target.value })}
                    placeholder="Enter customer title"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Avatar URL
                  </Label>
                </div>
                <Input
                  type="url"
                  value={formData.customer_avatar_url}
                  onChange={(e) => setFormData({ ...formData, customer_avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Rating *
                  </Label>
                </div>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="1">1 Star</Select.Item>
                    <Select.Item value="2">2 Stars</Select.Item>
                    <Select.Item value="3">3 Stars</Select.Item>
                    <Select.Item value="4">4 Stars</Select.Item>
                    <Select.Item value="5">5 Stars</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <div className="flex items-center gap-x-1">
                  <Label size="small" weight="plus">
                    Comment *
                  </Label>
                </div>
                <Textarea
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Enter testimonial comment"
                  rows={4}
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

export default TestimonialsManagement

