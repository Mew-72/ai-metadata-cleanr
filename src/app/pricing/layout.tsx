import type { Metadata } from "next";
import { PRICING } from "../../config/pricing";

export const metadata: Metadata = {
  title: { absolute: "ScrubAI Pricing - Free & Lifetime Pro Plans" },
  description:
    `Compare ScrubAI Free and Lifetime Pro plans. ${PRICING.displayPrice} one-time payment. Batch processing up to 50 images, unlimited daily cleans, ZIP exports, and all future tools — no subscription.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "ScrubAI Pricing - Free & Lifetime Pro Plans",
    description:
      "Unlimited metadata removal, batch processing, and ZIP exports. One-time payment, no recurring fees.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
