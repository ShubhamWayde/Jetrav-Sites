import type { Metadata } from "next";
import { outfit } from "@repo/fonts";
import "../../../styles/css/base.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jetrav | Travel agency",
  description: "Travel Seamlessly | Earn Instantly | Manage Effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`body ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
