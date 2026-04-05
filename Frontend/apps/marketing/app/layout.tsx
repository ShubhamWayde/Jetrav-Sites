import type {Metadata} from "next";
import "@repo/ui/styles/css/base.css";
import "./globals.css";
import {fontOutfit} from "@repo/ui/fonts/fonts";
import {SvgGradients} from "@repo/ui/icons/svgGradients";

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
      <body className={fontOutfit.className}>
        <SvgGradients />
        {children}
      </body>
    </html>
  );
}
