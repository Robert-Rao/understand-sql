import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalysisProvider } from "@/context/AnalysisContext";
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
  title: "Understand-SQL — SQL 知识图谱可视化",
  description: "精准拆解SQL代码逻辑，生成可交互、可探索、附带教学属性的结构化知识图谱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AnalysisProvider>{children}</AnalysisProvider>
      </body>
    </html>
  );
}
