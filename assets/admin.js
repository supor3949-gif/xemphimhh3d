/* ==========================
   HH3D TEMPLATE - ADMIN
   - LocalStorage (không cần DB)
   - Tự thêm phim, tự sinh ô phim ở Home
   - Tự dán list tập (RAW) -> movie.html tự nhận số tập
========================== */

const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_SETTINGS = "HH3D_SETTINGS_V1";
const STORE_KEY_CONTACT = "HH3D_CONTACT_V1";

// ✅ Đổi mật khẩu admin ở đây nếu muốn
const ADMIN_PASSWORD = "hh3d2026";

const $ = (id) => document.getElementById(id);

function showModal(title, body){
  const back = $("modalBack");
  if (!back) return alert(body);
  $("modalTitle").textContent = title;
  $("modalBody").textContent = body;
  back.style.display = "flex";
  back.setAttribute("aria-hidden","false");
}
function hideModal(){
  const back = $("modalBack");
  if (!back) return;
  back.style.display = "none";
  back.setAttribute("aria-hidden","true");
}

function loadMovies(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_MOVIES) || "[]"); }
  catch{ return []; }
}
function saveMovies(movies){
  localStorage.setItem(STORE_KEY_MOVIES, JSON.stringify(movies));
}

function loadSettings(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_SETTINGS) || "{}"); }
  catch{ return {}; }
}
function saveSettings(s){
  localStorage.setItem(STORE_KEY_SETTINGS, JSON.stringify(s));
}

function loadContact(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_CONTACT) || "{}"); }
  catch{ return {}; }
}
function saveContact(c){
  localStorage.setItem(STORE_KEY_CONTACT, JSON.stringify(c));
}

function escapeHtml(s){
  return String(s||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// ------- Auth -------
function isLogged(){
  return localStorage.getItem("HH3D_ADMIN_OK") === "1";
}
function setLogged(v){
  localStorage.setItem("HH3D_ADMIN_OK", v ? "1" : "0");
}
function requireLogin(){
  if (!isLogged()){
    showModal("Chưa đăng nhập", "Nhập mật khẩu admin để dùng chức năng này.");
    return false;
  }
  return true;
}

// ------- Day Picker -------
const DAY_MAP = [
  {val:2, label:"Th2"},
  {val:3, label:"Th3"},
  {val:4, label:"Th4"},
  {val:5, label:"Th5"},
  {val:6, label:"Th6"},
  {val:7, label:"Th7"},
  {val:8, label:"CN"},
];

let pickedDays = new Set();

function renderDayPick(){
  const el = $("m_days");
  el.innerHTML = "";
  DAY_MAP.forEach(d=>{
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = d.label;
    b.className = pickedDays.has(d.val) ? "active" : "";
    b.onclick = ()=>{
      if (pickedDays.has(d.val)) pickedDays.delete(d.val);
      else pickedDays.add(d.val);
      renderDayPick();
    };
    el.appendChild(b);
  });
}

// ------- Movie List -------
function renderMovieList(){
  const el = $("movieList");
  const movies = loadMovies();
  el.innerHTML = "";

  if (!movies.length){
    el.innerHTML = `<div class="empty">Chưa có phim. Nhập form bên trái và bấm “Lưu phim”.</div>`;
    return;
  }

  movies
    .slice()
    .sort((a,b)=> String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")))
    .forEach(m=>{
      const row = document.createElement("div");
      row.className = "movieRowAdmin";
      row.innerHTML = `
        <div style="min-width:0">
          <b>${escapeHtml(m.title)} <span class="muted small">(${escapeHtml(m.id)})</span></b>
          <small>${escapeHtml(m.genre||"")} • topRank: ${m.topRank ?? "-"}</small>
        </div>
        <div class="rowBtns">
          <button type="button" data-act="edit">Sửa</button>
          <button type="button" data-act="del">Xóa</button>
        </div>
      `;

      row.querySelector('[data-act="edit"]').onclick = ()=>{
        if (!requireLogin()) return;
        fillForm(m);
      };
      row.querySelector('[data-act="del"]').onclick = ()=>{
        if (!requireLogin()) return;
        const ok = confirm(`Xóa phim "${m.title}" ?`);
        if (!ok) return;
        const next = loadMovies().filter(x=>x.id!==m.id);
        saveMovies(next);
        renderMovieList();
        $("movieHint").textContent = "Đã xóa.";
      };

      el.appendChild(row);
    });
}

function fillForm(m){
  $("m_id").value = m.id || "";
  $("m_title").value = m.title || "";
  $("m_genre").value = m.genre || "";
  $("m_poster").value = m.poster || "";
  $("m_top").value = (m.topRank ?? "") === null ? "" : String(m.topRank ?? "");
  $("m_vs").value = m.rawVietsub || "";
  $("m_tm").value = m.rawThuyetminh || "";

  pickedDays = new Set(Array.isArray(m.scheduleDays) ? m.scheduleDays : []);
  renderDayPick();

  $("movieHint").textContent = "Đã nạp phim vào form. Sửa xong bấm Lưu phim.";
}

// ------- Save Movie -------
function saveMovieFromForm(){
  if (!requireLogin()) return;

  const id = ($("m_id").value || "").trim();
  const title = ($("m_title").value || "").trim();
  if (!id || !title){
    $("movieHint").textContent = "Thiếu ID hoặc Tên phim.";
    return;
  }

  const genre = ($("m_genre").value || "").trim();
  const poster = ($("m_poster").value || "").trim();
  const topRankRaw = ($("m_top").value || "").trim();
  const topRank = topRankRaw ? parseInt(topRankRaw,10) : null;

  const rawVietsub = $("m_vs").value || "";
  const rawThuyetminh = $("m_tm").value || "";

  const scheduleDays = Array.from(pickedDays.values()).sort((a,b)=>a-b);

  const movies = loadMovies();
  const idx = movies.findIndex(x=>x.id===id);

  const now = new Date().toISOString();

  const obj = {
    id, title, genre, poster,
    topRank: (Number.isFinite(topRank) ? topRank : null),
    scheduleDays,
    rawVietsub,
    rawThuyetminh,
    updatedAt: now
  };

  if (idx >= 0) movies[idx] = obj;
  else movies.push(obj);

  saveMovies(movies);
  renderMovieList();

  $("movieHint").textContent = "Đã lưu phim. Ra Trang chủ sẽ tự hiện.";
}

// ------- Settings (AFF) -------
function loadSettingsToUI(){
  const s = loadSettings();
  $("affTiktok").value = s.affTiktok || "";
  $("affShopee").value = s.affShopee || "";
  $("affRate").value = String(s.affRate ?? "0.5");
  $("affSplit").value = String(s.affSplit ?? "50");
}
function saveSettingsFromUI(){
  if (!requireLogin()) return;

  const s = loadSettings();
  s.affTiktok = ($("affTiktok").value || "").trim();
  s.affShopee = ($("affShopee").value || "").trim();
  s.affRate = Number($("affRate").value || 0);
  s.affSplit = Number($("affSplit").value || 50);
  saveSettings(s);

  $("settingsHint").textContent = "Đã lưu AFF. Bấm chọn tập sẽ chạy theo tỉ lệ.";
}

// ------- Contact -------
function loadContactToUI(){
  const c = loadContact();
  $("c_fb").value = c.facebook || "";
  $("c_tg").value = c.telegram || "";
  $("c_zalo").value = c.zalo || "";
}
function saveContactFromUI(){
  if (!requireLogin()) return;

  const c = {
    facebook: ($("c_fb").value || "").trim(),
    telegram: ($("c_tg").value || "").trim(),
    zalo: ($("c_zalo").value || "").trim(),
  };
  saveContact(c);
  $("contactHint").textContent = "Đã lưu liên hệ. Trang chủ sẽ tự cập nhật.";
}

// ------- Import/Export -------
function exportJSON(){
  if (!requireLogin()) return;
  const payload = {
    movies: loadMovies(),
    settings: loadSettings(),
    contact: loadContact(),
  };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hh3d-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSONFile(file){
  if (!requireLogin()) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(String(reader.result||"{}"));
      if (Array.isArray(obj.movies)) saveMovies(obj.movies);
      if (obj.settings) saveSettings(obj.settings);
      if (obj.contact) saveContact(obj.contact);
      renderMovieList();
      loadSettingsToUI();
      loadContactToUI();
      showModal("OK", "Đã nhập dữ liệu.");
    }catch(e){
      showModal("Lỗi", "File JSON không hợp lệ.");
    }
  };
  reader.readAsText(file);
}

// ------- Demo seed -------
function seedDemo(){
  if (!requireLogin()) return;
  const movies = loadMovies();
  const now = new Date().toISOString();

  const demo = [
    {
      id:"tien-nghich",
      title:"Tiên Nghịch",
      genre:"Tiên hiệp",
      poster:"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=60",
      topRank:1,
      scheduleDays:[2,4,6],
      rawVietsub:`Tập 01|https://player.phimapi.com/player/?url=https://s6.kkphimplayer6.com/20260202/qltZQ6Tn/index.m3u8`,
      rawThuyetminh:``,
      updatedAt: now
    },
    {
      id:"ngich-thien-chi-ton",
      title:"Nghịch Thiên Chí Tôn",
      genre:"Huyền huyễn",
      poster:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60",
      topRank:2,
      scheduleDays:[3,5,7],
      rawVietsub:``,
      rawThuyetminh:``,
      updatedAt: now
    }
  ];

  const merged = [...movies];
  demo.forEach(d=>{
    const idx = merged.findIndex(x=>x.id===d.id);
    if (idx>=0) merged[idx]=d; else merged.push(d);
  });

  saveMovies(merged);
  renderMovieList();
  showModal("OK", "Đã thêm demo. Ra Trang chủ xem.");
}

// ------- Init -------
document.addEventListener("DOMContentLoaded", ()=>{
  // modal close
  $("closeModal").onclick = hideModal;
  $("modalBack").onclick = (e)=>{ if(e.target.id==="modalBack") hideModal(); };
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") hideModal(); });

  renderDayPick();
  renderMovieList();
  loadSettingsToUI();
  loadContactToUI();

  // login
  $("btnLogin").onclick = ()=>{
    const pass = ($("adminPass").value || "").trim();
    if (pass === ADMIN_PASSWORD){
      setLogged(true);
      $("loginHint").textContent = "Đăng nhập OK.";
      showModal("OK", "Bạn đã đăng nhập admin.");
    } else {
      setLogged(false);
      $("loginHint").textContent = "Sai mật khẩu.";
      showModal("Sai mật khẩu", "Mật khẩu admin không đúng.");
    }
  };

  // save settings/contact/movie
  $("btnSaveSettings").onclick = saveSettingsFromUI;
  $("btnSaveContact").onclick = saveContactFromUI;
  $("btnSaveMovie").onclick = saveMovieFromForm;

  // export/import
  $("btnExport").onclick = exportJSON;
  $("btnImport").onclick = ()=>{
    if (!requireLogin()) return;
    $("importFile").click();
  };
  $("importFile").addEventListener("change",(e)=>{
    const f = e.target.files?.[0];
    if (f) importJSONFile(f);
    e.target.value = "";
  });

  $("btnSeedDemo").onclick = seedDemo;

  // hint login state
  if (isLogged()) $("loginHint").textContent = "Bạn đang đăng nhập.";
});
