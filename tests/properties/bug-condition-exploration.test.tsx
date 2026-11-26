/**
 * Property 1: Bug Condition - Non-English visitors always get a usable,
 * app-rendered document.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
 *
 * This is the bug condition exploration test. It encodes the EXPECTED
 * behaviour, so it is expected to FAIL on unfixed code. The failures are the
 * counterexamples that confirm hypotheses 1, 2 and 3 in the design.
 *
 * Assertions mirror the Fix Checking pseudocode:
 *   ASSERT NOT is_empty_document(result)
 *   ASSERT rendered_by_app(result)
 *   ASSERT has_recovery_affordance(result)
 *
 * The bug is deterministic per entry path, so each property is scoped to the
 * concrete failing cases rather than an open input space.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import fc from "fast-check";

import {
  simulateBrowserTranslation,
  resetTranslationMarkers,
} from "../support/simulateTranslation";
import { AppShell, loadRouteErrorBoundary } from "../support/appShell";

const authState = vi.hoisted(() => ({ signedIn: false }));
const routeState = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => routeState.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@clerk/nextjs", async () => {
  const react = await import("react");
  return {
    useAuth: () => ({
      isSignedIn: authState.signedIn,
      userId: authState.signedIn ? "user_test" : null,
      isLoaded: true,
    }),
    useUser: () => ({
      isSignedIn: authState.signedIn,
      user: authState.signedIn
        ? { publicMetadata: {}, reload: async () => {} }
        : null,
      isLoaded: true,
    }),
    SignInButton: ({ children }: { children: React.ReactNode }) => children,
    UserButton: () =>
      react.createElement("div", { "data-testid": "user-button" }, "Account"),
  };
});

import { Header } from "../../src/components/Header";

const ROUTES = ["/", "/pricing"] as const;
type MutationTarget =
  | "theme toggle label"
  | "auth action region"
  | "mobile drawer subtree";
const MUTATION_TARGETS: MutationTarget[] = [
  "theme toggle label",
  "auth action region",
  "mobile drawer subtree",
];

// ---------------------------------------------------------------------------
// Fix Checking predicates
// ---------------------------------------------------------------------------

function isEmptyDocument(container: HTMLElement): boolean {
  return container.innerHTML.trim().length === 0;
}

function renderedByApp(container: HTMLElement): boolean {
  return container.textContent?.includes("ScrubAI") ?? false;
}

function hasRecoveryAffordance(container: HTMLElement): boolean {
  // Either the page still works (its controls are present and usable) or an
  // in-app recovery UI is shown.
  const workingControls = container.querySelector('[aria-label="Toggle theme"]');
  const recoveryUi = container.querySelector('[data-recovery="true"]');
  return Boolean(workingControls || recoveryUi);
}

beforeEach(() => {
  authState.signedIn = false;
  routeState.pathname = "/";
  window.localStorage?.clear();
  resetTranslationMarkers(document);
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Case A: translation-style DOM mutation, then forced reconciliation
// ---------------------------------------------------------------------------

function resolveMutationRoot(
  container: HTMLElement,
  target: MutationTarget,
): Element {
  if (target === "theme toggle label") {
    const btn = container.querySelector('[aria-label="Toggle theme"]');
    if (!btn) throw new Error("theme toggle not found");
    return btn.parentElement as Element;
  }
  if (target === "auth action region") {
    const signIn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign in"),
    );
    if (!signIn) throw new Error("sign in control not found");
    return signIn.parentElement as Element;
  }
  // The drawer is not mounted yet, so a real engine has translated the whole
  // header by the time the visitor opens it.
  const header = container.querySelector("header");
  if (!header) throw new Error("header not found");
  return header;
}

describe.each(MUTATION_TARGETS)(
  "Case A: browser translation mutates React-owned DOM (%s)",
  (target) => {
  it("survives reconciliation after translation-style mutation", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ROUTES),
        (route) => {
          authState.signedIn = false;
          routeState.pathname = route;

          const { container, rerender } = render(<Header />);
          try {
            const mutated = simulateBrowserTranslation(
              resolveMutationRoot(container, target),
            );
            expect(mutated).toBeGreaterThan(0);

            // Force reconciliation of the mutated subtrees, the three ways the
            // app does it in production.
            fireEvent.click(
              container.querySelector('[aria-label="Toggle theme"]')!,
            );

            authState.signedIn = true;
            rerender(<Header />);

            fireEvent.click(
              container.querySelector('[aria-label="Toggle menu"]')!,
            );

            expect(isEmptyDocument(container)).toBe(false);
            expect(renderedByApp(container)).toBe(true);
            expect(hasRecoveryAffordance(container)).toBe(true);
          } finally {
            cleanup();
            resetTranslationMarkers(document);
          }
        },
      ),
      { numRuns: 6 },
    );
  });
  },
);

// ---------------------------------------------------------------------------
// Case B: an uncaught client throw must not leave an empty document
// ---------------------------------------------------------------------------

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("heic2any decode failed for the current file");
  }
  return <p>ScrubAI workspace</p>;
}

describe("Case B: uncaught client throw", () => {
  it("keeps app-rendered content in the document", async () => {
    const Fallback = await loadRouteErrorBoundary();

    const { container, rerender } = render(
      <AppShell Fallback={Fallback}>
        <p>ScrubAI</p>
        <Thrower shouldThrow={false} />
      </AppShell>,
    );

    let thrown: unknown = null;
    try {
      rerender(
        <AppShell Fallback={Fallback}>
          <p>ScrubAI</p>
          <Thrower shouldThrow />
        </AppShell>,
      );
    } catch (err) {
      thrown = err;
    }

    const detail = `uncaught client throw: ${
      (thrown as Error)?.message ?? "no error surfaced to the test"
    }`;

    // NOT is_empty_document
    expect(isEmptyDocument(container), detail).toBe(false);
    // rendered_by_app: some app-owned element is still in the document
    expect(container.querySelector("*"), detail).not.toBeNull();
    // has_recovery_affordance: a retry control or a link home
    expect(container.querySelector("button, a"), detail).not.toBeNull();
  });
});
