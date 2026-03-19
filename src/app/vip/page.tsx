"use client";

import { Crown, Star, ChevronRight, Percent, Gift } from "lucide-react";
import Link from "next/link";

const tiers = [
  { name: "Bronze",   points: "0+ แต้ม",      discount: "-3%",  icon: "🥉", active: false },
  { name: "Silver",   points: "1,000+ แต้ม",  discount: "-5%",  icon: "🥈", active: true  },
  { name: "Gold",     points: "5,000+ แต้ม",  discount: "-10%", icon: "🥇", active: false },
  { name: "Platinum", points: "15,000+ แต้ม", discount: "-15%", icon: "💎", active: false },
];

const benefits = [
  "ส่วนลด 5% ทุกการเติม",
  "รับ 2% คืนเป็นแต้ม",
  "สิทธิร่วมกิจกรรมพิเศษ",
  "โปรโมชันพิเศษเฉพาะ Silver",
];

export default function VIPPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-cyber">
            <Crown className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">สมาชิก VIP</h1>
          <p className="text-sm text-muted-foreground">รับสิทธิพิเศษมากมายจากการเป็นสมาชิก</p>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary to-muted p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">ระดับปัจจุบัน</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥈</span>
                <span className="text-xl font-bold">Silver</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">แต้มสะสม</p>
              <p className="text-2xl font-bold">2,450</p>
            </div>
          </div>
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>อีก 2,550 แต้ม ถึง Gold</span>
            <span>36%</span>
          </div>
          <div className="h-2 rounded-full bg-background">
            <div className="h-2 w-[36%] rounded-full gradient-cyber" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">ยอดใช้จ่ายรวม</p>
              <p className="text-lg font-bold">฿8,500</p>
            </div>
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">ส่วนลดปัจจุบัน</p>
              <p className="text-lg font-bold">5%</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="font-bold">สิทธิพิเศษของคุณ</h3>
          </div>
          <div className="space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="font-bold">ระดับสมาชิกทั้งหมด</h3>
          </div>
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                  tier.active ? "border-primary bg-primary/10 shadow-cyber" : "border-border bg-card"
                }`}
              >
                <span className="text-3xl">{tier.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tier.name}</span>
                    {tier.active && (
                      <span className="rounded-full gradient-cyber px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        ปัจจุบัน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tier.points}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{tier.discount}</p>
                  <p className="text-xs text-muted-foreground">ส่วนลด</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">ยิ่งเติมมาก ยิ่งได้แต้มมาก อัพระดับเพื่อรับส่วนลดเพิ่ม!</p>
          <Link
            href="/topup"
            className="inline-flex items-center gap-2 rounded-xl gradient-cyber px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Percent className="h-4 w-4" />
            เริ่มเติมเกมเลย
          </Link>
        </div>
      </div>
    </div>
  );
}
