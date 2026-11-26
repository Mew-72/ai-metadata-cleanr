/**
 * Minimal, faithful stand-in for a browser page translation engine
 * (Chrome / Edge "Translate this page").
 *
 * What the real engines do, and what matters for this bug:
 *  - they walk the rendered DOM after hydration,
 *  - they RE-PARENT the existing text nodes into freshly created <font>
 *    wrappers rather than only rewriting nodeValue,
 *  - they wrap runs of inline content, which can re-parent whole inline
 *    elements such as <button> and <a>,
 *  - they SKIP any subtree opted out with translate="no" or class="notranslate".
 *
 * The re-parenting is the hazard: React 19 keeps direct references to the
 * host nodes it created, so a later removeChild / insertBefore against a
 * node the translator moved throws
 * `NotFoundError: Failed to execute 'removeChild' on 'Node'`.
 *
 * The opt-out handling is what lets this same helper validate the fix: once
 * translation-volatile nodes are marked, the simulated engine leaves them
 * alone, exactly as a real engine would.
 */

const SKIPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "SVG",
  "PATH",
  "CIRCLE",
  "LINE",
  "RECT",
  "POLYLINE",
  "POLYGON",
  "G",
  "DEFS",
]);

const INLINE_TAGS = new Set(["BUTTON", "A", "SPAN", "LABEL", "STRONG", "EM", "B", "I"]);

export interface TranslateOptions {
  /**
   * Also wrap eligible inline element children in <font>, the way Chrome
   * wraps a run of inline content. Defaults to true because that is the
   * observed behaviour and it is what re-parents whole controls.
   */
  wrapInlineElements?: boolean;
  /** Prefix applied to translated text so mutations are visible in failures. */
  prefix?: string;
}

export function isTranslationOptedOut(el: Element): boolean {
  const attr = el.getAttribute("translate");
  if (attr !== null && attr.toLowerCase() === "no") return true;
  if (el.classList.contains("notranslate")) return true;
  return false;
}

function pseudoTranslate(text: string, prefix: string): string {
  return `${prefix}${text}`;
}

/**
 * Applies translation-style mutation to `root` and returns the number of
 * nodes that were re-parented.
 */
export function simulateBrowserTranslation(
  root: Element,
  options: TranslateOptions = {},
): number {
  const { wrapInlineElements = true, prefix = "[pt] " } = options;
  let mutated = 0;

  const walk = (el: Element) => {
    if (SKIPPED_TAGS.has(el.tagName)) return;
    if (isTranslationOptedOut(el)) return;

    // Snapshot children first: we mutate the child list as we go.
    const children = Array.from(el.childNodes);

    for (const node of children) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue ?? "";
        if (text.trim().length === 0) continue;

        const font = el.ownerDocument.createElement("font");
        el.insertBefore(font, node);
        // Re-parent the ORIGINAL node React created. This is the hazard.
        font.appendChild(node);
        node.nodeValue = pseudoTranslate(text, prefix);
        mutated++;
        continue;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const child = node as Element;
        if (SKIPPED_TAGS.has(child.tagName)) continue;
        if (isTranslationOptedOut(child)) continue;

        if (wrapInlineElements && INLINE_TAGS.has(child.tagName)) {
          const font = el.ownerDocument.createElement("font");
          el.insertBefore(font, child);
          font.appendChild(child);
          mutated++;
        }

        walk(child);
      }
    }
  };

  walk(root);

  // Mark the document the way Chrome does, so app code can detect it.
  const html = root.ownerDocument.documentElement;
  html.classList.add("translated-ltr");
  html.setAttribute("lang", "pt-BR");

  return mutated;
}

/** Marks the document as untranslated again. */
export function resetTranslationMarkers(doc: Document): void {
  doc.documentElement.classList.remove("translated-ltr", "translated-rtl");
  doc.documentElement.setAttribute("lang", "en");
}
