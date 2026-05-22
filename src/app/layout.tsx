import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const notoThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai" });

export const metadata: Metadata = {
  title: "Mini BigC · Branch Operations",
  description: "Branch management console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${notoThai.variable} font-[family-name:var(--font-geist),var(--font-thai)] antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
