/**
 * Unit tests for the app 404 (`src/app/not-found.tsx`).
 *
 * **Validates: Requirements 1.3, 2.3**
 *
 * A 404 is the third recovery affordance in the Fix Checking pseudocode, so it
 * has to be app-rendered, non-empty, and offer a way back. There is nothing to
 * retry on a missing page, so the retry control must stay absent.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import NotFound from "@/app/not-found";

describe("app not-found", () => {
  it("renders 404 copy with a link home", () => {
    render(<NotFound />);

    const heading = screen.getByRole("heading", { name: /404/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Page not found");
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders no retry control", () => {
    render(<NotFound />);

    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
