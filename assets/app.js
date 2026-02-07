/* ==========================
   HH3D TEMPLATE - HOME APP
   Lưu dữ liệu LocalStorage.
   (Muốn nâng lên Supabase: thay load/save ở dưới)
========================== */

const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_SETTINGS = "HH3D_SETTINGS_V1";
const STORE_KEY_CONTACT = "HH3D_CONTACT_V1";

// ---------- Utils ----------
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

function getHCMDateParts(){
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year:"numeric", month:"2-digit", day:"2-digit",
  }).formatToParts(d);
  const obj = Object.fromEntries(fmt.map(p=>[p.type,p.value]));
  return { dd: obj.day, mm: obj.month, yyyy: obj.year };
}

function dayLabel(i){ // 1..7 (Mon..Sun)
  return ["","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"][i];
}

// ---------- Data (LocalStorage) ----------
function loadMovies(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_MOVIES) || "[]"); }
  catch{ return []; }
}
function saveMovies(movies){
  localStorage.setItem(STORE_KEY_MOVIES, JSON.stringify(movies));
}

// settings: aff + etc (home dùng contact thôi)
function loadContact(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY_CONTACT) || "{}");
  }catch{ return {}; }
}

// ---------- UI Render ----------
function movieToHref(m){
  // dùng 1 movie.html chung, truyền id bằng query
  return `./movie.html?id=${encodeURIComponent(m.id)}`;
}

function renderTopSlider(movies){
  const el = $("topSlider");
  if (!el) return;
  el.innerHTML = "";

  const top = movies
    .filter(m => Number.isFinite(+m.topRank) && +m.topRank >= 1 && +m.topRank <= 10)
    .sort((a,b)=> (+a.topRank) - (+b.topRank));

  if (!top.length){
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Chưa có phim Top. Vào Admin thêm topRank 1-10.";
    el.appendChild(empty);
    return;
  }

  top.forEach(m=>{
    const a = document.createElement("a");
    a.className = "cardMini";
    a.href = movieToHref(m);
    a.innerHTML = `
      <div class="img">
        <img src="${m.poster || ""}" alt="${escapeHtml(m.title)}"
             onerror="this.style.display='none'">
        <span class="badgeTop">TOP ${m.topRank}</span>
      </div>
      <div class="info">
        <div class="title">${escapeHtml(m.title)}</div>
        <div class="meta">${escapeHtml(m.genre || "")}</div>
      </div>
    `;
    el.appendChild(a);
  });

  // buttons
  const prev = $("btnTopPrev");
  const next = $("btnTopNext");
  if (prev && next){
    prev.onclick = ()=> el.scrollBy({left:-240, behavior:"smooth"});
    next.onclick = ()=> el.scrollBy({left: 240, behavior:"smooth"});
  }
}

function renderDayTabs(){
  const tabs = $("dayTabs");
  if (!tabs) return;
  tabs.innerHTML = "";

  // 6 ô như yêu cầu (Th2→Th7), CN vẫn hiện trong lịch 6 ô? -> em muốn 6 ô,
  // nên mình làm 6 ô Th2→Th7, còn CN sẽ xuất hiện theo tab "Chủ nhật" nếu cần.
  // Ở dưới scheduleGrid vẫn là 6 cột, nên ta map Th2..Th7 = 6 cột.
  const days = [2,3,4,5,6,7,8]; // 8 = CN (tab riêng)
  days.forEach((d,idx)=>{
    const btn = document.createElement("button");
    btn.className = "tabBtn" + (idx===0 ? " active" : "");
    btn.type = "button";
    btn.dataset.day = String(d);
    btn.textContent = (d===8) ? "Chủ nhật" : dayLabel(d);
    btn.onclick = ()=>{
      [...tabs.querySelectorAll(".tabBtn")].forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      renderSchedule(loadMovies(), d);
    };
    tabs.appendChild(btn);
  });
}

function renderSchedule(movies, focusDay){
  const grid = $("scheduleGrid");
  if (!grid) return;

  // Lịch 6 ô hàng ngang: Th2..Th7 (6 cột)
  // Nếu focusDay = CN (8) -> show CN ở 1 ô, còn 5 ô còn lại trống.
  const cols = [2,3,4,5,6,7]; // 6 cột cố định

  grid.innerHTML = "";

  const date = getHCMDateParts();
  $("scheduleSubtitle").textContent = `Hôm nay: ${date.dd}/${date.mm}/${date.yyyy}`;

  cols.forEach(d=>{
    const box = document.createElement("div");
    box.className = "dayBox";

    const head = document.createElement("div");
    head.className = "dayBoxHead";
    head.innerHTML = `<b>${dayLabel(d)}</b><small>${(focusDay===8 && d!==2) ? "" : ""}</small>`;
    box.appendChild(head);

    const list = document.createElement("div");
    list.className = "dayList";

    // lọc phim theo scheduleDays (m.scheduleDays chứa 2..8, 8=CN)
    const dayToUse = (focusDay === 8) ? 8 : d;
    const items = movies
      .filter(m => Array.isArray(m.scheduleDays) && m.scheduleDays.includes(dayToUse))
      .slice(0,6);

    if (!items.length){
      const e = document.createElement("div");
      e.className = "empty";
      e.textContent = "Chưa có phim";
      list.appendChild(e);
    } else {
      items.forEach(m=>{
        const a = document.createElement("a");
        a.className = "itemRow";
        a.href = movieToHref(m);
        a.innerHTML = `
          <img src="${m.poster || ""}" alt="${escapeHtml(m.title)}" onerror="this.style.display='none'">
          <div>
            <div class="t">${escapeHtml(m.title)}</div>
            <div class="g">${escapeHtml(m.genre || "")}</div>
          </div>
        `;
        list.appendChild(a);
      });
    }

    box.appendChild(list);
    grid.appendChild(box);
  });

  // Nếu focusDay=CN: chỉ muốn hiện CN, còn lại trống -> ta override nhanh:
  if (focusDay === 8){
    // cột đầu dùng để hiển thị CN
    const first = grid.firstElementChild;
    if (first){
      first.querySelector(".dayBoxHead b").textContent = "Chủ nhật";
      const list = first.querySelector(".dayList");
      list.innerHTML = "";
      const items = movies
        .filter(m => Array.isArray(m.scheduleDays) && m.scheduleDays.includes(8))
        .slice(0,6);
      if (!items.length){
        const e = document.createElement("div");
        e.className = "empty";
        e.textContent = "Chưa có phim";
        list.appendChild(e);
      } else {
        items.forEach(m=>{
          const a = document.createElement("a");
          a.className = "itemRow";
          a.href = movieToHref(m);
          a.innerHTML = `
            <img src="${m.poster || ""}" alt="${escapeHtml(m.title)}" onerror="this.style.display='none'">
            <div>
              <div class="t">${escapeHtml(m.title)}</div>
              <div class="g">${escapeHtml(m.genre || "")}</div>
            </div>
          `;
          list.appendChild(a);
        });
      }
    }
    // các cột còn lại trống
    [...grid.children].slice(1).forEach(x=>{
      x.querySelector(".dayBoxHead b").textContent = "—";
      x.querySelector(".dayList").innerHTML = `<div class="empty">—</div>`;
    });
  }
}

function renderRank(movies){
  const el = $("rankList");
  if (!el) return;
  el.innerHTML = "";

  const top = movies
    .filter(m => Number.isFinite(+m.topRank) && +m.topRank >= 1 && +m.topRank <= 10)
    .sort((a,b)=> (+a.topRank) - (+b.topRank));

  if (!top.length){
    el.innerHTML = `<div class="empty">Chưa có xếp hạng. Vào Admin đặt topRank 1-10.</div>`;
    return;
  }

  top.forEach(m=>{
    const a = document.createElement("a");
    a.className = "rankItem";
    a.href = movieToHref(m);
    a.innerHTML = `
      <div class="rankNum">${m.topRank}</div>
      <img src="${m.poster || ""}" alt="${escapeHtml(m.title)}" onerror="this.style.display='none'">
      <div>
        <b>${escapeHtml(m.title)}</b>
        <small>${escapeHtml(m.genre || "")}</small>
      </div>
    `;
    el.appendChild(a);
  });
}

function renderSuggest(movies){
  const el = $("suggestList");
  if (!el) return;
  el.innerHTML = "";

  const list = movies
    .slice()
    .sort((a,b)=> (String(b.updatedAt||"")).localeCompare(String(a.updatedAt||"")))
    .slice(0,8);

  if (!list.length){
    el.innerHTML = `<div class="empty">Chưa có phim. Vào Admin thêm phim.</div>`;
    return;
  }

  list.forEach(m=>{
    const a = document.createElement("a");
    a.className = "rankItem";
    a.href = movieToHref(m);
    a.innerHTML = `
      <div class="rankNum">NEW</div>
      <img src="${m.poster || ""}" alt="${escapeHtml(m.title)}" onerror="this.style.display='none'">
      <div>
        <b>${escapeHtml(m.title)}</b>
        <small>${escapeHtml(m.genre || "")}</small>
      </div>
    `;
    el.appendChild(a);
  });
}

function renderContact(){
  const el = $("contactRow");
  if (!el) return;

  const c = loadContact();
  const fb = c.facebook || "";
  const tg = c.telegram || "";
  const zl = c.zalo || "";

  const items = [
    {name:"Facebook", url:fb, hint:"Link liên hệ Facebook"},
    {name:"Telegram", url:tg, hint:"Link liên hệ Telegram"},
    {name:"Zalo", url:zl, hint:"Link liên hệ Zalo"},
  ];

  el.innerHTML = "";
  items.forEach(it=>{
    const a = document.createElement("a");
    a.className = "contactCard";
    a.href = it.url || "javascript:void(0)";
    a.target = "_blank";
    a.rel = "noopener";
    a.onclick = (e)=>{
      if (!it.url){ e.preventDefault(); showModal("Chưa có link", `Bạn chưa nhập link ${it.name} trong Admin.`); }
    };
    a.innerHTML = `<b>${it.name}</b><small>${it.url ? it.url : "Chưa nhập (vào Admin)"}</small>`;
    el.appendChild(a);
  });
}

// ---------- Helpers ----------
function escapeHtml(s){
  return String(s||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", ()=>{
  // modal close
  const close = $("closeModal");
  const back = $("modalBack");
  if (close) close.onclick = hideModal;
  if (back) back.onclick = (e)=>{ if (e.target.id==="modalBack") hideModal(); };
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") hideModal(); });

  const d = getHCMDateParts();
  const today = $("todayText");
  if (today) today.textContent = `Hôm nay (Giờ HCM): ${d.dd}/${d.mm}/${d.yyyy}`;

  renderDayTabs();

  const movies = loadMovies();
  renderTopSlider(movies);
  renderSchedule(movies, 2); // mặc định focus Th2
  renderRank(movies);
  renderSuggest(movies);
  renderContact();
});
/* =========================
   HH3D TEMPLATE - HOME
   - Lưu dữ liệu phim trong LocalStorage (demo)
   - Admin sẽ chỉnh dữ liệu trong cùng STORE
   ========================= */

const STORE_KEY = "HH3D_STORE_V1";

function loadStore(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}
function saveStore(store){
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/* ====== Demo seed (nếu chưa có data) ====== */
function seedIfEmpty(){
  const ex = loadStore();
  if (ex && ex.movies && ex.movies.length) return;

  const demo = {
    config: {
      tiktokWeb: "https://vt.tiktok.com/ZS91xpNUw7kcD-nRXjG/",
      shopeeWeb: "",
      affRate: 0.5, // 5/5 = 50%
      facebook: "https://facebook.com/",
      telegram: "https://t.me/",
      zalo: "https://zalo.me/"
    },
    movies: [
      {
        id: "tien-nghich",
        title: "Tiên Nghịch",
        genre: "Tiên hiệp",
        poster: "https://i.imgur.com/7yUevPJ.jpeg",
        page: "/movie.html?id=tien-nghich",
        scheduleDays: [2,4,6,7],   // THỨ 2..CN (2=Thứ2 ... 8=CN)
        topRank: 1,
        tag: "4K TM-VS",
        episodes: {
          vietsub: "",
          thuyetminh: ""
        }
      }
    ]
  };

  saveStore(demo);
}

/* ===== Giờ HCM (UTC+7) ===== */
function getHCMDateParts(){
  const fmt = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long"
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t)=>parts.find(p=>p.type===t)?.value || "";
  return { dd:get("day"), mm:get("month"), yy:get("year"), wd:get("weekday") };
}

function $(id){ return document.getElementById(id); }

/* ===== Render Top slider ===== */
function renderTopSlider(movies){
  const top = movies
    .filter(m => Number.isFinite(m.topRank) && m.topRank >= 1 && m.topRank <= 10)
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  const slider = $("topSlider");
  slider.innerHTML = "";

  top.forEach(m=>{
    const a = document.createElement("a");
    a.className = "cardMini";
    a.href = m.page;

    a.innerHTML = `
      <div class="img">${m.poster ? `<img src="${m.poster}" alt="${m.title}">` : ""}</div>
      <div class="cBody">
        <div class="cTitle">TOP ${m.topRank} • ${escapeHtml(m.title)}</div>
        <div class="cSub">${escapeHtml(m.genre || "")}</div>
        ${m.tag ? `<div class="badge">✅ ${escapeHtml(m.tag)}</div>` : ""}
      </div>
    `;
    slider.appendChild(a);
  });

  // nút điều hướng
  $("topPrev").onclick = () => slider.scrollBy({left:-420, behavior:"smooth"});
  $("topNext").onclick = () => slider.scrollBy({left: 420, behavior:"smooth"});
}

/* ===== Render Rank list ===== */
function renderRank(movies){
  const rank = movies
    .filter(m => Number.isFinite(m.topRank) && m.topRank >= 1 && m.topRank <= 10)
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  const wrap = $("rankList");
  wrap.innerHTML = "";

  rank.forEach(m=>{
    const a = document.createElement("a");
    a.className = "rankItem";
    a.href = m.page;

    a.innerHTML = `
      <div class="rankN">${m.topRank}</div>
      <div class="rankThumb">${m.poster ? `<img src="${m.poster}" alt="${m.title}">` : ""}</div>
      <div class="rankMeta">
        <div class="rankTitle">${escapeHtml(m.title)}</div>
        <div class="rankSub">${escapeHtml(m.genre || "")}</div>
      </div>
    `;
    wrap.appendChild(a);
  });
}

/* ===== Schedule (Thứ 2 → CN) ===== */
const DAYS = [
  { id:2, name:"Thứ 2", en:"Monday" },
  { id:3, name:"Thứ 3", en:"Tuesday" },
  { id:4, name:"Thứ 4", en:"Wednesday" },
  { id:5, name:"Thứ 5", en:"Thursday" },
  { id:6, name:"Thứ 6", en:"Friday" },
  { id:7, name:"Thứ 7", en:"Saturday" },
  { id:8, name:"Chủ nhật", en:"Sunday" },
];

function renderDayTabs(){
  const tabs = $("dayTabs");
  tabs.innerHTML = "";

  DAYS.forEach(d=>{
    const btn = document.createElement("button");
    btn.className = "dayTab";
    btn.type = "button";
    btn.textContent = d.name;
    btn.onclick = ()=>{
      // cuộn tới cột ngày tương ứng
      const el = document.querySelector(`[data-day="${d.id}"]`);
      if (el) el.scrollIntoView({behavior:"smooth", block:"nearest", inline:"start"});
      document.querySelectorAll(".dayTab").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
    };
    tabs.appendChild(btn);
  });

  // active mặc định Thứ 2
  const first = tabs.querySelector(".dayTab");
  if (first) first.classList.add("active");
}

function renderSchedule(movies, keyword=""){
  const grid = $("scheduleGrid");
  grid.innerHTML = "";

  const kw = keyword.trim().toLowerCase();

  DAYS.forEach(d=>{
    const box = document.createElement("div");
    box.className = "dayBox";
    box.dataset.day = String(d.id);

    const list = movies.filter(m=>{
      const days = Array.isArray(m.scheduleDays) ? m.scheduleDays : [];
      const okDay = days.includes(d.id);
      if (!okDay) return false;
      if (!kw) return true;
      return (m.title||"").toLowerCase().includes(kw) || (m.genre||"").toLowerCase().includes(kw);
    });

    box.innerHTML = `
      <div class="dayBoxHead">
        <b>${d.name}</b>
        <span style="color:var(--muted);font-size:11px">${d.en}</span>
      </div>
      <div class="dayList" id="day-${d.id}"></div>
    `;

    const listEl = box.querySelector(`#day-${d.id}`);
    if (!list.length){
      const empty = document.createElement("div");
      empty.style.color = "var(--muted)";
      empty.style.fontSize = "12px";
      empty.textContent = "Chưa có phim";
      listEl.appendChild(empty);
    }else{
      // hiện tối đa 6 item / ngày (giống mẫu)
      list.slice(0,6).forEach(m=>{
        const a = document.createElement("a");
        a.className = "itemRow";
        a.href = m.page;
        a.innerHTML = `
          <div class="itemThumb">${m.poster ? `<img src="${m.poster}" alt="${m.title}">` : ""}</div>
          <div class="itemMeta">
            <div class="itemTitle">${escapeHtml(m.title)}</div>
            <div class="itemSub">${escapeHtml(m.genre || "")}</div>
          </div>
        `;
        listEl.appendChild(a);
      });
    }

    grid.appendChild(box);
  });
}

/* ===== Contact ===== */
function renderContacts(cfg){
  const setLink = (id, url)=>{
    const a = $(id);
    if (!a) return;
    if (!url) {
      a.style.opacity = "0.5";
      a.href = "#";
      a.onclick = (e)=>e.preventDefault();
      return;
    }
    a.style.opacity = "1";
    a.href = url;
  };
  setLink("contactFacebook", cfg.facebook);
  setLink("contactTelegram", cfg.telegram);
  setLink("contactZalo", cfg.zalo);
}

/* ===== Utils ===== */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Init ===== */
function initHome(){
  seedIfEmpty();
  const store = loadStore();
  const movies = (store?.movies || []).slice();

  const {dd,mm,yy} = getHCMDateParts();
  $("todayText").textContent = `Hôm nay: ${dd}/${mm}/${yy}`;

  renderTopSlider(movies);
  renderRank(movies);
  renderDayTabs();
  renderSchedule(movies);

  // Search
  const search = $("searchInput");
  search.addEventListener("input", ()=>{
    renderSchedule(movies, search.value || "");
  });

  renderContacts(store.config || {});
}

document.addEventListener("DOMContentLoaded", initHome);
