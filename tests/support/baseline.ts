/**
 * Observation-first baselines for the preservation property (Property 2).
 *
 * Preservation is not "the output looks reasonable", it is "the output is the
 * same as before the fix". So these baselines are RECORDED against the
 * unfixed code and committed, then asserted against afterwards.
 *
 * Usage:
 *   expect(observed).toEqual(baselineFor("render", key, observed));
 *
 * On the first run the file does not exist, the observation is recorded and
 * the assertion is trivially true. Every later run compares against the
 * recorded value, so a behaviour change introduced by the fix fails the test.
 * Delete a baseline file only when the change is intentional and reviewed.
 */
import fs from "node:fs";
import path from "node:path";

const BASELINE_DIR = path.resolve(__dirname, "../baselines");

type Store = Record<string, unknown>;

const loaded = new Map<string, Store>();
const dirty = new Set<string>();

function filePath(name: string) {
  return path.join(BASELINE_DIR, `${name}.json`);
}

function load(name: string): Store {
  const cached = loaded.get(name);
  if (cached) return cached;

  let store: Store = {};
  const file = filePath(name);
  if (fs.existsSync(file)) {
    store = JSON.parse(fs.readFileSync(file, "utf8")) as Store;
  }
  loaded.set(name, store);
  return store;
}

function flush(name: string) {
  if (!dirty.has(name)) return;
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const store = load(name);
  const ordered = Object.fromEntries(
    Object.keys(store)
      .sort()
      .map((k) => [k, store[k]]),
  );
  fs.writeFileSync(filePath(name), `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
  dirty.delete(name);
}

/**
 * Returns the recorded baseline for `key`, recording `observed` if this is the
 * first time the key has been seen.
 */
export function baselineFor<T>(name: string, key: string, observed: T): T {
  const store = load(name);
  if (!(key in store)) {
    store[key] = observed;
    dirty.add(name);
    flush(name);
    return observed;
  }
  return store[key] as T;
}

/** True when the baseline file for `name` already existed on disk. */
export function baselineExists(name: string): boolean {
  return fs.existsSync(filePath(name));
}

/**
 * Normalizes rendered markup so the baseline captures app-authored output and
 * not per-run noise: React auto-generated ids and any absolute date or time
 * stamp that moves with the clock.
 */
export function normalizeMarkup(html: string): string {
  return html
    .replace(/:r[0-9a-z]+:/g, ":rID:")
    .replace(/_r_[0-9a-z]+_/g, "_rID_")
    .replace(/«r[0-9a-z]+»/g, "«rID»")
    .replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD")
    .replace(/\d{1,2}:\d{2}(:\d{2})?(\s?[AaPp]\.?[Mm]\.?)?/g, "HH:MM")
    .trim();
}
