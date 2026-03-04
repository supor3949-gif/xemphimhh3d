// app/go/[provider]/route.ts
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params

  // TODO: giữ logic redirect/aff/cooldown của em ở đây
  // demo:
  return NextResponse.redirect(new URL("/", req.url))
}