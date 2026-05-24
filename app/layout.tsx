/**
 * Root layout — wraps every page in the app.
 *
 * In Next.js App Router, layout.tsx is the shell around {children}.
 * There is no index.html file; this component renders the <html> and <body> tags.
 * This file runs on the server by default (no "use client"), which is fine for
 * static structure, fonts, and global CSS.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track job applications, companies, and interview status locally.",
};

export default function RootLayout({
  children, // Next.js injects the current page here (e.g. Home from page.tsx)
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
