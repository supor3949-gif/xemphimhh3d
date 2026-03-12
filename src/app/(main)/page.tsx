// File: src/app/(main)/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";
import { useRouter } from 'next/navigation';
import { runMMO } from '@/lib/mmo';

export default function HomePage() {
  const router = useRouter();
  const [movieList, setMovieList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aff, setAff] = useState({ enabled: false, ratio: 0, link: '' });

  const daysOfWeek = [
    { vi: 'Thứ 2', en: 'Mon' }, { vi: 'Thứ 3', en: 'Tue' },
    { vi: 'Thứ 4', en: 'Wed' }, { vi: 'Thứ 5', en: 'Thu' },
    { vi: 'Thứ 6', en: 'Fri' }, { vi: 'Thứ 7', en: 'Sat' },
    { vi: 'Chủ nhật', en: 'Sun' }
  ];
  
  // Khởi tạo State tạm
  const [activeDay, setActiveDay] = useState('Thứ 2'); 

  useEffect(() => {
    // 🔥 TỰ ĐỘNG LẤY NGÀY THỰC TẾ (Theo giờ VN)
    const currentDayIndex = new Date().getDay();
    const mapDay = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    setActiveDay(mapDay[currentDayIndex]);

    const fetchData = async () => {
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });
      const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      if (data) setMovieList(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse text-xs">Đang tải...</div>;

  const latestMovies = movieList.slice(0, 6);
  const topMovies = [...movieList].filter(m => m.rank && m.rank > 0).sort((a, b) => a.rank - b.rank);
  const scheduleMovies = movieList.filter(m => m.day_of_week === activeDay);

  const handleClickRank = (slug: string) => { runMMO(aff); router.push(`/xem/${slug}/moi-nhat`); };

  return (
    // 🔥 BÍ QUYẾT NẰM Ở ĐÂY: max-w-[1100px] mx-auto (Gom toàn bộ web vào giữa, chống phình to)
    <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-5 mt-4 pb-12 px-2 sm:px-4 lg:px-0">
      
      {/* CỘT TRÁI CHÍNH (Phim mới + Lịch phim) */}
      <div className="w-full lg:w-[72%] space-y-6">
        
        {/* PHIM MỚI CẬP NHẬT */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base lg:text-lg font-black text-white uppercase tracking-tighter border-l-4 border-cyan-500 pl-2">Phim Mới Cập Nhật</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {latestMovies.map((movie) => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
          </div>
        </section>

        {/* LỊCH PHIM */}
        <section className="bg-[#151720]/50 p-3 lg:p-4 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-lg font-black text-green-400 uppercase tracking-tighter border-l-4 border-green-500 pl-2">Lịch Phim</h2>
             </div>
             <span className="bg-green-900/40 border border-green-500/30 text-green-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Hôm nay: {activeDay}</span>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 mb-4">
            {daysOfWeek.map((dayObj) => (
              <button 
                key={dayObj.vi} onClick={() => setActiveDay(dayObj.vi)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all ${activeDay === dayObj.vi ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-[#0b0c10] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'}`}
              >
                <span className="font-bold text-[11px] sm:text-xs">{dayObj.vi}</span>
                <span className="text-[8px] sm:text-[9px] opacity-70 hidden sm:block">{dayObj.en}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {scheduleMovies.map(movie => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
            {scheduleMovies.length === 0 && <div className="col-span-full text-center py-6 text-gray-500 text-xs sm:text-sm">Chưa có lịch chiếu cho {activeDay}</div>}
          </div>
        </section>
      </div>

      {/* CỘT PHẢI: BẢNG XẾP HẠNG */}
      <div className="w-full lg:w-[28%]">
        <section className="bg-[#151720] rounded-lg border border-gray-800 p-3 lg:p-4 sticky top-20">
          <div className="flex items-center mb-3">
            <h2 className="text-base lg:text-lg font-black text-cyan-400 uppercase tracking-tighter">Bảng Xếp Hạng</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {topMovies.map((movie, index) => (
              <div key={movie.id} onClick={() => handleClickRank(movie.slug)} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-800/80 cursor-pointer transition-colors group">
                <span className={`text-base font-black w-5 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-500' : 'text-gray-600'}`}>{movie.rank}</span>
                {/* ẢNH THUMBNAIL BẢNG XẾP HẠNG THU NHỎ LẠI */}
                <div className="w-9 h-12 shrink-0 overflow-hidden rounded relative border border-gray-700">
                  <img src={movie.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={movie.title} />
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-white text-[11px] sm:text-xs font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug">{movie.title}</h4>
                  <span className="text-[9px] text-gray-500 mt-0.5">{movie.status}</span>
                </div>
              </div>
            ))}
            {topMovies.length === 0 && <p className="text-gray-500 text-[10px] text-center">Đang cập nhật...</p>}
          </div>
        </section>
      </div>

    </div>
  );
}