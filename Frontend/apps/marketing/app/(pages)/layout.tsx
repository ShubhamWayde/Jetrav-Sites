import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import Glow from "../components/glow/glow";

export default function PagesLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Glow />
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
