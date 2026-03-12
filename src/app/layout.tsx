// File: src/app/layout.tsx

// 1. Thêm dòng import này ở đầu file (dưới các dòng import khác)
import GoogleSchema from '@/components/GoogleSchema';

// ... (code cũ giữ nguyên)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        
        {/* 2. GẮN LÁ BÙA VÀO ĐÂY (Nó tàng hình nên để đâu trong body cũng được) */}
        <GoogleSchema />

        {children}
        
      </body>
    </html>
  );
}
// File: src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Đây chính là đoạn tối ưu SEO Google anh nói lúc nãy
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
    // BẮT BUỘC PHẢI CÓ THẺ html VÀ body Ở ĐÂY
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}