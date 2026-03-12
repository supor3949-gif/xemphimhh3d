'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Eye, PlayCircle } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status, views }: any) {
  return (
    <div onClick={() => runMMO(aff)} title={title} className="cursor-pointer group">
      <Link href={`/xem/${slug}/moi-nhat`} className="block">
        
        {/* ==================== KHUNG ẢNH POSTER ==================== */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border-2 border-transparent group-hover:border-cyan-400 transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(34,211,238,0.7)]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30"></div>

          {/* 🏷️ Tag Trạng Thái - Đã tăng size chữ và padding */}
          {status && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[13px] sm:text-[15px] font-black px-3 py-1 rounded shadow-lg z-20 tracking-wider">
              {status}
            </div>
          )}

          {/* 👁️ Tag Lượt Xem - Đã tăng size chữ và icon */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-cyan-400 text-[13px] sm:text-[15px] font-black px-3 py-1 rounded flex items-center gap-2 z-20 border border-cyan-500/20">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            {views || 0}
          </div>

          {/* 🔥🔥🔥 LỚP PHỦ "XEM NGAY" - Đã tăng size nút và chữ */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 backdrop-blur-[1px]">
             <div className="bg-red-600 text-white font-black uppercase px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.8)] transform scale-90 group-hover:scale-110 transition-transform duration-300 tracking-widest text-sm sm:text-base">
               <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" /> XEM NGAY
             </div>
          </div>
        </div>

        {/* ==================== TÊN PHIM - Đã tăng size chữ ==================== */}
        <div className="mt-4 text-center sm:text-left px-1">
          <h3 className="text-gray-200 font-bold text-[15px] sm:text-lg leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
            {title}
          </h3>
        </div>

      </Link>
    </div>
  );
}
