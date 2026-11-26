/**
 * Test-side stand-in for the ScrubAI app shell.
 *
 * The real root layout cannot render under jsdom (next/font fetches, Clerk
 * needs keys), so this shell reproduces the only structural property that
 * matters for the bug: which error boundaries the app actually ships.
 *
 * It discovers `src/app/error.tsx` and `src/app/global-error.tsx` on disk. On
 * unfixed code neither exists, so a client throw escapes to the root and the
 * container is left empty, which is exactly the condition the browser reports
 * with its own localized failure screen.
 */
import fs from "node:fs";
import path from "node:path";
import React from "react";

const APP_DIR = path.resolve(__dirname, "../../src/app");

export interface BoundaryProps {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}

export function boundaryFilesPresent() {
  return {
    error: fs.existsSync(path.join(APP_DIR, "error.tsx")),
    globalError: fs.existsSync(path.join(APP_DIR, "global-error.tsx")),
    notFound: fs.existsSync(path.join(APP_DIR, "not-found.tsx")),
  };
}

export async function loadRouteErrorBoundary(): Promise<
  React.ComponentType<BoundaryProps> | null
> {
  if (!boundaryFilesPresent().error) return null;
  // Resolved at runtime so the test suite still loads while the file does not
  // exist yet, which is the unfixed state this test runs against first.
  const specifier = "/src/app/error.tsx";
  const mod = (await import(/* @vite-ignore */ specifier)) as {
    default?: React.ComponentType<BoundaryProps>;
  };
  return mod.default ?? null;
}

interface ShellState {
  error: (Error & { digest?: string }) | null;
}

/**
 * Mirrors the App Router boundary contract closely enough to test with: the
 * fallback receives `error` and a retry callback that re-renders children.
 */
export class AppShell extends React.Component<
  {
    children: React.ReactNode;
    Fallback: React.ComponentType<BoundaryProps> | null;
  },
  ShellState
> {
  state: ShellState = { error: null };

  static getDerivedStateFromError(error: Error & { digest?: string }): ShellState {
    return { error };
  }

  retry = () => this.setState({ error: null });

  render() {
    const { children, Fallback } = this.props;
    if (this.state.error) {
      // No boundary shipped by the app: rethrow so the tree unmounts to an
      // empty document, which is the unfixed behaviour under test.
      if (!Fallback) throw this.state.error;
      return (
        <Fallback
          error={this.state.error}
          unstable_retry={this.retry}
          reset={this.retry}
        />
      );
    }
    return <div data-app-shell="">{children}</div>;
  }
}
