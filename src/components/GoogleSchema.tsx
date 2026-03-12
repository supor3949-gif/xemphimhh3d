// File: src/components/GoogleSchema.tsx
import React from 'react';

export default function GoogleSchema() {
  // 🔥 CHỖ GẮN TÊN MIỀN: Hiện tại xài Vercel, sau này mua tên miền .com thì đổi ở đúng dòng này!
  const DOMAIN = "https://xemphimhh3d.vercel.app"; 

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "XEMPHIMHH3D",
    "alternateName": ["Xem Phim Hoạt Hình 3D", "HH3D", "Hoạt Hình Trung Quốc"],
    "url": DOMAIN,
    "description": "Hệ thống xem phim Hoạt Hình 3D Trung Quốc siêu nét, tốc độ cao, cập nhật nhanh nhất.",
    // Báo cho Google biết web này có chức năng Tìm Kiếm (Kích hoạt Sitelinks Search Box)
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${DOMAIN}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}