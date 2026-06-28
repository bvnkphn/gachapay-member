"use client";

import Link from "next/link";
import { Gamepad2, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/15 backdrop-blur-sm pt-12 pb-8 mt-16">
      <div className="container mx-auto px-4">
        {/* Top Section: Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Logo & Branding */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-sm shadow-primary/10">
                <Gamepad2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base font-black tracking-widest text-primary">
                GACHA<span className="text-foreground">PAY</span>
              </span>
            </Link>
            <p className="text-[11px] text-muted-foreground text-center md:text-left max-w-xs leading-relaxed">
              แพลตฟอร์มให้บริการเติมเกมออนไลน์อัตโนมัติ สะดวก รวดเร็ว ตลอด 24 ชั่วโมง เติมง่ายผ่านระบบ UID ปลอดภัย 100%
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest border-b border-primary/30 pb-1 w-fit">
              เมนูแนะนำ
            </h4>
            <div className="flex flex-col items-center md:items-start gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">หน้าหลัก</Link>
              <Link href="/#all-games" className="hover:text-primary transition-colors">บริการเติมเกมทั้งหมด</Link>
              <Link href="/balance" className="hover:text-primary transition-colors">เติมเงินเข้าวอลเล็ท</Link>
            </div>
          </div>

          {/* Column 3: Help & Policies */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest border-b border-primary/30 pb-1 w-fit">
              ช่วยเหลือ & ความเป็นส่วนตัว
            </h4>
            <div className="flex flex-col items-center md:items-start gap-1.5 text-xs text-muted-foreground">
              <Link href="/support" className="hover:text-primary transition-colors">ติดต่อฝ่ายสนับสนุน (Support)</Link>
              <Link href="/terms-privacy/terms" className="hover:text-primary transition-colors">ข้อตกลงการใช้บริการ (Terms)</Link>
              <Link href="/terms-privacy/privacy" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว (Privacy)</Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Divider & Copyright */}
        <div className="border-t border-border/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p>© 2026 GACHAPAY. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> by Ethereum Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
