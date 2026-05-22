import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini BigC Manager Console",
  description: "Branch operations console for Mini BigC managers and staff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
