import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

/**
 * Geist + Geist Mono is Vercel's design system stack - a clean, professional
 * sans family used by Linear, Vercel, Resend, and other modern SaaS products.
 *
 * Both CSS variables are referenced from globals.css (--font-geist-sans /
 * --font-geist-mono) and remapped to all four legacy font tokens
 * (font-serif, font-body, font-sans, font-mono) so existing markup
 * across the app continues to render without per-file edits.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://scrubai.app",
  ),
  title: {
    default: "ScrubAI - Free Image Metadata Remover (EXIF, GPS & C2PA)",
    template: "%s | ScrubAI",
  },
  description:
    "Remove EXIF, GPS, IPTC, XMP, and C2PA metadata from your images. Free, 100% in your browser. No uploads, no tracking. Take back control of what travels with your photos.",
  keywords: [
    "image metadata remover",
    "remove EXIF data",
    "photo metadata cleaner",
    "remove GPS from photos",
    "strip C2PA Content Credentials",
    "online metadata viewer",
    "EXIF remover",
    "photo privacy tool",
  ],
  openGraph: {
    type: "website",
    siteName: "ScrubAI",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScrubAI - Remove image metadata in your browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
