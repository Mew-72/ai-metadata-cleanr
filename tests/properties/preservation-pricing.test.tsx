/**
 * Property 2: Preservation - pricing keeps flowing from `src/config/pricing.ts`.
 *
 * **Validates: Requirements 3.5**
 *
 * Two halves. The rendered half asserts every dollar amount that reaches the
 * pricing page and the billing modal comes from `PRICING`, across the generated
 * auth-state domain, so the fix cannot quietly change what a visitor is shown.
 * The API half drives the real `POST /api/paypal/create-order` handler with the
 * PayPal HTTP calls intercepted, and asserts the order payload still carries
 * 24.99 USD and the configured description.
 *
 * Only the PayPal HTTP boundary is stubbed. The route's own logic, and the
 * price it reads, are exercised for real.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import fc from "fast-check";

import { baselineFor } from "../support/baseline";

vi.mock("next/navigation", async () =>
  (await import("../support/appMocks")).nextNavigationMock(),
);
vi.mock("@clerk/nextjs", async () =>
  (await import("../support/appMocks")).clerkMock(),
);
vi.mock("posthog-js", async () =>
  (await import("../support/appMocks")).posthogMock(),
);
vi.mock("@paypal/react-paypal-js", async () =>
  (await import("../support/appMocks")).paypalMock(),
);

import { appState, resetAppState } from "../support/appMocks";
import { PRICING } from "../../src/config/pricing";
import PricingPage from "../../src/app/pricing/page";
import { BillingModal } from "../../src/components/BillingModal";

const MONEY_RE = /\$\s?\d[\d,]*(?:\.\d{2})?/g;

const AUTH_STATES = [
  { signedIn: false, pro: false },
  { signedIn: true, pro: false },
  { signedIn: true, pro: true },
] as const;

function renderedMoneyTokens(node: React.ReactElement): string[] {
  let root!: HTMLElement;
  // act() flushes mount effects before the text is read, so the tokens come
  // from the settled render.
  act(() => {
    root = render(node).container;
  });
  const text = root.textContent ?? "";
  return Array.from(text.matchAll(MONEY_RE)).map((m) => m[0].replace(/\s/g, ""));
}

beforeEach(() => {
  resetAppState();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Property 2: rendered prices come from src/config/pricing.ts", () => {
  it("shows only the configured price, or free, across auth states", () => {
    fc.assert(
      fc.property(fc.constantFrom(...AUTH_STATES), (auth) => {
        try {
          appState.pathname = "/pricing";
          appState.signedIn = auth.signedIn;
          appState.pro = auth.pro;

          const tokens = renderedMoneyTokens(<PricingPage />);
          expect(tokens.length).toBeGreaterThan(0);
          for (const token of tokens) {
            expect(
              [PRICING.displayPrice, "$0"],
              `unexpected price token ${token}`,
            ).toContain(token);
          }
          expect(tokens).toContain(PRICING.displayPrice);
        } finally {
          cleanup();
        }
      }),
      { numRuns: 12 },
    );
  });

  it("shows only the configured price in the billing modal", () => {
    appState.pathname = "/pricing";
    const tokens = renderedMoneyTokens(
      <BillingModal isOpen onClose={() => {}} />,
    );
    for (const token of tokens) {
      expect([PRICING.displayPrice, "$0"], token).toContain(token);
    }
  });

  it("keeps the configured amount and currency", () => {
    const snapshot = {
      amount: PRICING.amount,
      currency: PRICING.currency,
      displayPrice: PRICING.displayPrice,
      description: PRICING.description,
      minCaptureAmount: PRICING.minCaptureAmount,
    };
    expect(snapshot).toEqual(baselineFor("pricing", "PRICING", snapshot));
    expect(snapshot.amount).toBe("24.99");
    expect(snapshot.currency).toBe("USD");
  });
});

describe("Property 2: the PayPal create-order payload is unchanged", () => {
  it("creates the order at the configured amount and currency", async () => {
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = "test-client-id";
    process.env.PAYPAL_CLIENT_SECRET = "test-client-secret";

    const requests: { url: string; body: unknown }[] = [];
    vi.stubGlobal(
      "fetch",
      async (input: string | URL, init?: RequestInit) => {
        const url = String(input);
        requests.push({
          url,
          body: init?.body ? String(init.body) : undefined,
        });
        if (url.endsWith("/v1/oauth2/token")) {
          return new Response(JSON.stringify({ access_token: "test-token" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ id: "ORDER-1" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    );

    const { POST } = await import(
      "../../src/app/api/paypal/create-order/route"
    );
    const res = await POST();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      success: true,
      orderId: "ORDER-1",
    });

    const orderRequest = requests.find((r) =>
      r.url.endsWith("/v2/checkout/orders"),
    );
    expect(orderRequest).toBeDefined();
    const payload = JSON.parse(String(orderRequest!.body));
    expect(payload).toEqual(baselineFor("pricing", "createOrderPayload", payload));
    expect(payload.purchase_units[0].amount).toEqual({
      currency_code: "USD",
      value: "24.99",
    });
  });
});
