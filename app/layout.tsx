import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import { ToastProvider } from "@/components/providers/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-secondary",
  display: "swap",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "EntranceGateway CMS",
  description: "Content Management System for EntranceGateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className="antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
