import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { pageFontVariables } from "@/lib/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // App-chrome-only font; public /s pages should not preload it.
  preload: false,
});

export const metadata: Metadata = {
  title: "Pageforce",
  description: "Mini web builder SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pageFontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
