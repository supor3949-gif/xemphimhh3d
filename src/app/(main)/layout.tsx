// File: src/app/(main)/layout.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col">
      {/* Header - Thanh điều hướng và Tìm kiếm */}
      <Header />
      
      {/* Main - Phần thân trang web (Hiển thị Trang chủ, Trang xem phim...) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6">
        {children}
      </main>
      
      {/* Footer - Chân trang */}
      <Footer />
    </div>
  );
}