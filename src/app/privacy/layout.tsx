import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ScrubAI handles your data. 100% client-side processing — images never leave your browser. Learn about our privacy practices and data collection policies.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
