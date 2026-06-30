"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  LayoutDashboard, ShoppingCart, HeadphonesIcon,
  BarChart2, CreditCard, Settings, FileText,
  Activity, Zap, Menu, X, ShoppingBag,
  Clock, RotateCw, Sun, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Management",
    items: [
      { id: "dashboard", label: "Dashboard",      icon: LayoutDashboard, path: "/admin"               },
      { id: "games",     label: "Games",          icon: ShoppingCart,    path: "/admin/games"         },
      { id: "orders",    label: "Orders",         icon: FileText,        path: "/admin/orders"        },
      { id: "support",   label: "Support",        icon: HeadphonesIcon,  path: "/admin/support-admin" },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "report",   label: "Reports",         icon: BarChart2,  path: "/admin/report"         },
      { id: "payment",  label: "Payment",         icon: CreditCard, path: "/admin/payment-admin"  },
      { id: "credit",   label: "Credit",          icon: Zap,        path: "/admin/api-credit"     },
      { id: "settings", label: "Settings",        icon: Settings,   path: "/admin/system-control" },
    ],
  },
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
        <button onClick={() => { logout(); router.replace('/'); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/5 transition">
          ✗ Logout
        </button>
      </div>
    </div>
  );
}



const getPageTitle = (pathname: string) => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/games') return 'จัดการเกม';
  if (pathname.includes('/packages')) return 'จัดการแพ็กเกจ';
  if (pathname === '/admin/orders') return 'รายการสั่งซื้อ';
  if (pathname === '/admin/support-admin') return 'ช่วยเหลือ';
  if (pathname === '/admin/report') return 'รายงาน';
  if (pathname === '/admin/payment-admin') return 'Payment';
  if (pathname === '/admin/api-credit') return 'API Credit';
  if (pathname === '/admin/system-control') return 'ตั้งค่า';
  if (pathname === '/admin/audit-log') return 'Audit Log';
  return 'ระบบจัดการ GACHAPAY';
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, _hydrated, admin } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const tick = () => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mounted]);

  const currentTheme = mounted ? (resolvedTheme ?? "dark") : "dark";

  const handleRefresh = () => {
    const event = new CustomEvent('admin-refresh');
    window.dispatchEvent(event);
    router.refresh();
    setLastUpdated(new Date());
    toast.success('รีเฟรชข้อมูลสำเร็จ');
  };

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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 bg-card border-b border-border/80 h-[56px] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Menu Drawer Toggle */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/40 border border-border/80 text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{getPageTitle(pathname)}</p>
            {mounted && lastUpdated && (
              <p className="text-[8px] text-muted-foreground font-semibold">
                อัปเดต {String(lastUpdated.getHours()).padStart(2, "0")}:{String(lastUpdated.getMinutes()).padStart(2, "0")}:{String(lastUpdated.getSeconds()).padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Refresh Button */}
          <button onClick={handleRefresh} className="p-1.5 rounded-full border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition cursor-pointer">
            <RotateCw size={11} />
          </button>

          {/* Theme Toggle Switch */}
          <div
            className="relative flex items-center w-12 h-6 bg-muted border border-border/80 rounded-full p-0.5 cursor-pointer select-none transition-colors duration-300"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          >
            <div className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ease-out border border-border/30",
              currentTheme === "dark" ? "translate-x-6" : "translate-x-0"
            )} />
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Sun className={cn("w-2.5 h-2.5 transition-colors duration-300", currentTheme === "light" ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="relative z-10 flex-1 flex items-center justify-center h-full">
              <Moon className={cn("w-2.5 h-2.5 transition-colors duration-300", currentTheme === "dark" ? "text-primary" : "text-muted-foreground")} />
            </div>
          </div>
        </div>
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

      {/* Main Content with Desktop Top Navbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-6 bg-card border-b border-border/80 h-[56px] flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">{getPageTitle(pathname)}</h1>
            {mounted && lastUpdated && (
              <p className="text-[9px] text-muted-foreground mt-0.5">
                อัปเดต {String(lastUpdated.getHours()).padStart(2, "0")}:{String(lastUpdated.getMinutes()).padStart(2, "0")}:{String(lastUpdated.getSeconds()).padStart(2, "0")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80 transition cursor-pointer"
              title="รีเฟรช"
            >
              <RotateCw size={12} />
            </button>

            {/* Clock Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/40 border border-border/80">
              <Clock size={11} className="text-primary" />
              <span className="font-mono text-[11px] font-bold tracking-wider text-foreground">
                {now || "--:--:--"}
              </span>
            </div>

            {/* Theme Toggle Switch */}
            <div
              className="relative flex items-center w-16 h-8 bg-muted border border-border/80 rounded-full p-1 cursor-pointer select-none transition-colors duration-300"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            >
              <div className={cn(
                "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-transform duration-300 ease-out border border-border/30",
                currentTheme === "dark" ? "translate-x-8" : "translate-x-0"
              )} />
              <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                <Sun className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "light" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="relative z-10 flex-1 flex items-center justify-center h-full">
                <Moon className={cn("w-3.5 h-3.5 transition-colors duration-300", currentTheme === "dark" ? "text-primary" : "text-muted-foreground")} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Spacer สำหรับ mobile topbar */}
          <div className="md:hidden h-[56px]" />

          {children}

        </div>
      </div>
    </div>
  );
}
