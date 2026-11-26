/**
 * Property 2: Preservation - theme persistence is unchanged.
 *
 * **Validates: Requirements 3.6**
 *
 * The fix adds `translate="no"` and the legacy `notranslate` class to the theme
 * toggle, and wraps the conditionally rendered header subtrees. Attributes and
 * wrappers must not change what the toggle does: write `scrubai-theme` to
 * localStorage and set `data-theme` on `<html>`.
 *
 * Generated over the starting theme and the auth state, because the toggle
 * lives next to the auth action region that the fix rewraps.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import fc from "fast-check";

import { resetTranslationMarkers } from "../support/simulateTranslation";

vi.mock("next/navigation", async () =>
  (await import("../support/appMocks")).nextNavigationMock(),
);
vi.mock("@clerk/nextjs", async () =>
  (await import("../support/appMocks")).clerkMock(),
);

import { appState, resetAppState } from "../support/appMocks";
import { Header } from "../../src/components/Header";

const THEMES = ["light", "dark"] as const;

beforeEach(() => {
  resetAppState();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  resetTranslationMarkers(document);
});

afterEach(() => {
  cleanup();
});

describe("Property 2: theme toggling persists exactly as before", () => {
  it("writes scrubai-theme and data-theme on every toggle", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...THEMES),
        fc.boolean(),
        fc.integer({ min: 1, max: 4 }),
        (initial, signedIn, toggles) => {
          try {
            window.localStorage.setItem("scrubai-theme", initial);
            appState.signedIn = signedIn;

            let container!: HTMLElement;
            act(() => {
              container = render(<Header />).container;
            });

            // Mount applies the persisted theme to <html> without writing.
            expect(document.documentElement.getAttribute("data-theme")).toBe(
              initial,
            );

            let expected: string = initial;
            for (let i = 0; i < toggles; i++) {
              expected = expected === "light" ? "dark" : "light";
              act(() => {
                fireEvent.click(
                  container.querySelector('[aria-label="Toggle theme"]')!,
                );
              });
              expect(window.localStorage.getItem("scrubai-theme")).toBe(expected);
              expect(document.documentElement.getAttribute("data-theme")).toBe(
                expected,
              );
            }
          } finally {
            cleanup();
            window.localStorage.clear();
            document.documentElement.removeAttribute("data-theme");
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("keeps the toggle reachable by its accessible label", () => {
    let container!: HTMLElement;
    act(() => {
      container = render(<Header />).container;
    });
    expect(container.querySelector('[aria-label="Toggle theme"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Toggle menu"]')).not.toBeNull();
  });
});
