/**
 * Unit test for task 3.10: the translation-volatile stat readouts in
 * `CleanerInterface.tsx` are opted out of browser page translation, so the
 * pipeline state updates that follow a translation-style DOM mutation do not
 * throw during reconciliation.
 *
 * **Validates: Requirements 1.1, 1.4, 2.1, 2.4**
 *
 * No image bytes are exercised here. jsdom has no canvas encoder and no image
 * decoder, so the queue is driven only as far as the state transitions that
 * update the marked readouts (audit queued, quality changed, cleaning
 * started). That is exactly the surface this task changed.
 */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

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
vi.mock("posthog-js", async () =>
  (await import("../support/appMocks")).posthogMock(),
);
vi.mock("@paypal/react-paypal-js", async () =>
  (await import("../support/appMocks")).paypalMock(),
);

import { resetAppState } from "../support/appMocks";
import { CleanerInterface } from "../../src/components/CleanerInterface";

// jsdom omits the object URL API the audit path uses to size an image.
// Stubbing the omission is not faking app behaviour: the returned URL still
// resolves to nothing, so the decode never completes, same as jsdom's
// resource loading.
const objectUrls: string[] = [];
if (typeof URL.createObjectURL !== "function") {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: (obj: Blob) => {
      const url = `blob:test/${objectUrls.length}`;
      objectUrls.push(url);
      void obj;
      return url;
    },
  });
}
if (typeof URL.revokeObjectURL !== "function") {
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: () => {},
  });
}

function marked(el: Element | null | undefined) {
  return Boolean(
    el &&
      el.getAttribute("translate") === "no" &&
      el.classList.contains("notranslate"),
  );
}

function fakeImage() {
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], "vacation.jpg", {
    type: "image/jpeg",
  });
}

async function renderWithQueuedFile() {
  const view = render(<CleanerInterface />);
  const input = view.container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;

  await act(async () => {
    fireEvent.change(input, { target: { files: [fakeImage()] } });
  });

  return view;
}

beforeEach(() => {
  resetAppState();
  window.localStorage?.clear();
  resetTranslationMarkers(document);
});

afterEach(() => {
  cleanup();
  resetTranslationMarkers(document);
  document.body.style.overflow = "";
});

describe("CleanerInterface translation marking", () => {
  it("marks the daily clean counter readout", () => {
    const { container } = render(<CleanerInterface />);
    const counter = Array.from(container.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("cleans today"),
    );
    expect(marked(counter)).toBe(true);
  });

  it("marks the queue readouts and the status pill", async () => {
    const { container } = await renderWithQueuedFile();

    const name = Array.from(container.querySelectorAll("span")).find(
      (s) => s.textContent === "vacation.jpg",
    );
    expect(marked(name)).toBe(true);

    const sizeValue = Array.from(container.querySelectorAll("span")).find((s) =>
      /KB$/.test(s.textContent ?? ""),
    );
    expect(marked(sizeValue)).toBe(true);

    const statusPill = Array.from(container.querySelectorAll("span")).find((s) =>
      ["Pending", "Ready", "Cleaning…", "Cleaned"].includes(
        s.textContent?.trim() ?? "",
      ),
    );
    expect(marked(statusPill)).toBe(true);

    const qualityReadout = Array.from(container.querySelectorAll("span")).find(
      (s) => s.textContent?.trim() === "95%",
    );
    expect(marked(qualityReadout)).toBe(true);

    const cleanButton = screen.getByRole("button", { name: /Clean 1 image/ });
    expect(marked(cleanButton)).toBe(true);
  });

  it("leaves static instructional copy translatable", async () => {
    const { container } = await renderWithQueuedFile();

    const hint = Array.from(container.querySelectorAll("div")).find(
      (d) =>
        d.textContent ===
        "Files are auto-renamed to neutral names regardless.",
    )!;
    expect(hint.getAttribute("translate")).toBeNull();
    expect(simulateBrowserTranslation(hint)).toBeGreaterThan(0);

    const sizeLabel = Array.from(container.querySelectorAll("span")).find(
      (s) => s.textContent === "Size",
    )!;
    expect(sizeLabel.getAttribute("translate")).toBeNull();
  });

  it("survives pipeline updates after a translation mutation", async () => {
    const { container } = await renderWithQueuedFile();

    const mutated = simulateBrowserTranslation(container);
    expect(mutated).toBeGreaterThan(0);

    const slider = container.querySelector("#export-quality") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(slider, { target: { value: "0.5" } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Clean 1 image/ }));
    });

    // Still an app-rendered, interactive workspace.
    expect(container.textContent).toContain("Workspace");
    expect(container.querySelector("#export-quality")).not.toBeNull();

    // The marked readouts reconciled to their new values.
    const readouts = Array.from(container.querySelectorAll(".notranslate")).map(
      (el) => el.textContent?.trim(),
    );
    expect(readouts).toContain("50%");
    expect(readouts).toContain("Cleaning…");
  });
});
