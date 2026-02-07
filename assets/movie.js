/* =========================
   HH3D TEMPLATE - MOVIE PAGE
   - Auto load phim theo query ?id=
   - Auto nhận số tập theo list (dán bao nhiêu dòng -> bấy nhiêu)
   - Ưu tiên nhúng (HLS m3u8 / phimapi player) -> fail -> mở tab mới
   - AFF: khi bấm tập -> có thể nhảy TikTok/Shopee theo tỉ lệ config
   ========================= */

const STORE_KEY = "HH3D_STORE_V1";

function loadStore(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY) || "null"); }
  catch(e){ return null; }
}
function saveStore(store){
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function seedIfEmpty(){
  const ex = loadStore();
  if (ex && ex.movies && ex.movies.length) return;
  // Nếu user vào movie trước khi vào home
  saveStore({
    config:{ tiktokWeb:"", shopeeWeb:"", affRate:0.5, facebook:"", telegram:"", zalo:"" },
    movies:[]
  });
}

/* ===== Helpers ===== */
function $(id){ return document.getElementById(id); }
function qparam(name){
  try{ return new URL(location.href).searchParams.get(name) || ""; }
  catch(e){ return ""; }
}
function pad2(n){ return String(n).padStart(2,"0"); }

function showModal(title, msg, sub=""){
  $("modalTitle").textContent = title;
  $("modalMsg").textContent = msg;
  $("modalSub").textContent = sub;
  $("modalBack").style.display = "flex";
}
function hideModal(){ $("modalBack").style.display = "none"; }

/* ===== Parse list tập (auto nhận) ===== */
function parseList(raw){
  const map = {};
  const lines = String(raw||"")
    .split(/\r?\n/)
    .map(s=>s.trim())
    .filter(Boolean);

  for (const line of lines){
    const parts = line.split("|");
    if (parts.length < 2) continue;
    const left = parts[0].trim();
    const url = parts.slice(1).join("|").trim();
    const m = left.match(/(\d+)/);
    if (!m) continue;
    const ep = parseInt(m[1], 10);
    if (!Number.isFinite(ep)) continue;
    map[ep] = url;
  }
  return map;
}
function maxEp(map){
  const ks = Object.keys(map||{});
  let m = 0;
  ks.forEach(k=>{ const n = parseInt(k,10); if (n>m) m=n; });
  return m;
}
function countHas(map){ return Object.keys(map||{}).length; }

/* ===== Player ===== */
const videoEl = $("video");
const frameEl = $("frame");
let hls = null;
let CURRENT_URL = "";

function stopPlayer(){
  CURRENT_URL = "";
  $("nowPlaying").textContent = "Chưa chọn tập";
  try{ if (hls) hls.destroy(); }catch(e){}
  hls = null;

  frameEl.style.display = "none";
  frameEl.src = "about:blank";

  videoEl.style.display = "block";
  try{
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }catch(e){}
}
function showVideo(){
  frameEl.style.display = "none";
  videoEl.style.display = "block";
}
function showFrame(){
  videoEl.style.display = "none";
  frameEl.style.display = "block";
}
function openTab(url){
  // dùng noopener tránh bị chặn nhẹ hơn
  window.open(url, "_blank", "noopener");
}

function isM3U8(u){ return /\.m3u8(\?|$)/i.test(u||""); }
function isPhimApiPlayer(u){ return /^https?:\/\/player\.phimapi\.com\/player\/\?/i.test(u||""); }
function extractInnerFromPhimApi(u){
  try{ return new URL(u).searchParams.get("url") || ""; }
  catch(e){ return ""; }
}

/* Play m3u8: ưu tiên nhúng; lỗi -> mở tab */
function playM3U8(url, fallbackUrl){
  showVideo();
  try{ if (hls) hls.destroy(); }catch(e){}
  hls = null;

  // iOS safari native
  const canNative = videoEl.canPlayType("application/vnd.apple.mpegurl");
  if (canNative){
    videoEl.src = url;
    videoEl.play().catch(()=>openTab(fallbackUrl || url));
    return;
  }

  if (window.Hls && window.Hls.isSupported()){
    hls = new Hls({ xhrSetup: (xhr)=>{ xhr.withCredentials = false; } });
    hls.loadSource(url);
    hls.attachMedia(videoEl);

    let opened = false;

    hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
      videoEl.play().catch(()=>{ if(!opened){ opened=true; openTab(fallbackUrl||url); } });
    });

    hls.on(Hls.Events.ERROR, (evt, data)=>{
      if (data && data.fatal){
        try{ hls.destroy(); }catch(e){}
        hls = null;
        if(!opened){ opened=true; openTab(fallbackUrl||url); }
      }
    });

    // Nếu sau 1.2s vẫn chưa ready -> mở tab (tránh “đứng hình”)
    setTimeout(()=>{
      if (videoEl.readyState < 2){
        openTab(fallbackUrl || url);
      }
    }, 1200);
    return;
  }

  openTab(fallbackUrl || url);
}

/* Link thường: thử iframe 800ms, vẫn mở tab để chắc chắn */
function playIframe(url){
  showFrame();
  frameEl.src = url;
  setTimeout(()=>openTab(url), 800);
}

/* ===== AFF (được gọi NGAY trong click -> không bị chặn popup) ===== */
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function maybeJumpAff(cfg){
  const rate = Number(cfg?.affRate ?? 0.5);
  const tiktok = String(cfg?.tiktokWeb || "").trim();
  const shopee = String(cfg?.shopeeWeb || "").trim();

  const pool = [];
  if (tiktok) pool.push(tiktok);
  if (shopee) pool.push(shopee);
  if (!pool.length) return;

  if (Math.random() >= rate) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  // Mobile: mở cùng tab dễ bật app hơn; PC: mở tab mới
  if (isMobile()) location.href = pick;
  else window.open(pick, "_blank", "noopener");
}

/* ===== Main ===== */
let MOVIE = null;
let MODE = "vietsub";
let EP_VS = {};
let EP_TM = {};
let CFG = {};

function setMode(m){
  MODE = m;
  $("btnVietsub").classList.toggle("active", MODE === "vietsub");
  $("btnThuyetMinh").classList.toggle("active", MODE === "thuyetminh");

  $("epSearch").value = "";
  $("epSort").value = "asc";
  stopPlayer();
  renderEpisodes();
}

function urlsByMode(){
  return MODE === "vietsub" ? EP_VS : EP_TM;
}
function totalByMode(){
  // auto: tổng tập = max ep trong list (nếu list rỗng -> 0)
  const total = MODE === "vietsub" ? maxEp(EP_VS) : maxEp(EP_TM);
  return total || 0;
}

function renderHeader(){
  const total = totalByMode();
  const has = countHas(urlsByMode());

  const modeText = MODE === "vietsub" ? "Vietsub" : "Thuyết minh";
  $("movieTitleTop").textContent = MOVIE?.title || "Không tìm thấy phim";
  $("movieTitleLeft").textContent = MOVIE?.title || "Không tìm thấy phim";
  $("genreText").textContent = MOVIE?.genre || "...";

  $("movieInfo").textContent = `${MOVIE?.title || "..." } • ${modeText} • ${total} tập`;
  $("subInfo").textContent = `Chế độ: ${modeText} • Có link: ${has}/${total}`;
  $("metaTotal").innerHTML = `Tổng tập (${modeText}): <b>${total}</b>`;
  $("metaHas").innerHTML = `Đã có link: <b>${has}</b>`;

  $("modeHint").innerHTML = `Bạn đang xem: <b>${modeText}</b> • Bấm tập để phát (ưu tiên nhúng, không nhúng được sẽ mở tab mới).`;

  // poster
  if (MOVIE?.poster){
    $("posterImg").src = MOVIE.poster;
    $("posterImg").alt = MOVIE.title || "";
  } else {
    $("posterImg").src = "";
    $("posterImg").alt = "";
  }
}

function getEpList(){
  const urls = urlsByMode();
  const total = totalByMode();
  const arr = Array.from({length: total}, (_,i)=>i+1);

  const q = ($("epSearch").value || "").trim();
  let out = arr;
  if (q){
    const n = parseInt(q,10);
    if (!Number.isNaN(n)) out = arr.filter(x=>x===n);
  }

  const sort = $("epSort").value;
  if (sort === "desc") out = out.slice().sort((a,b)=>b-a);
  else if (sort === "done"){
    out = out.slice().sort((a,b)=>{
      const da = !!urls[a], db = !!urls[b];
      if (da === db) return a-b;
      return db - da;
    });
  }
  return out;
}

function playURL(url, epLabel){
  if (!url){
    showModal("Đang cập nhật", "Tập này chưa có link.", "Bạn quay lại sau nha.");
    return;
  }

  CURRENT_URL = url;
  $("nowPlaying").textContent = `${MOVIE.title} • ${epLabel} • ${MODE.toUpperCase()}`;

  // ƯU TIÊN: phimapi -> bóc m3u8
  if (isPhimApiPlayer(url)){
    const inner = extractInnerFromPhimApi(url);
    if (inner && isM3U8(inner)){
      playM3U8(inner, url);
      return;
    }
    openTab(url);
    return;
  }

  // m3u8 trực tiếp
  if (isM3U8(url)){
    playM3U8(url, url);
    return;
  }

  // link khác
  playIframe(url);
}

function renderEpisodes(){
  renderHeader();

  const grid = $("epGrid");
  grid.innerHTML = "";

  const urls = urlsByMode();
  const eps = getEpList();

  if (!eps.length){
    const d = document.createElement("div");
    d.style.color = "var(--muted)";
    d.style.padding = "10px 0 20px";
    d.textContent = "Chưa có danh sách tập (bạn hãy dán list trong admin).";
    grid.appendChild(d);
    return;
  }

  eps.forEach(ep=>{
    const btn = document.createElement("button");
    btn.className = "epBtn";
    btn.type = "button";
    btn.textContent = pad2(ep);

    const hasLink = !!urls[ep];
    btn.classList.add(hasLink ? "done" : "lock");

    const note = document.createElement("small");
    note.textContent = hasLink ? "Có link" : "Đang cập nhật";
    btn.appendChild(note);

    btn.onclick = () => {
      const url = urls[ep];
      if (!url){
        showModal(`${MOVIE.title} – Tập ${pad2(ep)} (${MODE === "vietsub" ? "Vietsub" : "Thuyết minh"})`,
          "Tập này chưa có link.", "Bạn quay lại sau nha.");
        return;
      }

      /* ✅ QUAN TRỌNG:
         - AFF phải chạy ngay trong click để không bị chặn popup.
         - Sau đó mới play video.
      */
      maybeJumpAff(CFG);
      playURL(url, `Tập ${pad2(ep)}`);
    };

    grid.appendChild(btn);
  });
}

/* ===== Init ===== */
function initMovie(){
  seedIfEmpty();
  const store = loadStore();
  CFG = store?.config || {};

  const id = qparam("id");
  MOVIE = (store?.movies || []).find(m=>m.id === id);

  if (!MOVIE){
    showModal("Không tìm thấy phim", "Thiếu hoặc sai ?id=...", "Bạn quay về trang chủ và chọn lại.");
    $("btnHome").onclick = ()=>location.href="/index.html";
    return;
  }

  // Load lists
  EP_VS = parseList(MOVIE?.episodes?.vietsub || "");
  EP_TM = parseList(MOVIE?.episodes?.thuyetminh || "");

  // Buttons
  $("btnHome").onclick = ()=> location.href = "/index.html"; // ✅ luôn về root index
  $("btnScroll").onclick = ()=> $("epGrid").scrollIntoView({behavior:"smooth", block:"start"});

  $("btnOpenTab").onclick = ()=> CURRENT_URL ? openTab(CURRENT_URL) : showModal("Chưa có link", "Bạn chưa chọn tập.", "");
  $("btnStop").onclick = ()=> stopPlayer();

  $("btnVietsub").onclick = ()=> setMode("vietsub");
  $("btnThuyetMinh").onclick = ()=> setMode("thuyetminh");

  $("epSearch").addEventListener("input", renderEpisodes);
  $("epSort").addEventListener("change", renderEpisodes);

  $("closeModal").addEventListener("click", hideModal);
  $("modalBack").addEventListener("click", (e)=>{ if (e.target.id==="modalBack") hideModal(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") hideModal(); });

  // Start
  setMode("vietsub");
}

document.addEventListener("DOMContentLoaded", initMovie);
