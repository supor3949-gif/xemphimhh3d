export async function fetchAff(nextPath: string, provider = "tiktok") {
  const url = `/api/aff?next=${encodeURIComponent(nextPath)}&provider=${encodeURIComponent(provider)}`
  const r = await fetch(url, { cache: "no-store" })
  if (!r.ok) return { go: false as const }
  return (await r.json()) as { go: boolean; url?: string; key?: string }
}

export function isMobileUA() {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent || ""
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}