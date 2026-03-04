import Header from "@/components/Header"
import MovieCard from "@/components/MovieCard"
import Ranking from "@/components/Ranking"
import Schedule from "@/components/Schedule"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: latest } = await supabase
    .from("movies")
    .select("title, slug, poster, description, created_at")
    .order("created_at", { ascending: false })
    .limit(6)

  const { data: sch, error: schErr } = await supabase
    .from("schedule")
    .select("day, movies(title, slug, poster)")
    .order("created_at", { ascending: false })

  const schedule =
    (sch || []).map((x: any) => ({
      day: x.day,
      movie: x.movies
        ? { title: x.movies.title, slug: x.movies.slug, poster: x.movies.poster }
        : null,
    })) || []

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans">
      <Header />

      <main className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 p-6">
        <div className="col-span-12 lg:col-span-9">
          <div className="border-2 border-purple-500/50 rounded-lg p-2 mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(latest || []).map((m: any) => (
                <MovieCard key={m.slug} movie={{ ...m, ep: "Trailer", quality: "TM-VS" }} />
              ))}
            </div>
          </div>

          {schErr ? (
            <div className="text-rose-300 text-sm">Lỗi load lịch: {schErr.message}</div>
          ) : (
            <Schedule schedule={schedule} />
          )}
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div className="bg-[#1e293b]/30 rounded-xl p-4 border border-white/5">
            <Ranking />
          </div>
        </div>
      </main>
    </div>
  )
}