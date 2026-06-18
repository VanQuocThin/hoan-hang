import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HoànHàng — Quản lý đổi trả thông minh",
  description: "Tự động hóa quy trình đổi trả, giữ lại doanh thu và tăng lòng trung thành khách hàng Việt Nam.",
  openGraph: {
    title: "HoànHàng — Quản lý đổi trả thông minh",
    description: "Tự động hóa quy trình đổi trả, giữ lại doanh thu và tăng lòng trung thành khách hàng Việt Nam.",
    url: "https://hoan-hang-ngxu.vercel.app",
    siteName: "HoànHàng",
    images: [
      {
        url: "https://hoan-hang-ngxu.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "HoànHàng — Quản lý đổi trả thông minh",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoànHàng — Quản lý đổi trả thông minh",
    description: "Tự động hóa quy trình đổi trả, giữ lại doanh thu và tăng lòng trung thành khách hàng Việt Nam.",
    images: ["https://hoan-hang-ngxu.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
