import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/isAdmin"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const r = await requireAdmin()
  if (!r.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { data } = await supabaseAdmin.from("aff_links").select("*").order("created_at", { ascending: false })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: Request) {
  const r = await requireAdmin()
  if (!r.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from("aff_links")
    .upsert(
      { key: body.key, url: body.url, enabled: body.enabled ?? true },
      { onConflict: "key" }
    )
    .select("*")

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}