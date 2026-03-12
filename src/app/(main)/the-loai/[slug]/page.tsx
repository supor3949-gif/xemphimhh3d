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
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Lấy cấu hình MMO
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });

      // 2. Lọc phim theo thể loại và lấy luôn cột views
      const { data } = await supabase.from('movies')
        .select('*')
        .eq('genre', genreName)
        .order('created_at', { ascending: false });
      
      if (data) setMovies(data);
      setLoading(false);
    };
    fetchData();
  }, [genreName]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-cyan-400">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold animate-pulse uppercase tracking-widest">Đang tải danh sách phim...</p>
    </div>
  );

  return (
    <div className="mt-8 min-h-[60vh]">
      {/* TIÊU ĐỀ THỂ LOẠI */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Phim {genreName}</h1>
        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black border border-cyan-500/30 ml-2 uppercase">
          {movies.length} Tác phẩm
        </span>
      </div>

      {/* DANH SÁCH PHIM - ĐÃ CHỈNH LG:GRID-COLS-6 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            title={movie.title} 
            image={movie.thumbnail_url} 
            slug={movie.slug} 
            aff={aff} 
            status={movie.status} 
            views={movie.views} // Thêm lượt xem vào đây
          />
        ))}
      </div>

      {/* THÔNG BÁO NẾU TRỐNG */}
      {movies.length === 0 && (
        <div className="text-center py-20 bg-[#151720] border-2 border-dashed border-gray-800 rounded-3xl shadow-inner">
          <span className="text-6xl block mb-4 opacity-50 grayscale">🥲</span>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Kho phim đang trống</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Thể loại <span className="text-cyan-400 font-bold">{genreName}</span> hiện đang được Admin cập nhật nội dung. Vui lòng quay lại sau ít phút để thưởng thức nhé!
          </p>
        </div>
      )}
    </div>
  );
}