<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into ScrubAI. Initialization was migrated from the old `PostHogProvider` pattern to `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), the reverse proxy rewrites were updated in `next.config.ts`, and user identification is now handled automatically via Clerk session state. Eight events are now tracked across the core conversion funnel — from image upload through upgrade modal, checkout initiation, and batch download — plus existing events were preserved.

| Event | Description | File |
|---|---|---|
| `image_uploaded` | User uploads one or more images to the cleaner workspace | `src/components/CleanerInterface.tsx` |
| `image_scrubbed` | An image's metadata is fully stripped via canvas pixel-redraw *(pre-existing)* | `src/components/CleanerInterface.tsx` |
| `batch_download_initiated` | User downloads a ZIP archive of multiple cleaned images | `src/components/CleanerInterface.tsx` |
| `upgrade_modal_opened` | Billing upgrade modal triggered for a free-tier user (trigger: `batch_upload_limit`, `zip_download_gate`, `guest_limit_reached`) | `src/components/CleanerInterface.tsx` |
| `upgrade_clicked` | User clicks Upgrade to Pro or Buy Lifetime inside the billing modal | `src/components/BillingModal.tsx` |
| `pricing_viewed` | User views the pricing page — top of subscription conversion funnel | `src/app/pricing/page.tsx` |
| `checkout_started` | User clicks a checkout button for a Pro or Lifetime plan | `src/app/pricing/page.tsx` |
| `viewed_dashboard` | Authenticated user views their personal dashboard *(pre-existing)* | `src/app/dashboard/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1623139)
- [Images uploaded over time](/insights/eQs5VBDM)
- [Images scrubbed over time](/insights/fxYcAFZg)
- [Pricing page views](/insights/7cQVfPrZ)
- [Upgrade conversion funnel](/insights/Pc7GFV51)
- [Batch ZIP downloads over time](/insights/9AqiAbBI)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
