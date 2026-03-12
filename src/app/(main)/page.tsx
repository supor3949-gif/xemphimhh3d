// File: src/app/(main)/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";

export default function HomePage() {
  const [movieList, setMovieList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Lấy cấu hình MMO
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });

      // 2. Lấy danh sách phim
      const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      if (data) setMovieList(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-cyan-400">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold animate-pulse uppercase tracking-widest">Đang tải kho phim...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 mt-8">
      <section>
        {/* TIÊU ĐỀ TRANG CHỦ */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Phim Mới Cập Nhật</h2>
          <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black border border-cyan-500/30 ml-2 uppercase">
            {movieList.length} Tác phẩm
          </span>
        </div>
        
        {/* 🔥 GRID TỐI ƯU CO GIÃN THÔNG MINH (Nhỏ hơn 20%) 🔥 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {movieList.map((movie) => (
            <MovieCard 
              key={movie.id} 
              title={movie.title} 
              image={movie.thumbnail_url} 
              slug={movie.slug} 
              aff={aff}
              status={movie.status}
              views={movie.views}
            />
          ))}
        </div>
      </section>
    </div>
  );
}