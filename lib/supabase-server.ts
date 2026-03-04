// lib/supabase-server.ts
import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function createSupabaseServer() {
  const cookieStore: any = await cookies()
  const headerStore: any = await headers()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof cookieStore.getAll === "function") return cookieStore.getAll()

          const raw =
            typeof headerStore.get === "function"
              ? headerStore.get("cookie") || ""
              : ""

          if (!raw) return []
          return raw.split(";").map((p: string) => {
            const [name, ...rest] = p.trim().split("=")
            return { name, value: decodeURIComponent(rest.join("=") || "") }
          })
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {}
        },
      },
    }
  )
}