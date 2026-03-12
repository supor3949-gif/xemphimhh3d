// File: src/app/(main)/the-loai/[slug]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";
import { useParams } from 'next/navigation';

const genreMap: Record<string, string> = {
  'tien-hiep': 'Tiên Hiệp',
  'huyen-huyen': 'Huyền Huyễn',
  'xuyen-khong': 'Xuyên Không',
  'trung-sinh': 'Trùng Sinh',
  'hai-huoc': 'Hài Hước'
};

export default function GenrePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const genreName = genreMap[slug] || 'Thể Loại Khác';

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('movies').select('*').eq('genre', genreName).order('created_at', { ascending: false });
      if (data) setMovies(data);
      setLoading(false);
    };
    fetchData();
  }, [genreName]);

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse uppercase tracking-widest">🎬 Đang tải...</div>;

  return (
    <div className="mt-8 min-h-[60vh] pb-20">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Phim {genreName}</h1>
      </div>

      {/* HỆ THỐNG GRID TỰ CO GIÃN THÔNG MINH */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-4">
        {movies.map((movie) => (
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

      {movies.length === 0 && (
        <div className="text-center py-20 bg-[#151720] border-2 border-dashed border-gray-800 rounded-3xl">
          <p className="text-gray-500">Thể loại này đang được cập nhật...</p>
        </div>
      )}
    </div>
  );
}