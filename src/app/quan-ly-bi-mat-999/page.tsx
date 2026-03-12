// File: src/app/quan-ly-bi-mat-999/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Film, Tv, DollarSign, LogOut, Edit, Trash2, Save, XCircle, PlusCircle, UploadCloud } from 'lucide-react';

export default function SuperAdmin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [movieList, setMovieList] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  
  const [affEnabled, setAffEnabled] = useState(true);
  const [affRatio, setAffRatio] = useState(50);
  const [affLink, setAffLink] = useState('');
  const [affCooldown, setAffCooldown] = useState(15);
  const [affMaxJumps, setAffMaxJumps] = useState(3);

  // 🔥 ĐÃ THÊM 'genre' VÀO FORM
  const [movieForm, setMovieForm] = useState({ title: '', thumbnail_url: '', day_of_week: '', rank: '0', status: '', genre: 'Tiên Hiệp' });
  const [epForm, setEpForm] = useState({ id: '', ep: '', sv1: '', sv2: '', sv3: '' });
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    fetchMovies(); fetchSettings();
  }, []);

  const fetchMovies = async () => { const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false }); if (data) setMovieList(data); };
  const fetchSettings = async () => { const { data } = await supabase.from('settings').select('*').eq('id', 1).single(); if (data) { setAffEnabled(data.is_enabled); setAffRatio(data.ratio); setAffLink(data.affiliate_link); setAffCooldown(data.cooldown || 0); setAffMaxJumps(data.max_jumps || 0); } };
  const fetchEps = async (mId: string) => { const { data } = await supabase.from('episodes').select('*').eq('movie_id', mId); if (data) setEpisodes(data.sort((a, b) => Number(b.episode_number) - Number(a.episode_number))); };

  const handleLogin = async (e: any) => { e.preventDefault(); setLoading(true); setErrorMsg(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setErrorMsg('Sai Email hoặc Mật khẩu!'); setLoading(false); };

  const handleUploadImage = async (e: any) => {
    const file = e.target.files[0]; if (!file) return;
    setIsUploading(true); const fileName = `poster_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('posters').upload(fileName, file);
    if (uploadError) alert('Lỗi: ' + uploadError.message);
    else { const { data } = supabase.storage.from('posters').getPublicUrl(fileName); setMovieForm({ ...movieForm, thumbnail_url: data.publicUrl }); alert('Tải ảnh thành công!'); }
    setIsUploading(false);
  };

  const handleSaveMovie = async (e: any) => {
    e.preventDefault();
    const slug = movieForm.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const payload = { ...movieForm, slug, rank: parseInt(movieForm.rank) };
    if (editingMovieId) { await supabase.from('movies').update(payload).eq('id', editingMovieId); alert("✅ Đã cập nhật!"); } 
    else { await supabase.from('movies').insert([payload]); alert("🎉 Thêm mới thành công!"); }
    setMovieForm({ title: '', thumbnail_url: '', day_of_week: '', rank: '0', status: '', genre: 'Tiên Hiệp' }); setEditingMovieId(null); fetchMovies();
  };

  const handleSaveEp = async (e: any) => {
    e.preventDefault(); if (!selectedMovie) return alert("Lỗi: Chưa chọn phim!");
    const payload = { movie_id: selectedMovie.id, episode_number: epForm.ep, server1_url: epForm.sv1, server2_url: epForm.sv2, server3_url: epForm.sv3 };
    if (epForm.id) { await supabase.from('episodes').update(payload).eq('id', epForm.id); alert("✅ Cập nhật xong!"); } else { await supabase.from('episodes').insert([payload]); alert("🎉 Thêm tập xong!"); }
    setEpForm({ id: '', ep: '', sv1: '', sv2: '', sv3: '' }); fetchEps(selectedMovie.id);
  };

  const handleSaveAffiliate = async () => {
    const { error } = await supabase.from('settings').update({ affiliate_link: affLink, is_enabled: affEnabled, ratio: affRatio, cooldown: affCooldown, max_jumps: affMaxJumps }).eq('id', 1);
    if (error) alert('Lỗi: ' + error.message); else alert('💰 Lưu MMO THÀNH CÔNG!');
  };

  if (!session) return (<div className="min-h-screen flex items-center justify-center bg-[#0b0c10]"><div className="bg-[#151720] p-8 rounded-2xl border border-cyan-500/30 w-full max-w-md"><h1 className="text-3xl font-black text-center text-cyan-400 mb-8">ADMIN PANEL</h1><form onSubmit={handleLogin} className="space-y-5"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0b0c10] text-white border border-gray-700 rounded-lg p-3 outline-none" placeholder="Email" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0b0c10] text-white border border-gray-700 rounded-lg p-3 outline-none" placeholder="Mật Khẩu" />{errorMsg && <div className="text-red-500 text-center text-sm">{errorMsg}</div>}<button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white font-black py-3 rounded-lg">ĐĂNG NHẬP</button></form></div></div>);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 bg-[#0b0c10] min-h-screen text-gray-200">
      <div className="flex justify-between items-center bg-[#151720] p-6 rounded-2xl border border-gray-800"><h1 className="text-2xl font-black text-cyan-400 flex items-center gap-2"><Tv/> TRUNG TÂM ĐIỀU HÀNH</h1><button onClick={() => supabase.auth.signOut()} className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2"><LogOut className="w-4 h-4" /> Thoát</button></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#151720] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-black text-cyan-400 mb-6 flex items-center gap-2"><Film/> {editingMovieId ? 'CHỈNH SỬA PHIM' : 'THÊM PHIM MỚI'}</h2>
            <form onSubmit={handleSaveMovie} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Tên phim..." value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl w-full text-white" />
                <div className="flex gap-2">
                  <input required placeholder="Link Ảnh (Nhập hoặc Tải lên)..." value={movieForm.thumbnail_url} onChange={e => setMovieForm({...movieForm, thumbnail_url: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl flex-1 text-white text-sm" />
                  <label className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/30 px-4 rounded-xl flex items-center justify-center cursor-pointer transition-all" title="Tải ảnh">
                    {isUploading ? <span className="animate-spin">⏳</span> : <UploadCloud className="w-5 h-5" />}
                    <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                  </label>
                </div>
                
                {/* 🔥 Ô CHỌN THỂ LOẠI */}
                <select required value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl w-full text-white font-bold text-cyan-400">
                  <option value="Tiên Hiệp">⛩️ Thể loại: Tiên Hiệp</option><option value="Huyền Huyễn">🐉 Thể loại: Huyền Huyễn</option><option value="Xuyên Không">🌀 Thể loại: Xuyên Không</option><option value="Trùng Sinh">⚡ Thể loại: Trùng Sinh</option><option value="Hài Hước">😂 Thể loại: Hài Hước</option>
                </select>

                <select required value={movieForm.day_of_week} onChange={e => setMovieForm({...movieForm, day_of_week: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl w-full text-white">
                  <option value="">Lịch chiếu...</option><option value="Thứ 2">Thứ 2</option><option value="Thứ 3">Thứ 3</option><option value="Thứ 4">Thứ 4</option><option value="Thứ 5">Thứ 5</option><option value="Thứ 6">Thứ 6</option><option value="Thứ 7">Thứ 7</option><option value="Chủ nhật">Chủ nhật</option><option value="Không có">Đã Full</option>
                </select>
                <div className="flex gap-2">
                  <select required value={movieForm.rank} onChange={e => setMovieForm({...movieForm, rank: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl w-1/2 text-white"><option value="0">Khỏi Top</option>{[1,2,3,4,5,6,7,8,9,10].map(r => (<option key={r} value={r}>Top {r}</option>))}</select>
                  <input required placeholder="Trạng thái..." value={movieForm.status} onChange={e => setMovieForm({...movieForm, status: e.target.value})} className="bg-[#0b0c10] border border-gray-700 px-3 py-3 rounded-xl w-1/2 text-white" />
                </div>
              </div>
              <button type="submit" disabled={isUploading} className={`w-full py-3.5 rounded-xl font-black ${editingMovieId ? 'bg-yellow-500 text-black' : 'bg-cyan-600 text-white'} ${isUploading ? 'opacity-50' : ''}`}>{editingMovieId ? 'LƯU CẬP NHẬT' : 'ĐĂNG PHIM MỚI'}</button>
              {editingMovieId && <button type="button" onClick={() => {setEditingMovieId(null); setMovieForm({title:'', thumbnail_url:'', day_of_week:'', rank:'0', status:'', genre:'Tiên Hiệp'})}} className="w-full text-center text-sm underline mt-2 text-gray-500">Hủy</button>}
            </form>
        </div>

        <div className="bg-[#151720] p-6 rounded-2xl border border-yellow-700/50">
            <h2 className="text-xl font-black text-yellow-500 mb-6 flex items-center gap-2"><DollarSign/> HỆ THỐNG MMO</h2>
            <div className="space-y-4">
              <div className="flex justify-between bg-[#0b0c10] p-3 rounded-xl border border-gray-800"><span>Trạng thái:</span><button onClick={() => setAffEnabled(!affEnabled)} className={`px-3 py-1 rounded font-bold text-xs ${affEnabled ? 'bg-green-500' : 'bg-red-500'}`}>{affEnabled ? 'BẬT' : 'TẮT'}</button></div>
              <input type="text" value={affLink} onChange={e => setAffLink(e.target.value)} className="w-full bg-[#0b0c10] border border-yellow-900/50 p-3 rounded-xl text-yellow-400 text-sm" placeholder="Link Shopee..." />
              <div className="bg-[#0b0c10] p-3 rounded-xl"><div className="flex justify-between text-xs mb-1 text-gray-400"><span>Tỷ lệ nhảy:</span><span className="text-yellow-500 font-bold">{affRatio}%</span></div><input type="range" min="0" max="100" value={affRatio} onChange={e => setAffRatio(Number(e.target.value))} className="w-full accent-yellow-500 h-1" /></div>
              <div className="flex gap-2">
                <div className="bg-[#0b0c10] p-2 rounded-xl border border-gray-800 flex-1"><label className="text-[10px] text-gray-400">Chờ/lần (Phút)</label><input type="number" value={affCooldown} onChange={e => setAffCooldown(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" /></div>
                <div className="bg-[#0b0c10] p-2 rounded-xl border border-gray-800 flex-1"><label className="text-[10px] text-gray-400">Max/Ngày/User</label><input type="number" value={affMaxJumps} onChange={e => setAffMaxJumps(Number(e.target.value))} className="w-full bg-transparent text-white font-bold outline-none" /></div>
              </div>
              <button onClick={handleSaveAffiliate} className="w-full bg-yellow-600 text-black font-black py-3 rounded-xl">LƯU CẤU HÌNH</button>
            </div>
        </div>
      </div>

      {selectedMovie && (
        <div className="bg-gradient-to-br from-[#101920] to-[#151720] p-6 rounded-2xl border border-green-500/30">
          <div className="flex justify-between mb-4"><h2 className="text-xl font-black text-green-400">QUẢN LÝ TẬP: {selectedMovie.title}</h2><button onClick={() => setSelectedMovie(null)} className="text-sm bg-gray-800 px-3 py-1 rounded">ĐÓNG</button></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveEp} className="space-y-3 bg-[#0b0c10] p-4 rounded-xl border border-gray-800"><div className="flex gap-2"><input required placeholder="Tập..." value={epForm.ep} onChange={e => setEpForm({...epForm, ep: e.target.value})} className="w-1/3 bg-[#151720] border border-gray-700 p-2 rounded text-center" /><input required placeholder="Link SV1..." value={epForm.sv1} onChange={e => setEpForm({...epForm, sv1: e.target.value})} className="w-2/3 bg-[#151720] border border-gray-700 p-2 rounded text-sm" /></div><input placeholder="Link SV2" value={epForm.sv2} onChange={e => setEpForm({...epForm, sv2: e.target.value})} className="w-full bg-[#151720] border border-gray-700 p-2 rounded text-sm" /><input placeholder="Link SV3" value={epForm.sv3} onChange={e => setEpForm({...epForm, sv3: e.target.value})} className="w-full bg-[#151720] border border-gray-700 p-2 rounded text-sm" /><button type="submit" className={`w-full py-2.5 rounded font-black ${epForm.id ? 'bg-yellow-600' : 'bg-green-600'}`}>{epForm.id ? 'LƯU TẬP' : 'ĐĂNG TẬP'}</button></form>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {episodes.map(ep => (<div key={ep.id} className="bg-[#0b0c10] p-3 rounded-xl border border-gray-800"><div className="flex justify-between items-start mb-2"><span className="font-black bg-gray-800 px-2 rounded">Tập {ep.episode_number}</span><div className="flex gap-1"><button onClick={() => setEpForm({id: ep.id, ep: ep.episode_number, sv1: ep.server1_url, sv2: ep.server2_url || '', sv3: ep.server3_url || ''})} className="text-yellow-500"><Edit className="w-4 h-4"/></button><button onClick={async () => { if(confirm("Xóa tập?")) { await supabase.from('episodes').delete().eq('id', ep.id); fetchEps(selectedMovie.id); } }} className="text-red-500"><Trash2 className="w-4 h-4"/></button></div></div></div>))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#151720] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-900/80 p-5 border-b border-gray-800"><h2 className="text-xl font-black text-white">KHO PHIM TỔNG HỢP</h2></div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-800/50">
            {movieList.map(m => (
              <tr key={m.id} className="hover:bg-gray-800/30">
                <td className="p-4 w-20"><img src={m.thumbnail_url} alt="thumb" className="w-12 h-16 object-cover rounded border border-gray-700" /></td>
                <td className="p-4">
                  <p className="font-black text-white text-lg">{m.title}</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span className="bg-gray-800 px-2 rounded">{m.status}</span>
                    <span className="bg-cyan-900/30 text-cyan-400 px-2 rounded border border-cyan-800">{m.genre || 'Khác'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => {setSelectedMovie(m); fetchEps(m.id)}} className="bg-cyan-600/10 text-cyan-400 px-3 py-1.5 rounded font-bold border border-cyan-500/30">TẬP</button>
                    <button onClick={() => {setEditingMovieId(m.id); setMovieForm({title: m.title, thumbnail_url: m.thumbnail_url, day_of_week: m.day_of_week || '', rank: m.rank.toString(), status: m.status, genre: m.genre || 'Tiên Hiệp'})}} className="bg-yellow-600/10 text-yellow-500 px-3 py-1.5 rounded border border-yellow-500/30"><Edit className="w-4 h-4"/></button>
                    <button onClick={async () => { if(confirm("Xóa?")) { await supabase.from('movies').delete().eq('id', m.id); fetchMovies(); } }} className="bg-red-600/10 text-red-500 px-3 py-1.5 rounded border border-red-500/30"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}