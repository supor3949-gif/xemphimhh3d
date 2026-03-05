import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("id, aff_hit_rate, aff_cooldown_minutes, aff_max_per_day")
    .eq("id", 1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const patch = {
    aff_hit_rate: Number(body.aff_hit_rate),
    aff_cooldown_minutes: Number(body.aff_cooldown_minutes),
    aff_max_per_day: Number(body.aff_max_per_day),
  }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .update(patch)
    .eq("id", 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}