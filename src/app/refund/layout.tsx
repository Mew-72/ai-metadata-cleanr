import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - ScrubAI",
  description:
    "Refund policy for ScrubAI Lifetime Pro. One-time purchases are final. Contact us within 7 days if you experience a billing issue.",
  alternates: { canonical: "/refund" },
  openGraph: {
    title: "Refund Policy - ScrubAI",
    description:
      "Refund terms for ScrubAI's one-time Lifetime Pro purchase.",
  },
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
