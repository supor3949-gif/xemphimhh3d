# XEMPHIMHH3D — Template

## Cấu trúc
- index.html (Trang chủ: Top + Lịch + Rank)
- movie.html (Xem phim: Vietsub/Thuyết minh + Player + Tập auto)
- admin.html (Admin: thêm/sửa phim + dán list tập + set lịch + set AFF)

## Cách dùng nhanh
1) Mở /admin.html
2) Nhập PIN (mặc định 2026)
3) Dán Contact + AFF (TikTok/Shopee) → Lưu cấu hình
4) Thêm phim:
   - ID: khong-dau
   - Title/Genre/Poster
   - Tick lịch chiếu Thứ 2..CN
   - Dán list tập:
     Tập 01|https://...
     Tập 02|https://...
   → Lưu phim
5) Về index.html: phim tự hiện trong lịch + top + rank (nếu set TopRank)

## Ghi chú quan trọng
- AFF hoạt động vì window.open được gọi trực tiếp trong click tập (không bị chặn popup).
- Nhúng ưu tiên: m3u8 dùng HLS; iframe thử nhúng, nếu bị chặn sẽ tự mở tab mới.
