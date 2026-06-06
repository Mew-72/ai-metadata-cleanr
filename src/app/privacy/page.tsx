"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalLayout } from "../../components/LegalLayout";
import { PRICING } from "../../config/pricing";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <LegalLayout
        title="Privacy Policy"
        subtitle="Privacy by design. Local-first architecture."
        lastUpdated="May 23, 2026"
      >
        <section>
          <h2>01 · Our commitment to your privacy</h2>
          <p>
            Privacy is not a setting at ScrubAI. It is the architecture. Most
            image utilities force you to upload your files to remote cloud
            servers, exposing your work, your photos, and the metadata they
            carry to data harvesting and breach risk.
          </p>
          <p>
            ScrubAI runs on a local-first execution model.{" "}
            <strong>Your images never leave your computer.</strong> All file
            processing, metadata sanitization, and renaming happens locally in
            your browser&apos;s memory.
          </p>
        </section>

        <section className="legal-card">
          <h2>02 · What we don&apos;t collect</h2>
          <p>
            Because ScrubAI runs entirely client-side, the system is built so
            we cannot access, view, or retain your media:
          </p>
          <ul>
            <li>
              <strong>No media uploads.</strong> Your images are processed in
              your browser via the HTML5 Canvas API and bundled scripts.
            </li>
            <li>
              <strong>No image storage.</strong> We do not own, operate, or
              rent any backend that stores user-uploaded images.
            </li>
            <li>
              <strong>No metadata harvesting.</strong> We do not read, compile,
              or analyze your files&apos; original EXIF, IPTC, XMP, or C2PA
              provenance markers.
            </li>
          </ul>
          <p className="legal-note">
            When you close the browser tab or clear your session, any temporary
            image data in memory is gone.
          </p>
        </section>

        <section>
          <h2>03 · What we do collect (and why)</h2>
          <p>
            To manage accounts, process payments, and keep the site running, we
            collect a small, transparent set of data:
          </p>

          <div className="legal-grid">
            <div className="legal-card">
              <h3>Account &amp; billing</h3>
              <ul>
                <li>
                  <strong>Authentication:</strong> We use Clerk for accounts.
                  Clerk stores your email, name, and profile details.
                </li>
                <li>
                  <strong>Billing:</strong> Lifetime Pro is a one-time{" "}
                  {PRICING.displayPrice} purchase processed by PayPal. Card
                  details are entered on PayPal&apos;s PCI-compliant servers
                  and never touch ScrubAI.
                </li>
              </ul>
            </div>

            <div className="legal-card">
              <h3>Telemetry &amp; analytics</h3>
              <ul>
                <li>
                  <strong>Aggregate metrics:</strong> PostHog tracks anonymous
                  product usage and errors so we can improve the tool.
                </li>
                <li>
                  <strong>No PII in analytics:</strong> Telemetry is routed
                  through our domain proxy (<code>/ingest</code>). It carries
                  no personal identifying information.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-card">
          <h2>04 · How your images are processed</h2>
          <ol className="legal-steps">
            <li>
              <span className="legal-step-num">01</span>
              <div>
                <strong>File ingestion</strong>
                <p>
                  Your file is read in browser memory via the HTML5 File API.
                </p>
              </div>
            </li>
            <li>
              <span className="legal-step-num">02</span>
              <div>
                <strong>Canvas redraw</strong>
                <p>
                  The image is painted onto an offscreen{" "}
                  <code>&lt;canvas&gt;</code> element in the browser sandbox.
                </p>
              </div>
            </li>
            <li>
              <span className="legal-step-num">03</span>
              <div>
                <strong>Pristine export</strong>
                <p>
                  The browser regenerates the image from raw pixel data,
                  discarding all hidden tracking segments and signatures.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h2>05 · Your rights and data control</h2>
          <p>
            Because of the client-side architecture, you keep control over your
            digital footprint:
          </p>
          <ul>
            <li>
              <strong>Immediate sanitization.</strong> Closing the browser
              window wipes temporary file data from memory.
            </li>
            <li>
              <strong>Account deletion.</strong> You can delete your account,
              session profile, and billing logs at any time from your{" "}
              <Link href="/dashboard" className="legal-link">
                dashboard
              </Link>
              .
            </li>
          </ul>
        </section>
      </LegalLayout>

      <Footer />
    </div>
  );
}
