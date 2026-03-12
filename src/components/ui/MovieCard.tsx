// File: src/components/ui/MovieCard.tsx
'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Eye, PlayCircle } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status, views }: any) {
  return (
    <div onClick={() => runMMO(aff)} title={title} className="cursor-pointer group">
      <Link href={`/xem/${slug}/moi-nhat`} className="block">
        
        {/* ==================== KHUNG ẢNH POSTER ==================== */}
        {/* Khi hover: Viền sáng lên + Đổ bóng cyan rực rỡ (Đèn nháy) */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-900 border-2 border-transparent group-hover:border-cyan-400 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          {/* Lớp phủ đen mờ nhẹ ở góc để làm nổi tag */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30"></div>

          {/* 🏷️ Tag Trạng Thái - Góc trái trên */}
          {status && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 tracking-wider">
              {status}
            </div>
          )}

          {/* 👁️ Tag Lượt Xem - Góc phải trên */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-cyan-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 z-20 border border-cyan-500/20">
            <Eye className="w-3 h-3" />
            {views || 0}
          </div>

          {/* 🔥🔥🔥 LỚP PHỦ "XEM NGAY" KHI HOVER 🔥🔥🔥 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 backdrop-blur-[1px]">
             <div className="bg-red-600 text-white font-black uppercase px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.8)] transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest text-xs sm:text-sm">
               <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" /> XEM NGAY
             </div>
          </div>
        </div>

        {/* ==================== TÊN PHIM (NẰM NGOÀI ẢNH) ==================== */}
        <div className="mt-2.5 text-center sm:text-left px-0.5">
          <h3 className="text-gray-200 font-bold text-[11px] sm:text-xs leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
            {title}
          </h3>
        </div>

      </Link>
    </div>
  );
}