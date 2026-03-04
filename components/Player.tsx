// components/Player.tsx
"use client"

import { useMemo, useState } from "react"

export default function Player({ servers }: { servers: any[] }) {
  const list = useMemo(() => servers || [], [servers])
  const [active, setActive] = useState(1)

  const cur = list.find((x) => x.server === active) || list[0]
  const url = cur?.url || ""

  return (
    <div>
      {/* khung 16:9 */}
      <div className="w-full aspect-video bg-black">
        {url ? (
          <iframe
            src={url}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            404 - Video Not Found
            <div className="text-xs text-gray-400 ml-2">
              (Vào Admin → thêm URL tập này cho Server)
            </div>
          </div>
        )}
      </div>

      {/* chọn server */}
      <div className="flex gap-2 p-3 bg-black/20 border-t border-white/10">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${
              (cur?.server || 1) === s
                ? "bg-cyan-500 text-black border-cyan-400/40"
                : "bg-black/30 border-white/10 hover:bg-white/5"
            }`}
          >
            Server {s}
          </button>
        ))}
      </div>
    </div>
  )
}