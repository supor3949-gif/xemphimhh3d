// lib/aff.ts
export function affWrap(nextPath: string, provider: "tiktok" | "shopee" | string = "tiktok") {
  // nextPath: '/xem/slug/tap-1'
  const next = encodeURIComponent(nextPath)
  return `/go/${provider}?next=${next}`
}