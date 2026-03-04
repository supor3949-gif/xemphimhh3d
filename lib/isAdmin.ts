// lib/isAdmin.ts
import { createSupabaseServer } from "@/lib/supabase-server"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export async function requireAdmin() {
  const sb = await createSupabaseServer()
  const { data } = await sb.auth.getUser()
  const user = data.user

  if (!user) return { ok: false as const, user: null }

  const email = (user.email || "").toLowerCase()
  const ok = ADMIN_EMAILS.length ? ADMIN_EMAILS.includes(email) : false

  return { ok, user }
}