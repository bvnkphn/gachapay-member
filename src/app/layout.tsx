import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CYBERPAY - Game Top-up Platform",
    description: "บริการเติมเกมออนไลน์ที่ไว้วางใจได้ รองรับทุกเกมยอดนิยม",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <Header />
                    <main className="pt-16">{children}</main>
                    <BottomNav />
                </Providers>
            </body>
        </html>
    );
}
