import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const next = searchParams.get("next") || "/"

  const { data: st } = await sb
    .from("site_settings")
    .select("aff_hit_rate, aff_cooldown_minutes, aff_max_per_day")
    .eq("id", 1)
    .maybeSingle()

  const hitRate = Number(st?.aff_hit_rate ?? 0.35)
  const cooldownMin = Number(st?.aff_cooldown_minutes ?? 30)
  const maxPerDay = Number(st?.aff_max_per_day ?? 3)

  // ✅ Next 16: cookies() là async -> phải await
  const ck = await cookies()

  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)

  const last = Number(ck.get("aff_last")?.value || "0")
  const day = ck.get("aff_day")?.value || ""
  let count = Number(ck.get("aff_count")?.value || "0")

  if (day !== today) count = 0

  const cooldownMs = cooldownMin * 60 * 1000
  const inCooldown = last && now - last < cooldownMs
  const overDay = count >= maxPerDay

  if (inCooldown || overDay) {
    const res = NextResponse.json({ go: false })
    res.cookies.set("aff_day", today, { path: "/", maxAge: 60 * 60 * 24 * 30 })
    res.cookies.set("aff_count", String(count), { path: "/", maxAge: 60 * 60 * 24 * 30 })
    return res
  }

  const go = Math.random() < hitRate
  if (!go) {
    const res = NextResponse.json({ go: false })
    res.cookies.set("aff_day", today, { path: "/", maxAge: 60 * 60 * 24 * 30 })
    res.cookies.set("aff_count", String(count), { path: "/", maxAge: 60 * 60 * 24 * 30 })
    return res
  }

  const { data: links } = await sb
    .from("aff_links")
    .select("url,key")
    .eq("enabled", true)
    .limit(20)

  const pick = (links || [])[Math.floor(Math.random() * (links?.length || 1))]
  if (!pick?.url) return NextResponse.json({ go: false })

  const affUrl = String(pick.url).replaceAll("{next}", encodeURIComponent(next))

  count += 1

  const res = NextResponse.json({ go: true, url: affUrl })
  res.cookies.set("aff_last", String(now), { path: "/", maxAge: 60 * 60 * 24 * 30 })
  res.cookies.set("aff_day", today, { path: "/", maxAge: 60 * 60 * 24 * 30 })
  res.cookies.set("aff_count", String(count), { path: "/", maxAge: 60 * 60 * 24 * 30 })
  return res
}