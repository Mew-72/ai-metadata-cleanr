import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes - accessible to everyone (signed in or not)
// All other routes are protected by default (inverted security model)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/security(.*)",
  "/cookies(.*)",
  "/c2pa-scanner(.*)",
  "/docs(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/ingest(.*)",
  "/api/paypal/create-order",
]);

export default clerkMiddleware(async (auth, req) => {
  // Default-protect: if a route is NOT explicitly public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
