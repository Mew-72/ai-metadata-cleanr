import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - ScrubAI",
  description:
    "How ScrubAI uses cookies for session management and usage limits. Strictly necessary cookies and optional analytics via PostHog.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookie Policy - ScrubAI",
    description:
      "Cookie usage at ScrubAI: session management, anonymous analytics, and daily usage limits.",
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
