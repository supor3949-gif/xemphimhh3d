"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Movie = {
  id: number
  title: string
  slug: string
  poster: string
  description?: string | null
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function AdminMovies() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Movie[]>([])
  const [q, setQ] = useState("")

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [poster, setPoster] = useState("")
  const [description, setDescription] = useState("")

  // ✅ edit state
  const [editingId, setEditingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter(
      (m) => m.title?.toLowerCase().includes(t) || m.slug?.toLowerCase().includes(t)
    )
  }, [items, q])

  async function load() {
    const { data, error } = await supabase.from("movies").select("*").order("id", { ascending: false })
    if (error) {
      alert("Lỗi load movies: " + error.message)
      return
    }
    setItems((data as Movie[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setTitle("")
    setSlug("")
    setPoster("")
    setDescription("")
    setEditingId(null)
  }

  function startEdit(m: Movie) {
    setEditingId(m.id)
    setTitle(m.title || "")
    setSlug(m.slug || "")
    setPoster(m.poster || "")
    setDescription(m.description || "")
  }

  async function addMovie() {
    if (!title.trim()) return alert("Nhập tên phim")
    const finalSlug = (slug || slugify(title)).trim()
    if (!finalSlug) return alert("Nhập slug")

    setLoading(true)
    const { error } = await supabase.from("movies").insert([
      {
        title: title.trim(),
        slug: finalSlug,
        poster: poster.trim(),
        description: description.trim() || null,
      },
    ])
    setLoading(false)

    if (error) return alert("Lỗi thêm phim: " + error.message)

    resetForm()
    await load()
    alert("Đã thêm phim!")
  }

  async function updateMovie() {
    if (!editingId) return
    if (!title.trim()) return alert("Nhập tên phim")
    const finalSlug = (slug || slugify(title)).trim()
    if (!finalSlug) return alert("Nhập slug")

    setLoading(true)
    const { error } = await supabase
      .from("movies")
      .update({
        title: title.trim(),
        slug: finalSlug,
        poster: poster.trim(),
        description: description.trim() || null,
      })
      .eq("id", editingId)

    setLoading(false)

    if (error) return alert("Lỗi cập nhật: " + error.message)

    resetForm()
    await load()
    alert("✅ Đã cập nhật phim!")
  }

  async function delMovie(id: number) {
    if (!confirm("Xóa phim này?")) return
    const { error } = await supabase.from("movies").delete().eq("id", id)
    if (error) return alert("Lỗi xóa: " + error.message)
    if (editingId === id) resetForm()
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <div className="text-lg font-black text-cyan-200">Quản lý phim</div>
        <div className="text-sm text-slate-400">Thêm phim để hiển thị ngoài trang chủ / lịch / top.</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1 p-5 rounded-xl bg-[#050a12] border border-white/10">
          <div className="font-bold mb-3">{editingId ? "Sửa phim" : "Thêm phim"}</div>

          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!editingId && !slug.trim()) setSlug(slugify(e.target.value))
              }}
              placeholder="Tên phim"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (vd: dau-pha-thuong-khung)"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none"
            />

            <input
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="Poster URL (vd: https://...)"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả (optional)"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none min-h-[110px]"
            />

            {!editingId ? (
              <button
                onClick={addMovie}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-bold hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {loading ? "Đang thêm..." : "Thêm phim"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={updateMovie}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-bold hover:bg-cyan-500/30 disabled:opacity-50"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 font-bold hover:bg-white/10 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 p-5 rounded-xl bg-[#050a12] border border-white/10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-bold">Danh sách phim</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên/slug..."
              className="w-[280px] max-w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((m) => (
              <div key={m.id} className="rounded-xl overflow-hidden bg-black/30 border border-white/10">
                <div className="aspect-[3/4] bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.poster || "/demo/1.jpg"} alt={m.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold line-clamp-2">{m.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.slug}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200 hover:bg-amber-500/25 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => delMovie(m.id)}
                      className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!filtered.length && <div className="text-sm text-slate-400 mt-6">Chưa có phim.</div>}
        </div>
      </div>
    </div>
  )
}