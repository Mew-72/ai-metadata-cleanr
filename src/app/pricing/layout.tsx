import type { Metadata } from "next";
import { PRICING } from "../../config/pricing";

export const metadata: Metadata = {
  title: "Pricing - Free & Lifetime Pro Plans",
  description:
    `Compare ScrubAI Free and Lifetime Pro plans. Batch processing up to 50 images, unlimited daily cleans, ZIP exports, and camera profile removal. One-time ${PRICING.displayPrice} payment, no subscription.`,
  openGraph: {
    title: "ScrubAI Pricing - Free & Lifetime Pro Plans",
    description:
      "Unlimited metadata removal, batch processing, and ZIP exports. One-time payment, no recurring fees. Compare plans and upgrade instantly.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
