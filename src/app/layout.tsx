import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import {
  Playfair_Display,
  Lora,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://scrubai.app",
  ),
  title: {
    default: "ScrubAI — Bypass AI Reach Suppression & Clean Image Metadata",
    template: "%s | ScrubAI",
  },
  description:
    "100% client-side local image metadata cleaner. Strip EXIF, IPTC, XMP, and cryptographically signed C2PA credentials to bypass algorithmic reach suppression and 'Made with AI' tags.",
  keywords: [
    "metadata cleaner",
    "EXIF remover",
    "C2PA remover",
    "Content Credentials sanitizer",
    "Made with AI bypass",
    "Instagram reach suppression",
    "Pinterest SEO tool",
    "photography privacy",
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
        alt: "ScrubAI — Strip AI Metadata & Bypass Reach Suppression",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
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
      data-scroll-behavior="smooth"
      className={`${playfairDisplay.variable} ${lora.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
