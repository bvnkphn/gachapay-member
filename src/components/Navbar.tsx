"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Search, LogIn } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "หน้าแรก", path: "/" },
  { label: "ประวัติการเติม", path: "/history" },
  { label: "VIP", path: "/vip" },
  { label: "ช่วยเหลือ", path: "/help" },
];

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                CYBERPAY
              </span>
              <p className="text-[10px] text-muted-foreground leading-none">
                Game Top-up Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 relative">
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="relative text-sm font-medium transition-colors duration-200 hover:text-primary pb-1"
                >
                  <span className={active ? "text-primary" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-105 hover:shadow-purple-500/40 transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="border-t border-border/40 py-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="ค้นหาเกม..."
                  className="w-full rounded-xl border border-border bg-card/80 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile nav row */}
        <div className="md:hidden flex justify-around border-t border-border/30 bg-background/60 backdrop-blur-md py-2">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-xs font-medium transition-colors px-3 py-1 rounded-full ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
