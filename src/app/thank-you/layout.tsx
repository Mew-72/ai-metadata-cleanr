import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Lifetime Pro",
  description:
    "Thank you for upgrading to ScrubAI Lifetime Pro. Unlimited metadata cleaning, batch processing, and ZIP exports are now unlocked for life.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
