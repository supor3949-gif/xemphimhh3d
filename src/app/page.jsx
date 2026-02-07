// app/page.jsx (hoặc pages/index.js)

import React from 'react';
import Link from 'next/link';

// --- CHÚ THÍCH: Đây là file giao diện trang chủ chính của website. ---
// Chúng ta dùng Tailwind CSS để tạo giao diện tông màu tối (dark mode) chuyên nghiệp.

const HomePage = () => {
  return (
    // Bao ngoài cùng là nền tối, font chữ màu trắng mặc định
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      
      {/* 1. Header & Thanh tìm kiếm */}
      <header className="p-4 shadow-lg bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-400">XEMPHIMHD3D</h1>
        
        {/* CHÚ THÍCH: Thanh tìm kiếm (chức năng sẽ làm sau) */}
        <input 
          type="text" 
          placeholder="Tìm kiếm phim..." 
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-400 w-1/3 max-w-md hidden md:block" // Ẩn trên di động, hiện trên máy tính
        />
        
        {/* CHÚ THÍCH: Chức năng đăng nhập/profile (làm sau) */}
        <nav className="flex space-x-4">
          <Link href="/login" className="text-gray-300 hover:text-teal-400">Đăng nhập</Link>
        </nav>
      </header>

      {/* 2. Main Content Layout (Bố cục chính) */}
      <main className="container mx-auto p-4 flex flex-col lg:flex-row gap-8">
        
        {/* Cột chính bên trái: Carousel, Lịch phim, Danh sách phim */}
        <div className="flex-grow lg:w-2/3">
          
          {/* --- KHU VỰC THANH CUỘN TỰ ĐỘNG (CAROUSEL) --- */}
          {/* CHÚ THÍCH: Placeholder cho phần Carousel. Chúng ta sẽ thay thế bằng thư viện Swiper sau. */}
          <section className="mb-8 p-4 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-teal-400 pl-3">🔥 Phim Hot Đang Chiếu (Carousel Placeholder)</h2>
            <div className="flex overflow-x-scroll space-x-4 pb-4">
              {/* Vòng lặp các item placeholder */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex-shrink-0 w-40 transform hover:scale-105 transition duration-300 cursor-pointer">
                  <div className="bg-gray-700 h-64 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-gray-500">Poster {i}</span>
                  </div>
                  <p className="mt-2 text-sm truncate">Tên phim {i}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --- KHU VỰC LỊCH PHIM & DANH SÁCH --- */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-teal-400 pl-3">📅 Lịch Chiếu Phim</h2>
            {/* CHÚ THÍCH: Phần lịch phim từ T2 đến CN (sẽ làm sau) */}
            <div className="grid grid-cols-7 gap-2 text-center">
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
                    <button key={day} className="p-3 bg-gray-800 rounded-lg hover:bg-teal-600 transition">
                        {day}
                    </button>
                ))}
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                {/* Danh sách phim theo ngày hiện tại */}
                <p>Danh sách phim cho ngày hôm nay (chức năng lọc sẽ làm sau)...</p>
            </div>
          </section>

        </div>

        {/* Cột bên phải: Bảng xếp hạng Top 1-10 */}
        <aside className="w-full lg:w-1/3">
          <section className="p-4 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-red-500 pl-3">🏆 Bảng Xếp Hạng</h2>
            
            {/* CHÚ THÍCH: Danh sách top 10 (sẽ làm sau) */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
              <div key={rank} className="flex items-center mb-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer">
                <span className={`mr-4 font-bold text-lg ${rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{rank}.</span>
                <span>Tên phim Top {rank}</span>
              </div>
            ))}
          </section>
        </aside>
      </main>

      {/* 3. Footer (Chân trang - Pháp lý & Liên hệ) */}
      <footer className="mt-12 p-4 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto text-center text-gray-400">
          {/* CHÚ THÍCH: Dòng pháp lý */}
          <p className="mb-2">Đây là dòng pháp lý của bạn. Vui lòng tôn trọng bản quyền phim ảnh.</p>
          
          {/* CHÚ THÍCH: Phần liên hệ (Icons sẽ thêm sau) */}
          <p>Liên hệ: Facebook | Telegram | Zalo</p>
          <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} Tên Website Của Bạn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
