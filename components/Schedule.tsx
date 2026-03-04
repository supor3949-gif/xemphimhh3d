"use client"

import { useMemo, useState } from "react"
import MovieCard from "@/components/MovieCard"

const days = [
  { id: 1, label: "Thứ 2", sub: "Monday" },
  { id: 2, label: "Thứ 3", sub: "Tuesday" },
  { id: 3, label: "Thứ 4", sub: "Wednesday" },
  { id: 4, label: "Thứ 5", sub: "Thursday" },
  { id: 5, label: "Thứ 6", sub: "Friday" },
  { id: 6, label: "Thứ 7", sub: "Saturday" },
  { id: 0, label: "Chủ nhật", sub: "Sunday" },
]

export default function Schedule({ schedule }: { schedule: any[] }) {
  const vnDayStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
  const today = new Date(vnDayStr)
  const dayId = today.getDay() // CN=0 ... T7=6

  const [active, setActive] = useState(dayId)

  const list = useMemo(() => {
    return (schedule || [])
      .filter((x) => x.day === active)
      .map((x) => x.movie)
      .filter(Boolean)
  }, [schedule, active])

  const dateText = today.toLocaleDateString("vi-VN")

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#a5f3fc] uppercase tracking-wider">
          Lịch Phim
        </h2>
        <div className="bg-[#1e293b] px-3 py-1 rounded text-sm text-pink-400">
          Hôm nay: {days.find((d) => d.id === dayId)?.label}, {dateText}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6 bg-[#1e293b]/50 p-1 rounded-lg">
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`flex flex-col items-center py-3 cursor-pointer transition-all rounded-md ${
              active === d.id
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                : "hover:bg-[#334155] text-gray-400"
            }`}
          >
            <span className="font-bold text-sm">{d.label}</span>
            <span className="text-[10px] opacity-80 uppercase">{d.sub}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8">
        {list.map((m: any) => (
          <MovieCard
            key={m.slug}
            movie={{
              title: m.title,
              slug: m.slug,
              poster: m.poster,
              ep: "Tập 1",
              quality: "TM-VS",
            }}
          />
        ))}
      </div>
    </div>
  )
}