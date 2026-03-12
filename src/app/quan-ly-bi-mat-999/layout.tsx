// File: src/app/quan-ly-bi-mat-999/layout.tsx
import type { Metadata } from 'next';

// Tùy chỉnh Tiêu đề thẻ Tab và Tắt tính năng dò tìm của Google
export const metadata: Metadata = {
  title: 'Hệ Thống Quản Trị Supreme - HH3D',
  description: 'Khu vực điều hành nội bộ, cấm người lạ truy cập.',
  robots: {
    index: false,
    follow: false,
  }, // Lệnh này chặn Google Index trang Admin của em
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Bao bọc toàn bộ trang Admin với nền đen sâu
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 selection:bg-cyan-500 selection:text-white">
      {children}
    </div>
  );
}