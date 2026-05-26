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
