import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description:
    "ScrubAI's security practices. All image processing happens client-side in your browser — no server uploads, no data retention, encrypted connections.",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
