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
  const slug = params.slug as string;
  const genreName = genreMap[slug] || 'Thể Loại Khác';

  const [movies, setMovies] = useState<any[]>([]);
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Bốc cấu hình MMO xuống để gài vào Card Phim
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });

      // Lọc phim đúng thể loại
      const { data } = await supabase.from('movies').select('*').eq('genre', genreName).order('created_at', { ascending: false });
      if (data) setMovies(data);
      setLoading(false);
    };
    fetchData();
  }, [genreName]);

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse text-xl">Đang tải phim...</div>;

  return (
    <div className="mt-8 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Phim {genreName}</h1>
        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/30 ml-2">
          {movies.length} Phim
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {movies.map((movie) => (
          <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} />
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
          <span className="text-6xl block mb-4">🥲</span>
          <h3 className="text-xl font-bold text-white mb-2">Chưa có phim nào</h3>
          <p>Thể loại này đang được Admin cập nhật. Bạn quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}