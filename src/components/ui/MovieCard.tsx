'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Eye, PlayCircle } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status, views }: any) {
  return (
    <div onClick={() => runMMO(aff)} title={title} className="cursor-pointer group">
      <Link href={`/xem/${slug}/moi-nhat`} className="block">
        
        {/* ==================== KHUNG ẢNH POSTER ==================== */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-900 border-2 border-transparent group-hover:border-cyan-500/50 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          
          {/* Lớp phủ Gradient cho chuyên nghiệp */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          {/* 🏷️ Tag Trạng Thái - Đã sửa nhỏ lại, chữ sát nhau cho đẹp */}
          {status && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-[0_2px_10px_rgba(220,38,38,0.5)] z-20 tracking-tighter uppercase">
              {status}
            </div>
          )}

          {/* 👁️ Tag Lượt Xem - Nhỏ gọn, icon mảnh hơn */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-cyan-400 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-20 border border-white/10">
            <Eye className="w-3.5 h-3.5" />
            {views || 0}
          </div>

          {/* 🔥🔥🔥 LỚP PHỦ "XEM NGAY" - Hiệu ứng Glow rực rỡ khi hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-30 backdrop-blur-[2px]">
             <div className="bg-cyan-500 text-black font-black uppercase px-5 py-2 rounded-full flex items-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300 tracking-wider text-xs">
               <PlayCircle className="w-5 h-5 fill-black" /> XEM NGAY
             </div>
          </div>
        </div>

        {/* ==================== TÊN PHIM - Cân đối lại size chữ ==================== */}
        <div className="mt-3 text-center sm:text-left px-1">
          <h3 className="text-gray-200 font-semibold text-[13px] sm:text-[15px] leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
            {title}
          </h3>
        </div>

      </Link>
    </div>
  );
}
