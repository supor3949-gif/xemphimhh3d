// app/phim/[slug]/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

type Movie = {
  id: number
  title: string
  slug: string
  poster?: string | null
  description?: string | null
}

export default async function Page({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const slug = params?.slug
  if (!slug) redirect("/")

  const { data } = await supabase
    .from("movies")
    .select("id,title,slug,poster,description")
    .eq("slug", slug)
    .maybeSingle()

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-200 p-10">
        <div className="text-2xl font-black text-rose-300">404</div>
        <div className="mt-2 text-gray-300">Không tìm thấy phim.</div>
      </div>
    )
  }

  const m = data as Movie

  // tuỳ em muốn redirect qua trang xem tập 1
  redirect(`/xem/${m.slug}/tap-1`)
}