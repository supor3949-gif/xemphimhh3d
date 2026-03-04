import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/isAdmin"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const r = await requireAdmin()
  if (!r.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { data } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle()
  return NextResponse.json({ data })
}

export async function PATCH(req: Request) {
  const r = await requireAdmin()
  if (!r.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .update({
      aff_hit_rate: body.aff_hit_rate,
      aff_cooldown_minutes: body.aff_cooldown_minutes,
      aff_max_per_day: body.aff_max_per_day,
      aff_default_provider: body.aff_default_provider,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("*")
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}