// File: src/components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Film, Loader2, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        const { data } = await supabase.from('movies').select('title, slug, thumbnail_url, status').ilike('title', `%${searchTerm}%`).limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
      } else { setSearchResults([]); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const genres = [
    { name: 'Tiên Hiệp', slug: 'tien-hiep' },
    { name: 'Huyền Huyễn', slug: 'huyen-huyen' },
    { name: 'Xuyên Không', slug: 'xuyen-khong' },
    { name: 'Trùng Sinh', slug: 'trung-sinh' },
    { name: 'Hài Hước', slug: 'hai-huoc' }
  ];

  return (
    <header className="bg-[#101218]/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* LOGO & MENU DESKTOP */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] transition-all">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xl font-black text-white tracking-tighter leading-none">XEMPHIM<span className="text-cyan-400">HH3D</span></span>
              <span className="text-[9px] text-gray-400 tracking-widest uppercase font-bold">Thế giới Anime 3D</span>
            </div>
          </Link>

          {/* MENU CÁC THỂ LOẠI (MÁY TÍNH) */}
          <nav className="hidden lg:flex items-center gap-6">
            {genres.map(g => (
              <Link key={g.slug} href={`/the-loai/${g.slug}`} className="text-sm font-bold text-gray-300 hover:text-cyan-400 transition-colors uppercase tracking-wide">
                {g.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* THANH TÌM KIẾM THÔNG MINH */}
        <div className="relative w-full max-w-xs md:max-w-md flex items-center gap-2">
          <div className="relative group w-full">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên phim..." className="w-full bg-[#1a1d27] border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-gray-500" />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          
          {/* NÚT MENU MOBILE */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {searchTerm.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#151720] border border-gray-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
              {isSearching ? <div className="p-4 text-center text-cyan-400 text-sm font-bold flex justify-center"><Loader2 className="w-4 h-4 animate-spin"/></div> 
              : searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] uppercase text-gray-500 font-black border-b border-gray-800 mb-1">Kết quả</div>
                  {searchResults.map(movie => (
                    <div key={movie.slug} onClick={() => { router.push(`/xem/${movie.slug}/moi-nhat`); setSearchTerm(''); setSearchResults([]); }} className="flex items-center gap-3 p-2 border-b border-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors last:border-0 group">
                      <img src={movie.thumbnail_url} className="w-8 h-12 object-cover rounded" alt={movie.title} />
                      <div className="flex flex-col"><span className="text-white text-sm font-bold group-hover:text-cyan-400 line-clamp-1">{movie.title}</span><span className="text-[10px] text-green-400 font-bold">{movie.status}</span></div>
                    </div>
                  ))}
                </div>
              ) : <div className="p-4 text-center text-gray-500 text-sm">😢 Không tìm thấy phim.</div>}
            </div>
          )}
        </div>
      </div>

      {/* MENU ĐIỆN THOẠI */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-[#151720] border-t border-gray-800 p-4 grid grid-cols-2 gap-3">
           {genres.map(g => (
              <Link key={g.slug} href={`/the-loai/${g.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-gray-300 hover:text-cyan-400 bg-gray-900 p-2 rounded text-center border border-gray-800">
                {g.name}
              </Link>
            ))}
        </nav>
      )}
    </header>
  );
}