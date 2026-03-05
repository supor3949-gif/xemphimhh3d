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
  const provider = searchParams.get("provider") || "default"

  // settings
  const { data: st } = await sb
    .from("site_settings")
    .select("aff_hit_rate, aff_cooldown_minutes, aff_max_per_day")
    .eq("id", 1)
    .maybeSingle()

  const hitRate = Number(st?.aff_hit_rate ?? 0.35)
  const cooldownMin = Number(st?.aff_cooldown_minutes ?? 30)
  const maxPerDay = Number(st?.aff_max_per_day ?? 3)

  // cookie state
  const ck = cookies()
  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)

  const last = Number(ck.get("aff_last")?.value || "0")
  const day = ck.get("aff_day")?.value || ""
  let count = Number(ck.get("aff_count")?.value || "0")

  if (day !== today) count = 0

  const cooldownMs = cooldownMin * 60 * 1000
  const inCooldown = last && now - last < cooldownMs
  const overDay = count >= maxPerDay

  // helper set cookie
  const resNo = NextResponse.json({ go: false })
  resNo.cookies.set("aff_day", today, { path: "/", maxAge: 60 * 60 * 24 * 30 })
  resNo.cookies.set("aff_count", String(count), { path: "/", maxAge: 60 * 60 * 24 * 30 })

  if (inCooldown || overDay) return resNo

  // random
  const goRandom = Math.random() < hitRate
  if (!goRandom) return resNo

  // get enabled links
  const { data: links } = await sb
    .from("aff_links")
    .select("url,key,weight")
    .eq("enabled", true)
    .limit(100)

  const pool = (links || [])
    .filter((x: any) => x?.url)
    .flatMap((x: any) => Array(Math.max(1, Number(x.weight || 1))).fill(x))

  const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
  if (!pick?.url) return resNo

  // build url
  const affUrl = String(pick.url)
    .replaceAll("{next}", encodeURIComponent(next))
    .replaceAll("{provider}", encodeURIComponent(provider))

  count += 1

  const res = NextResponse.json({ go: true, url: affUrl, key: pick.key })
  res.cookies.set("aff_last", String(now), { path: "/", maxAge: 60 * 60 * 24 * 30 })
  res.cookies.set("aff_day", today, { path: "/", maxAge: 60 * 60 * 24 * 30 })
  res.cookies.set("aff_count", String(count), { path: "/", maxAge: 60 * 60 * 24 * 30 })
  return res
}