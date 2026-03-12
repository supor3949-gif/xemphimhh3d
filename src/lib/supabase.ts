// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Dấu ! ở cuối báo cho hệ thống biết: "Chắc chắn có link trong file .env.local rồi, hãy lấy ra dùng đi!"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)