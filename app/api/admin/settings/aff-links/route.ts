import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("aff_links")
    .select("id,key,url,enabled,weight,created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    key: String(body.key || "").trim(),
    url: String(body.url || "").trim(),
    enabled: Boolean(body.enabled),
    weight: Number(body.weight || 1),
  }

  const { error } = await supabaseAdmin.from("aff_links").insert(row)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const id = String(body.id)
  const patch: any = {}
  if (body.key !== undefined) patch.key = String(body.key).trim()
  if (body.url !== undefined) patch.url = String(body.url).trim()
  if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled)
  if (body.weight !== undefined) patch.weight = Number(body.weight || 1)

  const { error } = await supabaseAdmin.from("aff_links").update(patch).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("aff_links").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}