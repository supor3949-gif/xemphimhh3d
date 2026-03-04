"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function Item({
  href,
  label,
  sub,
}: {
  href: string
  label: string
  sub?: string
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition",
        active
          ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
          : "bg-white/0 border-white/10 text-slate-200 hover:bg-white/5 hover:border-white/20",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="font-bold text-[14px] leading-tight">{label}</div>
        {sub ? (
          <div className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
            {sub}
          </div>
        ) : null}
      </div>

      <div
        className={[
          "h-2 w-2 rounded-full",
          active ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.65)]" : "bg-white/15",
        ].join(" ")}
      />
    </Link>
  )
}

export default function AdminSidebar() {
  return (
    <aside className="w-full lg:w-[280px] shrink-0">
      <div className="sticky top-6">
        {/* Brand */}
        <div className="rounded-2xl p-4 bg-gradient-to-b from-[#071326] to-[#050a12] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="text-[12px] text-slate-400">HH3D PRO ADMIN</div>
          <div className="text-xl font-black tracking-wide text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
            XEMPHIMHH3D
          </div>
          <div className="text-[12px] text-slate-400 mt-1">
            Quản lý phim • tập • lịch • top • AFF
          </div>
        </div>

        {/* Menu */}
        <div className="mt-4 space-y-2">
          <Item
            href="/admin"
            label="Dashboard"
            sub="Tổng quan nhanh"
          />
          <Item
            href="/admin/movies"
            label="Movies"
            sub="Thêm / sửa phim"
          />
          <Item
            href="/admin/episodes"
            label="Episodes"
            sub="Server 1 / 2 / 3 theo tập"
          />
          <Item
            href="/admin/schedule"
            label="Schedule"
            sub="Lịch Thứ 2 → CN"
          />
          <Item
            href="/admin/ranking"
            label="Ranking"
            sub="Top 10 bảng xếp hạng"
          />
          <Item
            href="/admin/aff"
            label="AFF Links"
            sub="TikTok / Shopee / Link nhảy"
          />
        </div>

        {/* Footer box */}
        <div className="mt-4 rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="text-[12px] text-slate-300 font-bold">
            Gợi ý:
          </div>
          <div className="text-[12px] text-slate-400 mt-1 leading-relaxed">
            Nhập phim ở <b>Movies</b> → nhập tập ở <b>Episodes</b> → set lịch ở{" "}
            <b>Schedule</b> → set <b>Top</b> ở <b>Ranking</b>.
          </div>
        </div>
      </div>
    </aside>
  )
}