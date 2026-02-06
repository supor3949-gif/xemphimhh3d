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
