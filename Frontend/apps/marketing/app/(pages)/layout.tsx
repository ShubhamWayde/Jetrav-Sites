import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import Glow from "../components/glow/glow";
import { SvgGradients } from "@repo/ui/icon/svgGradients";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skipLink">
        Skip to main content
      </a>
      <SvgGradients />
      <Glow />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
