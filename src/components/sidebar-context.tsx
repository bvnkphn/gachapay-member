"use client";

import { createContext, useContext, useState, useMemo } from "react";

const SidebarContext = createContext({
    open: true,
    toggle: () => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    const value = useMemo(() => ({ open, toggle: () => setOpen(o => !o) }), [open]);
    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
