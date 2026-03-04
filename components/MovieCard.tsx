"use client"

// components/MovieCard.tsx
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { affWrap } from "@/lib/aff"
import { Play, Flame } from "lucide-react"

export default function MovieCard({ movie }: any) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  // ✅ link xem phim chuẩn
  const href = `/xem/${movie.slug}/tap-1`

  // ✅ link AFF (thường là /api/aff?... hoặc 1 url)
  const go = affWrap(href, "tiktok")

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      // để chắc chắn click không bị double
      if (busy) return
      setBusy(true)

      try {
        // ✅ Bọc AFF ẩn nút:
        // - Mở AFF ở TAB mới (không phá điều hướng)
        // - Nếu affWrap của em trả về route nội bộ /api/aff... thì mở route đó
        // - Nếu trả về url ngoài thì cũng ok
        if (go && typeof window !== "undefined") {
          window.open(go, "_blank", "noopener,noreferrer")
        }
      } catch {}

      // ✅ Luôn điều hướng sang trang xem phim
      e.preventDefault()
      router.push(href)

      setBusy(false)
    },
    [busy, go, href, router]
  )

  return (
    // ⚠️ quan trọng: Link phải trỏ về href thật (trang xem phim)
    <Link
      href={href}
      onClick={onClick}
      className="group block relative p-[1.5px] rounded-2xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03]"
    >
      {/* 1. Hạt lấp lánh bay lơ lửng (Particles) - Chỉ hiện khi hover */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-0 left-1/4 w-1 h-1 bg-pink-500 rounded-full animate-ping delay-100" />
        <div className="absolute bottom-1/4 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-500" />
        <div className="absolute top-1/2 left-2 w-1 h-1 bg-white rounded-full animate-bounce" />
      </div>

      {/* 2. Viền Neon chạy sáng đa sắc rực rỡ */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-[-150%] animate-spin-slow"
          style={{
            backgroundImage:
              "conic-gradient(from 0deg at 50% 50%, transparent 0%, #ff0080 15%, #00eaff 35%, transparent 50%)",
            animation: "spin 2.5s linear infinite",
          }}
        />
      </div>

      {/* 3. Hào quang phát sáng (Glow Aura) đa tầng */}
      <div className="absolute inset-[-10px] -z-10 bg-gradient-to-br from-pink-600/20 via-cyan-500/20 to-purple-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110" />

      {/* 4. Nội dung Card chính */}
      <div className="relative z-10 rounded-[14px] overflow-hidden bg-zinc-950/90 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* Tia sáng phản chiếu quét ngang cực nhanh */}
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />

          <img
            src={movie.poster || "/logo.png"}
            alt={movie.title}
            className="w-full h-full object-cover transform transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-[1.5deg]"
          />

          {/* Lớp phủ Xem ngay với hiệu ứng mờ ảo (Frosted Glass) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-3 translate-y-10 group-hover:translate-y-0 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 p-[2px] animate-pulse">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-white">
                  <Play
                    fill="currentColor"
                    size={28}
                    className="ml-1 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  />
                </div>
                {/* Vòng tròn sóng âm lan tỏa từ nút Play */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-20" />
              </div>
              <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                Xem Ngay
              </span>
            </div>
          </div>

          {/* Nhãn dán Hot/Trending */}
          <div className="absolute top-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-orange-500 text-white p-1 rounded-full animate-bounce">
              <Flame size={14} fill="currentColor" />
            </div>
          </div>

          {/* Badges Neon sắc nét */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-40">
            {movie.ep && (
              <span className="text-[10px] font-black bg-pink-600 text-white px-2.5 py-1 rounded shadow-[0_0_15px_rgba(255,0,128,0.5)]">
                {movie.ep}
              </span>
            )}
            {movie.quality && (
              <span className="text-[10px] font-black bg-cyan-500 text-black px-2.5 py-1 rounded shadow-[0_0_15px_rgba(0,234,255,0.5)]">
                {movie.quality}
              </span>
            )}
          </div>
        </div>

        {/* Tiêu đề với hiệu ứng Gradient rực rỡ */}
        <div className="p-4 relative">
          <div className="text-[15px] font-bold leading-tight line-clamp-2 text-zinc-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-cyan-300 transition-all duration-500">
            {movie.title}
          </div>
          <div className="mt-2 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-700" />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
        }}
      />
    </Link>
  )
}