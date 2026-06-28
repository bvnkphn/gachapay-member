"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  LayoutDashboard, ShoppingCart, HeadphonesIcon,
  BarChart2, CreditCard, Settings, FileText,
  Activity, Zap, Menu, X, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const BOTTOM_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin"                },
  { label: "เกม",       icon: ShoppingCart,    path: "/admin/games"          },
  { label: "ออเดอร์",  icon: ShoppingBag,     path: "/admin/orders"         },
  { label: "รายงาน",   icon: BarChart2,        path: "/admin/report"         },
  { label: "ตั้งค่า",  icon: Settings,         path: "/admin/system-control" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0 border-b border-border/80">
        <div>
          <p className="text-sm font-extrabold text-foreground tracking-wide">GACHAPAY</p>
          <p className="text-[9px] text-muted-foreground">Super Admin</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map(sec => (
          <div key={sec.label}>
            <p className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2 text-muted-foreground/60">{sec.label}</p>
            <div className="space-y-0.5">
              {sec.items.map(item => {
                const Icon = item.icon;
                const on = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border-l-2",
                      on
                        ? "bg-primary/10 text-primary border-primary font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
                    )}
                  >
                    <Icon size={14} />{item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 space-y-1 flex-shrink-0 border-t border-border/80">
        <Link href="/" onClick={onNavClick}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition">
          ← กลับหน้าเว็บ
        </Link>
        <button onClick={() => { logout(); router.replace('/'); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/5 transition">
          ✗ ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 bg-card/95 backdrop-blur-md border-t border-border/80 h-[60px] pb-[env(safe-area-inset-bottom)]">
      {BOTTOM_NAV.map(item => {
        const Icon = item.icon;
        const on = pathname === item.path;
        return (
          <Link key={item.path} href={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all",
              on ? "text-primary font-bold" : "text-muted-foreground"
            )}>
            <div className="relative flex items-center justify-center">
              {on && <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
              <Icon size={20} />
            </div>
            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, _hydrated, admin } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  useEffect(() => {
    if (!_hydrated) return;
    const isLoginPage = pathname === '/admin/verify-otp';
    if (!token && !isLoginPage) { router.replace('/login'); return; }
    if (_hydrated && token && admin && admin.role !== 'ADMIN' && !isLoginPage) { router.replace('/'); }
  }, [token, pathname, _hydrated, admin]);

  const isLoginPage = pathname === '/admin/verify-otp';
  if (isLoginPage) return <>{children}</>;

  if (!_hydrated || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "'Noto Sans Thai',sans-serif" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-52 flex-shrink-0 h-full bg-card border-r border-border/80">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 bg-card border-b border-border/80 h-[52px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-primary to-secondary">
            <Zap size={13} className="text-white" />
          </div>
          <p className="text-sm font-extrabold text-foreground tracking-wide">CYBERPAY</p>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 bg-primary/10 text-primary">ADMIN</span>
        </div>
        <button onClick={() => setMenuOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 border border-border/80 text-muted-foreground hover:text-foreground">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs"
          onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className="md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 flex flex-col transition-transform duration-300 bg-card border-r border-border/80"
        style={{
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        }}>
        <div className="flex items-center justify-end px-4 pt-3 pb-1">
          <button onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <SidebarContent onNavClick={() => setMenuOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Spacer สำหรับ mobile topbar */}
        <div className="md:hidden h-[52px]" />

        {children}

        {/* Padding ด้านล่างสำหรับ bottom nav บน mobile เท่านั้น */}
        <div className="md:hidden h-[72px]" />
      </div>

      {/* Admin Bottom Nav */}
      <AdminBottomNav />
    </div>
  );
}
