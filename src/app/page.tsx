import { Lock, Layers, Fingerprint, Zap, Eye, ShieldCheck } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { HomeHero } from "../components/HomeHero";
import { HomeFaq } from "../components/HomeFaq";
import { HomeCta } from "../components/HomeCta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <HomeHero />

      {/* ═════ HOW IT WORKS ════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="w-full bg-surface border-y border-muted-border"
      >
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
              How it works
            </div>
            <h2 className="font-sans text-[26px] lg:text-[34px] font-semibold tracking-tight text-ink">
              Three steps. No servers involved.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {[
              {
                step: "01",
                title: "Drop your image",
                body: "JPEG, PNG, WebP, AVIF, or HEIC from your phone. Up to 25 MB free, 100 MB on Pro.",
              },
              {
                step: "02",
                title: "We redraw the pixels",
                body: "An invisible HTML5 canvas renders raw RGB data. EXIF, GPS, XMP, JUMBF, C2PA - all of it lives in the file structure, not the pixels.",
              },
              {
                step: "03",
                title: "Download the clean file",
                body: "A fresh export at 95% quality. Bit-for-bit free of the original metadata.",
              },
            ].map((s) => (
              <div key={s.step} className="card-soft p-6">
                <div className="font-mono text-[12px] text-accent font-medium mb-3">
                  {s.step}
                </div>
                <h3 className="font-sans text-[16px] font-semibold tracking-tight text-ink mb-2">
                  {s.title}
                </h3>
                <p className="font-sans text-[13.5px] leading-relaxed text-n500">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ FEATURES ════════════════════════════════════════════ */}
      <section id="features" className="w-full bg-bg">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-xl mb-10 lg:mb-14">
            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
              Features
            </div>
            <h2 className="font-sans text-[26px] lg:text-[36px] font-semibold tracking-tight text-ink mb-3">
              Everything you can strip from a photo.
            </h2>
            <p className="font-sans text-[14.5px] lg:text-[15.5px] text-n500 leading-relaxed">
              Modern image files carry far more than the picture itself. ScrubAI
              removes the parts you didn&apos;t put there yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[
              {
                icon: Lock,
                title: "100% client-side",
                body: "Image bytes never go over the network. The canvas pipeline runs entirely inside your browser sandbox.",
              },
              {
                icon: Layers,
                title: "Pixel redraw, not tag deletion",
                body: "Most tools strip EXIF headers and stop. ScrubAI rebuilds the file from raw pixels, so JUMBF blocks and signed C2PA chains are gone too.",
              },
              {
                icon: Fingerprint,
                title: "C2PA & 'Made with AI' tags",
                body: "Cryptographically signed Content Credentials embedded by Adobe, OpenAI, and Midjourney are removed at the source.",
              },
              {
                icon: Zap,
                title: "Batch up to 50 images",
                body: "Pro users drag in queues, run them through the cleaner in one pass, and download a single ZIP. Built for workflows.",
              },
              {
                icon: Eye,
                title: "Live metadata inspector",
                body: "See exactly what's in your file before stripping it. EXIF, IPTC, XMP, and C2PA structures surfaced in plain language.",
              },
              {
                icon: ShieldCheck,
                title: "Zero telemetry on content",
                body: "We track UI events to improve the product. We never log image bytes, filenames, or extracted metadata. Period.",
              },
            ].map((f) => (
              <div key={f.title} className="card-soft p-6">
                <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-3.5">
                  <f.icon size={17} strokeWidth={2} />
                </span>
                <h3 className="font-sans text-[15.5px] font-semibold tracking-tight text-ink mb-1.5">
                  {f.title}
                </h3>
                <p className="font-sans text-[13.5px] leading-relaxed text-n500">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFaq />

      <HomeCta />

      <Footer />
    </div>
  );
}
