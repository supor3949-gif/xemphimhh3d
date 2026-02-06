/* ==========================
  DATA STORE (LocalStorage)
  - Demo step 1: lưu dữ liệu ngay trên trình duyệt
  - Step 2 (Supabase) sẽ thay phần này bằng API thật
========================== */

const STORE_KEY = "HH3D_MOVIES_V1";

function getHCMDate(){
  // Lấy "ngày hiện tại theo giờ HCM"
  const fmt = new Intl.DateTimeFormat("vi-VN", { timeZone:"Asia/Ho_Chi_Minh", year:"numeric", month:"2-digit", day:"2-digit" });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find(p=>p.type==="year").value;
  const m = parts.find(p=>p.type==="month").value;
  const d = parts.find(p=>p.type==="day").value;
  return { y, m, d, iso:`${y}-${m}-${d}` };
}

function seedIfEmpty(){
  const cur = localStorage.getItem(STORE_KEY);
  if (cur) return;

  // ✅ DỮ LIỆU MẪU (bạn có thể xoá hết sau này)
  const sample = [
    {
      id: "tien-nghich",
      title: "Tiên Nghịch",
      genre: "Tiên hiệp",
      poster: "https://i.imgur.com/7yUvePI.jpeg",
      page: "./movie.html?id=tien-nghich",
      // schedule: mỗi phim có thể xuất hiện trong 1 hoặc nhiều ngày (0=CN,1=Th2...6=Th7)
      scheduleDays: [5], // Thứ 6
      topRank: 1,
      tags: ["Hot","Vietsub"],
      updated: "2026-02-06"
    }
  ];
  localStorage.setItem(STORE_KEY, JSON.stringify(sample));
}

function loadMovies(){
  seedIfEmpty();
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  }catch(e){
    return [];
  }
}

function $(id){ return document.getElementById(id); }

function renderTopSlider(movies){
  const top = movies
    .slice()
    .filter(m=>Number.isFinite(m.topRank))
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  const el = $("topSlider");
  el.innerHTML = "";
  top.forEach(m=>{
    const card = document.createElement("a");
    card.className = "cardMini";
    card.href = m.page;
    card.innerHTML = `
      <img src="${m.poster||""}" alt="">
      <div class="pad">
        <div class="badge">TOP ${m.topRank}</div>
        <div style="font-weight:900;margin-top:8px">${m.title}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${m.genre||""}</div>
      </div>
    `;
    el.appendChild(card);
  });
}

function dayLabel(i){
  // 0 CN, 1 Th2...
  return ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][i];
}

function renderSchedule(movies){
  const grid = $("scheduleGrid");
  grid.innerHTML = "";

  for (let d=1; d<=6; d++){/* Th2..Th7 */} // chỉ để bạn thấy logic
  const days = [1,2,3,4,5,6,0]; // hiển thị Th2->CN

  days.forEach(day=>{
    const box = document.createElement("div");
    box.className = "dayBox";

    const list = movies.filter(m => (m.scheduleDays||[]).includes(day));

    box.innerHTML = `
      <div class="dayTop">
        <b>${dayLabel(day)}</b>
        <span>${list.length} phim</span>
      </div>
      <div class="dayList" id="day-${day}"></div>
    `;
    grid.appendChild(box);

    const listEl = box.querySelector(`#day-${day}`);
    if (!list.length){
      const empty = document.createElement("div");
      empty.style.color = "var(--muted)";
      empty.style.fontSize = "12px";
      empty.textContent = "Chưa có phim";
      listEl.appendChild(empty);
      return;
    }

    list.slice(0,6).forEach(m=>{
      const row = document.createElement("a");
      row.className = "itemRow";
      row.href = m.page;
      row.innerHTML = `
        <img src="${m.poster||""}" alt="">
        <div style="min-width:0">
          <div class="t">${m.title}</div>
          <div class="s">${m.genre||""}</div>
        </div>
      `;
      listEl.appendChild(row);
    });
  });
}

function renderRank(movies){
  const rank = movies
    .slice()
    .filter(m=>Number.isFinite(m.topRank))
    .sort((a,b)=>a.topRank-b.topRank)
    .slice(0,10);

  const el = $("rankList");
  el.innerHTML = "";
  rank.forEach(m=>{
    const item = document.createElement("a");
    item.className = "rankItem";
    item.href = m.page;
    item.innerHTML = `
      <div class="rankNum">${m.topRank}</div>
      <img src="${m.poster||""}" alt="">
      <div style="min-width:0">
        <div style="font-weight:900">${m.title}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${m.genre||""}</div>
      </div>
    `;
    el.appendChild(item);
  });
}

function initHome(){
  const now = getHCMDate();
  $("todayText").textContent = `Hôm nay (giờ HCM): ${now.d}/${now.m}/${now.y}`;

  const movies = loadMovies();
  renderTopSlider(movies);
  renderSchedule(movies);
  renderRank(movies);
}

document.addEventListener("DOMContentLoaded", initHome);
