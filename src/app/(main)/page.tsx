// File: src/app/(main)/page.tsx
'use client'; 
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from "@/components/ui/MovieCard";
import { useRouter } from 'next/navigation';
import { runMMO } from '@/lib/mmo';

export default function HomePage() {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState("Thứ 7");
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const [movies, setMovies] = useState<any[]>([]);
  
  // Nâng cấp mảng chứa cài đặt
  const [aff, setAff] = useState({ enabled: true, ratio: 50, link: '', cooldown: 0, maxJumps: 0 });

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
      // Bơm đủ Data từ Database xuống
      if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link, cooldown: setObj.cooldown || 0, maxJumps: setObj.max_jumps || 0 });
      
      const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
      if (data) setMovies(data);
    };
    fetchAllData();
  }, []);

  const newMovies = movies.slice(0, 12); 
  const scheduleMovies = movies.filter(m => m.day_of_week === activeDay).slice(0, 12);
  const topMovies = movies.filter(m => m.rank > 0).sort((a, b) => a.rank - b.rank).slice(0, 10);

  const handleRankClick = (slug: string) => {
    runMMO(aff); // Kích hoạt bộ não
    router.push(`/xem/${slug}/moi-nhat`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-6">
      <div className="w-full lg:w-[78%]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mới Cập Nhật</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {newMovies.map((movie) => (<MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} />))}
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-3">
          <h2 className="text-xl font-bold text-green-400 uppercase">Lịch Phim HH3D</h2>
          <div className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/20">Hôm nay: {activeDay}</div>
        </div>
        
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {days.map((day) => (
            <button key={day} onClick={() => setActiveDay(day)} className={`px-5 py-2.5 rounded-md font-bold text-[13px] transition-all min-w-[100px] ${activeDay === day ? 'bg-cyan-600 text-white shadow-lg' : 'bg-[#1a1d27] text-gray-500 hover:text-white border border-gray-800'}`}>
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {scheduleMovies.map((movie) => (<MovieCard key={movie.id} title={movie.title} image={movie.thumbnail_url} slug={movie.slug} aff={aff} status={movie.status} />))}
        </div>
      </div>

      <div className="w-full lg:w-[22%]">
         <h2 className="text-xl font-black mb-6 text-white uppercase border-b-2 border-cyan-500 inline-block pb-1">Bảng Xếp Hạng</h2>
         <div className="bg-[#151720] rounded-xl overflow-hidden border border-gray-800">
          {topMovies.map((movie) => (
            <div key={movie.id} onClick={() => handleRankClick(movie.slug)} className="flex items-center gap-3 p-3 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 cursor-pointer group">
              <span className={`text-2xl font-black w-6 text-center italic ${movie.rank === 1 ? 'text-cyan-400' : movie.rank === 2 ? 'text-orange-400' : movie.rank === 3 ? 'text-yellow-400' : 'text-gray-600'}`}>{movie.rank}</span>
              <img src={movie.thumbnail_url} alt={movie.title} className="w-11 h-15 object-cover rounded shadow-md group-hover:scale-105 transition-all" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-[13px] line-clamp-1 group-hover:text-cyan-400 transition-colors">{movie.title}</span>
                <span className="text-gray-500 text-[10px] mt-1 italic uppercase">{movie.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}