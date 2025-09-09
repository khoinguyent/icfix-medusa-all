// in icfix-storefront/src/app/api/revalidate/route.ts
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  // Check for a secret token to prevent unauthorized access
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return new NextResponse("Invalid token", { status: 401 })
  }

  // Get the path to revalidate from the request body
  const body = await request.json()
  const path = body.path

  if (!path) {
    return new NextResponse("Path is required", { status: 400 })
  }

  try {
    // Revalidate the specified path
    revalidatePath(path)
    return new NextResponse(`Revalidated path: ${path}`)
  } catch (err: any) {
    return new NextResponse(`Error revalidating: ${err.message}`, { status: 500 })
  }
}