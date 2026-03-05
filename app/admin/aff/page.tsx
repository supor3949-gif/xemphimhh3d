"use client"

import { useEffect, useMemo, useState } from "react"

type LinkRow = {
  id: string
  key: string | null
  url: string
  enabled: boolean
  weight: number
}

export default function AdminAffPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [hit, setHit] = useState("0.35")
  const [cooldown, setCooldown] = useState("30")
  const [maxDay, setMaxDay] = useState("3")

  const [links, setLinks] = useState<LinkRow[]>([])
  const [newKey, setNewKey] = useState("tiktok")
  const [newUrl, setNewUrl] = useState("https://example.com/?next={next}")
  const [newEnabled, setNewEnabled] = useState(true)
  const [newWeight, setNewWeight] = useState("1")

  const loadAll = async () => {
    setLoading(true)
    try {
      const st = await fetch("/api/admin/settings/aff", { cache: "no-store" }).then((r) => r.json())
      if (st?.data) {
        setHit(String(st.data.aff_hit_rate ?? 0.35))
        setCooldown(String(st.data.aff_cooldown_minutes ?? 30))
        setMaxDay(String(st.data.aff_max_per_day ?? 3))
      }
      const ls = await fetch("/api/admin/aff-links", { cache: "no-store" }).then((r) => r.json())
      setLinks(ls?.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch("/api/admin/settings/aff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aff_hit_rate: hit,
          aff_cooldown_minutes: cooldown,
          aff_max_per_day: maxDay,
        }),
      })
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  const addLink = async () => {
    setSaving(true)
    try {
      await fetch("/api/admin/aff-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey,
          url: newUrl,
          enabled: newEnabled,
          weight: Number(newWeight || 1),
        }),
      })
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (row: LinkRow) => {
    await fetch("/api/admin/aff-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, enabled: !row.enabled }),
    })
    await loadAll()
  }

  const del = async (id: string) => {
    await fetch(`/api/admin/aff-links?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    await loadAll()
  }

  if (loading) return <div className="p-6 text-gray-200">Loading...</div>

  return (
    <div className="p-6 text-gray-200 space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-extrabold text-cyan-300 mb-3">AFF Settings</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            Hit rate
            <input className="mt-1 w-full rounded bg-black/30 border border-white/10 p-2" value={hit} onChange={(e)=>setHit(e.target.value)} />
          </label>
          <label className="text-sm">
            Cooldown (minutes)
            <input className="mt-1 w-full rounded bg-black/30 border border-white/10 p-2" value={cooldown} onChange={(e)=>setCooldown(e.target.value)} />
          </label>
          <label className="text-sm">
            Max per day
            <input className="mt-1 w-full rounded bg-black/30 border border-white/10 p-2" value={maxDay} onChange={(e)=>setMaxDay(e.target.value)} />
          </label>
        </div>

        <button
          disabled={saving}
          onClick={saveSettings}
          className="mt-4 rounded-lg bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 font-bold hover:bg-cyan-500/30 disabled:opacity-50"
        >
          Save settings
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-extrabold text-cyan-300 mb-3">AFF Links</div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input className="rounded bg-black/30 border border-white/10 p-2" placeholder="key" value={newKey} onChange={(e)=>setNewKey(e.target.value)} />
          <input className="rounded bg-black/30 border border-white/10 p-2 md:col-span-2" placeholder="url with {next}" value={newUrl} onChange={(e)=>setNewUrl(e.target.value)} />
          <input className="rounded bg-black/30 border border-white/10 p-2" placeholder="weight" value={newWeight} onChange={(e)=>setNewWeight(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newEnabled} onChange={(e)=>setNewEnabled(e.target.checked)} />
            enabled
          </label>
        </div>

        <button
          disabled={saving}
          onClick={addLink}
          className="rounded-lg bg-pink-500/20 border border-pink-400/30 px-4 py-2 font-bold hover:bg-pink-500/30 disabled:opacity-50"
        >
          Add link
        </button>

        <div className="mt-5 space-y-2">
          {links.map((x) => (
            <div key={x.id} className="rounded-lg border border-white/10 bg-black/20 p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-bold">{x.key || "(no key)"} {x.enabled ? <span className="text-green-400">• on</span> : <span className="text-rose-400">• off</span>}</div>
                <div className="text-xs text-gray-400 break-all">{x.url}</div>
              </div>
              <div className="text-xs text-gray-300">w:{x.weight}</div>
              <button onClick={()=>toggle(x)} className="rounded bg-cyan-500/20 border border-cyan-400/30 px-3 py-2 text-sm font-bold hover:bg-cyan-500/30">
                Toggle
              </button>
              <button onClick={()=>del(x.id)} className="rounded bg-rose-500/20 px-3 py-2 text-sm font-bold text-rose-200 hover:bg-rose-500/30">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}