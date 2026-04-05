import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import Glow from "../components/glow/glow";
import {SvgGradients} from "@repo/ui/icons/svgGradients";

export default function PagesLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SvgGradients />
      <Glow />
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
