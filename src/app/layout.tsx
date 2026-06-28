import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import FooterWrapper from "@/components/FooterWrapper";
import { LanguageProvider } from "@/components/language-context";
import { MainWrapper } from "@/components/MainWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GACHAPAY - Game Top-up Platform",
    description: "บริการเติมเกมออนไลน์ที่ไว้วางใจได้ รองรับทุกเกมยอดนิยม พร้อมโปรโมชันพิเศษสำหรับสมาชิก VIP",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body className={inter.className}>
                <LanguageProvider>
                    <Providers>
                        <Header />
                        <MainWrapper>{children}</MainWrapper>
                        <FooterWrapper />
                    </Providers>
                </LanguageProvider>
            </body>
        </html>
    );
}
