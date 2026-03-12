// File: src/app/(main)/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";
import { Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { runMMO } from '@/lib/mmo';

export default function HomePage() {
  const router = useRouter();
  const [movieList, setMovieList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });

  // Danh sách ngày kèm tiếng Anh cho giống ảnh mẫu của em
  const daysOfWeek = [
    { vi: 'Thứ 2', en: 'Monday' }, { vi: 'Thứ 3', en: 'Tuesday' },
    { vi: 'Thứ 4', en: 'Wednesday' }, { vi: 'Thứ 5', en: 'Thursday' },
    { vi: 'Thứ 6', en: 'Friday' }, { vi: 'Thứ 7', en: 'Saturday' },
    { vi: 'Chủ nhật', en: 'Sunday' }
  ];
  const [activeDay, setActiveDay] = useState('Thứ 7'); // Mặc định chọn Thứ 7

  useEffect(() => {
    const fetchData = async () => {
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });

      const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      if (data) setMovieList(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-cyan-400">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold animate-pulse uppercase tracking-widest">Đang tải giao diện...</p>
    </div>
  );

  // Phân loại Phim
  const topMovies = [...movieList].filter(m => m.rank && m.rank > 0).sort((a, b) => a.rank - b.rank);
  const scheduleMovies = movieList.filter(m => m.day_of_week === activeDay);

  // Hàm click cho Bảng Xếp Hạng
  const handleClickRank = (slug: string) => {
    runMMO(aff);
    router.push(`/xem/${slug}/moi-nhat`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-8 pb-20">
      
      {/* ========================================================
          CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 75% màn hình máy tính) 
          ======================================================== */}
      <div className="w-full lg:w-[72%] space-y-10">
        
        {/* KHU VỰC 1: PHIM MỚI */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter border-l-4 border-cyan-500 pl-3">Phim Mới Cập Nhật</h2>
          </div>
          {/* Lưới phim nhỏ gọn: 3 cột Mobile, 4-5 cột Desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {movieList.map((movie) => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
          </div>
        </section>

        {/* KHU VỰC 2: LỊCH PHIM THEO NGÀY */}
        <section className="bg-[#151720]/50 p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-black text-green-400 uppercase tracking-tighter border-l-4 border-green-500 pl-3">Lịch Phim</h2>
            <span className="bg-gray-800 text-white px-3 py-1 rounded text-xs ml-2">Hôm nay: {activeDay}</span>
          </div>
          
          {/* Thanh Menu Chọn Ngày (Thiết kế giống ảnh) */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-6">
            {daysOfWeek.map((dayObj) => (
              <button 
                key={dayObj.vi} onClick={() => setActiveDay(dayObj.vi)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${activeDay === dayObj.vi ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#0b0c10] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'}`}
              >
                <span className="font-bold text-sm">{dayObj.vi}</span>
                <span className="text-[10px] opacity-70">{dayObj.en}</span>
              </button>
            ))}
          </div>

          {/* Lưới phim chiếu trong ngày được chọn */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {scheduleMovies.map(movie => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
            {scheduleMovies.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 font-medium bg-[#0b0c10] rounded-xl border border-gray-800">
                Chưa có lịch chiếu cho {activeDay}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================
          CỘT PHẢI: BẢNG XẾP HẠNG (Chiếm 25% màn hình máy tính) 
          ======================================================== */}
      <div className="w-full lg:w-[28%]">
        <section className="bg-[#151720] rounded-xl border border-gray-800 p-4 sticky top-20">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-black text-cyan-400 uppercase tracking-tighter">Bảng Xếp Hạng</h2>
          </div>
          
          {/* Danh sách List dọc chuẩn chỉ */}
          <div className="flex flex-col gap-3">
            {topMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                onClick={() => handleClickRank(movie.slug)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/80 cursor-pointer transition-colors group"
              >
                {/* Số thứ tự (Top 1, 2, 3 đổi màu) */}
                <span className={`text-2xl font-black w-6 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-500' : 'text-gray-600'}`}>
                  {movie.rank}
                </span>
                
                {/* Ảnh thumbnail mini */}
                <div className="w-12 h-16 shrink-0 overflow-hidden rounded relative border border-gray-700">
                  <img src={movie.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={movie.title} />
                </div>
                
                {/* Tên phim và Trạng thái */}
                <div className="flex flex-col flex-1">
                  <h4 className="text-white text-sm font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {movie.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 mt-1">{movie.status}</span>
                </div>
              </div>
            ))}
            {topMovies.length === 0 && <p className="text-gray-500 text-sm text-center">Đang cập nhật...</p>}
          </div>
        </section>
      </div>

    </div>
  );
}