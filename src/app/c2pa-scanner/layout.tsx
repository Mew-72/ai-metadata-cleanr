import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free C2PA Checker & Content Credentials Scanner",
  description:
    "Inspect C2PA Content Credentials and signed image provenance privately in your browser. Understand credential validation results.",
  alternates: { canonical: "/c2pa-scanner" },
  openGraph: {
    title: "Free C2PA Checker & Content Credentials Scanner | ScrubAI",
    description:
      "Inspect C2PA Content Credentials and signed image provenance privately in your browser. Understand credential validation results.",
  },
};

export default function C2paScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
