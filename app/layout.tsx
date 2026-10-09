import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NestFlow - Modern PG & Co-Living Platform",
  description: "Manage rooms, real-time bed matrices, and 3-meal daily mess schedules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
          <ThemeProvider>
            <Navbar />
            <main className="pt-20 sm:pt-24">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}