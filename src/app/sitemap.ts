// File: src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 🔥 LƯU Ý: Sau này mua tên miền .com thì nhớ vào đây đổi lại link nhé
  const DOMAIN = 'https://xemphimhh3d.vercel.app'; 

  // Tự động mò vào Supabase lấy toàn bộ danh sách 250+ phim của em
  const { data: movies } = await supabase.from('movies').select('slug, created_at');

  // Tự động biến mỗi bộ phim thành 1 đường link để nộp cho Google
  const movieUrls = movies?.map((movie) => ({
    url: `${DOMAIN}/xem/${movie.slug}/moi-nhat`,
    lastModified: new Date(movie.created_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || [];

  return [
    {
      url: DOMAIN,
      lastModified: new Date(),
      changeFrequency: 'hourly', // Báo Google trang chủ cập nhật hàng giờ
      priority: 1.0,
    },
    ...movieUrls,
  ];
}