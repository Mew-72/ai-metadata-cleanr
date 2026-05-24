import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require authentication — users must be signed in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

// Public routes — accessible to everyone (signed in or not)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/security(.*)',
  '/cookies(.*)',
  '/c2pa-scanner(.*)',
  '/robots.txt',
  '/sitemap.xml',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect authenticated routes — redirects to sign-in if not logged in
  if (isProtectedRoute(req)) {
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
