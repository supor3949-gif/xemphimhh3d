// File: src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 1. GỌI LÁ BÙA TỪ THƯ MỤC COMPONENTS VÀO ĐÂY
import GoogleSchema from '@/components/GoogleSchema';

const inter = Inter({ subsets: ['latin'] });

// BỘ SEO CƠ BẢN CỦA TRANG WEB
export const metadata: Metadata = {
  title: 'XEMPHIMHH3D - Web Phim Hoạt Hình 3D Trung Quốc',
  description: 'Tổng hợp phim HH3D hot nhất: Tiên Nghịch, Phàm Nhân Tu Tiên, Thần Ấn Vương Tọa... Chất lượng 4K, Vietsub, Thuyết minh nhanh nhất.',
  keywords: 'hh3d, hoạt hình 3d, phim 3d trung quốc, tiên nghịch, xem phim 3d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        
        {/* 2. GẮN LÁ BÙA VÀO BÊN TRONG THẺ BODY */}
        <GoogleSchema />

        {/* NỘI DUNG TOÀN BỘ TRANG WEB */}
        {children}

      </body>
    </html>
  );
}