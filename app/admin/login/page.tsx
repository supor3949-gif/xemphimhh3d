// app/admin/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onLogin() {
    setErr(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    // đăng nhập xong -> vào admin dashboard
    router.replace("/admin")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-200 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="text-2xl font-extrabold text-cyan-300">Admin Login</div>

        <div className="mt-4 space-y-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-cyan-400/50"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-cyan-400/50"
          />

          {err ? <div className="text-sm text-rose-300">{err}</div> : null}

          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  )
}