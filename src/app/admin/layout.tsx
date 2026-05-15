"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  LayoutDashboard, ShoppingCart, HeadphonesIcon,
  BarChart2, CreditCard, Settings, FileText,
  Activity, Zap
} from "lucide-react";

const navSections = [
  {
    label: "การจัดการ",
    items: [
      { id: "dashboard", label: "Dashboard",      icon: LayoutDashboard, path: "/admin"               },
      { id: "games",     label: "จัดการเกม",      icon: ShoppingCart,    path: "/admin/games"         },
      { id: "orders",    label: "รายการสั่งซื้อ", icon: FileText,        path: "/admin/orders"        },
      { id: "support",   label: "ช่วยเหลือ",      icon: HeadphonesIcon,  path: "/admin/support-admin" },
    ],
  },
  {
    label: "การเงิน",
    items: [
      { id: "report",   label: "รายงาน",   icon: BarChart2,  path: "/admin/report"         },
      { id: "payment",  label: "Payment",  icon: CreditCard, path: "/admin/payment-admin"  },
      { id: "settings", label: "ตั้งค่า",  icon: Settings,   path: "/admin/system-control" },
      { id: "auditlog", label: "Audit Log",icon: Activity,   path: "/admin/audit-log"      },
    ],
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();

  return (
    <aside className="flex flex-col h-full w-52 flex-shrink-0"
      style={{ background: "rgba(8,10,22,0.95)", borderRight: "1px solid #1c2540" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4"
        style={{ borderBottom: "1px solid #1c2540" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-white tracking-wide">CYBERPAY</p>
          <p className="text-[9px]" style={{ color: "#3a4a6a" }}>Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map(sec => (
          <div key={sec.label}>
            <p className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2"
              style={{ color: "#3a4a6a" }}>{sec.label}</p>
            <div className="space-y-0.5">
              {sec.items.map(item => {
                const Icon = item.icon;
                const on = pathname === item.path;
                return (
                  <Link key={item.id} href={item.path}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={on
                      ? { background: "rgba(56,189,248,0.15)", color: "#38bdf8", borderLeft: "2px solid #38bdf8" }
                      : { color: "#64748b" }}>
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to site + Logout */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid #1c2540" }}>
        <Link href="/"
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ color: "#64748b" }}>
          ← กลับหน้าเว็บ
        </Link>
        <button
          onClick={() => { logout(); router.replace('/admin/login-admin'); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition">
          ✗ ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, _hydrated, admin } = useAdminAuth();

  useEffect(() => {
    if (!_hydrated) return;
    const isLoginPage = pathname === '/admin/login-admin' || pathname === '/admin/verify-otp';
    if (!token && !isLoginPage) {
      router.replace('/admin/login-admin');
      return;
    }
    // RBAC — เช็ค role ต้องเป็น ADMIN เท่านั้น
    if (_hydrated && token && admin && admin.role !== 'ADMIN' && !isLoginPage) {
      router.replace('/');
    }
  }, [token, pathname, _hydrated, admin]);

  const isLoginPage = pathname === '/admin/login-admin' || pathname === '/admin/verify-otp';

  // หน้า login ไม่ต้องแสดง sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // รอ hydration หรือยังไม่มี token — แสดง loading
  if (!_hydrated || !token) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
