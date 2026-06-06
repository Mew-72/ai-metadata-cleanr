/**
 * ScrubAI Privacy Docs registry.
 *
 * Single source of truth for the `/docs` section. Each entry is a Markdown
 * string in its own module so future authors can edit one doc without
 * touching the others.
 */

import { reachPenalties } from "./reach-penalties";
import { pixelRedrawTechnique } from "./pixel-redraw-technique";
import { platformsCheatsheet } from "./platforms-cheatsheet";

export type DocCategory = "Strategy" | "Technical" | "Reference";

export interface DocEntry {
    slug: string;
    title: string;
    /** One-line teaser shown on the index and in search results. */
    summary: string;
    /** Coarse grouping shown in the sidebar. */
    category: DocCategory;
    /** Approximate read time (minutes). */
    readMinutes: number;
    /** Inline tags that power client-side search. */
    tags: string[];
    /** Raw Markdown body. */
    body: string;
}

export const DOCS: DocEntry[] = [
    {
        slug: "reach-penalties",
        title: "Why Instagram & Pinterest Penalize AI Metadata",
        summary:
            "How algorithmic suppression actually works on visual platforms, and why metadata - not the pixels - usually triggers it.",
        category: "Strategy",
        readMinutes: 9,
        tags: [
            "instagram",
            "pinterest",
            "shadowban",
            "reach",
            "algorithm",
            "suppression",
            "made with ai",
            "c2pa",
            "exif",
        ],
        body: reachPenalties,
    },
    {
        slug: "pixel-redraw-technique",
        title: "Pixel Redraw Technique: Complete Metadata Removal",
        summary:
            "A technical walkthrough of why re-encoding pixels destroys C2PA / JUMBF manifests in ways tag-removers physically cannot.",
        category: "Technical",
        readMinutes: 12,
        tags: [
            "canvas",
            "c2pa",
            "jumbf",
            "exif",
            "xmp",
            "iptc",
            "pixel",
            "redraw",
            "cryptography",
            "credentials",
        ],
        body: pixelRedrawTechnique,
    },
    {
        slug: "platforms-cheatsheet",
        title: "Platforms Cheatsheet: What Each Network Looks At",
        summary:
            "Quick reference: which metadata blocks each major social platform reads, and the suppression patterns associated with them.",
        category: "Reference",
        readMinutes: 5,
        tags: [
            "instagram",
            "pinterest",
            "tiktok",
            "x",
            "linkedin",
            "facebook",
            "reference",
            "cheatsheet",
        ],
        body: platformsCheatsheet,
    },
];

export const DOC_CATEGORIES: DocCategory[] = [
    "Strategy",
    "Technical",
    "Reference",
];

export function getDoc(slug: string): DocEntry | undefined {
    return DOCS.find((d) => d.slug === slug);
}
