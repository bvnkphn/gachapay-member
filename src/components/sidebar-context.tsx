"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
    open: true,
    toggle: () => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <SidebarContext.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
