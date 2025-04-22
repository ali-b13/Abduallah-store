// app/admin-panel/layout.tsx
import AdminSidebar from './components/SideBar';

export default async function AdminLayout({
  children}: {
  children: React.ReactNode
}) {
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      
      <div className="flex">
        {/* Shared Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 pr-0 lg:pr-64 transition-all duration-300">
          <div className="p-6 md:p-8 max-w-full lg:max-w-[calc(100%-16rem)] mx-auto">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}
