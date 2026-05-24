import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "Compare ScrubAI Free and Pro plans. Batch processing up to 50 images, unlimited daily cleans, ZIP exports, and camera profile bypass. Starting at $5/mo.",
  openGraph: {
    title: "ScrubAI Pricing — Free & Pro Plans",
    description:
      "Unlimited metadata stripping, batch processing, and ZIP exports. Compare plans and upgrade instantly.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
