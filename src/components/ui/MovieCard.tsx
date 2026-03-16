// File: src/components/ui/MovieCard.tsx
'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Play } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status }: any) {
  // Đã bỏ biến 'views' khỏi giao diện hiển thị để giấu view với khách
  
  return (
    <div onClick={() => runMMO(aff)} title={title} className="cursor-pointer group w-full h-full">
      <Link href={`/xem/${slug}/moi-nhat`} className="flex flex-col h-full bg-[#111319] rounded-xl overflow-hidden border border-gray-800 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300 relative">
        
        {/* KHUNG ẢNH POSTER */}
        <div className="relative aspect-[2/3] w-full overflow-hidden shrink-0">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* LỚP PHỦ GRADIENT (Làm nền cho text nếu cần) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-transparent to-transparent opacity-80"></div>

          {/* BADGE TÌNH TRẠNG PHIM */}
          {status && (
             <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
               <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black tracking-wider text-white shadow-md uppercase">
                 {status}
               </span>
             </div>
          )}

          {/* HIỆU ỨNG HOVER "XEM NGAY" (Thu nhỏ, tinh tế giữa màn hình) */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 backdrop-blur-[1px]">
            <div className="flex items-center gap-1.5 bg-cyan-500 text-black px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]">
              <Play className="w-4 h-4 fill-black" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Xem</span>
            </div>
          </div>
        </div>

        {/* KHUNG TÊN PHIM (Ôm trọn vào thẻ, hiện đủ chữ) */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col justify-center bg-[#111319] z-10 relative">
          <h3 className="text-xs sm:text-sm font-bold text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
        </div>

      </Link>
    </div>
  );
}