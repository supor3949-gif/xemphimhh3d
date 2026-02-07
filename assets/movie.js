const STORE_KEY_MOVIES = "HH3D_MOVIES_V1";
const STORE_KEY_CFG = "HH3D_CFG_V1";

function $(id){ return document.getElementById(id); }

function loadCfg(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_CFG) || "{}"); }
  catch(e){ return {}; }
}

function loadMovies(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY_MOVIES) || "[]"); }
  catch(e){ return []; }
}

function getMovieId(){
  const u = new URL(location.href);
  return u.searchParams.get("id") || "";
}

function findMovie(id){
  return loadMovies().find(m => m.id === id) || null;
}

/* =========================
  AFF — FIX CHẮC ĂN (popup không bị chặn)
  ✅ Quan trọng: gọi window.open() NGAY TRONG CLICK
========================= */
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openMobileWithFallback(appUrl, webUrl){
  const hasWeb = !!(webUrl && webUrl.trim());
  const hasApp = !!(appUrl && appUrl.trim());

  if (!hasApp){
    if (hasWeb) window.location.href = webUrl;
    return;
  }
  window.location.href = appUrl;
  setTimeout(()=>{ if (hasWeb) window.location.href = webUrl; }, 900);
}

function openAFFInGesture(){
  const cfg = loadCfg();
  const rate = Number(cfg.affRate ?? 0.5); // mặc định 0.5 = 5/5 như bạn muốn
  if (!(Math.random() < rate)) return;

  const sources = [];

  if (cfg.tiktok){
    sources.push({ name:"tiktok", mobileApp:"", mobileWeb:cfg.tiktok, pcWeb:cfg.tiktok });
  }
  if (cfg.shopeeWeb || cfg.shopeeApp){
    sources.push({
      name:"shopee",
      mobileApp: cfg.shopeeApp || "",
      mobileWeb: cfg.shopeeWeb || "",
      pcWeb: cfg.shopeeWeb || ""
    });
  }
  if (!sources.length) return;

  const pick = sources[Math.floor(Math.random()*sources.length)];

  if (isMobile()){
    openMobileWithFallback(pick.mobileApp, pick.mobileWeb || pick.pcWeb);
  }else{
    // ✅ phải gọi trong gesture mới chắc không bị block
    const url = pick.pcWeb || pick.mobileWeb;
    if (url) window.open(url, "_blank", "noopener");
  }
}

/* =========================
  PARSE LIST: "Tập 01|url"
  ✅ Auto nhận số tập theo MAX tập trong list
========================= */
function parseList(raw){
  const map = {};
  if (!raw) return { map, maxEp: 0, count: 0 };

  const lines = raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  let maxEp = 0;
  let count = 0;

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
    count++;
    if (ep > maxEp) maxEp = ep;
  }

  return { map, maxEp, count };
}

function pad2(n){ return String(n).padStart(2, "0"); }

/* =========================
  PLAYER: ưu tiên nhúng
  - m3u8: video + hls.js, fatal => open tab
  - phimapi player?url=m3u8: bóc m3u8
  - ok.ru / vidmmo / iframe: thử iframe 1 chút, fail => open tab
========================= */
const videoEl = ()=>$("video");
const frameEl = ()=>$("frame");
let hls = null;
let CURRENT_URL = "";

function stopPlayer(){
  CURRENT_URL = "";
  $("nowPlaying").textContent = "Chưa chọn tập";

  try{ if (hls) hls.destroy(); }catch(e){}
  hls = null;

  frameEl().style.display = "none";
  frameEl().src = "about:blank";

  try{
    videoEl().pause();
    videoEl().removeAttribute("src");
    videoEl().load();
  }catch(e){}
}

function showVideo(){
  frameEl().style.display = "none";
  videoEl().style.display = "block";
}
function showFrame(){
  videoEl().style.display = "none";
  frameEl().style.display = "block";
}

function isM3U8(u){ return /\.m3u8(\?|$)/i.test(u||""); }

function isPhimApiPlayer(u){
  return /^https?:\/\/player\.phimapi\.com\/player\/\?/i.test(u||"");
}
function extractInnerUrlFromPhimApi(u){
  try{
    const x = new URL(u);
    return x.searchParams.get("url") || "";
  }catch(e){ return ""; }
}

function openTab(url){
  window.open(url, "_blank", "noopener");
}

/* Try iframe, if browser blocks by XFO/CSP → often ends up about:blank */
function tryIframeThenFallback(url){
  showFrame();
  const fr = frameEl();
  fr.src = url;

  // heuristic check after 1200ms
  setTimeout(()=>{
    let blocked = false;
    try{
      const href = fr.contentWindow?.location?.href;
      if (!href || href === "about:blank") blocked = true;
    }catch(e){
      // cross-origin will throw — not equal to blocked
      // so we DO NOT treat throw as blocked
      blocked = false;
    }

    // If looks blocked -> open tab
    if (blocked) openTab(url);
  }, 1200);
}

function playM3U8(url, fallbackUrl){
  // reset hls only
  try{ if (hls) hls.destroy(); }catch(e){}
  hls = null;

  showVideo();

  const v = videoEl();
  const canNative = v.canPlayType("application/vnd.apple.mpegurl");

  if (canNative){
    v.src = url;
    v.play().catch(()=>openTab(fallbackUrl || url));
    return;
  }

  if (window.Hls && window.Hls.isSupported()){
    hls = new Hls({ xhrSetup:(xhr)=>{ xhr.withCredentials=false; } });
    hls.loadSource(url);
    hls.attachMedia(v);

    hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
      v.play().catch(()=>openTab(fallbackUrl || url));
    });

    hls.on(Hls.Events.ERROR, (evt, data)=>{
      if (data && data.fatal){
        try{ hls.destroy(); }catch(e){}
        hls = null;
        openTab(fallbackUrl || url);
      }
    });
    return;
  }

  openTab(fallbackUrl || url);
}

function playURL(url, epLabel){
  if (!url){
    showModal("Đang cập nhật", "Tập này chưa có link.", "Bạn quay lại sau nha.");
    return;
  }

  CURRENT_URL = url;
  $("nowPlaying").textContent = epLabel ? `${epLabel}` : "Đang phát";

  // 0) AFF: gọi NGAY trong click gesture (để không bị chặn)
  openAFFInGesture();

  // 1) phimapi → bóc m3u8
  if (isPhimApiPlayer(url)){
    const inner = extractInnerUrlFromPhimApi(url);
    if (inner && isM3U8(inner)){
      playM3U8(inner, url);
      return;
    }
    openTab(url);
    return;
  }

  // 2) m3u8 trực tiếp
  if (isM3U8(url)){
    playM3U8(url, url);
    return;
  }

  // 3) iframe attempt → blocked => open tab
  tryIframeThenFallback(url);
}

/* =========================
  MODAL
========================= */
function showModal(title, msg, sub){
  $("modalTitle").textContent = title;
  $("modalMsg").textContent = msg;
  $("modalSub").textContent = sub || "";
  $("modalBack").style.display = "flex";
}
function hideModal(){ $("modalBack").style.display = "none"; }

/* =========================
  EPISODES UI
========================= */
let MODE = "vietsub";
let MOVIE = null;

let EP_VS = { map:{}, maxEp:0, count:0 };
let EP_TM = { map:{}, maxEp:0, count:0 };

function getActiveEp(){
  return MODE === "vietsub" ? EP_VS : EP_TM;
}

function renderHeader(){
  const total = getActiveEp().maxEp || 0;
  const has = Object.keys(getActiveEp().map || {}).length;

  document.title = `${MOVIE?.title || "Xem phim"} — HH3D`;

  $("movieTitleTop").textContent = MOVIE?.title || "Không tìm thấy phim";
  $("movieTitleLeft").textContent = MOVIE?.title || "Không tìm thấy phim";
  $("genreText").textContent = MOVIE?.genre || "...";

  $("movieInfo").textContent = `${MOVIE?.title || "..." } • ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • ${total} tập`;
  $("subInfo").textContent = `Chế độ: ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • Có link: ${has}/${total}`;

  $("metaTotal").innerHTML = `Tổng tập (${MODE==="vietsub"?"Vietsub":"Thuyết minh"}): <b>${total}</b>`;
  $("metaHas").innerHTML = `Đã có link: <b>${has}</b>`;

  $("modeHint").innerHTML =
    `Bạn đang xem: <b>${MODE==="vietsub"?"Vietsub":"Thuyết minh"}</b> • Bấm tập để phát (nhúng được thì nhúng, không được sẽ mở tab mới).`;
}

function getEpList(){
  const total = getActiveEp().maxEp || 0;
  const arr = Array.from({length: total}, (_,i)=>i+1);

  // search
  const q = ($("epSearch").value || "").trim();
  let out = arr;
  if (q){
    const n = parseInt(q,10);
    if (!Number.isNaN(n)) out = arr.filter(x=>x===n);
  }

  // sort
  const sort = $("epSort").value;
  const urls = getActiveEp().map;

  if (sort === "desc") out = out.slice().sort((a,b)=>b-a);
  else if (sort === "done"){
    out = out.slice().sort((a,b)=>{
      const da = !!urls[a];
      const db = !!urls[b];
      if (da===db) return a-b;
      return db - da;
    });
  }

  return out;
}

function renderEpisodes(){
  renderHeader();

  const grid = $("epGrid");
  grid.innerHTML = "";

  const { map } = getActiveEp();
  const eps = getEpList();

  if (!eps.length){
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "10px 0";
    empty.textContent = "Chưa có tập. Vào Admin dán list tập.";
    grid.appendChild(empty);
    return;
  }

  eps.forEach(ep=>{
    const btn = document.createElement("button");
    btn.className = "epBtn";
    btn.type = "button";
    btn.textContent = pad2(ep);

    const url = map[ep];
    const hasLink = !!url;
    if (hasLink) btn.classList.add("done");
    else btn.classList.add("lock");

    const note = document.createElement("small");
    note.textContent = hasLink ? "Có link" : "Đang cập nhật";
    btn.appendChild(note);

    btn.onclick = ()=>{
      if (!url){
        showModal(`${MOVIE.title} – Tập ${pad2(ep)} (${MODE==="vietsub"?"Vietsub":"Thuyết minh"})`,
          "Tập này chưa có link.", "Bạn quay lại sau nha.");
        return;
      }
      playURL(url, `${MOVIE.title} • Tập ${pad2(ep)} • ${MODE.toUpperCase()}`);
    };

    grid.appendChild(btn);
  });
}

/* =========================
  MODE
========================= */
function setMode(m){
  MODE = m;
  $("btnVietsub").classList.toggle("active", MODE==="vietsub");
  $("btnThuyetMinh").classList.toggle("active", MODE==="thuyetminh");

  $("epSearch").value = "";
  $("epSort").value = "asc";

  stopPlayer();
  renderEpisodes();
}

/* =========================
  INIT
========================= */
function init(){
  const id = getMovieId();
  MOVIE = findMovie(id);

  if (!MOVIE){
    $("movieTitleTop").textContent = "Không tìm thấy phim";
    $("movieTitleLeft").textContent = "Không tìm thấy phim";
    showModal("Lỗi", "Không tìm thấy phim. Vui lòng vào Admin tạo phim hoặc kiểm tra link.", "");
    return;
  }

  // poster
  const img = $("posterImg");
  img.src = MOVIE.poster || "";

  // parse lists
  EP_VS = parseList(MOVIE.vietsubRaw || "");
  EP_TM = parseList(MOVIE.thuyetminhRaw || "");

  // events
  $("btnVietsub").addEventListener("click", ()=>setMode("vietsub"));
  $("btnThuyetMinh").addEventListener("click", ()=>setMode("thuyetminh"));

  $("epSearch").addEventListener("input", renderEpisodes);
  $("epSort").addEventListener("change", renderEpisodes);

  $("stopBtn").addEventListener("click", stopPlayer);
  $("openTabBtn").addEventListener("click", ()=>{
    if (CURRENT_URL) openTab(CURRENT_URL);
    else showModal("Chưa có link", "Bạn chưa chọn tập.", "");
  });

  $("btnScrollEp").addEventListener("click", ()=>{
    $("epGrid").scrollIntoView({behavior:"smooth", block:"start"});
  });

  $("closeModal").addEventListener("click", hideModal);
  $("modalBack").addEventListener("click", (e)=>{ if(e.target.id==="modalBack") hideModal(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") hideModal(); });

  setMode("vietsub");
}

document.addEventListener("DOMContentLoaded", init);
