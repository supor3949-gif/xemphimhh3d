// components/Ranking.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type RankItem = {
  pos: number
  title: string
  slug: string
  poster?: string | null
}

export default function Ranking() {
  const [items, setItems] = useState<RankItem[]>([])

  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/ranking", { cache: "no-store" })
      const json = await res.json()
      setItems(json.items || [])
    })()
  }, [])

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="font-black text-cyan-200 mb-3">Bảng Xếp Hạng</div>

      <div className="space-y-2">
        {items.map((m) => (
          <Link
            key={m.slug}
            href={`/xem/${m.slug}/tap-1`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 hover:text-cyan-200 transition"
          >
            <div className="w-5 text-cyan-300 font-black">{m.pos}</div>

            <div className="w-9 h-12 rounded-md overflow-hidden bg-black/40 border border-white/10 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.poster || "/logo.png"}
                alt={m.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-semibold line-clamp-1">{m.title}</div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{m.slug}</div>
            </div>
          </Link>
        ))}

        {!items.length && <div className="text-sm text-slate-400">Chưa set TOP 10.</div>}
      </div>
    </div>
  )
}