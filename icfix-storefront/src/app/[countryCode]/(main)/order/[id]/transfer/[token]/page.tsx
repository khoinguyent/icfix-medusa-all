import { Heading, Text } from "@medusajs/ui"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <div className="flex flex-col gap-y-6">
        <Heading level="h1" className="text-xl text-zinc-900">
          Transfer request for order {id}
        </Heading>
        <Text className="text-zinc-600">
          You&#39;ve received a request to transfer ownership of your order ({id}).
          Transfer functionality has been removed from this version.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="text-zinc-600">
          Please contact support if you need assistance with order transfers.
        </Text>
      </div>
    </div>
  )
}
