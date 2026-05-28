import type { Metadata } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const metadata: Metadata = {
    title: "Privacy Docs",
    description:
        "Editorial guides on metadata, C2PA Content Credentials, AI reach suppression, and ScrubAI's pixel-redraw pipeline.",
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-bg transition-colors duration-200">
            <Header />
            {children}
            <Footer />
        </div>
    );
}
