"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Movie = { id: number; title: string; slug: string }
type Row = { id: number; movie_id: number; day: number }

const days = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 0, label: "Chủ nhật" },
]

export default function AdminSchedule() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [movieId, setMovieId] = useState<number | "">("")
  const [day, setDay] = useState<number>(6)

  async function load() {
    const { data: m } = await supabase
      .from("movies")
      .select("id,title,slug")
      .order("id", { ascending: false })
    setMovies((m as Movie[]) || [])

    const { data: r } = await supabase
      .from("schedule")
      .select("*")
      .order("id", { ascending: false })
    setRows((r as Row[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function add() {
    if (!movieId) return alert("Chọn phim")
    const { error } = await supabase.from("schedule").insert([
      { movie_id: movieId, day },
    ])
    if (error) return alert("Lỗi: " + error.message)
    await load()
    alert("Đã gán lịch!")
  }

  async function del(id: number) {
    if (!confirm("Xóa lịch này?")) return
    const { error } = await supabase.from("schedule").delete().eq("id", id)
    if (error) return alert("Lỗi: " + error.message)
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <div className="text-lg font-black text-cyan-200">Lịch chiếu</div>
        <div className="text-sm text-slate-400">
          Gán phim theo ngày (Thứ 2 → CN). Ngoài trang chủ sẽ show đúng.
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#050a12] border border-white/10 space-y-3">
        <div className="font-bold">Gán lịch</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value ? Number(e.target.value) : "")}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10"
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.slug})
              </option>
            ))}
          </select>

          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10"
          >
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>

          <button
            onClick={add}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-bold hover:bg-cyan-500/30"
          >
            Lưu lịch
          </button>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[#050a12] border border-white/10">
        <div className="font-bold mb-3">Danh sách lịch</div>

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="text-sm">
                <b>ID:</b> {r.id} • <b>movie_id:</b> {r.movie_id} •{" "}
                <b>day:</b> {r.day}
              </div>
              <button
                onClick={() => del(r.id)}
                className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-200 hover:bg-red-500/25 text-sm"
              >
                Xóa
              </button>
            </div>
          ))}
          {!rows.length && <div className="text-sm text-slate-400">Chưa có lịch.</div>}
        </div>
      </div>
    </div>
  )
}