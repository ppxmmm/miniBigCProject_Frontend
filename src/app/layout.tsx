import type { Metadata } from "next";
import { AppShellProvider } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import brandIcon from "./Big_C_mini_logo.ico";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini BigC · Manager Console",
  description: "Branch operations console for Mini BigC retail managers",
  icons: {
    icon: brandIcon.src,
    shortcut: brandIcon.src,
    apple: brandIcon.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppShellProvider>{children}</AppShellProvider>
            <Toaster richColors position="bottom-center" className="z-[100]" />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
