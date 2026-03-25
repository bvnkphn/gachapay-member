"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, ShoppingCart, HeadphonesIcon,
  BarChart2, CreditCard, Settings, FileText,
  Activity, Zap, Menu, X, Package,
} from "lucide-react";

const navSections = [
  {
    label: "การจัดการ",
    items: [
      { id: "dashboard", label: "Dashboard",      icon: LayoutDashboard, path: "/admin"                    },
      { id: "games",     label: "จัดการเกม",      icon: ShoppingCart,    path: "/admin/game-management"    },
      { id: "packages",  label: "แพ็กเกจ",         icon: Package,         path: "/admin/packages"           },
      { id: "orders",    label: "รายการสั่งซื้อ", icon: FileText,        path: "/admin/orders"             },
      { id: "support",   label: "ช่วยเหลือ",      icon: HeadphonesIcon,  path: "/admin/support-admin"      },
    ],
  },
  {
    label: "การเงิน",
    items: [
      { id: "report",   label: "รายงาน",   icon: BarChart2,  path: "/admin/report"         },
      { id: "payment",  label: "Payment",  icon: CreditCard, path: "/admin/payment-admin"  },
      { id: "settings", label: "ตั้งค่า",  icon: Settings,   path: "/admin/system-control" },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid #1c2540" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white tracking-wide">CYBERPAY</p>
            <p className="text-[9px]" style={{ color: "#3a4a6a" }}>Super Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition"
            style={{ color: "#64748b" }}>
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map(sec => (
          <div key={sec.label}>
            <p className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2"
              style={{ color: "#3a4a6a" }}>{sec.label}</p>
            <div className="space-y-0.5">
              {sec.items.map(item => {
                const Icon = item.icon;
                const on = pathname === item.path ||
                  (item.path !== "/admin" && pathname.startsWith(item.path));
                return (
                  <Link key={item.id} href={item.path} onClick={onClose}
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

      <div className="px-3 py-4" style={{ borderTop: "1px solid #1c2540" }}>
        <Link href="/" onClick={onClose}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ color: "#64748b" }}>
          ← กลับหน้าเว็บ
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg,#080c18 0%,#0a0e1e 60%,#060911 100%)" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-52 flex-shrink-0"
        style={{ background: "rgba(8,10,22,0.95)", borderRight: "1px solid #1c2540" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
        style={{
          width: 220,
          background: "rgba(8,10,22,0.98)",
          borderRight: "1px solid #1c2540",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 lg:hidden flex-shrink-0"
          style={{ background: "rgba(8,10,22,0.97)", borderBottom: "1px solid #1c2540", minHeight: 52 }}>
          <button onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            style={{ color: "#94a3b8" }} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)" }}>
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-wide">CYBERPAY</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

      </div>
    </div>
  );
}