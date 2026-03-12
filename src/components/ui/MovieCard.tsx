'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Eye, PlayCircle } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status, views }: any) {
  return (
    <div onClick={() => runMMO(aff)} title={title} className="cursor-pointer group w-full">
      <Link href={`/xem/${slug}/moi-nhat`} className="block">
        
        {/* KHUNG ẢNH - Bo góc mạnh hơn cho sang */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border-[3px] border-transparent group-hover:border-cyan-500 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

          {/* Tag Trạng Thái - Nhỏ gọn, font dày dặn */}
          {status && (
            <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-lg z-20 uppercase tracking-tighter">
              {status}
            </div>
          )}

          {/* Tag Lượt Xem - Thiết kế kính mờ (Glassmorphism) */}
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-cyan-400 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-20 border border-white/10">
            <Eye className="w-3.5 h-3.5" />
            {views || 0}
          </div>

          {/* Nút XEM NGAY - Hiệu ứng LED rực rỡ */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-30 backdrop-blur-[2px]">
             <div className="bg-cyan-500 text-black font-black uppercase px-6 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.9)] transform scale-75 group-hover:scale-100 transition-transform duration-300 text-xs">
               <PlayCircle className="w-5 h-5 fill-black" /> XEM NGAY
             </div>
          </div>
        </div>

        {/* Tên Phim - Căn chỉnh lại để không bị thô khi card to */}
        <div className="mt-3.5 text-center sm:text-left px-1">
          <h3 className="text-gray-200 font-bold text-[14px] sm:text-[16px] leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
            {title}
          </h3>
        </div>

      </Link>
    </div>
  );
}
