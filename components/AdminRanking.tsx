"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Movie = { id: number; title: string; slug: string; poster: string | null }
type RankRow = { id: number; position: number; movie_slug: string }

export default function AdminRanking() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [rank, setRank] = useState<RankRow[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")

  const movieMap = useMemo(() => {
    const m = new Map<string, Movie>()
    movies.forEach((x) => m.set(x.slug, x))
    return m
  }, [movies])

  const filteredMovies = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return movies
    return movies.filter(
      (m) => m.title?.toLowerCase().includes(t) || m.slug?.toLowerCase().includes(t)
    )
  }, [movies, q])

  async function loadAll() {
    const { data: m, error: me } = await supabase
      .from("movies")
      .select("id,title,slug,poster")
      .order("id", { ascending: false })

    if (me) return alert("Lỗi load movies: " + me.message)

    const { data: r, error: re } = await supabase
      .from("rankings")
      .select("id,position,movie_slug")
      .order("position", { ascending: true })

    if (re) return alert("Lỗi load rankings: " + re.message)

    setMovies((m || []) as any)
    setRank((r || []) as any)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function getSelectedSlug(position: number) {
    return rank.find((x) => x.position === position)?.movie_slug || ""
  }

  async function setPosition(position: number, movie_slug: string) {
    setLoading(true)

    // nếu position đã có -> update, chưa có -> insert
    const exist = rank.find((x) => x.position === position)

    let err: any = null
    if (!movie_slug) {
      // clear slot
      if (exist) {
        const { error } = await supabase.from("rankings").delete().eq("id", exist.id)
        err = error
      }
    } else {
      if (exist) {
        const { error } = await supabase
          .from("rankings")
          .update({ movie_slug })
          .eq("id", exist.id)
        err = error
      } else {
        const { error } = await supabase.from("rankings").insert({ position, movie_slug })
        err = error
      }
    }

    setLoading(false)
    if (err) return alert("Lỗi lưu ranking: " + err.message)
    await loadAll()
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <div className="text-lg font-black text-cyan-200">Ranking TOP 10</div>
        <div className="text-sm text-slate-400">
          Chọn phim cho từng vị trí 1 → 10 (public đọc để hiển thị ngoài trang chủ).
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* LEFT: set positions */}
        <div className="p-5 rounded-xl bg-[#050a12] border border-white/10 space-y-3">
          <div className="font-bold mb-2">Chọn TOP 10</div>

          {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
            <div key={pos} className="flex items-center gap-3">
              <div className="w-10 text-center font-black text-cyan-300">#{pos}</div>
              <select
                value={getSelectedSlug(pos)}
                onChange={(e) => setPosition(pos, e.target.value)}
                disabled={loading}
                className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
              >
                <option value="">(Trống)</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.title} ({m.slug})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setPosition(pos, "")}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25 text-sm"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT: preview */}
        <div className="p-5 rounded-xl bg-[#050a12] border border-white/10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-bold">Preview TOP 10</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm phim..."
              className="w-[260px] max-w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rank
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((r) => {
                const m = movieMap.get(r.movie_slug)
                return (
                  <div key={r.id} className="rounded-xl overflow-hidden bg-black/30 border border-white/10">
                    <div className="aspect-[3/4] bg-black/40 relative">
                      <div className="absolute top-2 left-2 z-10 text-xs font-black bg-cyan-500 text-black px-2 py-1 rounded">
                        #{r.position}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m?.poster || "/logo.png"}
                        alt={m?.title || r.movie_slug}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-bold line-clamp-2">{m?.title || r.movie_slug}</div>
                      <div className="text-xs text-slate-400 mt-1">{r.movie_slug}</div>
                    </div>
                  </div>
                )
              })}

            {!rank.length && <div className="text-sm text-slate-400">Chưa set TOP 10.</div>}
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Tip: trang chủ chỉ cần query bảng <b>rankings</b> là ra TOP 10.
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-black/20 border border-white/10 text-sm text-slate-300">
        <div className="font-bold text-cyan-200">Danh sách phim (lọc nhanh)</div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMovies.slice(0, 12).map((m) => (
            <div key={m.id} className="rounded-xl overflow-hidden bg-black/30 border border-white/10">
              <div className="aspect-[3/4] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.poster || "/logo.png"} className="w-full h-full object-cover" alt={m.title} />
              </div>
              <div className="p-3">
                <div className="text-sm font-bold line-clamp-2">{m.title}</div>
                <div className="text-xs text-slate-400 mt-1">{m.slug}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}