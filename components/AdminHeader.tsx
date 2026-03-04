import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="h-[64px] flex items-center justify-between px-6 border-b border-white/10 bg-[#060b14] sticky top-0 z-10">
      <div>
        <div className="text-white font-bold">Admin Panel</div>
        <div className="text-xs text-slate-400">Quản trị nội dung website</div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10"
        >
          Về trang chủ
        </Link>
      </div>
    </header>
  )
}