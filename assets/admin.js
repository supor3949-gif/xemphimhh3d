/* =========================
   HH3D TEMPLATE - ADMIN
   - Demo admin local (LocalStorage)
   - Thêm phim -> tự hiện Home + Lịch + BXH
   - Dán list tập -> movie page auto nhận số tập
   - Export/Import JSON
   ========================= */

const STORE_KEY = "HH3D_STORE_V1";
const PASS_KEY  = "HH3D_ADMIN_PASS";

function loadStore(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY) || "null"); }
  catch(e){ return null; }
}
function saveStore(store){
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function seedIfEmpty(){
  const ex = loadStore();
  if (ex && ex.movies) return;
  saveStore({
    config:{ tiktokWeb:"", shopeeWeb:"", affRate:0.5, facebook:"", telegram:"", zalo:"" },
    movies:[]
  });
}
function getPass(){
  return localStorage.getItem(PASS_KEY) || "123456";
}
function setPass(p){
  localStorage.setItem(PASS_KEY, p);
}

function $(id){ return document.getElementById(id); }

function clampRate(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function esc(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Login ===== */
let LOGGED = false;

function requireLogin(action){
  if (!LOGGED){
    alert("Bạn chưa đăng nhập admin.");
    return false;
  }
  return true;
}

function fillConfig(cfg){
  $("cfgTikTok").value = cfg.tiktokWeb || "";
  $("cfgShopee").value = cfg.shopeeWeb || "";
  $("cfgRate").value = String(cfg.affRate ?? 0.5);
  $("cfgFb").value = cfg.facebook || "";
  $("cfgTg").value = cfg.telegram || "";
  $("cfgZalo").value = cfg.zalo || "";
}

function readFormMovie(){
  const id = ($("m_id").value||"").trim();
  const title = ($("m_title").value||"").trim();
  const genre = ($("m_genre").value||"").trim();
  const poster = ($("m_poster").value||"").trim();
  const page = ($("m_page").value||"").trim() || `/movie.html?id=${encodeURIComponent(id)}`;
  const rank = parseInt(($("m_rank").value||"").trim(), 10);
  const topRank = Number.isFinite(rank) ? rank : null;

  const daysRaw = ($("m_days").value||"").trim();
  const scheduleDays = daysRaw
    ? daysRaw.split(",").map(x=>parseInt(x.trim(),10)).filter(n=>Number.isFinite(n) && n>=2 && n<=8)
    : [];

  const tag = ($("m_tag").value||"").trim();

  const vietsub = $("m_vietsub").value || "";
  const thuyetminh = $("m_thuyetminh").value || "";

  return {
    id, title, genre, poster, page,
    scheduleDays,
    topRank,
    tag,
    episodes:{ vietsub, thuyetminh }
  };
}

function clearForm(){
  ["m_id","m_title","m_genre","m_poster","m_page","m_rank","m_days","m_tag","m_vietsub","m_thuyetminh"]
    .forEach(x=>$(x).value="");
}

function autoFillPage(){
  const id = ($("m_id").value||"").trim();
  if (!id) return;
  $("m_page").value = `/movie.html?id=${encodeURIComponent(id)}`;
}

function renderAdminList(){
  const store = loadStore();
  const list = (store?.movies || []).slice();

  const wrap = $("movieListAdmin");
  wrap.innerHTML = "";

  if (!list.length){
    wrap.innerHTML = `<div style="color:var(--muted);font-size:12px">Chưa có phim. Bạn thêm ở form bên trái.</div>`;
    return;
  }

  list.sort((a,b)=> (a.title||"").localeCompare(b.title||""));

  list.forEach(m=>{
    const row = document.createElement("div");
    row.className = "adminItem";
    row.innerHTML = `
      <div style="min-width:0">
        <b>${esc(m.title || m.id)}</b>
        <div style="color:var(--muted);font-size:12px;margin-top:2px">
          ID: ${esc(m.id)} • Lịch: ${(m.scheduleDays||[]).join(",") || "—"} • Rank: ${m.topRank ?? "—"}
        </div>
      </div>
      <div class="aBtns">
        <button class="btnSmall" data-act="edit">Sửa</button>
        <button class="btnSmall" data-act="del">Xóa</button>
      </div>
    `;

    row.querySelector('[data-act="edit"]').onclick = ()=>{
      if (!requireLogin()) return;
      $("m_id").value = m.id || "";
      $("m_title").value = m.title || "";
      $("m_genre").value = m.genre || "";
      $("m_poster").value = m.poster || "";
      $("m_page").value = m.page || `/movie.html?id=${encodeURIComponent(m.id||"")}`;
      $("m_rank").value = m.topRank ?? "";
      $("m_days").value = (m.scheduleDays || []).join(",");
      $("m_tag").value = m.tag || "";
      $("m_vietsub").value = m.episodes?.vietsub || "";
      $("m_thuyetminh").value = m.episodes?.thuyetminh || "";
      window.scrollTo({top:0, behavior:"smooth"});
    };

    row.querySelector('[data-act="del"]').onclick = ()=>{
      if (!requireLogin()) return;
      if (!confirm(`Xóa phim: ${m.title || m.id} ?`)) return;
      const s = loadStore();
      s.movies = (s.movies || []).filter(x=>x.id !== m.id);
      saveStore(s);
      renderAdminList();
    };

    wrap.appendChild(row);
  });
}

function initAdmin(){
  seedIfEmpty();
  const store = loadStore();

  fillConfig(store.config || {});
  renderAdminList();

  $("btnLogin").onclick = ()=>{
    const p = $("adminPass").value || "";
    if (p !== getPass()){
      alert("Sai mật khẩu.");
      return;
    }
    LOGGED = true;
    alert("Đăng nhập OK. Bạn có thể chỉnh phim.");
  };

  $("btnSetPass").onclick = ()=>{
    const old = prompt("Nhập pass cũ:", "");
    if (old === null) return;
    if (old !== getPass()){
      alert("Pass cũ sai.");
      return;
    }
    const neu = prompt("Nhập pass mới:", "");
    if (!neu) return alert("Pass mới không hợp lệ.");
    setPass(neu);
    alert("Đã đổi pass.");
  };

  $("btnSaveCfg").onclick = ()=>{
    if (!requireLogin()) return;
    const s = loadStore();
    s.config = {
      tiktokWeb: ($("cfgTikTok").value||"").trim(),
      shopeeWeb: ($("cfgShopee").value||"").trim(),
      affRate: clampRate(($("cfgRate").value||"").trim()),
      facebook: ($("cfgFb").value||"").trim(),
      telegram: ($("cfgTg").value||"").trim(),
      zalo: ($("cfgZalo").value||"").trim()
    };
    saveStore(s);
    alert("Đã lưu cấu hình.");
  };

  $("m_id").addEventListener("input", autoFillPage);

  $("btnAdd").onclick = ()=>{
    if (!requireLogin()) return;

    const item = readFormMovie();
    if (!item.id || !item.title){
      alert("Thiếu ID hoặc tên phim.");
      return;
    }

    const s = loadStore();
    const idx = (s.movies||[]).findIndex(x=>x.id === item.id);

    if (idx >= 0) s.movies[idx] = item;
    else (s.movies = s.movies || []).push(item);

    saveStore(s);
    renderAdminList();
    alert("Đã lưu phim.");
  };

  $("btnClear").onclick = ()=>{
    if (!requireLogin()) return;
    clearForm();
  };

  $("btnExport").onclick = ()=>{
    if (!requireLogin()) return;
    const data = JSON.stringify(loadStore(), null, 2);
    const blob = new Blob([data], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hh3d_store.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  $("fileImport").addEventListener("change", async (e)=>{
    if (!requireLogin()) return;
    const f = e.target.files?.[0];
    if (!f) return;
    try{
      const txt = await f.text();
      const obj = JSON.parse(txt);
      if (!obj || !Array.isArray(obj.movies)){
        alert("File JSON không đúng format.");
        return;
      }
      saveStore(obj);
      fillConfig(obj.config || {});
      renderAdminList();
      alert("Import OK.");
    }catch(err){
      alert("Import lỗi: " + err.message);
    }finally{
      e.target.value = "";
    }
  });

  $("btnReset").onclick = ()=>{
    if (!requireLogin()) return;
    if (!confirm("Reset demo (xóa toàn bộ data phim & config)?")) return;
    localStorage.removeItem(STORE_KEY);
    seedIfEmpty();
    fillConfig(loadStore().config || {});
    renderAdminList();
    clearForm();
    alert("Đã reset.");
  };
}

document.addEventListener("DOMContentLoaded", initAdmin);
