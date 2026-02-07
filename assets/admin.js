const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_CFG = "HH3D_CFG_V1";
const STORE_KEY_ADMIN = "HH3D_ADMIN_OK";

/* ✅ ĐỔI PIN Ở ĐÂY */
const ADMIN_PIN = "2026";

function $(id){ return document.getElementById(id); }

function loadMovies(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_MOVIES) || "[]"); }
  catch(e){ return []; }
}
function saveMovies(list){
  localStorage.setItem(STORE_KEY_MOVIES, JSON.stringify(list));
}
function loadCfg(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_CFG) || "{}"); }
  catch(e){ return {}; }
}
function saveCfg(cfg){
  localStorage.setItem(STORE_KEY_CFG, JSON.stringify(cfg));
}

/* 1=Th2..7=CN */
const DAYS = [
  {k:1, t:"Thứ 2"}, {k:2, t:"Thứ 3"}, {k:3, t:"Thứ 4"},
  {k:4, t:"Thứ 5"}, {k:5, t:"Thứ 6"}, {k:6, t:"Thứ 7"}, {k:7, t:"Chủ nhật"},
];

let pickedDays = new Set();
let currentEditId = null;

function renderDayPick(){
  const wrap = $("dayPick");
  wrap.innerHTML = "";
  DAYS.forEach(d=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dayChip" + (pickedDays.has(d.k) ? " active" : "");
    b.textContent = d.t;
    b.onclick = ()=>{
      if (pickedDays.has(d.k)) pickedDays.delete(d.k);
      else pickedDays.add(d.k);
      renderDayPick();
    };
    wrap.appendChild(b);
  });
}

function renderMovieList(){
  const wrap = $("movieListAdmin");
  const movies = loadMovies();

  wrap.innerHTML = "";
  if (!movies.length){
    wrap.innerHTML = `<div class="muted">Chưa có phim. Hãy thêm phim bên trái.</div>`;
    return;
  }

  movies.forEach(m=>{
    const row = document.createElement("div");
    row.className = "movieRowAdmin";
    row.innerHTML = `
      <div class="movieThumbAdmin" style="background-image:url('${m.poster||""}')"></div>
      <div>
        <div style="font-weight:900">${escapeHtml(m.title||"")}</div>
        <div class="muted" style="font-size:12px">${escapeHtml(m.genre||"")} • ID: ${escapeHtml(m.id||"")}</div>
      </div>
      <div class="rowBtns">
        <button class="smallBtn" type="button" data-act="edit">Sửa</button>
        <a class="smallBtn" href="./movie.html?id=${encodeURIComponent(m.id)}" target="_blank" rel="noopener">Xem</a>
        <button class="smallBtn" type="button" data-act="del">Xóa</button>
      </div>
    `;

    row.querySelector('[data-act="edit"]').onclick = ()=>loadToForm(m.id);
    row.querySelector('[data-act="del"]').onclick = ()=>deleteMovie(m.id);

    wrap.appendChild(row);
  });
}

function deleteMovie(id){
  const ok = confirm(`Xóa phim "${id}"?`);
  if (!ok) return;
  const movies = loadMovies().filter(m=>m.id!==id);
  saveMovies(movies);
  $("movieMsg").textContent = "Đã xóa phim.";
  if (currentEditId === id) clearForm();
  renderMovieList();
}

function loadToForm(id){
  const m = loadMovies().find(x=>x.id===id);
  if (!m) return;
  currentEditId = id;

  $("mId").value = m.id || "";
  $("mTitle").value = m.title || "";
  $("mGenre").value = m.genre || "";
  $("mPoster").value = m.poster || "";
  $("mTopRank").value = m.topRank ?? "";

  pickedDays = new Set(Array.isArray(m.scheduleDays) ? m.scheduleDays : []);
  renderDayPick();

  $("mVietsub").value = m.vietsubRaw || "";
  $("mThuyetminh").value = m.thuyetminhRaw || "";

  $("movieMsg").textContent = "Đã load phim lên form. Sửa xong bấm Lưu phim.";
}

function clearForm(){
  currentEditId = null;
  $("mId").value = "";
  $("mTitle").value = "";
  $("mGenre").value = "";
  $("mPoster").value = "";
  $("mTopRank").value = "";
  $("mVietsub").value = "";
  $("mThuyetminh").value = "";
  pickedDays = new Set();
  renderDayPick();
}

function saveMovie(){
  const id = ($("mId").value || "").trim();
  const title = ($("mTitle").value || "").trim();
  const genre = ($("mGenre").value || "").trim();
  const poster = ($("mPoster").value || "").trim();
  const topRankRaw = ($("mTopRank").value || "").trim();
  const topRank = topRankRaw ? Number(topRankRaw) : null;

  const vietsubRaw = $("mVietsub").value || "";
  const thuyetminhRaw = $("mThuyetminh").value || "";
  const scheduleDays = Array.from(pickedDays).sort((a,b)=>a-b);

  if (!id || !title){
    $("movieMsg").textContent = "Thiếu ID hoặc Tên phim.";
    return;
  }

  const movies = loadMovies();
  const idx = movies.findIndex(m=>m.id===id);

  const obj = {
    id,
    title,
    genre,
    poster,
    topRank: (Number.isFinite(topRank) ? topRank : undefined),
    scheduleDays,
    vietsubRaw,
    thuyetminhRaw,
  };

  if (idx >= 0) movies[idx] = { ...movies[idx], ...obj };
  else movies.push(obj);

  saveMovies(movies);
  $("movieMsg").textContent = "Đã lưu phim. Ra trang chủ sẽ tự cập nhật.";
  renderMovieList();
}

function saveConfig(){
  const cfg = loadCfg();
  cfg.fb = ($("cfgFb").value || "").trim();
  cfg.tg = ($("cfgTg").value || "").trim();
  cfg.zalo = ($("cfgZalo").value || "").trim();
  cfg.tiktok = ($("cfgTiktok").value || "").trim();
  cfg.shopeeWeb = ($("cfgShopeeWeb").value || "").trim();
  cfg.shopeeApp = ($("cfgShopeeApp").value || "").trim();

  const r = Number(($("cfgAffRate").value || "").trim());
  cfg.affRate = Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : 0.5;

  saveCfg(cfg);
  $("cfgMsg").textContent = "Đã lưu cấu hình (Contact + AFF).";
}

function loadConfigToInputs(){
  const cfg = loadCfg();
  $("cfgFb").value = cfg.fb || "";
  $("cfgTg").value = cfg.tg || "";
  $("cfgZalo").value = cfg.zalo || "";
  $("cfgTiktok").value = cfg.tiktok || "";
  $("cfgShopeeWeb").value = cfg.shopeeWeb || "";
  $("cfgShopeeApp").value = cfg.shopeeApp || "";
  $("cfgAffRate").value = (cfg.affRate ?? 0.5);
}

function login(){
  const pin = ($("pin").value || "").trim();
  if (pin !== ADMIN_PIN){
    $("loginMsg").textContent = "Sai PIN.";
    return;
  }
  localStorage.setItem(STORE_KEY_ADMIN, "1");
  $("loginMsg").textContent = "OK. Đang vào admin...";
  openAdminArea();
}

function openAdminArea(){
  $("adminArea").style.display = "block";
  $("loginMsg").textContent = "";
  renderDayPick();
  renderMovieList();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

function init(){
  renderDayPick();
  loadConfigToInputs();

  $("loginBtn").addEventListener("click", login);
  $("saveCfgBtn").addEventListener("click", saveConfig);
  $("saveMovieBtn").addEventListener("click", saveMovie);

  // auto login if remembered
  if (localStorage.getItem(STORE_KEY_ADMIN) === "1"){
    openAdminArea();
  }
}

document.addEventListener("DOMContentLoaded", init);
