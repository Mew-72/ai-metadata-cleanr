import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const usesWindowsCommandShim = process.platform === "win32";
const port = process.env.PERFORMANCE_PORT ?? "3000";

function spawnNpm(argumentsList, options = {}) {
  return spawn(npmCommand, argumentsList, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
    shell: usesWindowsCommandShim,
    ...options,
  });
}

function runToCompletion(argumentsList) {
  return new Promise((resolve, reject) => {
    const child = spawnNpm(argumentsList);

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `npm ${argumentsList.join(" ")} exited with ${signal ?? code ?? "unknown status"}`,
        ),
      );
    });
  });
}

if (process.env.PERFORMANCE_SKIP_BUILD !== "1") {
  await runToCompletion(["run", "build"]);
}

const server = spawnNpm([
  "run",
  "start",
  "--",
  "--hostname",
  "127.0.0.1",
  "--port",
  port,
]);

const stopServer = () => {
  if (!server.killed) {
    server.kill();
  }
};

process.once("SIGINT", stopServer);
process.once("SIGTERM", stopServer);
process.once("exit", stopServer);

server.once("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
