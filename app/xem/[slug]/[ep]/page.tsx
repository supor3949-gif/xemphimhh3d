// app/xem/[slug]/[ep]/page.tsx
import Header from "@/components/Header"
import Player from "@/components/Player"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function epToNumber(ep: string) {
  const m = ep.match(/(\d+)/)
  return m ? Number(m[1]) : 1
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; ep: string }> | { slug: string; ep: string }
}) {
  const p: any = typeof (params as any)?.then === "function" ? await (params as any) : params
  const slug = p.slug
  const epStr = p.ep
  const epNum = epToNumber(epStr)

  const { data: movie } = await supabase
    .from("movies")
    .select("title, slug, poster, description")
    .eq("slug", slug)
    .maybeSingle()

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans">
        <Header />
        <div className="max-w-[1400px] mx-auto p-10 text-center">
          <div className="text-6xl font-black">404</div>
          <div className="text-gray-400 mt-2">Không tìm thấy phim</div>
        </div>
      </div>
    )
  }

  const { data: eps, error } = await supabase
    .from("episodes")
    .select("ep, server, url")
    .eq("movie_slug", slug)
    .order("ep", { ascending: true })
    .order("server", { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans">
        <Header />
        <div className="max-w-[1400px] mx-auto p-10 text-center">
          <div className="text-5xl font-black text-pink-300">DB Error</div>
          <div className="text-gray-300 mt-2">Không đọc được bảng episodes</div>
          <div className="text-rose-300 mt-2 text-sm">error: {error.message}</div>
        </div>
      </div>
    )
  }

  const maxEp = Math.max(1, ...(eps || []).map((x: any) => x.ep || 1))
  const epList = Array.from({ length: maxEp }, (_, i) => i + 1)

  const curServers =
    (eps || [])
      .filter((x: any) => x.ep === epNum)
      .sort((a: any, b: any) => (a.server || 0) - (b.server || 0)) || []

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans">
      <Header />

      <main className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 p-6">
        <aside className="col-span-12 lg:col-span-2">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="font-bold mb-3">Tập phim</div>

            {epList.length ? (
              <div className="flex flex-wrap gap-2">
                {epList.map((n) => (
                  <a
                    key={n}
                    href={`/xem/${slug}/tap-${n}`}
                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition ${
                      n === epNum
                        ? "bg-cyan-500 text-black border-cyan-400/40"
                        : "bg-black/20 border-white/10 hover:bg-white/5"
                    }`}
                  >
                    {n}
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Chưa có tập.</div>
            )}
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-7">
          <div className="text-xl font-extrabold mb-3">{movie.title}</div>

          <div className="rounded-xl overflow-hidden bg-black/30 border border-white/10">
            <Player servers={curServers} />
          </div>

          {movie.description ? (
            <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="font-bold text-cyan-300 mb-2">Mô tả</div>
              <div className="text-sm text-gray-300 whitespace-pre-line">{movie.description}</div>
            </div>
          ) : null}
        </section>

        <aside className="col-span-12 lg:col-span-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="font-extrabold">{movie.title}</div>
            <div className="text-sm text-gray-400 mt-1">Tổng tập: {maxEp}</div>

            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/20">
              <img src={movie.poster || "/logo.png"} className="w-full aspect-[2/3] object-cover" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}