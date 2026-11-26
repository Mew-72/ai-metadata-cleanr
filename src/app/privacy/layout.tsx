import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - ScrubAI",
  description:
    "How ScrubAI handles your data. Images are processed entirely in your browser and never uploaded. Anonymous UI analytics via PostHog. No image data or filenames logged.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy - ScrubAI",
    description:
      "Images never leave your device. Anonymous UI analytics help improve the product. No image bytes or filenames are ever logged.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
