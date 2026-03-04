"use client"

import { useEffect, useState } from "react"

export default function AdminAff() {
  const [settings, setSettings] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [key, setKey] = useState("tiktok")
  const [url, setUrl] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [msg, setMsg] = useState("")

  async function load() {
    setMsg("")
    const s = await fetch("/api/admin/settings").then((r) => r.json())
    const l = await fetch("/api/admin/aff-links").then((r) => r.json())
    setSettings(s.data)
    setLinks(l.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function saveSettings() {
    setMsg("")
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).then((r) => r.json())
    if (res.error) return setMsg(res.error)
    setSettings(res.data)
    setMsg("✅ Đã lưu settings")
  }

  async function upsertLink() {
    setMsg("")
    const res = await fetch("/api/admin/aff-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, url, enabled }),
    }).then((r) => r.json())
    if (res.error) return setMsg(res.error)
    setKey("tiktok")
    setUrl("")
    setEnabled(true)
    setMsg("✅ Đã lưu link")
    load()
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 p-8">
      <div className="text-3xl font-black text-cyan-300">AFF + Settings</div>

      {msg ? <div className="mt-3 text-sm text-pink-300">{msg}</div> : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="font-extrabold text-cyan-300 mb-3">Cấu hình nhảy AFF</div>

          {settings ? (
            <div className="space-y-3">
              <label className="block text-sm">
                Hit rate (0..1)
                <input
                  value={settings.aff_hit_rate}
                  onChange={(e) => setSettings({ ...settings, aff_hit_rate: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                Cooldown (phút)
                <input
                  value={settings.aff_cooldown_minutes}
                  onChange={(e) => setSettings({ ...settings, aff_cooldown_minutes: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                Max / ngày / cookie
                <input
                  value={settings.aff_max_per_day}
                  onChange={(e) => setSettings({ ...settings, aff_max_per_day: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                Default provider (key)
                <input
                  value={settings.aff_default_provider}
                  onChange={(e) => setSettings({ ...settings, aff_default_provider: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                />
              </label>

              <button
                onClick={saveSettings}
                className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:brightness-110"
              >
                Lưu settings
              </button>
            </div>
          ) : (
            <div className="text-gray-400">Đang tải...</div>
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="font-extrabold text-cyan-300 mb-3">AFF Links</div>

          <div className="grid grid-cols-1 gap-3">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="key (tiktok/shopee...)"
              className="rounded-lg bg-black/30 border border-white/10 px-3 py-2"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="url template (có thể dùng {next})"
              className="rounded-lg bg-black/30 border border-white/10 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              enabled
            </label>

            <button
              onClick={upsertLink}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:brightness-110"
            >
              Lưu link
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {links.map((x) => (
              <div key={x.id} className="rounded-lg bg-black/20 border border-white/10 p-3">
                <div className="font-bold text-cyan-200">{x.key}</div>
                <div className="text-xs text-gray-400 break-all">{x.url}</div>
                <div className="text-xs mt-1">{x.enabled ? "✅ enabled" : "⛔ disabled"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}