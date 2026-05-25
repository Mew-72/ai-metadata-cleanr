import { NextResponse } from "next/server";

// Use explicit PAYPAL_MODE env var for consistency with client-side SDK
// Falls back to NODE_ENV detection if not set
const PAYPAL_MODE =
  process.env.NEXT_PUBLIC_PAYPAL_MODE ||
  (process.env.NODE_ENV === "production" ? "live" : "sandbox");

const PAYPAL_BASE =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Acquire a PayPal OAuth2 access token using client credentials.
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[PayPal] Auth failed (mode: ${PAYPAL_MODE}):`, errText);
    throw new Error(`PayPal auth failed: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * POST /api/paypal/create-order
 *
 * Securely creates a PayPal order from the server side.
 */
export async function POST() {
  try {
    // 1. Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // 2. Call PayPal API to create order
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "24.99",
            },
            description: "ScrubAI Lifetime Pro Membership",
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `[PayPal] Create order failed (mode: ${PAYPAL_MODE}):`,
        errText,
      );
      return NextResponse.json(
        {
          success: false,
          error: `PayPal order creation failed: ${res.status}`,
        },
        { status: res.status },
      );
    }

    const order = await res.json();
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("[PayPal] Create order error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
