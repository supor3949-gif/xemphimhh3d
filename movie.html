const STORE_KEY = "HH3D_MOVIES_V1";
const ADMIN_SESSION = "HH3D_ADMIN_OK";

/* ✅ DEMO PASSWORD: đổi chỗ này */
const ADMIN_PASSWORD = "123456";

function load(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)||"[]"); }catch(e){ return []; }
}
function saveAll(arr){
  localStorage.setItem(STORE_KEY, JSON.stringify(arr));
}
function $(id){ return document.getElementById(id); }

function parseDays(s){
  return (s||"").split(",").map(x=>parseInt(x.trim(),10)).filter(n=>Number.isFinite(n) && n>=0 && n<=6);
}

/* Parse list tập -> map */
function parseEp(raw){
  const map = {};
  (raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(line=>{
    const parts = line.split("|");
    if (parts.length<2) return;
    const epNum = parseInt((parts[0].match(/(\d+)/)||[])[1],10);
    const url = parts.slice(1).join("|").trim();
    if (!Number.isFinite(epNum)) return;
    map[epNum] = url;
  });
  return map;
}

function renderList(items){
  const wrap = $("list");
  wrap.innerHTML = "";
  items.forEach(m=>{
    const row = document.createElement("div");
    row.className = "pill";
    row.style.marginTop = "10px";
    row.style.cursor = "pointer";
    row.textContent = `${m.title} (${m.id}) • lịch: ${(m.scheduleDays||[]).join(",")} • top: ${m.topRank||"-"}`;
    row.onclick = ()=> fillForm(m);
    wrap.appendChild(row);
  });
}

function fillForm(m){
  $("id").value = m.id||"";
  $("title").value = m.title||"";
  $("genre").value = m.genre||"";
  $("poster").value = m.poster||"";
  $("page").value = m.page||"";
  $("topRank").value = (m.topRank ?? "");
  $("scheduleDays").value = (m.scheduleDays||[]).join(",");
  $("updated").value = m.updated||"";

  // map -> text list
  const toText = (map)=>{
    return Object.keys(map||{})
      .map(n=>parseInt(n,10))
      .filter(n=>Number.isFinite(n))
      .sort((a,b)=>a-b)
      .map(n=>`Tập ${String(n).padStart(2,"0")}|${map[n]}`)
      .join("\n");
  };
  $("vietsub").value = toText(m.vietsub||{});
  $("thuyetminh").value = toText(m.thuyetminh||{});
}

function loginOK(){
  localStorage.setItem(ADMIN_SESSION,"1");
  $("loginBox").style.display="none";
  $("adminBox").style.display="grid";
  renderList(load());
}

document.addEventListener("DOMContentLoaded", ()=>{
  if (localStorage.getItem(ADMIN_SESSION)==="1") loginOK();

  $("btnLogin").onclick = ()=>{
    if ($("pw").value === ADMIN_PASSWORD) loginOK();
    else alert("Sai mật khẩu");
  };

  $("btnSave").onclick = ()=>{
    const items = load();
    const id = $("id").value.trim();
    if (!id) return alert("Thiếu id");

    const m = {
      id,
      title: $("title").value.trim() || id,
      genre: $("genre").value.trim(),
      poster: $("poster").value.trim(),
      page: $("page").value.trim() || `./movie.html?id=${encodeURIComponent(id)}`,
      topRank: $("topRank").value.trim()? parseInt($("topRank").value.trim(),10) : undefined,
      scheduleDays: parseDays($("scheduleDays").value),
      updated: $("updated").value.trim(),
      vietsub: parseEp($("vietsub").value),
      thuyetminh: parseEp($("thuyetminh").value),
    };

    const idx = items.findIndex(x=>x.id===id);
    if (idx>=0) items[idx]=m; else items.push(m);
    saveAll(items);
    renderList(items);
    alert("Đã lưu!");
  };

  $("btnClear").onclick = ()=>{
    if (!confirm("Xoá toàn bộ dữ liệu?")) return;
    localStorage.removeItem(STORE_KEY);
    location.reload();
  };

  $("btnExport").onclick = ()=>{
    const data = JSON.stringify(load(), null, 2);
    navigator.clipboard.writeText(data).then(()=>alert("Đã copy JSON vào clipboard"));
  };
});
