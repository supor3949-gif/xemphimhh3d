import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = "force-dynamic"

function parseCookieHeader(cookieHeader: string | null) {
  const out: Record<string, string> = {}
  if (!cookieHeader) return out
  const parts = cookieHeader.split(";")
  for (const p of parts) {
    const idx = p.indexOf("=")
    if (idx === -1) continue
    const k = p.slice(0, idx).trim()
    const v = p.slice(idx + 1).trim()
    out[k] = decodeURIComponent(v)
  }
  return out
}

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

  // đọc cookie từ header (tránh lỗi cookies() trên turbopack)
  const c = parseCookieHeader(req.headers.get("cookie"))
  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)

  const last = Number(c["aff_last"] || "0")
  const day = c["aff_day"] || ""
  let count = Number(c["aff_count"] || "0")

  if (day !== today) count = 0

  const cooldownMs = cooldownMin * 60 * 1000
  const inCooldown = last && now - last < cooldownMs
  const overDay = count >= maxPerDay

  const base = {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  } as const

  // helper response go=false
  const resNo = NextResponse.json({ go: false })
  resNo.cookies.set("aff_day", today, base)
  resNo.cookies.set("aff_count", String(count), base)

  if (inCooldown || overDay) return resNo

  const goRandom = Math.random() < hitRate
  if (!goRandom) return resNo

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

  const affUrl = String(pick.url)
    .replaceAll("{next}", encodeURIComponent(next))
    .replaceAll("{provider}", encodeURIComponent(provider))

  count += 1

  const res = NextResponse.json({ go: true, url: affUrl, key: pick.key })
  res.cookies.set("aff_last", String(now), base)
  res.cookies.set("aff_day", today, base)
  res.cookies.set("aff_count", String(count), base)
  return res
}