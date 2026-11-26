"use client";

import { CleanerInterface } from "./CleanerInterface";
import { useAppAuth } from "../hooks/useAppAuth";

export function HomeHero() {
  const { isPro } = useAppAuth();

  return (
    <section className="relative w-full hero-gradient">
      <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-5 lg:px-6 pt-5 lg:pt-7 pb-12 lg:pb-16">
        {/* Title header — compact, keeps tool first */}
        <div className="text-center mb-4 lg:mb-5">
          <h1 className="font-sans text-[22px] lg:text-[28px] font-semibold tracking-tight text-ink mb-2">
            Free Online Image Metadata Remover
          </h1>
          <p className="font-sans text-[13.5px] text-n500 max-w-2xl mx-auto leading-relaxed">
            Remove EXIF, GPS, XMP and C2PA data from JPEG, PNG, WebP, AVIF and HEIC files — entirely in your browser.
            Five free cleans per day. No account required.{" "}
            <a href="/c2pa-scanner" className="text-accent hover:underline">Verify C2PA credentials</a>{" "}
            or{" "}
            <a href="/docs" className="text-accent hover:underline">read the guides</a>.
          </p>
        </div>

        {!isPro && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-4 lg:mb-5">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-medium">100% in your browser</span>
            </span>
            <span className="hidden sm:inline text-n300">·</span>
            <span className="text-[12.5px] text-n500">No uploads, ever</span>
            <span className="hidden sm:inline text-n300">·</span>
            <span className="text-[12.5px] text-n500">No account to start</span>
            <span className="hidden sm:inline text-n300">·</span>
            <span className="text-[12.5px] text-n500">Free up to 5 images / day</span>
          </div>
        )}
        {isPro && (
          <div className="flex justify-center mb-4 lg:mb-5">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-medium">Pro · Unlimited cleans, batch up to 50</span>
            </span>
          </div>
        )}

        <div className="surface-card overflow-hidden">
          <CleanerInterface />
        </div>

        <p className="mt-5 text-center font-sans text-[13.5px] text-n500 max-w-3xl mx-auto leading-relaxed">
          Strips EXIF, GPS, IPTC, XMP, and C2PA Content Credentials by redrawing
          your photos pixel-by-pixel. Nothing leaves your device.
        </p>
      </div>
    </section>
  );
}
