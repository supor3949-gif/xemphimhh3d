// File: src/components/layout/Footer.tsx
import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b0c10] border-t border-gray-800 mt-12 pt-10 pb-6 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]"><Film className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-black text-white tracking-tighter">XEMPHIM<span className="text-cyan-400">HH3D</span></span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">Hệ thống xem phim Hoạt Hình 3D Trung Quốc siêu nét, tốc độ cao, cập nhật nhanh nhất thị trường. Phim vietsub, thuyết minh bản chuẩn 4K.</p>
        </div>
        
        <div>
          <h3 className="text-white font-black mb-4 uppercase text-sm border-l-2 border-cyan-500 pl-2">Liên Kết Nhanh</h3>
          <ul className="text-gray-400 text-sm space-y-2 font-medium">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Trang Chủ</Link></li>
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Phim Mới Cập Nhật</Link></li>
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Lịch Chiếu Phim</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-black mb-4 uppercase text-sm border-l-2 border-cyan-500 pl-2">DMCA & Bản Quyền</h3>
          <p className="text-gray-500 text-[11px] leading-relaxed text-justify">
            Trang web này cung cấp nội dung giải trí và KHÔNG lưu trữ bất kỳ tệp tin video nào trên máy chủ của chúng tôi. Mọi nội dung đều được thu thập từ các nguồn công khai chia sẻ trên internet. Nếu có vấn đề về bản quyền, vui lòng liên hệ qua Telegram: <a href="https://t.me/phimhh3d" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline">@phimhh3d</a> để được xử lý ngay lập tức..
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-6 border-t border-gray-800/50 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-600 text-[11px] font-medium relative z-10">
        <p>&copy; 2026 XEMPHIMHH3D. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link href="#" className="hover:text-cyan-400">Điều khoản dịch vụ</Link>
          <Link href="#" className="hover:text-cyan-400">Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  );
}