// File: src/app/(main)/xem/[slug]/[tap]/page.tsx
'use client';

// LỚP KHIÊN BẢO VỆ TYPESCRIPT: Báo cho Vercel biết FB là biến an toàn
declare global {
  interface Window {
    FB: any;
  }
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { runMMO } from '@/lib/mmo';
import { Share2, MessageCircle, AlertTriangle, Heart, Eye } from 'lucide-react';

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const tap = params?.tap as string;

  const [activeServer, setActiveServer] = useState(1);
  const [movie, setMovie] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [currentEpData, setCurrentEpData] = useState<any>(null);
  const [aff, setAff] = useState({ enabled: true, ratio: 50, link: '', cooldown: 0, maxJumps: 0 });
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!slug || !tap) return; 
    const fetchData = async () => {
      try {
        const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link, cooldown: setObj.cooldown || 0, maxJumps: setObj.max_jumps || 0 });

        const { data: mov } = await supabase.from('movies').select('*').eq('slug', slug).single();
        if (!mov) { setLoading(false); return; }
        setMovie(mov);

        if (typeof window !== 'undefined') {
          if (!sessionStorage.getItem(`viewed_${mov.id}`)) {
            await supabase.from('movies').update({ views: (mov.views || 0) + 1 }).eq('id', mov.id);
            sessionStorage.setItem(`viewed_${mov.id}`, 'true');
          }
          if (localStorage.getItem(`saved_${mov.id}`)) setIsSaved(true);
        }

        const { data: eps } = await supabase.from('episodes').select('*').eq('movie_id', mov.id);
        if (eps && eps.length > 0) {
          const sortedEps = eps.sort((a, b) => {
             const numA = parseInt(a?.episode_number?.match(/\d+/)?.[0] || '0');
             const numB = parseInt(b?.episode_number?.match(/\d+/)?.[0] || '0');
             return numB - numA; 
          });
          setEpisodes(sortedEps);
          if (tap === 'moi-nhat') { router.replace(`/xem/${slug}/${sortedEps[0]?.episode_number}`); return; }
          setCurrentEpData(sortedEps.find(e => e.episode_number === tap) || sortedEps[0]);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // 🔥 THUẬT TOÁN LOAD FACEBOOK COMMENT MỚI NHẤT (CHỐNG LỖI TRẮNG)
    if (typeof window !== 'undefined') {
      const initFacebook = () => {
        if (window.FB) {
          window.FB.XFBML.parse(); // Nếu đã tải rồi thì render luôn
        } else {
          // Nếu chưa tải thì tạo thẻ root và gắn script
          if (!document.getElementById('fb-root')) {
            const fbRoot = document.createElement('div'); 
            fbRoot.id = 'fb-root'; 
            document.body.appendChild(fbRoot);
          }
          if (!document.getElementById('fb-script')) {
            const script = document.createElement('script');
            script.id = 'fb-script';
            script.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v19.0";
            script.async = true; 
            script.defer = true; 
            script.crossOrigin = "anonymous";
            // CHỜ SCRIPT TẢI XONG MỚI GỌI HÀM VẼ KHUNG BÌNH LUẬN
            script.onload = () => {
              if (window.FB) window.FB.XFBML.parse();
            };
            document.body.appendChild(script);
          }
        }
      };
      
      // Delay nhẹ 0.5s để đảm bảo layout Nextjs đã render xong HTML
      setTimeout(initFacebook, 500); 
    }
  }, [slug, tap, router]);

  const handleAction = (callback: () => void) => { runMMO(aff); callback(); };

  const handleSaveMovie = () => {
    if (!movie?.id) return; 
    if (isSaved) { localStorage.removeItem(`saved_${movie.id}`); setIsSaved(false); alert("Đã bỏ lưu phim!"); } 
    else { localStorage.setItem(`saved_${movie.id}`, 'true'); setIsSaved(true); alert("❤️ Đã thêm vào Phim Yêu Thích!"); }
  };

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse text-xl uppercase tracking-widest">🎬 Đang chuẩn bị Phim...</div>;
  if (!movie) return <div className="text-center p-20 text-red-500 font-bold text-2xl uppercase">404 - Không tìm thấy phim</div>;

  const videoUrl = activeServer === 1 ? currentEpData?.server1_url : activeServer === 2 ? currentEpData?.server2_url : currentEpData?.server3_url;
  
  // Tự động sinh link trang hiện tại cho Facebook nhận diện
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://xemphimhh3d.com/xem/${slug}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4 pb-10">
      <div className="w-full md:w-3/4">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">{movie?.title}</h1>
          <span className="bg-red-600 px-3 py-0.5 rounded text-sm font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">Tập {tap}</span>
        </div>

        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
           {videoUrl ? (
             <iframe src={videoUrl} allowFullScreen className="absolute inset-0 w-full h-full border-0" scrolling="no"></iframe>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-500"><span className="text-4xl mb-2">🥲</span><span className="font-bold">Chưa có link cho Server {activeServer}</span></div>
           )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151720] p-3 rounded-xl border border-gray-800 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => handleAction(() => setActiveServer(n))} className={`px-5 py-2 rounded-lg font-black uppercase text-xs tracking-widest transition-all duration-300 ${activeServer === n ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-[#0b0c10] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'}`}>
                Server {n}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={handleSaveMovie} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isSaved ? 'bg-pink-600/20 text-pink-500 border-pink-500/30 hover:bg-pink-600 hover:text-white' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-pink-600/20 hover:text-pink-500'}`}>
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Đã Lưu' : 'Lưu Phim'}
            </button>
            
            <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Đã copy Link phim! Hãy dán lên Zalo/FB để thấy Điều kỳ diệu!')}} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-blue-600/30">
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
          </div>
        </div>

        <div className="mt-8 bg-[#151720] p-4 md:p-6 rounded-xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2"><MessageCircle className="w-6 h-6 text-cyan-400" /><h2 className="text-xl font-bold text-white uppercase">Bình luận Phim</h2></div>
            <div className="text-gray-400 text-sm flex items-center gap-1"><Eye className="w-4 h-4 text-cyan-500"/> {movie?.views || 0} lượt xem</div>
          </div>
          <div className="bg-white rounded p-2 min-h-[150px] flex items-center justify-center relative">
            {/* THẺ CHỨA FACEBOOK COMMENT */}
            <div className="fb-comments w-full" data-href={currentUrl} data-width="100%" data-numposts="5" data-colorscheme="light"></div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/4">
        <div className="bg-[#151720] p-5 rounded-xl border border-gray-800 shadow-xl sticky top-20">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
            <div className="w-1 h-5 bg-cyan-500"></div><h2 className="text-lg font-bold text-white uppercase italic">Chọn Tập</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {episodes.map(ep => (
              <button key={ep?.id} onClick={() => handleAction(() => router.push(`/xem/${slug}/${ep?.episode_number}`))} className={`py-2.5 rounded font-black text-sm transition-all ${tap === ep?.episode_number ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>
                {ep?.episode_number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}