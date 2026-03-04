import "./globals.css";

export const metadata = {
  title: "XEMPHIMHH3D",
  description: "Web xem phim hoạt hình 3D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[#0f172a] text-white">
        {children}
      </body>
    </html>
  );
}