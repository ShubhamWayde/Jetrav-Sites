import type {Metadata} from "next";
import "../../../styles/css/base.css"
import "./globals.css";
import {fontOutfit} from "@repo/ui/fonts";

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
    <html lang="en" className={`${fontOutfit.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
