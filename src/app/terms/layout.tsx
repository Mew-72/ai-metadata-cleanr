import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - ScrubAI",
  description:
    "Terms and conditions for using ScrubAI's metadata cleaning and C2PA scanning services. Free tier and Lifetime Pro plan terms.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service - ScrubAI",
    description:
      "Usage policies and disclaimers for ScrubAI's browser-based image privacy tools.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
