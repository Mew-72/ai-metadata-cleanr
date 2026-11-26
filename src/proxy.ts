import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes - accessible to everyone (signed in or not)
// Known non-public routes are protected by default (inverted security model)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/security(.*)",
  "/cookies(.*)",
  "/refund(.*)",
  "/c2pa-scanner(.*)",
  "/about(.*)",
  "/docs(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/ingest(.*)",
  "/api/paypal/create-order",
]);

// Every path the app actually serves, public and protected alike. A path that
// matches nothing here does not exist, so it must fall through to the app's
// 404 instead of being swept into auth.protect() and redirected to sign-in.
// That sweep is what sent visitors on locale-prefixed URLs (/pt-br/,
// /pt/pricing, /es/docs) to the sign-in page instead of the 404.
//
// Deliberately no locale regex: unknown locale-prefixed paths are just a
// special case of unknown paths, and a language-tag pattern here would shadow
// any future two-letter route.
export const isKnownRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/security(.*)",
  "/cookies(.*)",
  "/refund(.*)",
  "/c2pa-scanner(.*)",
  "/about(.*)",
  "/docs(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/ingest(.*)",
  "/dashboard(.*)",
  "/thank-you(.*)",
  "/api/paypal/create-order",
  "/api/paypal/capture-order",
  "/__clerk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Public route: allow through.
  if (isPublicRoute(req)) {
    return;
  }

  // Unknown route: let Next routing resolve it to not-found.tsx at status 404.
  // No auth.protect() here, so no sign-in redirect for a path that has no page.
  if (!isKnownRoute(req)) {
    return;
  }

  // Known but not public: require authentication, exactly as before.
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
