import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "fit.ly — AI Wardrobe Intelligence",
  description: "AI-powered wardrobe & outfit generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} relative`}>
        {/* Animated background system */}
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="grid-overlay" />

        <Navbar />
        <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
      </body>
    </html>
  );
}
