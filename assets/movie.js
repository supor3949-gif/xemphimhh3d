const STORE_KEY = "HH3D_MOVIES_V1";

/* =========================
  ✅ AFF CONFIG (bạn thay link)
  - Mobile: ưu tiên mở app (deep link) nếu có, không có thì mở web link
  - PC: mở web link (tab mới)
  - Tỉ lệ nhảy: 0.5 = 50% (5/5 bạn muốn = 100% thì để 1.0)
========================= */
const TIKTOK_WEB = "https://vt.tiktok.com/ZS91toLTD646r-LRcCy/";
const SHOPEE_WEB = "https://s.shopee.vn/3fxvwKdzAg";
const SHOPEE_APP = ""; // nếu có deep link app thì dán vào (vd: shopee://...)

const AFF_JUMP_RATE = 0.50; // ✅ 5/5 bạn muốn thì đổi thành 1.0
const AFF_DELAY_MS = 150;   // nhảy sau khi bấm tập

function isMobileDevice(){ return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); }

function openMobileWithFallback(appUrl, webUrl){
  const hasWeb = !!(webUrl && webUrl.trim());
  const hasApp = !!(appUrl && appUrl.trim());
  if (!hasApp){ if (hasWeb) location.href = webUrl; return; }
  location.href = appUrl;
  setTimeout(()=>{ if (hasWeb) location.href = webUrl; }, 900);
}

function openAFFRandom(){
  const sources = [
    { name:"tiktok", mobileApp:"", mobileWeb:TIKTOK_WEB, pcWeb:TIKTOK_WEB },
    { name:"shopee", mobileApp:SHOPEE_APP, mobileWeb:SHOPEE_WEB, pcWeb:SHOPEE_WEB },
  ].filter(x => (x.mobileWeb||x.pcWeb));

  if (!sources.length) return;
  const pick = sources[Math.floor(Math.random()*sources.length)];

  if (isMobileDevice()){
    openMobileWithFallback(pick.mobileApp, pick.mobileWeb || pick.pcWeb);
  }else{
    const url = pick.pcWeb || pick.mobileWeb;
    if (url) window.open(url, "_blank", "noopener");
  }
}

/* ✅ CHỐT: mở AFF ngay trong cú click để tránh bị chặn popup */
function maybeJumpAFF_InUserGesture(){
  if (Math.random() < AFF_JUMP_RATE){
    // gọi trực tiếp để browser coi là user gesture
    openAFFRandom();
  }
}

function loadMovies(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)||"[]"); }catch(e){ return []; }
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name) || "";
}

function pad2(n){ return String(n).padStart(2,"0"); }

/* ===== PARSE LIST text -> map ===== */
function parseList(raw){
  const map = {};
  if (!raw) return map;
  raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).forEach(line=>{
    const parts = line.split("|");
    if (parts.length<2) return;
    const m = parts[0].match(/(\d+)/);
    if (!m) return;
    const ep = parseInt(m[1],10);
    const url = parts.slice(1).join("|").trim();
    if (!Number.isFinite(ep)) return;
    map[ep]=url;
  });
  return map;
}

function countHasLink(map){
  return Object.values(map||{}).filter(u=>u && u.trim()).length;
}
function getMaxEp(map){
  const keys = Object.keys(map||{}).map(n=>parseInt(n,10)).filter(n=>Number.isFinite(n));
  return keys.length ? Math.max(...keys) : 0;
}

/* =========================
  PLAYER: ưu tiên nhúng
  - phimapi player -> tách url=... (m3u8) -> thử nhúng
  - m3u8 trực tiếp -> thử nhúng
  - còn lại -> iframe thử + fallback mở tab mới
  - Nếu nhúng lỗi/CORS/403 => fallback mở tab mới
========================= */

const videoEl = document.getElementById("video");
const frameEl = document.getElementById("frame");
let hlsInstance = null;
let CURRENT_URL = "";

function isPhimApiPlayer(u){ return /^https?:\/\/player\.phimapi\.com\/player\/\?/i.test(u||""); }
function extractInnerUrlFromPhimApi(u){
  try{ return new URL(u).searchParams.get("url") || ""; }catch(e){ return ""; }
}
function isM3U8(u){ return /\.m3u8(\?|$)/i.test(u||""); }

function stopHlsOnly(){
  try{ if (hlsInstance) hlsInstance.destroy(); }catch(e){}
  hlsInstance = null;
  try{ videoEl.pause(); videoEl.removeAttribute("src"); videoEl.load(); }catch(e){}
}

function stopPlayer(){
  CURRENT_URL = "";
  document.getElementById("nowPlaying").textContent = "Chưa chọn tập";
  stopHlsOnly();
  frameEl.style.display="none";
  frameEl.src="about:blank";
  videoEl.style.display="block";
}

function openCurrentInNewTab(){
  if (CURRENT_URL) window.open(CURRENT_URL, "_blank", "noopener");
}

function showVideo(){ frameEl.style.display="none"; videoEl.style.display="block"; }
function showFrame(){ videoEl.style.display="none"; frameEl.style.display="block"; }
function openFallback(url){ window.open(url, "_blank", "noopener"); }

/* ✅ timeout fallback nếu nhúng không chạy */
function scheduleEmbedFallback(url){
  // nếu sau 2.2s chưa play được -> mở tab mới
  const startedAt = Date.now();
  setTimeout(()=>{
    // readyState < 2 thường là không load được
    if (!videoEl || videoEl.readyState < 2 || (Date.now()-startedAt<2000 && videoEl.currentTime===0)){
      openFallback(url);
    }
  }, 2200);
}

function playM3U8(url, fallbackUrl){
  stopHlsOnly();
  showVideo();

  const canNative = videoEl.canPlayType("application/vnd.apple.mpegurl");
  try{
    if (canNative){
      videoEl.src = url;
      videoEl.play().catch(()=>openFallback(fallbackUrl||url));
      scheduleEmbedFallback(fallbackUrl||url);
      return true;
    }

    if (window.Hls && window.Hls.isSupported()){
      hlsInstance = new Hls({ xhrSetup:xhr=>{ xhr.withCredentials=false; }});
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoEl);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, ()=>{
        videoEl.play().catch(()=>openFallback(fallbackUrl||url));
      });

      hlsInstance.on(Hls.Events.ERROR, (_, data)=>{
        if (data && data.fatal){
          stopHlsOnly();
          openFallback(fallbackUrl||url);
        }
      });

      scheduleEmbedFallback(fallbackUrl||url);
      return true;
    }

    openFallback(fallbackUrl||url);
    return false;
  }catch(e){
    stopHlsOnly();
    openFallback(fallbackUrl||url);
    return false;
  }
}

function playURL(url, epLabel, modeLabel){
  if (!url || !url.trim()) return;

  CURRENT_URL = url;
  document.getElementById("nowPlaying").textContent = `${epLabel} • ${modeLabel}`;

  // ✅ AFF: chạy ngay trong click (đỡ bị chặn popup)
  // (nếu bạn muốn “bấm tập là NHẢY 100%” -> AFF_JUMP_RATE = 1.0)
  setTimeout(()=>{ /* giữ chút delay cho cảm giác tự nhiên */ }, AFF_DELAY_MS);
  maybeJumpAFF_InUserGesture();

  if (isPhimApiPlayer(url)){
    const inner = extractInnerUrlFromPhimApi(url);
    if (inner && isM3U8(inner)){
      const ok = playM3U8(inner, url);
      if (!ok) openFallback(url);
      return;
    }
    openFallback(url);
    return;
  }

  if (isM3U8(url)){
    const ok = playM3U8(url, url);
    if (!ok) openFallback(url);
    return;
  }

  // link thường: thử iframe trước, nhưng vẫn fallback mở tab mới
  showFrame();
  frameEl.src = url;
  setTimeout(()=>openFallback(url), 900);
}

/* =========================
  UI
========================= */
function scrollToEpisodes(){
  document.getElementById("epGrid").scrollIntoView({behavior:"smooth", block:"start"});
}

let MODE = "vietsub";
let DATA = null;

function getUrlsByMode(){
  return MODE==="vietsub" ? (DATA.vietsub||{}) : (DATA.thuyetminh||{});
}

function getTotalByMode(){
  // ✅ auto nhận số tập theo list bạn dán (không cần TOTAL cố định)
  return getMaxEp(getUrlsByMode());
}

function renderHeaderMeta(){
  const total = getTotalByMode();
  const has = countHasLink(getUrlsByMode());

  document.getElementById("movieInfo").textContent = `${DATA.title} • ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • ${total} tập`;
  document.getElementById("subInfo").textContent = `Chế độ: ${MODE==="vietsub"?"Vietsub":"Thuyết minh"} • Có link: ${has}/${total}`;
  document.getElementById("metaTotal").innerHTML = `Tổng tập (${MODE==="vietsub"?"Vietsub":"Thuyết minh"}): <b>${total}</b>`;
  document.getElementById("metaHas").innerHTML = `Đã có link: <b>${has}</b>`;
  document.getElementById("modeHint").innerHTML =
    `Bạn đang xem: <b>${MODE==="vietsub"?"Vietsub":"Thuyết minh"}</b> • Bấm tập để phát (ưu tiên nhúng, lỗi sẽ mở tab mới).`;
}

function getEpList(){
  const total = getTotalByMode();
  const urls = getUrlsByMode();
  const arr = Array.from({length: total}, (_,i)=>i+1);

  const q = (document.getElementById("epSearch").value||"").trim();
  let out = arr;
  if (q){
    const n = parseInt(q,10);
    if (!Number.isNaN(n)) out = arr.filter(x=>x===n);
  }

  const mode = document.getElementById("epSort").value;
  if (mode==="desc") out = out.slice().sort((a,b)=>b-a);
  else if (mode==="done"){
    out = out.slice().sort((a,b)=>{
      const da = !!(urls[a] && urls[a].trim());
      const db = !!(urls[b] && urls[b].trim());
      if (da===db) return a-b;
      return (db?1:0)-(da?1:0);
    });
  }
  return out;
}

function renderEpisodes(){
  renderHeaderMeta();

  const grid = document.getElementById("epGrid");
  grid.innerHTML = "";
  const urls = getUrlsByMode();
  const eps = getEpList();

  if (!eps.length){
    grid.innerHTML = `<div class="pill" style="grid-column:1/-1">Chưa có tập.</div>`;
    return;
  }

  eps.forEach(ep=>{
    const btn = document.createElement("button");
    btn.className = "epBtn";
    btn.type="button";
    btn.textContent = pad2(ep);

    const url = (urls[ep]||"").trim();
    const hasLink = !!url;
    if (hasLink) btn.classList.add("done"); else btn.classList.add("lock");

    const note = document.createElement("small");
    note.textContent = hasLink ? "Có link" : "Đang cập nhật";
    btn.appendChild(note);

    btn.onclick = ()=>{
      if (!url) return;
      playURL(url, `Tập ${pad2(ep)}`, `${DATA.title} • ${MODE.toUpperCase()}`);
    };

    grid.appendChild(btn);
  });
}

function setMode(m){
  MODE = m;
  document.getElementById("btnVietsub").classList.toggle("active", MODE==="vietsub");
  document.getElementById("btnThuyetMinh").classList.toggle("active", MODE==="thuyetminh");
  document.getElementById("epSearch").value="";
  document.getElementById("epSort").value="asc";
  stopPlayer();
  renderEpisodes();
}

function initPoster(){
  const img = document.getElementById("posterImg");
  const no = document.getElementById("noimg");
  img.alt = DATA.title || "Poster";

  if (!DATA.poster){
    img.style.display="none"; no.style.display="flex"; return;
  }
  img.onload = ()=>{ img.style.display="block"; no.style.display="none"; };
  img.onerror = ()=>{ img.style.display="none"; no.style.display="flex"; };
  img.src = DATA.poster;
}

function init(){
  const id = getParam("id");
  const movies = loadMovies();
  const m = movies.find(x=>x.id===id) || movies[0];

  if (!m){
    document.getElementById("movieTitleTop").textContent = "Không có phim";
    return;
  }

  DATA = m;

  document.getElementById("pageTitle").textContent = `${DATA.title} – HH3D`;
  document.getElementById("movieTitleTop").textContent = DATA.title;
  document.getElementById("movieTitleLeft").textContent = DATA.title;
  document.getElementById("genreText").textContent = DATA.genre || "...";

  // ✅ Fix “bấm về trang chủ bị 404”:
  // movie.html nằm cùng cấp index.html (root) => ./index.html
  document.getElementById("btnHome").onclick = ()=> location.href = "./index.html";
  document.getElementById("homeBrand").href = "./index.html";

  initPoster();

  document.getElementById("epSearch").addEventListener("input", renderEpisodes);
  document.getElementById("epSort").addEventListener("change", renderEpisodes);
  document.getElementById("btnVietsub").addEventListener("click", ()=>setMode("vietsub"));
  document.getElementById("btnThuyetMinh").addEventListener("click", ()=>setMode("thuyetminh"));

  setMode("vietsub");
}

document.addEventListener("DOMContentLoaded", init);
