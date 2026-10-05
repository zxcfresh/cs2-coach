import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CS2 AI Coach — Умный анализ твоих демок",
  description:
    "Загрузи демку CS2 и получи персональный разбор от ИИ-тренера с конкретными советами, как апнуться. Без воды.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-cs2-dark text-gray-100 antialiased">
        <Header />
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
