/**
 * Harness for driving a production build of the app over HTTP.
 *
 * jsdom cannot run middleware or observe HTTP status codes, so the routing and
 * 404 checks in this spec run against `next build` plus `next start`. Never
 * `next dev`: the dev server blocks and does not exercise the production
 * middleware path.
 *
 * Set `SCRUBAI_INTEGRATION_SKIP_BUILD=1` to reuse an existing `.next` build
 * while iterating locally.
 *
 * The build and the server are spawned with `NODE_ENV=production`, not the
 * `test` value Vitest sets. Next skips `.env.local` when `NODE_ENV` is `test`,
 * which leaves Clerk without a publishable key and turns every page into a 500.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../../..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const useShell = process.platform === "win32";
const productionEnv: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: "production",
};

export type BuiltApp = {
  origin: string;
  /** Issues a request that does NOT follow redirects, so 3xx stays observable. */
  request: (pathname: string, init?: RequestInit) => Promise<Response>;
  stop: () => Promise<void>;
};

function runToCompletion(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, args, {
      cwd: repositoryRoot,
      env: productionEnv,
      stdio: "inherit",
      shell: useShell,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(`npm ${args.join(" ")} exited with ${signal ?? code ?? "unknown status"}`),
      );
    });
  });
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForReady(origin: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(origin, { redirect: "manual" });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`app at ${origin} did not become ready within ${timeoutMs}ms`);
}

export async function startBuiltApp(): Promise<BuiltApp> {
  if (process.env.SCRUBAI_INTEGRATION_SKIP_BUILD !== "1") {
    await runToCompletion(["run", "build"]);
  }

  const port = await findFreePort();
  // `next start` fronts the app with a proxy that forwards to
  // `localhost:<port>`, so the server has to listen on the same name the proxy
  // dials. Binding 127.0.0.1 makes the proxy hit ::1, and every forwarded
  // request comes back as a 500.
  const origin = `http://localhost:${port}`;
  const server = spawn(
    npmCommand,
    ["run", "start", "--", "--hostname", "localhost", "--port", String(port)],
    { cwd: repositoryRoot, env: productionEnv, stdio: "inherit", shell: useShell },
  );

  await waitForReady(origin);

  return {
    origin,
    request: (pathname, init) =>
      fetch(new URL(pathname, origin), { redirect: "manual", ...init }),
    stop: () =>
      new Promise<void>((resolve) => {
        if (server.exitCode !== null || server.killed) {
          resolve();
          return;
        }
        server.once("exit", () => resolve());
        server.kill();
      }),
  };
}
