/**
 * Unit test for task 3.9: translation-volatile nodes in `Header.tsx` are
 * opted out of browser page translation, so reconciliation after a
 * translation-style DOM mutation does not throw.
 *
 * **Validates: Requirements 1.1, 1.4, 2.1, 2.4**
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import {
  simulateBrowserTranslation,
  resetTranslationMarkers,
} from "../support/simulateTranslation";

vi.mock("next/navigation", async () =>
  (await import("../support/appMocks")).nextNavigationMock(),
);
vi.mock("@clerk/nextjs", async () =>
  (await import("../support/appMocks")).clerkMock(),
);

import { appState, resetAppState } from "../support/appMocks";
import { Header } from "../../src/components/Header";

beforeEach(() => {
  resetAppState();
  window.localStorage?.clear();
  resetTranslationMarkers(document);
});

afterEach(() => {
  cleanup();
  resetTranslationMarkers(document);
});

function marked(el: Element | null | undefined) {
  return Boolean(
    el &&
      el.getAttribute("translate") === "no" &&
      el.classList.contains("notranslate"),
  );
}

describe("Header translation marking", () => {
  it("marks the theme toggle and the auth action region", () => {
    const { container } = render(<Header />);

    const themeToggle = container.querySelector('[aria-label="Toggle theme"]');
    expect(marked(themeToggle)).toBe(true);
    // The swapping title lives on the marked node.
    expect(themeToggle?.getAttribute("title")).toBe("Switch to dark mode");

    const signIn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign in"),
    );
    expect(marked(signIn)).toBe(true);
  });

  it("marks the mobile drawer container", () => {
    const { container } = render(<Header />);
    fireEvent.click(container.querySelector('[aria-label="Toggle menu"]')!);

    const drawer = container.querySelector(
      'nav[aria-label="Mobile navigation"]',
    )?.parentElement;
    expect(marked(drawer)).toBe(true);
  });

  it("leaves static nav labels translatable", () => {
    const { container } = render(<Header />);
    const nav = container.querySelector('nav[aria-label="Main navigation"]')!;
    const mutated = simulateBrowserTranslation(nav);
    expect(mutated).toBeGreaterThan(0);
  });

  it("survives theme toggle and auth flip after a translation mutation", () => {
    const { container, rerender } = render(<Header />);

    const mutated = simulateBrowserTranslation(
      container.querySelector("header")!,
    );
    expect(mutated).toBeGreaterThan(0);

    expect(() => {
      fireEvent.click(container.querySelector('[aria-label="Toggle theme"]')!);
      appState.signedIn = true;
      rerender(<Header />);
      fireEvent.click(container.querySelector('[aria-label="Toggle menu"]')!);
    }).not.toThrow();

    expect(container.textContent).toContain("ScrubAI");
    expect(
      container.querySelector('[aria-label="Toggle theme"]'),
    ).not.toBeNull();
    expect(container.querySelector('[aria-label="Toggle menu"]')).not.toBeNull();
  });
});
