"use client";

import React from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { LegalLayout } from "../../components/LegalLayout";

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <LegalLayout
        title="Cookie Policy"
        subtitle="Strictly necessary cookies only. No tracking networks."
        lastUpdated="May 23, 2026"
      >
        <section>
          <h2>01 · How we use cookies</h2>
          <p>
            ScrubAI uses a minimal set of cookies. We don&apos;t partner with
            third-party tracking networks, and we don&apos;t drop behavioral
            advertising, retargeting, or data-broker cookies. Cookies are used
            to secure your session, remember interface preferences, and process
            payments.
          </p>
        </section>

        <section>
          <h2>02 · The cookies we set</h2>
          <p>
            A complete audit of every cookie set on the platform:
          </p>

          <div style={{ overflowX: "auto" }}>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Clerk</strong>
                  </td>
                  <td>Keeps you signed in and routes the dashboard.</td>
                  <td>Session / persistent</td>
                  <td>
                    <span className="legal-pill">Strictly necessary</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>PayPal</strong>
                  </td>
                  <td>
                    Authorizes the one-time Lifetime Pro upgrade. Set only on
                    the checkout flow, by PayPal directly.
                  </td>
                  <td>Session</td>
                  <td>
                    <span className="legal-pill">Strictly necessary</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>PostHog</strong>
                  </td>
                  <td>Anonymous unique-visitor tracking for usage patterns.</td>
                  <td>Up to 1 year</td>
                  <td>
                    <span className="legal-pill legal-pill-neutral">Analytics</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>ScrubAI prefs</strong>
                  </td>
                  <td>
                    Remembers local settings (light / dark theme, filename
                    toggle).
                  </td>
                  <td>Persistent</td>
                  <td>
                    <span className="legal-pill legal-pill-neutral">Functional</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>03 · Managing cookies</h2>
          <p>
            Most browsers accept cookies automatically. You can disable them in
            your browser&apos;s privacy settings.
          </p>
          <p className="legal-callout">
            <strong>Heads up:</strong> disabling strictly necessary cookies
            (such as Clerk) will prevent you from logging in, upgrading, or
            using the batch workspace.
          </p>
        </section>
      </LegalLayout>

      <Footer />
    </div>
  );
}
