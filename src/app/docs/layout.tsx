import type { Metadata } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const metadata: Metadata = {
  title: "Image Metadata & Photo Privacy Guides",
  description:
    "Guides on image metadata removal, C2PA Content Credentials, photo privacy, and how the pixel-redraw pipeline strips hidden data.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Image Metadata & Photo Privacy Guides | ScrubAI",
    description:
      "Guides on image metadata removal, C2PA Content Credentials, photo privacy, and how the pixel-redraw pipeline strips hidden data.",
  },
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
