/**
 * Shared module stand-ins for rendering real ScrubAI pages under jsdom.
 *
 * Only third-party SDKs that need a live browser, network, or vendor script
 * are replaced (Clerk session UI, PostHog transport, the PayPal script tag).
 * Every ScrubAI module under `src/` is exercised for real, which is the point:
 * the preservation baselines have to come from app code, not from fakes.
 */
import React from "react";

/** Mutable ambient state the mocks read, so tests can drive the matrix. */
export const appState: {
  signedIn: boolean;
  pro: boolean;
  pathname: string;
} = {
  signedIn: false,
  pro: false,
  pathname: "/",
};

export function resetAppState() {
  appState.signedIn = false;
  appState.pro = false;
  appState.pathname = "/";
}

export function nextNavigationMock() {
  return {
    usePathname: () => appState.pathname,
    useRouter: () => ({
      push: () => {},
      replace: () => {},
      refresh: () => {},
      back: () => {},
      prefetch: () => {},
    }),
    useSearchParams: () => new URLSearchParams(),
    redirect: () => {},
    notFound: () => {},
  };
}

export function clerkMock() {
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return {
    useAuth: () => ({
      isSignedIn: appState.signedIn,
      userId: appState.signedIn ? "user_test" : null,
      isLoaded: true,
      signOut: async () => {},
    }),
    useUser: () => ({
      isSignedIn: appState.signedIn,
      isLoaded: true,
      user: appState.signedIn
        ? {
            id: "user_test",
            firstName: "Test",
            primaryEmailAddress: { emailAddress: "test@example.com" },
            publicMetadata: appState.pro ? { plan: "pro" } : {},
            reload: async () => {},
          }
        : null,
    }),
    useClerk: () => ({ openUserProfile: () => {}, signOut: async () => {} }),
    SignInButton: passthrough,
    SignUpButton: passthrough,
    SignOutButton: passthrough,
    SignedIn: passthrough,
    SignedOut: passthrough,
    UserButton: () =>
      React.createElement("div", { "data-testid": "user-button" }, "Account"),
    ClerkProvider: passthrough,
  };
}

export function posthogMock() {
  const captured: { event: string; props?: Record<string, unknown> }[] = [];
  const api = {
    __captured: captured,
    init: () => {},
    capture: (event: string, props?: Record<string, unknown>) => {
      captured.push({ event, props });
    },
    identify: () => {},
    reset: () => {},
    register: () => {},
    people: { set: () => {} },
    __loaded: true,
  };
  return { default: api, ...api };
}

export function paypalMock() {
  return {
    PayPalScriptProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    PayPalButtons: () =>
      React.createElement(
        "div",
        { "data-testid": "paypal-buttons" },
        "PayPal Checkout",
      ),
    usePayPalScriptReducer: () => [{ isPending: false, isResolved: true }, () => {}],
  };
}
