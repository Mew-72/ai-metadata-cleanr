"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalLayout } from "../../components/LegalLayout";

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <LegalLayout
        title="Refund Policy"
        subtitle="Digital goods. All sales are final."
        lastUpdated="May 25, 2026"
      >
        <section>
          <h2>01 · No-refund standard</h2>
          <p>
            All purchases on ScrubAI are final and{" "}
            <strong>strictly non-refundable</strong>. By purchasing the Pro
            tier and completing checkout via PayPal, you acknowledge and agree
            you waive any right to a refund or chargeback.
          </p>
        </section>

        <section className="legal-card">
          <h2>02 · Why we enforce this</h2>
          <p>
            ScrubAI runs on a local-first model. We don&apos;t store your
            images and we don&apos;t use server-side processing queues. As soon
            as you upgrade:
          </p>
          <ul>
            <li>
              <strong>Instant value.</strong> Pro features (batch queue,
              advanced compression, ZIP exports) unlock immediately in your
              browser via your Clerk session.
            </li>
            <li>
              <strong>Unlimited use.</strong> Because processing is purely
              client-side, a Pro user can run hundreds or thousands of images
              through the cleaner the moment they upgrade. There&apos;s no way
              to &quot;return&quot; the digital transformations executed
              locally on your device.
            </li>
          </ul>
        </section>

        <section>
          <h2>03 · Lifetime access</h2>
          <p>
            Lifetime Pro is a one-time purchase. There&apos;s no cancellation
            flow because there&apos;s nothing to cancel:
          </p>
          <ul>
            <li>
              <strong>No recurring billing.</strong> Your account is marked Pro
              for life. You will never be billed again.
            </li>
            <li>
              <strong>Permanent access.</strong> Pro features stay active as
              long as your Clerk credentials remain active.
            </li>
          </ul>
        </section>

        <section className="legal-card">
          <h2>04 · Double charges &amp; technical errors</h2>
          <p>
            We&apos;re committed to billing accuracy. If you spot a duplicate
            transaction or a technical credit error:
          </p>
          <ul>
            <li>
              <strong>Reporting.</strong> Email <code>billing@scrubai.app</code>{" "}
              with your invoice and PayPal transaction IDs.
            </li>
            <li>
              <strong>Resolution.</strong> If our billing systems verify a
              system-level double-charge, we&apos;ll credit or refund the extra
              transaction to your original payment method.
            </li>
          </ul>
        </section>

        <section>
          <h2>05 · No exceptions</h2>
          <p>
            To keep things simple and fair for every creator on the platform,
            we don&apos;t make exceptions for:
          </p>
          <ul>
            <li>Accidental purchases or upgrades.</li>
            <li>Unused features or under-utilization.</li>
            <li>
              Changes in third-party platform algorithms (e.g. Instagram or
              Pinterest reach metrics).
            </li>
          </ul>
        </section>
      </LegalLayout>

      <Footer />
    </div>
  );
}
