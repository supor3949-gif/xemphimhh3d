// File: src/components/ui/MovieCard.tsx
'use client';
import { Play, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { runMMO } from '@/lib/mmo';

export default function MovieCard({ title, image, slug, aff, status, views }: { title: string, image: string, slug: string, aff?: any, status?: string, views?: number }) {
  const router = useRouter();

  const handleClick = () => { runMMO(aff); router.push(`/xem/${slug}/moi-nhat`); };

  // Hàm làm gọn con số (VD: 15400 -> 15.4K)
  const formatViews = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div onClick={handleClick} className="group relative block overflow-hidden rounded-lg cursor-pointer bg-[#151720] border border-gray-800 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]">
      <div className="aspect-[2/3] overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-cyan-500/80 p-3 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] transform scale-50 group-hover:scale-100 transition-all duration-300"><Play className="w-8 h-8 text-white fill-white" /></div>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">{status || '4K'}</span>
        </div>
        {/* 🔥 Ô HIỂN THỊ LƯỢT XEM */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
          <Eye className="w-3 h-3 text-cyan-400" /> {formatViews(views || 0)}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/90 to-transparent p-2 pt-10">
        <h3 className="text-white font-semibold text-[13px] line-clamp-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
        <div className="text-[10px] text-gray-500 mt-0.5 font-medium flex justify-between">
          <span>Vietsub + Thuyết Minh</span>
        </div>
      </div>
    </div>
  );
}