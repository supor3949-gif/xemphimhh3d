// File: src/app/(main)/xem/[slug]/[tap]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { runMMO } from '@/lib/mmo';
import { Share2, MessageCircle, Heart, Eye } from 'lucide-react';

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

  // 🔥 STATE CHO HỆ THỐNG BÌNH LUẬN MỚI
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug || !tap) return; 
    const fetchData = async () => {
      try {
        const { data: setObj } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (setObj) setAff({ enabled: setObj.is_enabled, ratio: setObj.ratio, link: setObj.affiliate_link, cooldown: setObj.cooldown || 0, maxJumps: setObj.max_jumps || 0 });

        const { data: mov } = await supabase.from('movies').select('*').eq('slug', slug).single();
        if (!mov) { setLoading(false); return; }
        setMovie(mov);

        if (typeof window !== 'undefined' && mov?.id) {
          if (!sessionStorage.getItem(`viewed_${mov.id}`)) {
            await supabase.from('movies').update({ views: (mov.views || 0) + 1 }).eq('id', mov.id);
            sessionStorage.setItem(`viewed_${mov.id}`, 'true');
          }
          if (localStorage.getItem(`saved_${mov.id}`)) setIsSaved(true);
        }

        // Lấy danh sách Tập phim
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

        // 🔥 Lấy danh sách Bình Luận của phim này
        const { data: cmts } = await supabase.from('comments').select('*').eq('movie_id', mov.id).order('created_at', { ascending: false });
        if (cmts) setComments(cmts);

      } catch (error) { console.error("Lỗi:", error); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, tap, router]);

  const handleAction = (callback: () => void) => { runMMO(aff); callback(); };
  
  const handleSaveMovie = () => {
    if (!movie?.id) return; 
    if (isSaved) { localStorage.removeItem(`saved_${movie.id}`); setIsSaved(false); alert("Đã bỏ lưu phim!"); } 
    else { localStorage.setItem(`saved_${movie.id}`, 'true'); setIsSaved(true); alert("❤️ Đã thêm vào Phim Yêu Thích!"); }
  };

  // 🔥 HÀM XỬ LÝ GỬI BÌNH LUẬN
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim() || !movie?.id) return;
    setIsSubmitting(true);
    
    const newComment = { movie_id: movie.id, user_name: commentName, content: commentContent };
    
    // Gửi lên Supabase
    const { data, error } = await supabase.from('comments').insert([newComment]).select();
    
    if (!error && data) {
      // Ép bình luận mới lên đầu danh sách hiển thị
      setComments([data[0], ...comments]);
      setCommentContent(''); // Xóa khung nhập cảm nghĩ, giữ lại Tên
    } else {
      alert("Có lỗi xảy ra, không thể gửi bình luận!");
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="text-center p-20 text-cyan-400 font-bold animate-pulse text-sm uppercase tracking-widest">🎬 Đang tải phim...</div>;
  if (!movie) return <div className="text-center p-20 text-red-500 font-bold text-lg uppercase">404 - Không tìm thấy phim</div>;

  const videoUrl = activeServer === 1 ? currentEpData?.server1_url : activeServer === 2 ? currentEpData?.server2_url : currentEpData?.server3_url;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5 mt-4 pb-12 max-w-[1100px] mx-auto px-2 sm:px-4 lg:px-0">
      
      {/* 🎬 KHỐI 1: KHUNG PLAYER & SERVER */}
      <div className="lg:col-span-9 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">{movie?.title}</h1>
          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] whitespace-nowrap">Tập {tap}</span>
        </div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
           {videoUrl ? (
             <iframe src={videoUrl} allowFullScreen className="absolute inset-0 w-full h-full border-0" scrolling="no"></iframe>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-500"><span className="text-3xl mb-2">🥲</span><span className="text-sm font-bold">Chưa có link cho Server {activeServer}</span></div>
           )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#151720] p-2.5 rounded-lg border border-gray-800 shadow-lg">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => handleAction(() => setActiveServer(n))} className={`px-4 py-1.5 rounded-md font-black uppercase text-[10px] md:text-xs tracking-wider transition-all duration-300 ${activeServer === n ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-[#0b0c10] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'}`}>
                Server {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button onClick={handleSaveMovie} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all border ${isSaved ? 'bg-pink-600/20 text-pink-500 border-pink-500/30 hover:bg-pink-600 hover:text-white' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-pink-600/20 hover:text-pink-500'}`}>
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Đã Lưu' : 'Lưu'}
            </button>
            <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Đã copy Link phim!')}} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all border border-blue-600/30">
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
          </div>
        </div>
      </div>
      
      {/* 📺 KHỐI 2: CHỌN TẬP PHIM */}
      <div className="lg:col-span-3 lg:row-span-3">
        <div className="bg-[#151720] p-3 lg:p-4 rounded-lg border border-gray-800 shadow-xl lg:sticky lg:top-20">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
            <div className="w-1 h-4 bg-cyan-500"></div><h2 className="text-base font-bold text-white uppercase italic">Chọn Tập</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 max-h-[250px] lg:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {episodes.map(ep => (
              <button key={ep?.id} onClick={() => handleAction(() => router.push(`/xem/${slug}/${ep?.episode_number}`))} className={`py-1.5 rounded font-black text-[10px] md:text-xs transition-all ${tap === ep?.episode_number ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>
                {ep?.episode_number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ℹ️ KHỐI 3: THÔNG TIN PHIM */}
      <div className="lg:col-span-9">
        <div className="bg-[#151720] p-3 lg:p-4 rounded-lg border border-gray-800 shadow-lg flex flex-col sm:flex-row gap-4">
          <div className="w-24 h-32 sm:w-28 sm:h-40 shrink-0 rounded-lg overflow-hidden border border-gray-700 shadow-md mx-auto sm:mx-0">
            <img src={movie?.thumbnail_url} alt={movie?.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-2.5 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{movie?.title}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-[10px] sm:text-xs font-bold">
              <span className="bg-red-600/20 text-red-500 px-2 py-1 rounded border border-red-500/30">🔥 {movie?.status || 'Đang cập nhật'}</span>
              <span className="bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">🎬 {movie?.genre || 'Chưa phân loại'}</span>
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-500/30">📅 {movie?.day_of_week || 'Chưa xếp lịch'}</span>
            </div>
            <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed mt-2">
              Phim <strong className="text-gray-200">{movie?.title}</strong> thuộc thể loại <strong className="text-cyan-400">{movie?.genre}</strong>. 
              Tác phẩm hiện đang ở trạng thái <strong>{movie?.status}</strong> và được hệ thống cập nhật tập mới vào <strong>{movie?.day_of_week}</strong> hàng tuần. Chúc bạn xem phim vui vẻ!
            </p>
          </div>
        </div>
      </div>

      {/* 💬 KHỐI 4: BÌNH LUẬN NATIVE CỰC XỊN (Tự code, không xài FB) */}
      <div className="lg:col-span-9">
        <div className="bg-[#151720] p-4 lg:p-5 rounded-lg border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-5 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">Bình luận ({comments.length})</h2>
            </div>
            <div className="text-gray-400 text-[10px] md:text-xs flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-cyan-500"/> {movie?.views || 0} lượt xem</div>
          </div>

          {/* Form nhập bình luận */}
          <form onSubmit={handleSubmitComment} className="mb-6 bg-[#0b0c10] p-3 rounded-lg border border-gray-800 shadow-inner">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
               <input required type="text" placeholder="Tên của bạn..." value={commentName} onChange={e => setCommentName(e.target.value)} className="w-full sm:w-1/3 bg-[#151720] text-white border border-gray-700 rounded-md px-3 py-2 text-xs md:text-sm outline-none focus:border-cyan-500 transition-colors" />
               <input required type="text" placeholder="Cảm nghĩ của bạn về tập này..." value={commentContent} onChange={e => setCommentContent(e.target.value)} className="w-full sm:w-2/3 bg-[#151720] text-white border border-gray-700 rounded-md px-3 py-2 text-xs md:text-sm outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex justify-end">
               <button type="submit" disabled={isSubmitting} className={`bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-md text-xs font-bold transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 {isSubmitting ? 'ĐANG GỬI...' : 'GỬI BÌNH LUẬN'}
               </button>
            </div>
          </form>

          {/* Danh sách bình luận */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
             {comments.map((cmt) => (
               <div key={cmt.id} className="flex gap-3 bg-[#0b0c10]/60 p-3 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors">
                  {/* Tạo Avatar ngẫu nhiên từ chữ cái đầu của Tên */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-white font-black shrink-0 text-lg shadow-inner">
                    {cmt.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-bold text-cyan-400 text-xs md:text-sm">{cmt.user_name}</span>
                      <span className="text-[9px] text-gray-500">{new Date(cmt.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-gray-300 text-[11px] md:text-xs leading-relaxed">{cmt.content}</p>
                  </div>
               </div>
             ))}
             {comments.length === 0 && (
               <div className="text-center py-10 bg-[#0b0c10] rounded-lg border border-dashed border-gray-800">
                 <p className="text-3xl mb-2 opacity-50">💬</p>
                 <p className="text-gray-500 text-xs md:text-sm">Chưa có bình luận nào. Hãy là người đầu tiên bóc tem!</p>
               </div>
             )}
          </div>
        </div>
      </div>

    </div>
  );
}