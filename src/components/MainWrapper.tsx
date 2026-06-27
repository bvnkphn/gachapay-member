"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const isAuthPage = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"].includes(pathname);
    return (
        <main className={isAdmin || isAuthPage ? "" : "pt-16 pb-12"}>
            {children}
        </main>
    );
}
