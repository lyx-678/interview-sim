import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfferLab · 理工科 AI 面试训练场",
  description: "面向理工科学生的 AI 模拟面试：选岗位、练面试、拿反馈。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
