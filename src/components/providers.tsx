"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { SidebarProvider } from "@/components/sidebar-context";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
                <Toaster position="top-center" richColors />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
