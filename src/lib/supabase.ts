// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Chèn thêm đoạn fetch với 'force-cache' để đóng băng truy vấn trong 60 giây (bảo vệ database)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }, 
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        next: { revalidate: 60 }, 
      });
    },
  },
});