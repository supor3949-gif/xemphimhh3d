// File: src/lib/mmo.ts
export const runMMO = (aff: any) => {
  if (!aff || !aff.enabled || !aff.link) return;

  const now = new Date();
  const today = now.toDateString();
  
  // Lấy dữ liệu cũ từ trình duyệt khách hàng
  let stats = { date: '', count: 0, lastTime: 0 };
  try {
    const saved = localStorage.getItem('mmo_stats');
    if (saved) stats = JSON.parse(saved);
  } catch (e) { console.error("Lỗi đọc cache MMO"); }

  // 1. Reset nếu qua ngày mới
  if (stats.date !== today) {
    stats = { date: today, count: 0, lastTime: 0 };
  }

  // 2. Kiểm tra giới hạn số lần nhảy trong 1 ngày
  const maxJumps = aff.maxJumps || 0;
  if (maxJumps > 0 && stats.count >= maxJumps) return;

  // 3. Kiểm tra thời gian chờ (Cooldown)
  const cooldownMinutes = aff.cooldown || 0;
  const diffMinutes = (now.getTime() - stats.lastTime) / (1000 * 60);
  if (diffMinutes < cooldownMinutes) return;

  // 4. Quay xổ số theo tỷ lệ %
  if (Math.random() * 100 <= (aff.ratio || 0)) {
    window.open(aff.link, '_blank'); // Nhảy tab

    // Lưu lại lịch sử nhảy
    stats.count += 1;
    stats.lastTime = now.getTime();
    localStorage.setItem('mmo_stats', JSON.stringify(stats));
  }
};