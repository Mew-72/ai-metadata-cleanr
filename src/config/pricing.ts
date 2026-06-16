/**
 * Central pricing configuration for ScrubAI.
 *
 * Change the price here and it updates everywhere:
 * - PayPal order creation
 * - Server-side payment verification
 * - UI display (pricing page, billing modal, FAQ)
 */

export const PRICING = {
  /** The amount charged for Lifetime Pro (in USD). */
  amount: "24.99",

  /** Currency code for PayPal orders. */
  currency: "USD",

  /** Human-readable price string for UI display. */
  get displayPrice() {
    return `$${this.amount}`;
  },

  /** Plan description shown in PayPal checkout. */
  description: "ScrubAI Lifetime Pro Membership",

  /** Minimum acceptable captured amount (guards against tampering). */
  get minCaptureAmount() {
    return parseFloat(this.amount);
  },
} as const;

/* ─── Tier limits ─────────────────────────────────────────────────────── */

export type TierName = "guest_free" | "user_free" | "pro";

export interface TierLimits {
  /** Maximum cleans per calendar day. 0 means unlimited (pro). */
  dailyCleanLimit: number;
  /** Maximum images per single batch operation. */
  maxBatchSize: number;
  /** Maximum upload size in megabytes. */
  maxUploadMB: number;
}

export const TIER_LIMITS: Record<TierName, TierLimits> = {
  guest_free: { dailyCleanLimit: 5, maxBatchSize: 1, maxUploadMB: 25 },
  user_free: { dailyCleanLimit: 10, maxBatchSize: 1, maxUploadMB: 25 },
  pro: { dailyCleanLimit: 0, maxBatchSize: 50, maxUploadMB: 100 },
};
