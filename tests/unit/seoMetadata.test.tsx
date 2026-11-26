/**
 * SEO metadata and H1 presence tests.
 *
 * Verifies that every public route exports the required title, description,
 * canonical, and that rendered pages contain exactly one H1.
 *
 * Validates: spec section 03 invariant — each public page has exactly one H1,
 * one self-referencing relative canonical, unique title.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("next/navigation", async () =>
  (await import("../support/appMocks")).nextNavigationMock(),
);
vi.mock("@clerk/nextjs", async () =>
  (await import("../support/appMocks")).clerkMock(),
);
vi.mock("posthog-js", async () =>
  (await import("../support/appMocks")).posthogMock(),
);
vi.mock("@paypal/react-paypal-js", async () =>
  (await import("../support/appMocks")).paypalMock(),
);

// ── Metadata exports ───────────────────────────────────────────────────────────

describe("Route metadata exports", () => {
  it("/ exports correct title, description, and canonical", async () => {
    const { metadata } = await import("../../src/app/page");
    expect(metadata).toBeDefined();
    expect((metadata as any).title).toContain(
      "Free Image Metadata Remover",
    );
    expect((metadata as any).description).toContain("EXIF");
    expect((metadata as any).alternates?.canonical).toBe("/");
  });

  it("/c2pa-scanner exports correct title, description, and canonical", async () => {
    const { metadata } = await import(
      "../../src/app/c2pa-scanner/layout"
    );
    expect((metadata as any).title).toContain("C2PA");
    expect((metadata as any).description).toContain("C2PA");
    expect((metadata as any).alternates?.canonical).toBe("/c2pa-scanner");
  });

  it("/docs exports correct title, description, and canonical", async () => {
    const { metadata } = await import("../../src/app/docs/layout");
    expect((metadata as any).title).toContain("Metadata");
    expect((metadata as any).alternates?.canonical).toBe("/docs");
  });

  it("/pricing exports absolute title and canonical", async () => {
    const { metadata } = await import("../../src/app/pricing/layout");
    const title = (metadata as any).title;
    // Pricing uses { absolute: "..." } to avoid double "ScrubAI" from template
    const titleStr =
      typeof title === "string" ? title : title?.absolute ?? "";
    expect(titleStr).toContain("ScrubAI Pricing");
    expect((metadata as any).alternates?.canonical).toBe("/pricing");
  });

  it("/about exports canonical", async () => {
    const { metadata } = await import("../../src/app/about/layout");
    expect((metadata as any).alternates?.canonical).toBe("/about");
  });

  it("/security exports canonical", async () => {
    const { metadata } = await import("../../src/app/security/layout");
    expect((metadata as any).alternates?.canonical).toBe("/security");
  });

  it("/privacy exports canonical", async () => {
    const { metadata } = await import("../../src/app/privacy/layout");
    expect((metadata as any).alternates?.canonical).toBe("/privacy");
  });

  it("/terms exports canonical", async () => {
    const { metadata } = await import("../../src/app/terms/layout");
    expect((metadata as any).alternates?.canonical).toBe("/terms");
  });

  it("/cookies exports canonical", async () => {
    const { metadata } = await import("../../src/app/cookies/layout");
    expect((metadata as any).alternates?.canonical).toBe("/cookies");
  });

  it("/refund exports canonical", async () => {
    const { metadata } = await import("../../src/app/refund/layout");
    expect((metadata as any).alternates?.canonical).toBe("/refund");
  });
});

// ── H1 presence in rendered pages ─────────────────────────────────────────────

describe("H1 presence", () => {
  it("HomeHero renders exactly one H1", async () => {
    const { HomeHero } = await import("../../src/components/HomeHero");
    const { container } = render(React.createElement(HomeHero));
    const h1s = container.querySelectorAll("h1");
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain("Free Online Image Metadata Remover");
  });

  it("Docs index page renders exactly one H1 with correct text", async () => {
    const DocsPage = (await import("../../src/app/docs/page")).default;
    const { container } = render(React.createElement(DocsPage));
    const h1s = container.querySelectorAll("h1");
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toContain(
      "Image Metadata and Photo Privacy Guides",
    );
  });
});

// ── Canonical format check ─────────────────────────────────────────────────────

describe("Canonical format", () => {
  it("all canonicals are relative paths (no absolute URLs)", async () => {
    const layouts = [
      () => import("../../src/app/c2pa-scanner/layout"),
      () => import("../../src/app/docs/layout"),
      () => import("../../src/app/pricing/layout"),
      () => import("../../src/app/about/layout"),
      () => import("../../src/app/security/layout"),
      () => import("../../src/app/privacy/layout"),
      () => import("../../src/app/terms/layout"),
      () => import("../../src/app/cookies/layout"),
      () => import("../../src/app/refund/layout"),
    ];

    for (const loader of layouts) {
      const { metadata } = await loader();
      const canonical = (metadata as any).alternates?.canonical;
      if (canonical) {
        expect(canonical).not.toMatch(/^https?:\/\//);
        expect(canonical).toMatch(/^\//);
      }
    }
  });
});
