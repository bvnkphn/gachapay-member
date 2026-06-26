"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    return (
        <main className={isAdmin ? "" : "pt-16 pb-12"}>
            {children}
        </main>
    );
}
