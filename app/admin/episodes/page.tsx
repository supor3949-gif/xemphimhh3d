"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Movie = { id: number; title: string; slug: string }
type EpRow = { id: number; movie_slug: string; ep: number; server: number; url: string }

function cleanUrl(raw: string) {
  const s = (raw || "").trim()
  if (!s) return ""
  // ✅ nếu dán kiểu: "Tập 360|https://...." thì lấy phần sau dấu |
  return s.includes("|") ? (s.split("|").pop() || "").trim() : s
}

export default function AdminEpisodesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [movieSlug, setMovieSlug] = useState("")
  const [ep, setEp] = useState(1)
  const [server, setServer] = useState(1)
  const [url, setUrl] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [list, setList] = useState<EpRow[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ edit state
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: m, error } = await supabase.from("movies").select("id,title,slug").order("id", { ascending: false })
      if (error) {
        alert("Lỗi load movies: " + error.message)
        return
      }
      setMovies((m || []) as any)
      if (!movieSlug && m?.[0]?.slug) setMovieSlug(m[0].slug)
    })()
  }, [])

  async function loadEpisodes(slug: string) {
    const { data, error } = await supabase
      .from("episodes")
      .select("id,movie_slug,ep,server,url")
      .eq("movie_slug", slug)
      .order("ep", { ascending: true })
      .order("server", { ascending: true })

    if (error) {
      alert("Lỗi load episodes: " + error.message)
      return
    }
    setList((data || []) as any)
  }

  useEffect(() => {
    if (movieSlug) loadEpisodes(movieSlug)
  }, [movieSlug])

  function resetForm() {
    setEditingId(null)
    setEp(1)
    setServer(1)
    setUrl("")
  }

  function startEdit(x: EpRow) {
    setEditingId(x.id)
    setEp(Number(x.ep) || 1)
    setServer(Number(x.server) || 1)
    setUrl(x.url || "")
  }

  async function addEpisode() {
    setMsg(null)
    const finalUrl = cleanUrl(url)
    if (!movieSlug || !finalUrl) return

    setLoading(true)
    const { error } = await supabase.from("episodes").insert({
      movie_slug: movieSlug,
      ep: Number(ep),
      server: Number(server),
      url: finalUrl, // ✅ đã clean
    })
    setLoading(false)

    if (error) {
      setMsg("Lỗi thêm tập: " + error.message)
      return
    }

    setUrl("")
    setMsg("✅ Đã thêm tập thành công")
    await loadEpisodes(movieSlug)
  }

  async function updateEpisode() {
    if (!editingId) return
    setMsg(null)
    const finalUrl = cleanUrl(url)
    if (!finalUrl) return

    setLoading(true)
    const { error } = await supabase
      .from("episodes")
      .update({
        ep: Number(ep),
        server: Number(server),
        url: finalUrl,
      })
      .eq("id", editingId)

    setLoading(false)

    if (error) {
      setMsg("Lỗi cập nhật: " + error.message)
      return
    }

    setMsg("✅ Đã cập nhật tập")
    resetForm()
    await loadEpisodes(movieSlug)
  }

  async function delEpisode(id: number) {
    if (!confirm("Xóa tập này?")) return
    const { error } = await supabase.from("episodes").delete().eq("id", id)
    if (error) return alert("Lỗi xóa tập: " + error.message)
    if (editingId === id) resetForm()
    await loadEpisodes(movieSlug)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 p-6">
      <div className="text-2xl font-extrabold text-cyan-300">Admin / Episodes</div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-bold mb-3">{editingId ? "Sửa tập" : "Thêm tập"}</div>

          <div className="space-y-3">
            <select
              value={movieSlug}
              onChange={(e) => setMovieSlug(e.target.value)}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.title} ({m.slug})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={ep}
                onChange={(e) => setEp(Number(e.target.value))}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                placeholder="Tập"
              />
              <input
                type="number"
                value={server}
                onChange={(e) => setServer(Number(e.target.value))}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                placeholder="Server"
              />
            </div>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
              placeholder="Link video (url) — dán dạng 'Tập 360|https://...' cũng OK"
            />

            {msg ? <div className="text-sm text-rose-200">{msg}</div> : null}

            {!editingId ? (
              <button
                onClick={addEpisode}
                disabled={loading || !movieSlug || !url.trim()}
                className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Đang thêm..." : "Thêm tập"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={updateEpisode}
                  disabled={loading}
                  className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 font-bold text-gray-200 hover:bg-white/15 disabled:opacity-60"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="font-bold mb-3">Danh sách tập ({movieSlug})</div>

          <div className="space-y-2">
            {list.map((x) => (
              <div key={x.id} className="rounded-lg bg-black/20 border border-white/10 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold">
                    Tập {x.ep} — Server {x.server}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(x)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200 hover:bg-amber-500/25 text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => delEpisode(x.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25 text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="break-all text-gray-300 mt-1">{x.url}</div>
              </div>
            ))}
            {!list.length ? <div className="text-gray-400 text-sm">Chưa có tập</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}