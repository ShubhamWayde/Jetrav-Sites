import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export default function PagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}
