// src/app/page.jsx

import React from 'react';
import Link from 'next/link';
import { supabase } = require('./lib/supabase'); // Import kết nối supabase

// --- CHÚ THÍCH: Đây là giao diện trang chủ chính, bây giờ có thêm chức năng lấy dữ liệu thật từ Supabase ---

// Next.js cho phép dùng async component để lấy dữ liệu trực tiếp từ database ở phía server
async function HomePage() {
  
  // Lấy dữ liệu từ bảng 'movies'
  const { data: movies, error } = await supabase
    .from('movies') // Tên bảng của bạn là 'movies' (hoặc 'xemphimhh3d')
    .select('*')    // Lấy tất cả các cột
    .order('created_at', { ascending: false }); // Sắp xếp theo ngày mới nhất

  if (error) {
    console.error("Lỗi khi lấy dữ liệu phim:", error);
    // Vẫn render giao diện để không bị trắng trang
  }

  // Lọc phim hot cho thanh cuộn (carousel)
  const hotMovies = movies?.filter(movie => movie.is_hot === true) || [];
  // Lọc phim cho bảng xếp hạng Top 1-10
  const topMovies = movies?.filter(movie => movie.rank > 0 && movie.rank <= 10).sort((a, b) => a.rank - b.rank) || [];


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      
      {/* 1. Header & Thanh tìm kiếm */}
      <header className="p-4 shadow-lg bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-400">XEMPHIMHD3D</h1>
        <input 
          type="text" 
          placeholder="Tìm kiếm phim..." 
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-teal-400 w-1/3 max-w-md hidden md:block"
        />
        <nav className="flex space-x-4">
          <Link href="/login" className="text-gray-300 hover:text-teal-400">Đăng nhập</Link>
        </nav>
      </header>

      {/* 2. Main Content Layout */}
      <main className="container mx-auto p-4 flex flex-col lg:flex-row gap-8">
        
        <div className="flex-grow lg:w-2/3">
          
          {/* --- KHU VỰC THANH CUỘN TỰ ĐỘNG (CAROUSEL) --- */}
          <section className="mb-8 p-4 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-teal-400 pl-3">🔥 Phim Hot Đang Chiếu</h2>
            <div className="flex overflow-x-scroll space-x-4 pb-4">
              {/* Lặp qua dữ liệu phim hot thật từ Supabase */}
              {hotMovies.map((movie) => (
                <Link href={`/${movie.id}`} key={movie.id} className="flex-shrink-0 w-40 transform hover:scale-105 transition duration-300 cursor-pointer">
                  {/* Sử dụng link ảnh từ Google mà bạn đã nhập trong Supabase */}
                  <img src={movie.poster_url} alt={movie.title} className="h-64 w-full object-cover rounded-lg shadow-md" />
                  <p className="mt-2 text-sm truncate">{movie.title}</p>
                </Link>
              ))}
              {hotMovies.length === 0 && <p className="text-gray-500">Chưa có phim hot nào. Vui lòng thêm dữ liệu vào Supabase.</p>}
            </div>
          </section>

          {/* --- KHU VỰC LỊCH PHIM & DANH SÁCH --- */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-teal-400 pl-3">📅 Lịch Chiếu Phim</h2>
             {/* ... (phần code lịch phim sẽ được bổ sung sau) ... */}
             <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p>Danh sách phim cho ngày hôm nay...</p>
            </div>
          </section>

        </div>

        {/* Cột bên phải: Bảng xếp hạng Top 1-10 */}
        <aside className="w-full lg:w-1/3">
          <section className="p-4 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-red-500 pl-3">🏆 Bảng Xếp Hạng</h2>
            
            {topMovies.map((movie, index) => (
              <div key={movie.id} className="flex items-center mb-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer">
                <span className={`mr-4 font-bold text-lg ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{index + 1}.</span>
                <span>{movie.title}</span>
              </div>
            ))}
             {topMovies.length === 0 && <p className="text-gray-500">Chưa có phim top nào. Vui lòng thêm dữ liệu vào Supabase.</p>}
          </section>
        </aside>
      </main>

      {/* 3. Footer (Chân trang - Pháp lý & Liên hệ) */}
      <footer className="mt-12 p-4 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto text-center text-gray-400">
          <p className="mb-2">Đây là dòng pháp lý của bạn. Vui lòng tôn trọng bản quyền phim ảnh.</p>
          <p>Liên hệ: Facebook | Telegram | Zalo</p>
          <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} Tên Website Của Bạn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
