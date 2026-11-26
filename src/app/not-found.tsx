import { ErrorFallback } from "@/components/ErrorFallback";

/**
 * App 404.
 *
 * The root `not-found` file handles every unmatched URL for the whole app, so
 * this is what unknown locale-prefixed paths such as `/pt-br/` or `/es/docs`
 * land on now that `src/proxy.ts` lets unknown paths fall through instead of
 * routing them into `auth.protect()`.
 *
 * Server component on purpose: it renders no browser-only API, which keeps the
 * client and server split intact. `not-found` accepts no props and does not
 * support a `metadata` export, and Next already injects `noindex` for 404
 * responses, so the copy lives entirely in the rendered output.
 */
export default function NotFound() {
  return (
    <ErrorFallback
      title="404 - Page not found"
      description="This page does not exist. It may have moved, or the link that brought you here may include a language prefix the site does not use."
    />
  );
}
