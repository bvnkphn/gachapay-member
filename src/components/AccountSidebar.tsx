"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, Crown, Settings, LogOut, User, Ticket, Wallet, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/sidebar-context";
import { cn } from "@/lib/utils";

export function AccountSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const { logout } = useAuth();
    const { open } = useSidebar();

    // Only show on account/tickets pages
    const shouldShow =
        pathname.startsWith("/account") ||
        pathname.startsWith("/support/tickets") ||
        pathname.startsWith("/history");

    if (!shouldShow) return null;

    const items = [
        { icon: User, label: t.myAccount, path: "/account" },
        { icon: Wallet, label: t.sidebarBalance, path: "/account/balance" },
        { icon: ShoppingCart, label: t.sidebarOrders, path: "/history" },
        { icon: Ticket, label: t.sidebarTickets, path: "/support/tickets" },
        { icon: Crown, label: t.vipPrivileges, path: "/account/vip-tier" },
        { icon: Settings, label: t.accountSettings, path: "/account/settings" },
    ];

    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col fixed top-16 left-0 bottom-0 border-r border-border/40 pt-8 pb-6 px-3 z-40 transition-all duration-300 overflow-hidden",
                open ? "w-48" : "w-14"
            )}
            style={{ background: "rgba(8,10,22,0.97)" }}
        >
            {open && (
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-3 mb-3 whitespace-nowrap">
                    {t.general}
                </p>
            )}
            <nav className="flex-1 space-y-0.5">
                {items.map(item => {
                    const isActive =
                        pathname === item.path ||
                        (item.path === "/account" &&
                            pathname.startsWith("/account") &&
                            pathname !== "/account/vip-tier" &&
                            pathname !== "/account/settings" &&
                            pathname !== "/account/balance") ||
                        (item.path === "/history" && pathname.startsWith("/history"));
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            title={!open ? item.label : undefined}
                            className={cn(
                                "w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors group",
                                open ? "justify-between" : "justify-center",
                                isActive
                                    ? "bg-primary/15 text-primary"
                                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn("flex items-center", open && "gap-2.5")}>
                                <item.icon className="w-4 h-4 shrink-0" />
                                {open && <span className="whitespace-nowrap">{item.label}</span>}
                            </div>
                            {open && (
                                <ChevronRight className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary/60" : "text-muted-foreground")} />
                            )}
                        </button>
                    );
                })}
            </nav>
            <button
                onClick={() => { logout(); router.push("/login"); }}
                title={!open ? t.logout : undefined}
                className={cn(
                    "w-full flex items-center py-2.5 px-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors",
                    open ? "gap-2.5" : "justify-center"
                )}
            >
                <LogOut className="w-4 h-4 shrink-0" />
                {open && <span className="whitespace-nowrap">{t.logout}</span>}
            </button>
        </aside>
    );
}
