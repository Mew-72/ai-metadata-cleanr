import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "C2PA Content Credentials Scanner",
  description:
    "Scan images for C2PA cryptographic provenance manifests, JUMBF signature blocks, and 'Made with AI' markers. 100% client-side verification.",
  openGraph: {
    title: "C2PA Scanner - Detect AI Content Credentials",
    description:
      "Upload any image to scan for hidden C2PA provenance manifests and AI generation signatures. Free, instant, client-side.",
  },
};

export default function C2paScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
