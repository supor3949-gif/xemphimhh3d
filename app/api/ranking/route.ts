// app/api/ranking/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1) lấy ranking
  const { data: r, error: re } = await supabase
    .from("rankings")
    .select("position,movie_slug")
    .order("position", { ascending: true })
    .limit(10)

  if (re) {
    return NextResponse.json({ items: [], error: re.message }, { status: 200 })
  }

  const slugs = (r || []).map((x) => x.movie_slug).filter(Boolean)
  if (!slugs.length) return NextResponse.json({ items: [] }, { status: 200 })

  // 2) lấy movie info (KHÔNG select ep)
  const { data: m, error: me } = await supabase
    .from("movies")
    .select("slug,title,poster") // ✅ chỉ lấy cột có thật
    .in("slug", slugs)

  if (me) {
    return NextResponse.json({ items: [], error: me.message }, { status: 200 })
  }

  const map = new Map<string, any>()
  ;(m || []).forEach((x) => map.set(x.slug, x))

  // 3) trả về đúng thứ tự position
  const items = (r || [])
    .sort((a, b) => a.position - b.position)
    .map((x) => {
      const mv = map.get(x.movie_slug)
      return {
        pos: x.position,
        slug: x.movie_slug,
        title: mv?.title || x.movie_slug,
        poster: mv?.poster || null,
      }
    })

  return NextResponse.json({ items }, { status: 200 })
}