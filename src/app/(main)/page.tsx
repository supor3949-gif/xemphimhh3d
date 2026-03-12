// File: src/app/(main)/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";
import { Calendar, TrendingUp, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [movieList, setMovieList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });

  // Biến cho phần Lịch Chiếu
  const [activeDay, setActiveDay] = useState('Thứ 2');
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

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

  // Lọc dữ liệu cho các khu vực
  const topMovies = [...movieList].filter(m => m.rank && m.rank > 0).sort((a, b) => a.rank - b.rank);
  const scheduleMovies = movieList.filter(m => m.day_of_week === activeDay);

  return (
    <div className="space-y-12 pb-20 mt-8">

      {/* KHU VỰC 1: PHIM MỚI CẬP NHẬT */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Phim Mới Cập Nhật</h2>
          <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black border border-cyan-500/30 ml-2 uppercase hidden sm:block">
            {movieList.length} Tác phẩm
          </span>
        </div>
        
        {/* Lưới 8 cột Desktop, 3 cột Mobile siêu nhỏ gọn */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {movieList.map((movie) => (
            <MovieCard 
              key={movie.id} title={movie.title} image={movie.thumbnail_url} 
              slug={movie.slug} aff={aff} status={movie.status} views={movie.views}
            />
          ))}
        </div>
      </section>

      {/* KHU VỰC 2: BẢNG XẾP HẠNG (TOP PHIM) */}
      {topMovies.length > 0 && (
         <section>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Bảng Xếp Hạng</h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
            {topMovies.map((movie) => (
              <div key={movie.id} className="relative mt-3">
                {/* Con số Top nổi bật */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white font-black flex items-center justify-center rounded-full z-10 shadow-[0_0_15px_rgba(220,38,38,0.6)] border-2 border-[#0b0c10]">
                  {movie.rank}
                </div>
                <MovieCard 
                  title={movie.title} image={movie.thumbnail_url} 
                  slug={movie.slug} aff={aff} status={movie.status} views={movie.views} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KHU VỰC 3: LỊCH CHIẾU PHIM */}
      <section className="bg-[#151720] p-4 md:p-6 rounded-2xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Lịch Chiếu Trong Tuần</h2>
        </div>
        
        {/* Các nút chọn ngày */}
        <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar mb-6">
          {days.map(day => (
            <button 
              key={day} 
              onClick={() => setActiveDay(day)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeDay === day ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#0b0c10] text-gray-400 hover:text-white border border-gray-800'}`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Phim theo ngày */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {scheduleMovies.map(movie => (
            <MovieCard 
              key={movie.id} title={movie.title} image={movie.thumbnail_url} 
              slug={movie.slug} aff={aff} status={movie.status} views={movie.views} 
            />
          ))}
          {scheduleMovies.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 font-medium">Không có phim chiếu {activeDay}</div>
          )}
        </div>
      </section>

    </div>
  );
}