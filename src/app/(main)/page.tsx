// File: src/app/(main)/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";

export default function HomePage() {
  const [movieList, setMovieList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      if (data) setMovieList(data);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse uppercase tracking-widest">🎬 Đang tải kho phim...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* PHẦN PHIM MỚI CẬP NHẬT */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-cyan-500 pl-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Mới Cập Nhật</h2>
        </div>
        
        {/* HỆ THỐNG GRID TỰ CO GIÃN THÔNG MINH */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-4">
          {movieList.map((movie) => (
            <MovieCard 
              key={movie.id} 
              title={movie.title} 
              image={movie.thumbnail_url} 
              slug={movie.slug} 
              status={movie.status}
              views={movie.views}
            />
          ))}
        </div>
      </section>
    </div>
  );
}