import "@testing-library/jest-dom/vitest";

/**
 * Harness notes for anyone writing tests against this setup:
 *
 * - Read markup or text only after the surrounding `act()` scope has closed.
 *   Reading mid-scope observes a tree React has not finished committing.
 * - Nothing here fakes app behavior. Only browser APIs jsdom omits and
 *   same-origin asset requests jsdom cannot serve are stubbed.
 */

// jsdom under this Node build does not always expose localStorage or
// matchMedia, both of which Header.tsx uses on mount.
if (typeof window !== "undefined") {
  if (!window.localStorage) {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
        setItem: (k: string, v: string) => void store.set(k, String(v)),
        removeItem: (k: string) => void store.delete(k),
        clear: () => store.clear(),
        key: (i: number) => Array.from(store.keys())[i] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
}

// jsdom has no server behind its document origin, so any same-origin asset
// request (the C2PA wasm binary is the one that shows up today) fails at the
// socket and floods stderr with noise unrelated to the assertion under test.
// Answer those with a plain 404 instead: callers see a normal HTTP failure they
// already handle, and cross-origin requests still go nowhere by design.
if (typeof globalThis.fetch === "function") {
  const realFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const isSameOrigin =
      raw.startsWith("/") ||
      (typeof window !== "undefined" && raw.startsWith(window.location.origin));

    if (isSameOrigin) {
      return Promise.resolve(
        new Response(null, { status: 404, statusText: "Not Found (test harness)" }),
      );
    }

    return realFetch(input as RequestInfo, init);
  }) as typeof globalThis.fetch;
}
