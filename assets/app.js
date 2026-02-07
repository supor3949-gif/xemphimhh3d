/* =========================================================
   XEMPHIMHH3D - Home (2026)
   - Bấm Thứ -> chỉ hiện phim đúng Thứ đó
   - Hover card -> hiện “Xem ngay”
   - SEO-friendly: title/aria + hidden text
   - Data demo dùng LocalStorage (sau này đổi Supabase API vẫn giữ UI)
   ========================================================= */

const STORE_KEY = "HH3D_MOVIES_V1";

/* ===== Helpers ===== */
function $(id){ return document.getElementById(id); }
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Giờ HCM ===== */
function getHCMDateParts(){
  const fmt = new Intl.DateTimeFormat("vi-VN", {
    timeZone:"Asia/Ho_Chi_Minh",
    year:"numeric", month:"2-digit", day:"2-digit"
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t)=>parts.find(p=>p.type===t)?.value || "";
  return { d:get("day"), m:get("month"), y:get("year") };
}

/* ===== Days chuẩn: Thứ 2 -> Chủ nhật (id 2..8), không dup ===== */
const DAYS = [
  { id:2, name:"Thứ 2", en:"Monday" },
  { id:3, name:"Thứ 3", en:"Tuesday" },
  { id:4, name:"Thứ 4", en:"Wednesday" },
  { id:5, name:"Thứ 5", en:"Thursday" },
  { id:6, name:"Thứ 6", en:"Friday" },
  { id:7, name:"Thứ 7", en:"Saturday" },
  { id:8, name:"Chủ nhật", en:"Sunday" },
];

function uniqueDays(arr){
  const seen = new Set();
  return arr.filter(d=>{
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

/* ===== Demo data seed (nếu chưa có) =====
   Bạn sửa/nhập phim bằng admin.html sau (nếu bạn có admin.js).
   Nếu chưa có admin, vẫn có data mẫu để UI không trắng.
*/
function seedIfEmpty(){
  try{
    const cur = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (Array.isArray(cur) && cur.length) return;
  }catch(e){}

  const sample = [
    {
      id:"tien-nghich",
      title:"Tiên Nghịch",
      genre:"Tiên hiệp",
      poster:"https://images2.imgbox.com/8d/5f/cZxLw0ZJ_o.jpg",
      page:"./movie.html?id=tien-nghich",
      topRank:1,
      scheduleDays:[2,4,6],
      badge:"126 tập",
      tag:"VS",
      desc:"Tiên hiệp – hành trình tu luyện, nghịch thiên cải mệnh."
    },
    {
      id:"ngich-thien-chi-ton",
      title:"Nghịch Thiên Chí Tôn",
      genre:"Huyền huyễn",
      poster:"https://images2.imgbox.com/0c/17/0i6yLrVv_o.jpg",
      page:"./movie.html?id=ngich-thien-chi-ton",
      topRank:2,
      scheduleDays:[3,5,7,8],
      badge:"Tập mới",
      tag:"TM/VS",
      desc:"Huyền huyễn – chiến lực bạo phát, nghịch chuyển càn khôn."
    }
  ];

  localStorage.setItem(STORE_KEY, JSON.stringify(sample));
}

function loadMovies(){
  try{
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

/* ===== Top slider ===== */
function renderTopSlider(movies){
  const el = $("topSlider");
  el.innerHTML = "";

  const top = movies
    .filter(m=>Number.isFinite(m.topRank))
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  top.forEach(m=>{
    const a = document.createElement("a");
    a.className = "cardMini";
    a.href = m.page;
    a.title = `${m.title} - ${m.genre || ""}`;

    a.innerHTML = `
      <div class="thumb">
        ${m.poster ? `<img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}">` : ""}
      </div>
      <div class="info">
        <div class="t">TOP ${m.topRank} • ${escapeHtml(m.title)}</div>
        <div class="g">${escapeHtml(m.genre || "")}</div>
      </div>
    `;
    el.appendChild(a);
  });

  // nav buttons
  $("topPrev").onclick = ()=> el.scrollBy({left:-520, behavior:"smooth"});
  $("topNext").onclick = ()=> el.scrollBy({left: 520, behavior:"smooth"});
}

/* ===== Schedule: chỉ hiện theo Thứ đang chọn ===== */
let ACTIVE_DAY = 2; // mặc định Thứ 2

function renderDayTabs(){
  const tabs = $("dayTabs");
  tabs.innerHTML = "";

  const safeDays = uniqueDays(DAYS);

  safeDays.forEach(d=>{
    const btn = document.createElement("button");
    btn.className = "dayTab";
    btn.type = "button";
    btn.textContent = d.name;

    if (d.id === ACTIVE_DAY) btn.classList.add("active");

    btn.onclick = ()=>{
      ACTIVE_DAY = d.id;
      tabs.querySelectorAll(".dayTab").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      // render lại schedule theo ngày
      const movies = loadMovies();
      const kw = ($("globalSearch").value || "").trim();
      renderScheduleSingleDay(movies, ACTIVE_DAY, kw);
    };

    tabs.appendChild(btn);
  });
}

function renderScheduleSingleDay(movies, dayId, keyword=""){
  const grid = $("scheduleGrid");
  grid.classList.add("fade");
  grid.innerHTML = "";

  const kw = (keyword || "").trim().toLowerCase();

  const list = (movies || [])
    .filter(m=>{
      const days = Array.isArray(m.scheduleDays) ? m.scheduleDays : [];
      if (!days.includes(dayId)) return false;
      if (!kw) return true;
      return (m.title||"").toLowerCase().includes(kw) ||
             (m.genre||"").toLowerCase().includes(kw) ||
             (m.desc||"").toLowerCase().includes(kw);
    })
    // ưu tiên phim topRank + còn lại theo title
    .sort((a,b)=>{
      const ar = Number.isFinite(a.topRank) ? a.topRank : 9999;
      const br = Number.isFinite(b.topRank) ? b.topRank : 9999;
      if (ar !== br) return ar - br;
      return String(a.title||"").localeCompare(String(b.title||""));
    });

  // Nếu trống
  if (!list.length){
    const div = document.createElement("div");
    div.className = "schEmpty";
    div.textContent = "Chưa có phim cho ngày này.";
    grid.appendChild(div);
    setTimeout(()=>grid.classList.remove("fade"), 80);
    return;
  }

  list.forEach(m=>{
    const a = document.createElement("a");
    a.className = "schCard";
    a.href = m.page;
    a.title = `${m.title} - ${m.genre || ""}`;
    a.setAttribute("aria-label", `${m.title} - ${m.genre || ""}. Bấm để xem ngay`);

    const badgeText = m.badge || "";
    const tagText = m.tag || "";

    // SEO text (ẩn): giúp bot đọc thêm nội dung
    const seoText = [
      m.title,
      m.genre ? `Thể loại: ${m.genre}` : "",
      m.desc ? `Mô tả: ${m.desc}` : "",
      badgeText ? `Thông tin: ${badgeText}` : "",
      tagText ? `Tag: ${tagText}` : "",
    ].filter(Boolean).join(". ");

    a.innerHTML = `
      <div class="schThumb">
        ${m.poster ? `<img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}">` : ""}
        ${badgeText ? `<div class="schBadge">${escapeHtml(badgeText)}</div>` : ""}
        ${tagText ? `<div class="schTag">${escapeHtml(tagText)}</div>` : ""}

        <div class="schOverlay" aria-hidden="true">
          <div class="schOverlayBtn">Xem ngay</div>
        </div>
      </div>

      <div class="schBody">
        <div class="schTitle">${escapeHtml(m.title)}</div>
        <div class="schMeta">
          <div class="line">Thể loại: <b>${escapeHtml(m.genre || "Đang cập nhật")}</b></div>
          ${m.desc ? `<div class="line">${escapeHtml(m.desc)}</div>` : `<div class="line">Đang cập nhật mô tả...</div>`}
        </div>

        <span class="srOnly">${escapeHtml(seoText)}</span>
      </div>
    `;
    grid.appendChild(a);
  });

  setTimeout(()=>grid.classList.remove("fade"), 80);
}

/* ===== Rank list ===== */
function renderRank(movies){
  const el = $("rankList");
  el.innerHTML = "";

  const rank = movies
    .filter(m=>Number.isFinite(m.topRank))
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  rank.forEach(m=>{
    const a = document.createElement("a");
    a.className = "rankItem";
    a.href = m.page;
    a.title = `${m.title} - ${m.genre || ""}`;

    a.innerHTML = `
      <div class="rankNo">${m.topRank}</div>
      <div class="rankThumb">${m.poster ? `<img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}">` : ""}</div>
      <div class="rankText">
        <b>${escapeHtml(m.title)}</b>
        <span>${escapeHtml(m.genre || "")}</span>
      </div>
    `;
    el.appendChild(a);
  });
}

/* ===== Init ===== */
function initHome(){
  seedIfEmpty();

  const {d,m,y} = getHCMDateParts();
  $("todayText").textContent = `${d}/${m}/${y}`;

  const movies = loadMovies();

  renderTopSlider(movies);
  renderDayTabs();
  renderScheduleSingleDay(movies, ACTIVE_DAY, "");
  renderRank(movies);

  // search realtime: lọc schedule theo từ khóa + ngày đang chọn
  $("globalSearch").addEventListener("input", ()=>{
    const kw = ($("globalSearch").value || "").trim();
    const mv = loadMovies();
    renderScheduleSingleDay(mv, ACTIVE_DAY, kw);
  });
}

document.addEventListener("DOMContentLoaded", initHome);
