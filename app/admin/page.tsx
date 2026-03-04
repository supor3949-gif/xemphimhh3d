// app/admin/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/isAdmin"

export default async function AdminPage() {
  const { ok } = await requireAdmin()

  // Chưa login / không phải admin -> đá về login
  if (!ok) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 p-10">
      <div className="text-3xl font-black text-cyan-300">Admin Panel</div>

      <div className="mt-6 grid gap-3 max-w-xl">
        <Link
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10"
          href="/admin/aff"
        >
          AFF + Settings
        </Link>

        <Link
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10"
          href="/admin/ranking"
        >
          Ranking TOP 10
        </Link>

        <Link
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10"
          href="/admin/movies"
        >
          Movies
        </Link>

        <Link
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10"
          href="/admin/episodes"
        >
          Episodes
        </Link>

        <Link
          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/10"
          href="/admin/schedule"
        >
          Schedule
        </Link>
      </div>
    </div>
  )
}