import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileDrawer from "@/components/ui/ProfileDrawer";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Education Center",
  description: "Hệ thống quản lý trung tâm giáo dục",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <ProfileDrawer />
        </QueryProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
