import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Pro",
  description:
    "Thank you for subscribing to ScrubAI Pro. Unlimited metadata cleaning, batch processing, and ZIP exports are now unlocked.",
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
