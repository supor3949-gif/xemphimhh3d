// File: src/components/ui/MovieCard.tsx
'use client';
import Link from 'next/link';
import { runMMO } from '@/lib/mmo';
import { Eye } from 'lucide-react';

export default function MovieCard({ title, image, slug, aff, status, views }: any) {
  return (
    <div 
      onClick={() => runMMO(aff)} 
      // Gắn thuộc tính title để khi rê chuột vào sẽ hiện full tên phim (Tooltip mặc định siêu an toàn)
      title={title} 
      className="relative group overflow-hidden rounded-lg cursor-pointer bg-[#151720] border border-transparent hover:border-cyan-500/50 transition-all duration-300 shadow-lg"
    >
      <Link href={`/xem/${slug}/moi-nhat`} className="block">
        {/* Khung ảnh tỷ lệ dọc (Poster chuẩn) */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Lớp phủ đen Gradient từ dưới lên (Dày hơn một chút để chữ nổi bật) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* 🏷️ Tag Trạng Thái (VD: Tập 15) - Góc trái trên */}
          {status && (
            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.8)] z-10 tracking-wider">
              {status}
            </div>
          )}

          {/* 👁️ Tag Lượt Xem - Góc phải trên */}
          <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-cyan-400 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 z-10 border border-cyan-500/20">
            <Eye className="w-3 h-3" />
            {views || 0}
          </div>

          {/* 📝 Tên Phim (Đã xóa dòng Vietsub) */}
          <div className="absolute bottom-0 left-0 w-full p-2 sm:p-2.5 z-10">
            <h3 className="text-white font-bold text-[11px] sm:text-xs leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors drop-shadow-md">
              {title}
            </h3>
            {/* Đã tháo gỡ hoàn toàn đoạn <p> chứa dòng chữ Vietsub thừa thãi */}
          </div>
        </div>
      </Link>
    </div>
  );
}