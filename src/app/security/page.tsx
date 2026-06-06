"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalLayout } from "../../components/LegalLayout";

export default function SecurityPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <LegalLayout
        title="Security Policy"
        subtitle="Security by absence. Client-side isolation. Data we don't have can't leak."
        lastUpdated="May 23, 2026"
      >
        <section>
          <h2>01 · Data minimization</h2>
          <p>
            The strongest security guarantee is the data we don&apos;t collect.
            ScrubAI runs entirely in your browser&apos;s sandbox, so there is
            no centralized database of user images for an attacker to breach.
          </p>
          <p>
            If someone targeted our hosting, they would find static HTML, CSS,
            and client-side JavaScript — and zero user files, media, or
            archives.
          </p>
        </section>

        <section className="legal-card">
          <h2>02 · Authentication &amp; sessions (Clerk)</h2>
          <p>
            Identity management is delegated to Clerk. The protections it
            applies on our behalf:
          </p>

          <div className="legal-grid">
            <div className="legal-card">
              <h3>Brute-force protection</h3>
              <p>
                Continuous monitoring for login threshold abuses and suspicious
                endpoint activity.
              </p>
            </div>
            <div className="legal-card">
              <h3>XSS mitigation</h3>
              <p>
                Encrypted, <code>HttpOnly</code> session cookies prevent
                client-side scripts from reading auth tokens.
              </p>
            </div>
            <div className="legal-card">
              <h3>CSRF mitigation</h3>
              <p>
                Strict <code>SameSite</code> cookie attributes block cross-site
                request forgery.
              </p>
            </div>
            <div className="legal-card">
              <h3>Session rotation</h3>
              <p>
                Every sign-in / sign-out rotates the session token; the prior
                token is immediately invalidated.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>03 · Payments (PayPal)</h2>
          <p>
            Card or bank credentials are never transmitted to or stored on
            ScrubAI infrastructure. The Lifetime Pro upgrade is processed
            entirely by PayPal via the official{" "}
            <code>@paypal/react-paypal-js</code> SDK and verified server-side
            on capture. We only see PayPal&apos;s order confirmation token.
          </p>

          <ul>
            <li>
              <strong>PCI-DSS compliant.</strong> PayPal is a certified PCI-DSS
              Service Provider. Cardholder data is entered into PayPal&apos;s
              own surface, never into a ScrubAI form.
            </li>
            <li>
              <strong>TLS 1.3 in transit.</strong> Checkout sessions are
              encrypted directly between your device and PayPal.
            </li>
            <li>
              <strong>Server-side verification.</strong> Once PayPal confirms
              the order, our server independently verifies the captured amount
              and currency before unlocking Pro entitlements.
            </li>
            <li>
              <strong>One-time authorization.</strong> Lifetime Pro is a single
              payment — no stored billing token, no saved card, no recurring
              charge.
            </li>
          </ul>
        </section>

        <section className="legal-card">
          <h2>04 · Content security policy</h2>
          <p>
            We apply a strict CSP at the application layer, restricting
            resource loading to a pre-approved list of domains:
          </p>
          <ul>
            <li>
              <strong>connect-src</strong> — first-party (<code>&apos;self&apos;</code>),
              Clerk APIs, PayPal&apos;s checkout gateway, and our reverse
              telemetry proxy (<code>/ingest</code>).
            </li>
            <li>
              <strong>img-src</strong> — local blobs (<code>blob:</code>),
              base64 data URIs, and Clerk profile images.
            </li>
            <li>
              <strong>worker-src</strong> — limited to local web workers.
            </li>
          </ul>
        </section>

        <section>
          <h2>05 · Reporting vulnerabilities</h2>
          <p>
            Found a vulnerability? Email{" "}
            <code>security@scrubai.app</code> with reproducible steps. We
            review disclosures within 48 hours and ship fixes as fast as
            possible.
          </p>
        </section>
      </LegalLayout>

      <Footer />
    </div>
  );
}
