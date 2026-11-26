import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Policy - ScrubAI",
  description:
    "ScrubAI security practices. All image processing happens client-side — no server uploads, no image data retention. Authentication via Clerk, payments via PayPal.",
  alternates: { canonical: "/security" },
  openGraph: {
    title: "Security Policy - ScrubAI",
    description:
      "Client-side isolation, no stored user images, encrypted connections, and third-party payment security via PayPal.",
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
