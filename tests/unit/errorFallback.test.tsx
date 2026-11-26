/**
 * Unit tests for the shared recovery UI.
 *
 * Covers the has_recovery_affordance half of the Fix Checking pseudocode:
 * the fallback always offers a way out, and the retry control appears only
 * when the caller can actually retry.
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorFallback } from "@/components/ErrorFallback";

describe("ErrorFallback", () => {
  it("renders the title and description it is given", () => {
    render(
      <ErrorFallback
        title="Something went wrong"
        description="This page stopped rendering."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByText("This page stopped rendering.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to home/i }),
    ).toHaveAttribute("href", "/");
  });

  it("omits the retry control when no onRetry is supplied", () => {
    render(<ErrorFallback title="Page not found" description="No such page." />);

    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("renders the retry control and invokes onRetry on click", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorFallback
        title="Something went wrong"
        description="This page stopped rendering."
        onRetry={onRetry}
      />,
    );

    const retry = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retry);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
