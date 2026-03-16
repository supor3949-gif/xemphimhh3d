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
  
  const [activeDay, setActiveDay] = useState('Thứ 2'); 

  useEffect(() => {
    const currentDayIndex = new Date().getDay();
    const mapDay = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    setActiveDay(mapDay[currentDayIndex]);

    const fetchData = async () => {
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link });
      
      // 🔥 ĐỔI SANG XẾP THEO UPDATED_AT ĐỂ PHIM NÀO VỪA THÊM TẬP SẼ LÊN ĐẦU
      const { data } = await supabase.from('movies').select('*').order('updated_at', { ascending: false });
      
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
    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* CỘT TRÁI CHÍNH */}
      <div className="w-full lg:w-[75%] space-y-8">
        
        {/* PHIM MỚI CẬP NHẬT */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg lg:text-xl font-black text-white uppercase tracking-tighter border-l-4 border-cyan-500 pl-3">Phim Mới Cập Nhật</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {latestMovies.map((movie) => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
          </div>
        </section>

        {/* LỊCH PHIM */}
        <section className="bg-[#151720]/50 p-4 lg:p-6 rounded-xl border border-gray-800 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
             <div className="flex items-center gap-2">
                <h2 className="text-lg lg:text-xl font-black text-green-400 uppercase tracking-tighter border-l-4 border-green-500 pl-3">Lịch Phim</h2>
             </div>
             <span className="bg-green-900/40 border border-green-500/30 text-green-400 px-3 py-1 rounded-md text-[11px] uppercase font-bold tracking-wider">Hôm nay: {activeDay}</span>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-6">
            {daysOfWeek.map((dayObj) => (
              <button 
                key={dayObj.vi} onClick={() => setActiveDay(dayObj.vi)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all ${activeDay === dayObj.vi ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105' : 'bg-[#0b0c10] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'}`}
              >
                <span className="font-extrabold text-[12px] sm:text-sm">{dayObj.vi}</span>
                <span className="text-[9px] sm:text-[10px] opacity-70 hidden sm:block uppercase">{dayObj.en}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {scheduleMovies.map(movie => (
              <MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} views={movie.views} />
            ))}
            {scheduleMovies.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 text-sm italic">Chưa có lịch chiếu cho {activeDay}</div>}
          </div>
        </section>
      </div>

      {/* CỘT PHẢI: BẢNG XẾP HẠNG */}
      <div className="w-full lg:w-[25%]">
        <section className="bg-[#151720] rounded-xl border border-gray-800 p-4 lg:p-5 sticky top-24 shadow-xl">
          <div className="flex items-center mb-4">
            <h2 className="text-lg lg:text-xl font-black text-cyan-400 uppercase tracking-tighter">Bảng Xếp Hạng</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {topMovies.map((movie, index) => (
              <div key={movie.id} onClick={() => handleClickRank(movie.slug)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/80 cursor-pointer transition-all group border border-transparent hover:border-gray-700">
                <span className={`text-lg font-black w-6 text-center ${index === 0 ? 'text-yellow-400 text-xl' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-500' : 'text-gray-600'}`}>{movie.rank}</span>
                
                <div className="w-11 h-14 shrink-0 overflow-hidden rounded-md relative border border-gray-700 shadow-md">
                  <img src={movie.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title} />
                </div>
                
                <div className="flex flex-col flex-1">
                  <h4 className="text-white text-[13px] sm:text-[14px] font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors leading-tight">{movie.title}</h4>
                  <span className="text-[10px] text-gray-500 mt-1 font-medium">{movie.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}