import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { PRICING } from "../../../../config/pricing";

// Use explicit PAYPAL_MODE env var for consistency with client-side SDK
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
    throw new Error(`PayPal auth failed: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Capture a PayPal order server-side.
 * This is the recommended approach per PayPal docs when using server-side order creation.
 */
async function capturePayPalOrder(
  orderId: string,
  accessToken: string,
): Promise<{
  success: boolean;
  error?: string;
  capture?: Record<string, unknown>;
}> {
  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    },
  );

  if (!res.ok) {
    const errText = await res.text();

    // Handle INSTRUMENT_DECLINED (payer's funding source failed)
    if (res.status === 422) {
      try {
        const errData = JSON.parse(errText);
        if (errData.details?.[0]?.issue === "INSTRUMENT_DECLINED") {
          return {
            success: false,
            error:
              "Payment method was declined. Please try a different payment method.",
          };
        }
        if (errData.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
          // Order was already captured (likely a retry) - treat as success for idempotency
          console.log(
            `[PayPal] Order ${orderId} was already captured, verifying...`,
          );
          return await verifyExistingCapture(orderId, accessToken);
        }
      } catch {
        /* fall through */
      }
    }

    return {
      success: false,
      error: `PayPal capture failed: ${res.status} — ${errText}`,
    };
  }

  const order = await res.json();

  // Verify the captured amount
  const capturedAmount =
    order.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  const capturedValue = Number(capturedAmount?.value);
  if (
    !capturedAmount ||
    !Number.isFinite(capturedValue) ||
    capturedValue < PRICING.minCaptureAmount ||
    capturedAmount.currency_code !== PRICING.currency
  ) {
    return {
      success: false,
      error: `Invalid captured amount: ${capturedAmount?.currency_code} ${capturedAmount?.value}`,
    };
  }

  return { success: true, capture: order };
}

/**
 * Verify an already-captured order (for idempotent retries).
 */
async function verifyExistingCapture(
  orderId: string,
  accessToken: string,
): Promise<{
  success: boolean;
  error?: string;
  capture?: Record<string, unknown>;
}> {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return {
      success: false,
      error: `Failed to verify existing capture: ${res.status}`,
    };
  }

  const order = await res.json();
  if (order.status === "COMPLETED") {
    const capturedAmount =
      order.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
    const capturedValue = Number(capturedAmount?.value);
    if (
      capturedAmount &&
      Number.isFinite(capturedValue) &&
      capturedValue >= PRICING.minCaptureAmount &&
      capturedAmount.currency_code === PRICING.currency
    ) {
      return { success: true, capture: order };
    }
  }

  return {
    success: false,
    error: `Order status: ${order.status}, expected COMPLETED`,
  };
}

/**
 * POST /api/paypal/capture-order
 *
 * Body: { orderId: string, userId: string }
 *
 * 1. Captures the PayPal order server-side
 * 2. Verifies the payment amount
 * 3. Updates the Clerk user's publicMetadata to grant Pro status
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the caller is authenticated and get userId from session
    // — never trust a client-provided userId for privilege escalation
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 },
      );
    }

    // 1. Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // 2. Capture the order server-side
    const captureResult = await capturePayPalOrder(orderId, accessToken);

    if (!captureResult.success) {
      console.error(
        "[PayPal] Capture/verification failed:",
        captureResult.error,
      );
      return NextResponse.json(
        { success: false, error: captureResult.error },
        { status: 400 },
      );
    }

    // 3. Update Clerk user publicMetadata to mark as Pro
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: "pro",
      },
      privateMetadata: {
        paypalOrderId: orderId,
        paymentProvider: "paypal",
        upgradedAt: new Date().toISOString(),
      },
    });

    console.log(`[PayPal] User ${userId} upgraded to Pro (order: ${orderId})`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PayPal] Capture error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
