"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalLayout } from "../../components/LegalLayout";
import { PRICING } from "../../config/pricing";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <LegalLayout
        title="Terms of Service"
        subtitle="The agreement between you and ScrubAI."
        lastUpdated="May 23, 2026"
      >
        <section>
          <h2>01 · Contractual relationship</h2>
          <p>
            Welcome to ScrubAI (the <em>Service</em>, <em>we</em>, <em>us</em>,
            or <em>our</em>). These Terms of Service form a legally binding
            agreement between you (<em>User</em>) and ScrubAI. By using the
            client-side metadata tools, registering an account, or accessing
            the platform, you agree to abide by these Terms.
          </p>
        </section>

        <section>
          <h2>02 · Eligibility &amp; account security</h2>
          <ul>
            <li>
              <strong>Authentication.</strong> Premium features (such as batch
              queue processing) require an account verified by Clerk.
            </li>
            <li>
              <strong>Credentials.</strong> You are responsible for keeping
              your login credentials confidential and notifying us if you
              detect unauthorized use of your account.
            </li>
            <li>
              <strong>Automated use.</strong> Bots, scrapers, and high-volume
              automation are not permitted to register accounts or run on our
              client without explicit API licensing.
            </li>
          </ul>
        </section>

        <section className="legal-card">
          <h2>03 · Intellectual property &amp; your content</h2>
          <ul>
            <li>
              <strong>You keep your rights.</strong> You retain 100% ownership
              of any images, designs, or assets you process on ScrubAI.
            </li>
            <li>
              <strong>No license to us.</strong> We don&apos;t require, claim,
              or grant ourselves any license to copy, distribute, host, or
              analyze your content. Processing runs entirely in your browser
              sandbox.
            </li>
          </ul>
        </section>

        <section>
          <h2>04 · Billing, plans, and refunds</h2>
          <p>
            Two plans, one of them paid once. No subscriptions, no auto-renew.
          </p>

          <div className="legal-grid">
            <div className="legal-card">
              <h3>Free tier</h3>
              <p>
                Single-image drag-and-drop with full metadata removal.
                Completely free, no account required.
              </p>
            </div>
            <div className="legal-card">
              <h3>Lifetime Pro · {PRICING.displayPrice} one-time</h3>
              <p>
                A single payment processed via PayPal. Unlocks batch uploads,
                ZIP packaging, and every current and future Pro feature for the
                life of your account. No recurring billing, nothing to cancel.
              </p>
            </div>
          </div>

          <div className="legal-note">
            <strong>One-time charge.</strong> Lifetime Pro is billed once at
            checkout. There is no subscription to manage. All sales are final —
            see our{" "}
            <Link href="/refund" className="legal-link">
              refund policy
            </Link>
            .
          </div>
        </section>

        <section className="legal-card">
          <h2>05 · Acceptable use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate local, national, or international laws.</li>
            <li>
              Strip metadata from copyrighted works that don&apos;t belong to
              you for the purpose of piracy or attribution fraud.
            </li>
            <li>
              Bypass legitimate, signed legal evidence markers on sensitive
              documents.
            </li>
            <li>
              Reverse engineer, decompile, or extract the client-side code of
              the application.
            </li>
          </ul>
        </section>

        <section>
          <h2>06 · Limitation of liability</h2>
          <ul>
            <li>
              <strong>&quot;As-is&quot; service.</strong> ScrubAI is provided
              &quot;as is&quot; without warranties of any kind, express or
              implied.
            </li>
            <li>
              <strong>Algorithmic changes.</strong> Social platforms constantly
              update their detection systems. We remove all image-level
              metadata and signed credentials, but we can&apos;t guarantee a
              platform won&apos;t deploy pixel-level analysis to flag content.
              We are not liable for changes in reach, shadowbans, or traffic
              drops on third-party networks.
            </li>
            <li>
              <strong>Indirect damages.</strong> ScrubAI is not liable for
              indirect, incidental, special, or consequential damages from your
              use of the tool.
            </li>
          </ul>
        </section>
      </LegalLayout>

      <Footer />
    </div>
  );
}
