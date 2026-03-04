import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/isAdmin"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const r = await requireAdmin()
  if (!r.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from("movies")
    .select("id, title, slug")
    .order("id", { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: data || [] })
}