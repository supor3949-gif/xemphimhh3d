import AdminSidebar from "@/components/AdminSidebar"
import AdminHeader from "@/components/AdminHeader"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060b14] text-white flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}