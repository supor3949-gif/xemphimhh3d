// src/lib/supabase.js

// CHÚ THÍCH: File này dùng để khởi tạo kết nối tới Supabase Database của bạn.

import { createClient } from '@supabase/supabase-js';

// Lấy URL và Anon Key từ biến môi trường (Environment Variables) mà bạn đã thêm ở Bước 7
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kiểm tra xem biến môi trường đã được tải chưa
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Thiếu Supabase URL hoặc Anon Key. Vui lòng kiểm tra file .env.local hoặc Vercel Environment Variables.");
}

// Tạo Client kết nối
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// CHÚ THÍCH: Bây giờ các file khác chỉ cần import 'supabase' từ file này là dùng được.
