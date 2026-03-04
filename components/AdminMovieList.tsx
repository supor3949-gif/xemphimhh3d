"use client"

export default function AdminMovieList({
  movies,
  onDelete,
  onEdit,
}: {
  movies: any[]
  onDelete: (slug: string) => Promise<void>
  onEdit: (movie: any) => void
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-extrabold text-cyan-300">Danh sách phim</div>
        <div className="text-xs text-gray-400">{movies.length} phim</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((m) => (
          <div
            key={m.slug}
            className="rounded-xl overflow-hidden border border-white/10 bg-black/20"
          >
            <div className="aspect-[2/3] bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.poster || "/logo.png"}
                alt={m.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-3">
              <div className="text-sm font-bold line-clamp-2">{m.title}</div>
              <div className="text-xs text-slate-400 mt-1">{m.slug}</div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onEdit(m)}
                  className="flex-1 rounded-lg bg-cyan-500/20 border border-cyan-400/30 py-2 text-sm font-bold hover:bg-cyan-500/30"
                >
                  Sửa
                </button>

                <button
                  onClick={() => onDelete(m.slug)}
                  className="flex-1 rounded-lg bg-rose-500/20 py-2 text-sm font-bold text-rose-200 hover:bg-rose-500/30"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!movies.length ? <div className="text-sm text-slate-400 mt-4">Chưa có phim.</div> : null}
    </div>
  )
}