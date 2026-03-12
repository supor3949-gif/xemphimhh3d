// File: src/app/(main)/xem/[slug]/layout.tsx
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

// Lệnh này tự động bắt Tên Phim và Ảnh Bìa để gắn vào thẻ Share Facebook/Zalo
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: movie } = await supabase.from('movies').select('*').eq('slug', resolvedParams.slug).single();

  if (!movie) return { title: 'Không tìm thấy phim' };

  return {
    title: `${movie.title} - Xem Phim HH3D Siêu Nét`,
    description: `Xem ngay phim ${movie.title} chất lượng 4K, Vietsub + Thuyết minh tốc độ cao nhất tại XEMPHIMHH3D.`,
    openGraph: {
      title: `${movie.title} - Xem Phim HH3D 4K`,
      description: `Đang phát: ${movie.title}. Xem ngay trên XEMPHIMHH3D!`,
      images: [movie.thumbnail_url], // Tự động lấy ảnh bìa của phim
    },
  };
}

export default function MovieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}