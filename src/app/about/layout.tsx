import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description:
        "ScrubAI is an independent, local-first privacy tool. We build software that strips EXIF, GPS, and C2PA metadata from your images entirely in your browser — because what travels with your photos should be your call.",
    openGraph: {
        title: "About ScrubAI",
        description:
            "Local-first image privacy tools, built independently. Why we exist, how we work, and what we won't do.",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
