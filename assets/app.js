/* =========================
  HH3D TEMPLATE — HOME (index)
  - Data demo dùng LocalStorage
  - Sau này bạn muốn Supabase thì thay load/save bằng API thật
========================= */

const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_CFG = "HH3D_CFG_V1";

/* ====== TIME: Giờ HCM ====== */
function getHCMDate(){
  const fmt = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year:"numeric", month:"2-digit", day:"2-digit",
    weekday:"long"
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t)=>parts.find(p=>p.type===t)?.value || "";
  return { d:get("day"), m:get("month"), y:get("year"), weekday:get("weekday") };
}

/* ====== CFG ====== */
function loadCfg(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY_CFG) || "{}");
  }catch(e){ return {}; }
}

function applyCfgToFooter(){
  const cfg = loadCfg();
  const fb = document.getElementById("fbLink");
  const tg = document.getElementById("tgLink");
  const zl = document.getElementById("zaloLink");

  if (fb) fb.href = cfg.fb || "#";
  if (tg) tg.href = cfg.tg || "#";
  if (zl) zl.href = cfg.zalo || "#";
}

/* ====== MOVIES ====== */
function seedIfEmpty(){
  const cur = loadMovies();
  if (cur.length) return;

  // DEMO 2 phim để bạn thấy chạy (vào admin sửa/xóa)
  const demo = [
    {
      id:"tien-nghich",
      title:"Tiên Nghịch",
      genre:"Tiên hiệp",
      poster:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1200&q=70",
      topRank:1,
      // scheduleDays: 1=Thứ2 ... 7=Chủ nhật  ✅ (FIX chuẩn, không còn trùng CN)
      scheduleDays:[5,7],
      vietsubRaw:"",
      thuyetminhRaw:"",
    },
    {
      id:"ngichthienchiton",
      title:"Nghịch Thiên Chí Tôn",
      genre:"Huyền huyễn",
      poster:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=70",
      topRank:2,
      scheduleDays:[5],
      vietsubRaw:"",
      thuyetminhRaw:"",
    }
  ];
  localStorage.setItem(STORE_KEY_MOVIES, JSON.stringify(demo));
}

function loadMovies(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY_MOVIES) || "[]");
  }catch(e){ return []; }
}

/* ====== UI helpers ====== */
function $(id){ return document.getElementById(id); }

function toMovieHref(id){
  return `./movie.html?id=${encodeURIComponent(id)}`;
}

/* ====== TOP SLIDER ====== */
let topIndex = 0;
let topList = [];

function renderTop(){
  const leftCard = $("topLeftCard");
  const leftImg = $("topLeftImg");
  const leftTitle = $("topLeftTitle");
  const leftGenre = $("topLeftGenre");

  const hero = $("topHero");
  const heroImg = $("topHeroImg");
  const heroTitle = $("topHeroTitle");
  const heroGenre = $("topHeroGenre");

  if (!topList.length){
    leftTitle.textContent = "TOP • Chưa có phim";
    heroTitle.textContent = "Thêm phim trong Admin";
    return;
  }

  // card trái = current
  const a = topList[topIndex % topList.length];
  leftCard.href = toMovieHref(a.id);
  leftImg.style.backgroundImage = `url('${a.poster || ""}')`;
  leftTitle.textContent = `TOP ${a.topRank || 0} • ${a.title}`;
  leftGenre.textContent = a.genre || "";

  // hero = next
  const b = topList[(topIndex + 1) % topList.length];
  hero.href = toMovieHref(b.id);
  heroImg.style.backgroundImage = `url('${b.poster || ""}')`;
  heroTitle.textContent = `TOP ${b.topRank || 0} • ${b.title}`;
  heroGenre.textContent = b.genre || "";
}

function initTopControls(){
  $("topPrev").addEventListener("click", ()=>{
    if (!topList.length) return;
    topIndex = (topIndex - 1 + topList.length) % topList.length;
    renderTop();
  });
  $("topNext").addEventListener("click", ()=>{
    if (!topList.length) return;
    topIndex = (topIndex + 1) % topList.length;
    renderTop();
  });
}

/* ====== SCHEDULE TABS ====== */
/**
 * Quy ước chuẩn:
 * 1=Thứ 2
 * 2=Thứ 3
 * 3=Thứ 4
 * 4=Thứ 5
 * 5=Thứ 6
 * 6=Thứ 7
 * 7=Chủ nhật
 * => FIX lỗi bạn gặp: mất Thứ 2 + trùng CN (do mapping sai)
 */
const DAY_LABELS = [
  { key:1, vi:"Thứ 2" },
  { key:2, vi:"Thứ 3" },
  { key:3, vi:"Thứ 4" },
  { key:4, vi:"Thứ 5" },
  { key:5, vi:"Thứ 6" },
  { key:6, vi:"Thứ 7" },
  { key:7, vi:"Chủ nhật" },
];

function guessTodayKey(){
  // JS getDay(): 0=CN..6=Th7
  // Chuyển sang 1=Th2..7=CN
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone:"Asia/Ho_Chi_Minh", weekday:"short" });
  const w = fmt.format(d).toLowerCase(); // mon,tue,wed...
  const map = { mon:1, tue:2, wed:3, thu:4, fri:5, sat:6, sun:7 };
  return map[w] || 1;
}

let activeDay = guessTodayKey();

function renderDayTabs(){
  const wrap = $("dayTabs");
  wrap.innerHTML = "";
  DAY_LABELS.forEach(d=>{
    const b = document.createElement("button");
    b.className = "dayTab" + (d.key===activeDay ? " active" : "");
    b.type = "button";
    b.textContent = d.vi;
    b.onclick = ()=>{
      activeDay = d.key;
      renderDayTabs();
      renderSchedule();
    };
    wrap.appendChild(b);
  });
}

/* ====== SCHEDULE GRID ====== */
function renderSchedule(){
  const grid = $("scheduleGrid");
  const q = ($("q")?.value || "").trim().toLowerCase();
  const movies = loadMovies();

  const list = movies
    .filter(m => Array.isArray(m.scheduleDays) && m.scheduleDays.includes(activeDay))
    .filter(m => {
      if (!q) return true;
      return (m.title||"").toLowerCase().includes(q) || (m.genre||"").toLowerCase().includes(q);
    });

  grid.innerHTML = "";
  if (!list.length){
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "14px";
    empty.textContent = "Chưa có phim cho Thứ này.";
    grid.appendChild(empty);
    return;
  }

  list.forEach(m=>{
    const a = document.createElement("a");
    a.className = "movieCard";
    a.href = toMovieHref(m.id);
    a.innerHTML = `
      <div class="moviePoster" style="background-image:url('${m.poster||""}')"></div>
      <div class="movieMeta">
        <div class="movieTitle">${escapeHtml(m.title||"")}</div>
        <div class="movieGenre">Thể loại: ${escapeHtml(m.genre||"")}</div>
      </div>
      <div class="movieHover">
        <span class="watchBtn">Xem ngay</span>
      </div>
    `;
    grid.appendChild(a);
  });
}

/* ====== RANK ====== */
function renderRank(){
  const el = $("rankList");
  const movies = loadMovies()
    .filter(m => Number.isFinite(m.topRank) && m.topRank>=1 && m.topRank<=10)
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  el.innerHTML = "";
  if (!movies.length){
    el.innerHTML = `<div class="muted" style="padding:12px">Chưa có top. Vào Admin set TopRank.</div>`;
    return;
  }

  movies.forEach(m=>{
    const a = document.createElement("a");
    a.className = "rankItem";
    a.href = toMovieHref(m.id);
    a.innerHTML = `
      <div class="rankNo">${m.topRank}</div>
      <div class="rankThumb" style="background-image:url('${m.poster||""}')"></div>
      <div>
        <div class="rankTitle">${escapeHtml(m.title||"")}</div>
        <div class="rankSub">${escapeHtml(m.genre||"")}</div>
      </div>
    `;
    el.appendChild(a);
  });
}

/* ====== SEARCH ====== */
function initSearch(){
  const input = $("q");
  if (!input) return;
  input.addEventListener("input", ()=>{
    renderSchedule();
  });
}

/* ====== HTML escape ====== */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ====== INIT ====== */
function initHome(){
  seedIfEmpty();

  const now = getHCMDate();
  $("todayText").textContent = `${capitalize(now.weekday)}, ngày ${now.d}/${now.m}/${now.y}`;

  applyCfgToFooter();

  const movies = loadMovies();
  topList = movies
    .filter(m => Number.isFinite(m.topRank) && m.topRank>=1 && m.topRank<=10)
    .sort((a,b)=>a.topRank-b.topRank);

  initTopControls();
  renderTop();

  renderDayTabs();
  renderSchedule();
  renderRank();

  initSearch();
}

function capitalize(s){
  const str = String(s||"");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener("DOMContentLoaded", initHome);
