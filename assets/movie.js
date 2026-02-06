/* ==========================
   HH3D TEMPLATE - MOVIE PAGE
   - Ưu tiên nhúng (m3u8 bằng HLS)
   - Nếu không phát được / bị chặn -> tự mở tab mới
   - AFF: chạy khi bấm chọn tập (tùy tỉ lệ)
========================== */

const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_SETTINGS = "HH3D_SETTINGS_V1";

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
function loadSettings(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_SETTINGS) || "{}"); }
  catch{ return {}; }
}

function getMovieId(){
  const u = new URL(location.href);
  return u.searchParams.get("id") || "";
}

function parseList(raw){
  const map = {};
  if (!raw) return map;
  const lines = raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  for (const line of lines){
    const parts = line.split("|");
    if (parts.length < 2) continue;
    const left = parts[0].trim();
    const url = parts.slice(1).join("|").trim();
    const m = left.match(/(\d+)/);
    if (!m) continue;
    const ep = parseInt(m[1],10);
    if (!Number.isFinite(ep)) continue;
    map[ep] = url;
  }
  return map;
}

function maxEp(map){
  const ks = Object.keys(map||{}).map(x=>+x).filter(n=>Number.isFinite(n));
  return ks.length ? Math.max(...ks) : 0;
}

function pad2(n){ return String(n).padStart(2,"0"); }

function isPhimApiPlayer(u){
  return /^https?:\/\/player\.phimapi\.com\/player\/\?/i.test(u||"");
}
function extractInnerUrlFromPhimApi(u){
  try{
    const x = new URL(u);
    return x.searchParams.get("url") || "";
  }catch{ return ""; }
}
function isM3U8(u){
  return /\.m3u8(\?|$)/i.test(u||"");
}

// ----------------- AFF -----------------
function isMobileDevice(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function pickAffUrl(settings){
  const tiktok = (settings.affTiktok || "").trim();
  const shopee = (settings.affShopee || "").trim();
  const split = Number(settings.affSplit || 50); // 50 = 50/50

  const hasT = !!tiktok;
  const hasS = !!shopee;
  if (!hasT && !hasS) return "";

  if (hasT && !hasS) return tiktok;
  if (!hasT && hasS) return shopee;

  // both
  const r = Math.random() * 100;
  return (r < split) ? tiktok : shopee;
}

/**
 * QUAN TRỌNG: popup phải nằm TRONG click (user gesture) để không bị chặn.
 * Nên ta gọi maybeJumpAFF_InClick() ngay trong handler click tập.
 */
function maybeJumpAFF_InClick(){
  const settings = loadSettings();
  const rate = Number(settings.affRate ?? 0.5); // default 50%
  if (!Number.isFinite(rate) || rate <= 0) return;

  if (Math.random() > rate) return;

  const url = pickAffUrl(settings);
  if (!url) return;

  // Desktop: open tab mới (ít bị phá phát video)
  // Mobile: nhiều máy sẽ mở app nếu là universal link
  if (isMobileDevice()){
    // Mobile thường khó mở popup, dùng redirect nhanh rồi quay lại user tự back.
    // Nếu em KHÔNG muốn redirect mobile, đổi dòng dưới thành window.open(url,"_blank");
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener");
  }
}

// ----------------- Player -----------------
const videoEl = $("video");
const frameEl = $("frame");
let hls = null;
let CURRENT_URL = "";

function stopPlayer(){
  CURRENT_URL = "";
  $("nowPlaying").textContent = "Chưa chọn tập";

  try{ if (hls) hls.destroy(); }catch{}
  hls = null;

  // iframe off
  frameEl.style.display = "none";
  frameEl.src = "about:blank";

  // video reset
  videoEl.style.display = "block";
  try{
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }catch{}
}

function openCurrentInNewTab(){
  if (!CURRENT_URL) return showModal("Chưa có link", "Bạn chưa chọn tập.");
  window.open(CURRENT_URL, "_blank", "noopener");
}

function showVideo(){
  frameEl.style.display = "none";
  videoEl.style.display = "block";
}
function showFrame(){
  videoEl.style.display = "none";
  frameEl.style.display = "block";
}

function openFallback(url){
  window.open(url, "_blank", "noopener");
}

function playM3U8(url, fallbackUrl){
  // reset hls
  try{ if (hls) hls.destroy(); }catch{}
  hls = null;

  showVideo();

  const canNative = videoEl.canPlayType("application/vnd.apple.mpegurl");

  try{
    if (canNative){
      videoEl.src = url;
      videoEl.play().catch(()=> openFallback(fallbackUrl || url));
      // nếu 2.2s vẫn chưa load -> mở tab
      setTimeout(()=>{
        if (videoEl.readyState < 2) openFallback(fallbackUrl || url);
      }, 2200);
      return;
    }

    if (window.Hls && window.Hls.isSupported()){
      hls = new Hls({ xhrSetup:(xhr)=>{ xhr.withCredentials = false; } });
      hls.loadSource(url);
      hls.attachMedia(videoEl);

      let opened = false;

      const safeOpen = ()=>{
        if (opened) return;
        opened = true;
        try{ if (hls) hls.destroy(); }catch{}
        hls = null;
        openFallback(fallbackUrl || url);
      };

      hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
        videoEl.play().catch(()=> safeOpen());
      });

      hls.on(Hls.Events.ERROR, (ev,data)=>{
        if (data && data.fatal) safeOpen();
      });

      // timeout: nếu 2.2s chưa ready -> mở tab
      setTimeout(()=>{
        if (videoEl.readyState < 2) safeOpen();
      }, 2200);

      return;
    }

    // no support
    openFallback(fallbackUrl || url);
  }catch{
    openFallback(fallbackUrl || url);
  }
}

function playURL(url, epLabel){
  if (!url) return showModal("Đang cập nhật", "Tập này chưa có link.");

  CURRENT_URL = url;
  $("nowPlaying").textContent = epLabel || "Đang phát...";

  // 1) phimapi -> bóc m3u8
  if (isPhimApiPlayer(url)){
    const inner = extractInnerUrlFromPhimApi(url);
    if (inner && isM3U8(inner)){
      playM3U8(inner, url);
      return;
    }
    openFallback(url);
    return;
  }

  // 2) m3u8 trực tiếp
  if (isM3U8(url)){
    playM3U8(url, url);
    return;
  }

  // 3) link khác -> thử iframe, nhưng vẫn set timeout mở tab để chắc chắn
  showFrame();
  frameEl.src = url;

  setTimeout(()=>{
    // không thể detect chắc chắn X-Frame-Options -> luôn mở tab sau 900ms
    openFallback(url);
  }, 900);
}

// ----------------- UI Episodes -----------------
let MODE = "vietsub";
let MOVIE = null;
let VS_MAP = {};
let TM_MAP = {};

function setMode(m){
  MODE = m;
  $("btnVietsub").classList.toggle("active", MODE==="vietsub");
  $("btnThuyetMinh").classList.toggle("active", MODE==="thuyetminh");
  $("epSearch").value = "";
  $("epSort").value = "asc";
  stopPlayer();
  renderEpisodes();
}

function getUrlsByMode(){
  return MODE==="vietsub" ? VS_MAP : TM_MAP;
}
function getTotalByMode(){
  const map = getUrlsByMode();
  const auto = maxEp(map);
  return Math.max(auto, 1); // auto theo list
}

function renderHeader(){
  const total = getTotalByMode();
  const has = Object.keys(getUrlsByMode()).length;

  $("movieTitleTop").textContent = MOVIE?.title || "Phim";
  $("movieTitleLeft").textContent = MOVIE?.title || "Phim";
  $("genreText").textContent = MOVIE?.genre || "—";

  $("movieSubTop").textContent = `Chế độ: ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • Có link: ${has}/${total}`;
  $("moviePill").textContent = `${MOVIE?.title || "Phim"} • ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • ${total} tập`;

  $("totalText").textContent = String(total);
  $("hasText").textContent = String(has);

  $("modeHint").innerHTML = `Bạn đang xem: <b>${MODE==="vietsub"?"Vietsub":"Thuyết minh"}</b> • Bấm tập để phát (ưu tiên nhúng, không được sẽ mở tab mới).`;
}

function getEpList(){
  const total = getTotalByMode();
  const urls = getUrlsByMode();

  let arr = Array.from({length: total}, (_,i)=>i+1);

  // search
  const q = ($("epSearch").value || "").trim();
  if (q){
    const n = parseInt(q,10);
    if (!Number.isNaN(n)) arr = arr.filter(x=>x===n);
  }

  // sort
  const s = $("epSort").value;
  if (s==="desc") arr.sort((a,b)=>b-a);
  else if (s==="done"){
    arr.sort((a,b)=>{
      const da = !!urls[a];
      const db = !!urls[b];
      if (da===db) return a-b;
      return (db?1:0) - (da?1:0);
    });
  }
  return arr;
}

function renderEpisodes(){
  renderHeader();

  const grid = $("epGrid");
  grid.innerHTML = "";
  const urls = getUrlsByMode();
  const eps = getEpList();

  eps.forEach(ep=>{
    const btn = document.createElement("button");
    btn.className = "epBtn";
    btn.type = "button";
    btn.textContent = pad2(ep);

    const hasLink = !!urls[ep];
    if (hasLink) btn.classList.add("done");
    else btn.classList.add("lock");

    const small = document.createElement("small");
    small.textContent = hasLink ? "Có link" : "Đang cập nhật";
    btn.appendChild(small);

    btn.onclick = ()=>{
      // ✅ AFF chạy trong click (đỡ bị chặn popup)
      // (Nếu rate=0 thì tự tắt)
      maybeJumpAFF_InClick();

      const url = urls[ep];
      if (!url){
        showModal(`${MOVIE?.title || "Phim"} – Tập ${pad2(ep)}`, "Tập này chưa có link.");
        return;
      }
      playURL(url, `${MOVIE?.title || "Phim"} • Tập ${pad2(ep)} • ${MODE.toUpperCase()}`);
    };

    grid.appendChild(btn);
  });
}

// ----------------- Init -----------------
document.addEventListener("DOMContentLoaded", ()=>{
  // modal close
  const close = $("closeModal");
  const back = $("modalBack");
  if (close) close.onclick = hideModal;
  if (back) back.onclick = (e)=>{ if (e.target.id==="modalBack") hideModal(); };
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") hideModal(); });

  $("btnStop").onclick = stopPlayer;
  $("btnOpenNew").onclick = openCurrentInNewTab;
  $("btnScrollEps").onclick = ()=> $("epGrid").scrollIntoView({behavior:"smooth", block:"start"});
  $("epSearch").addEventListener("input", renderEpisodes);
  $("epSort").addEventListener("change", renderEpisodes);
  $("btnVietsub").onclick = ()=> setMode("vietsub");
  $("btnThuyetMinh").onclick = ()=> setMode("thuyetminh");

  const id = getMovieId();
  const movies = loadMovies();
  MOVIE = movies.find(x=>x.id===id);

  if (!MOVIE){
    showModal("Không tìm thấy phim", "Phim này chưa tồn tại. Vào Admin thêm phim rồi quay lại.");
    $("movieTitleTop").textContent = "Không tìm thấy phim";
    $("movieTitleLeft").textContent = "Không tìm thấy phim";
    return;
  }

  // poster
  const poster = $("poster");
  const fallback = $("posterFallback");
  poster.src = MOVIE.poster || "";
  poster.onerror = ()=>{ poster.style.display="none"; fallback.style.display="flex"; };

  VS_MAP = parseList(MOVIE.rawVietsub || "");
  TM_MAP = parseList(MOVIE.rawThuyetminh || "");

  setMode("vietsub");
});
