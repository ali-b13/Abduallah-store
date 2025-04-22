"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar = () => {
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "لوحة التحكم",
      href: "/admin-panel/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "الطلبات",
      href: "/admin-panel/orders",
      icon: Package,
    },
    {
      name: "المنتجات",
      href: "/admin-panel/products",
      icon: Package,
    },
    {
      name: "الفئات",
      href: "/admin-panel/categories",
      icon: Package,
    },
    {
      name: "المستخدمين",
      href: "/admin-panel/users",
      icon: Users,
    },
    {
      name: "الإشعارات",
      href: "/admin-panel/notifications",
      icon: Bell,
    },
    {
      name: "الإعدادات",
      href: "/admin-panel/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 p-2 lg:hidden text-white bg-gray-800 rounded-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed right-0 top-0 h-screen w-64 border-l bg-gray-800 text-white shadow-xl">
        <div className="flex h-20 items-center justify-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-primary">إدارة المتجر</h1>
        </div>

        <nav className="p-4 h-[calc(100vh-7rem)] overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-700/50 hover:text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed lg:hidden right-0 top-0 h-screen w-64 border-l bg-gray-800 text-white shadow-xl z-40"
          >
            <div className="flex h-20 items-center justify-center border-b border-gray-700">
              <h1 className="text-2xl font-bold text-primary">إدارة المتجر</h1>
            </div>

            <nav className="p-4 h-[calc(100vh-7rem)] overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-gray-700/50 hover:text-primary"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;