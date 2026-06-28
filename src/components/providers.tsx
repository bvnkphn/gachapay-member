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
            <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: 'hsl(var(--card))',
                            color: 'hsl(var(--card-foreground))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                            fontFamily: 'inherit',
                            opacity: 1,
                        },
                        success: {
                            style: {
                                background: 'hsl(var(--card))',
                                color: 'hsl(var(--card-foreground))',
                                border: '1px solid rgba(6, 182, 212, 0.4)',
                                boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.2)',
                                opacity: 1,
                            },
                        },
                        error: {
                            style: {
                                background: 'hsl(var(--card))',
                                color: 'hsl(var(--card-foreground))',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
                                opacity: 1,
                            },
                        },
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
