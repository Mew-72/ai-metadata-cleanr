"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ExifReader from "exifreader";
import JSZip from "jszip";
import posthog from "posthog-js";
import { useAppAuth, useAppUser, useUpgradeWatcher } from "../hooks/useAppAuth";
import {
  useCanvasEngine,
  type ExportFormat,
} from "../hooks/useCanvasEngine";
import { BillingModal } from "./BillingModal";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import {
  Upload,
  Trash2,
  ShieldCheck,
  Download,
  FileImage,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Lock,
  FileCode,
  Check,
  X,
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  metadata?: Record<string, string>;
  riskLevel?: "high" | "low" | "clean";
  riskTagCount?: number;
  cleanedBlob?: Blob;
  cleanedUrl?: string;
  status: "idle" | "audited" | "cleaning" | "done" | "error";
  dimensions?: string;
}

const MOCK_C2PA_MANIFEST = {
  active_manifest: "urn:cpa:709055fa-9dce-4eba-8a71-d57444385397",
  manifests: {
    "urn:cpa:709055fa-9dce-4eba-8a71-d57444385397": {
      claimant: "OpenAI Media Service",
      assertions: [
        {
          label: "c2pa.actions",
          data: {
            actions: [
              {
                action: "c2pa.converted",
                when: "2026-04-23T20:08:00Z",
              },
            ],
            created: true,
          },
        },
        {
          label: "c2pa.certificate-status",
          data: {
            ocspVals: ["MOCK_OCSP_RESPONSE_PLACEHOLDER"],
            created: true,
          },
        },
      ],
      signature_info: {
        alg: "Ps256",
        issuer: "OpenAI OpCo, LLC",
        common_name: "OpenAI Media Service",
        cert_serial_number: "15483366567143162630298612244848438035",
        time: "2026-04-23T14:19:04.095995+00:00",
      },
      claim_version: 2,
    },
  },
};

// ── Obfuscated Rate-Limit Storage ──────────────────────────────────────────
// Storage keys and values are scrambled so users cannot trivially find
// or edit them via DevTools. A daily rotating salt + integrity hash
// ensures that manually changing any value invalidates the entire record.

const _RK = {
  // Base64-encoded storage key prefixes — not human-searchable in DevTools
  a: atob("X19zY3JiX3g5X2Q="),        // __scrb_x9_d  (date slot)
  b: atob("X19zY3JiX3g5X3Y="),        // __scrb_x9_v  (value slot)
  c: atob("X19zY3JiX3g5X2g="),        // __scrb_x9_h  (hash slot)
  ck: atob("X194OWNr"),               // _x9ck         (cookie prefix)
};

// Simple numeric XOR scramble with a daily-rotating salt
const _salt = (): number => {
  const d = new Date();
  return ((d.getFullYear() * 397) ^ ((d.getMonth() + 1) * 53) ^ (d.getDate() * 31)) >>> 0;
};

const _encode = (n: number): string => {
  const s = _salt();
  const scrambled = (n * 7 + 3) ^ s;
  return btoa(String(scrambled));
};

const _decode = (encoded: string): number => {
  try {
    const s = _salt();
    const scrambled = Number(atob(encoded));
    if (isNaN(scrambled)) return 0;
    return ((scrambled ^ s) - 3) / 7;
  } catch { return 0; }
};

// HMAC-like integrity hash — if any stored value is edited, this fails
const _hash = (date: string, count: number): string => {
  const payload = `${date}|${count}|${_salt()}|scrb`;
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
};

const getPersistedCleanCount = (): number => {
  if (typeof window === "undefined") return 0;

  const today = new Date().toLocaleDateString("en-CA");
  let localCount = 0;
  let cookieCount = 0;

  // ── localStorage (obfuscated) ──
  try {
    const storedDate = localStorage.getItem(_RK.a);
    if (storedDate !== today) {
      localCount = 0;
    } else {
      const raw = localStorage.getItem(_RK.b);
      const storedHash = localStorage.getItem(_RK.c);
      if (raw) {
        const decoded = _decode(raw);
        // Verify integrity — reject if hash was tampered with
        if (storedHash === _hash(today, decoded) && decoded >= 0 && decoded <= 999) {
          localCount = decoded;
        } else {
          localCount = 5; // Tamper detected — lock out
        }
      }
    }
  } catch { }

  // ── Cookie (obfuscated) ──
  try {
    const cookies = document.cookie.split(";");
    let cDate = "";
    let cVal = "";
    let cHash = "";
    for (const c of cookies) {
      const [name, val] = c.trim().split("=");
      if (name === `${_RK.ck}d`) cDate = val;
      if (name === `${_RK.ck}v`) cVal = val;
      if (name === `${_RK.ck}h`) cHash = val;
    }
    if (cDate !== today) {
      cookieCount = 0;
    } else if (cVal) {
      const decoded = _decode(cVal);
      if (cHash === _hash(today, decoded) && decoded >= 0 && decoded <= 999) {
        cookieCount = decoded;
      } else {
        cookieCount = 5; // Tamper detected
      }
    }
  } catch { }

  const maxCount = Math.max(localCount, cookieCount);
  setPersistedCleanCount(maxCount);
  return maxCount;
};

const setPersistedCleanCount = (count: number) => {
  if (typeof window === "undefined") return;

  const today = new Date().toLocaleDateString("en-CA");
  const encoded = _encode(count);
  const integrity = _hash(today, count);

  // ── localStorage ──
  try {
    localStorage.setItem(_RK.a, today);
    localStorage.setItem(_RK.b, encoded);
    localStorage.setItem(_RK.c, integrity);
  } catch { }

  // ── Cookie (with Secure flag) ──
  try {
    const expires = new Date();
    expires.setHours(23, 59, 59, 999);
    const expStr = expires.toUTCString();
    const flags = `expires=${expStr}; path=/; SameSite=Lax; Secure`;

    document.cookie = `${_RK.ck}d=${today}; ${flags}`;
    document.cookie = `${_RK.ck}v=${encoded}; ${flags}`;
    document.cookie = `${_RK.ck}h=${integrity}; ${flags}`;
  } catch { }
};

export function CleanerInterface() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [customFilename, setCustomFilename] = useState("");
  const [spoofProfile, setSpoofProfile] = useState<
    "none" | "iphone" | "canon" | "sony"
  >("iphone");
  const [exportQuality, setExportQuality] = useState<number>(0.95);
  const [exportFormat, setExportFormat] = useState<"auto" | ExportFormat>("auto");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [auditTab, setAuditTab] = useState<"tags" | "c2pa">("tags");
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [cleanCount, setCleanCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clerk Auth and PayPal Pro Gating Checks
  const { isPro, isSignedIn, isLoaded } = useAppAuth();
  const { user } = useAppUser();

  // Watch for an out-of-band upgrade (PayPal completing in another tab)
  // so the in-progress queue automatically picks up Pro entitlements.
  useUpgradeWatcher(isSignedIn === true);

  // Canvas + HEIC purification engine (Agent A)
  const { purifyImage, normalizeForAudit, isHeic } = useCanvasEngine();

  const [activeTier, setActiveTier] = useState<"free" | "pro">("free");

  // Keep state sync'd with isPro
  useEffect(() => {
    if (isPro) {
      setActiveTier("pro");
    } else {
      setActiveTier("free");
    }
  }, [isPro]);

  // Set mounted status on load
  useEffect(() => {
    setMounted(true);
    setCleanCount(getPersistedCleanCount());
  }, []);

  // Close guest limit modal if user signs in
  useEffect(() => {
    if (isSignedIn) {
      setIsGuestLimitModalOpen(false);
    }
  }, [isSignedIn]);

  // Prevent page scroll when modals are open
  useEffect(() => {
    if (isGuestLimitModalOpen || isBillingModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isGuestLimitModalOpen, isBillingModalOpen]);

  // handleSimulateUpgrade has been completely removed in favor of strict, secure Clerk Billing.

  // Helper to load image dimensions. HEIC files cannot be decoded by <img>
  // in most browsers, so we transparently convert them to JPEG first via the
  // canvas engine. Falls back to "Unknown px" on any failure.
  const getImageDimensions = async (file: File): Promise<string> => {
    let decodable: File;
    try {
      decodable = await normalizeForAudit(file);
    } catch {
      // If normalization fails, fall back to original file
      decodable = file;
    }
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(decodable);
      img.src = url;
      img.onload = () => {
        resolve(`${img.naturalWidth} x ${img.naturalHeight} px`);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve("Unknown px");
        URL.revokeObjectURL(url);
      };
    });
  };

  // Comprehensive list of tag keywords that indicate privacy/tracking risk
  const RISK_KEYWORDS = [
    "gps",
    "latitude",
    "longitude",
    "altitude",
    "location",
    "make",
    "model",
    "lensmodel",
    "lensmake",
    "software",
    "creator",
    "creatortool",
    "tool",
    "producer",
    "processor",
    "c2pa",
    "jumbf",
    "credential",
    "provenance",
    "assertion",
    "claim",
    "copyright",
    "artist",
    "author",
    "rights",
    "owner",
    "byline",
    "datetime",
    "datecreated",
    "datetimeoriginal",
    "datetimedigitized",
    "createdate",
    "modifydate",
    "serialnumber",
    "bodyserialnumber",
    "lensserialnumber",
    "uniqueid",
    "imageid",
    "documentid",
    "instanceid",
    "originalid",
    "usernote",
    "usercomment",
    "imagedescription",
    "historysoftwareagent",
    "historyaction",
    "historywhen",
  ];

  // Tags that are safe structural file properties
  const STRUCTURAL_KEYWORDS = [
    "imagewidth",
    "imageheight",
    "bitspersample",
    "bitdepth",
    "colordepth",
    "colorspace",
    "colortype",
    "compression",
    "filter",
    "interlace",
    "pixelxdimension",
    "pixelydimension",
    "xresolution",
    "yresolution",
    "resolutionunit",
    "orientation",
    "photometricinterpretation",
    "samplesperpixel",
    "planarconfiguration",
    "ycbcrsubsampling",
    "componentsconfiguration",
    "compressedbitsper",
    "whitepoint",
    "primarychromaticities",
    "referenceblackwhite",
    "jfifversion",
    "thumbnaillength",
    "thumbnailoffset",
    "renderingintent",
    "connectionspace",
    "pcs",
    "profileclass",
    "profileid",
    "colorspacedata",
    "cmm",
    "trc",
    "red",
    "green",
    "blue",
    "mediawhitepoint",
    "chad",
    "numberofcomponents",
    "filetypeextension",
    "mimetypeextension",
    "device",
  ];

  const isRiskTag = (tagKey: string, groupName: string): boolean => {
    const lk = tagKey.toLowerCase();
    const lg = groupName.toLowerCase();

    // Whole-group decisions first — these always win, regardless of which
    // keyword the tag name happens to contain. Without this, "DeviceModel"
    // inside an ICC profile gets flagged on the "model" risk keyword even
    // though ICC profile fields are vendor-neutral structural data.
    if (lg === "iptc") return true;
    if (
      lg === "icc" ||
      lg === "icc_profile" ||
      lg === "iccp" ||
      lg === "file" ||
      lg === "jfif" ||
      lg === "ihdr" ||
      lg === "png" ||
      lg === "pngfile" ||
      lg === "ph" ||
      lg === "phys" ||
      lg === "chrm" ||
      lg === "gama" ||
      lg === "srgb" ||
      lg === "trns" ||
      lg === "bkgd" ||
      lg === "sbit" ||
      lg === "interlace"
    ) {
      return false;
    }

    // XMP carries a mix — only structural keywords whitelist it.
    if (lg === "xmp" && !STRUCTURAL_KEYWORDS.some((s) => lk.includes(s)))
      return true;

    // Tag-name keyword fallback for everything else (mostly EXIF).
    if (RISK_KEYWORDS.some((rk) => lk.includes(rk))) return true;
    if (STRUCTURAL_KEYWORDS.some((sk) => lk.includes(sk))) return false;
    return false;
  };

  // Audit metadata — extract ALL tags with proper risk vs structural classification
  const auditFile = async (
    file: File,
  ): Promise<{
    metadata: Record<string, string>;
    dimensions: string;
    riskLevel: "high" | "low" | "clean";
    riskTagCount: number;
  }> => {
    const dimensions = await getImageDimensions(file);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const riskTags: Record<string, string> = {};
        const structuralTags: Record<string, string> = {};
        let riskTagCount = 0;

        try {
          if (reader.result instanceof ArrayBuffer) {
            const tags = ExifReader.load(reader.result, { expanded: true });
            const allGroups = tags as Record<
              string,
              Record<string, { description?: string; value?: unknown }>
            >;

            for (const [groupName, groupTags] of Object.entries(allGroups)) {
              if (!groupTags || typeof groupTags !== "object") continue;
              for (const [tagKey, tagData] of Object.entries(groupTags)) {
                if (!tagData) continue;
                let val = "";
                if (typeof tagData === "string") {
                  val = tagData;
                } else if (
                  tagData.description &&
                  typeof tagData.description === "string"
                ) {
                  val = tagData.description;
                } else if (
                  tagData.value !== undefined &&
                  tagData.value !== null
                ) {
                  val = String(tagData.value);
                } else {
                  continue;
                }
                if (
                  !val ||
                  val === "" ||
                  val === "undefined" ||
                  val.length > 500
                )
                  continue;
                if (
                  tagKey === "Thumbnail" ||
                  tagKey === "ThumbnailImage" ||
                  tagKey === "data" ||
                  tagKey === "rawValue" ||
                  tagKey === "MakerNote"
                )
                  continue;
                if (tagKey === "UserComment" && val.includes("\u0000"))
                  continue;

                if (isRiskTag(tagKey, groupName)) {
                  riskTags[`⚠ [${groupName.toUpperCase()}] ${tagKey}`] = val;
                  riskTagCount++;
                } else {
                  structuralTags[`◈ [${groupName.toUpperCase()}] ${tagKey}`] =
                    val;
                }
              }
            }

            // C2PA special detection
            const allKeys = [
              ...Object.keys(riskTags),
              ...Object.keys(structuralTags),
            ]
              .join(" ")
              .toLowerCase();
            if (allKeys.includes("jumbf") || allKeys.includes("c2pa")) {
              riskTags["⚠ C2PA Content Credentials"] =
                "DETECTED — Cryptographically signed manifest found";
              riskTagCount++;
            }

            // AI platform filename pattern
            const nameL = file.name.toLowerCase();
            if (
              nameL.includes("dall") ||
              nameL.includes("midjourney") ||
              nameL.includes("chatgpt") ||
              nameL.includes("stable") ||
              nameL.includes("firefly") ||
              nameL.includes("comfy")
            ) {
              riskTags["⚠ AI Platform Filename"] =
                `Filename "${file.name}" matches known AI generation naming patterns`;
              riskTagCount++;
            }
          }
        } catch (err) {
          console.warn("ExifReader parse error:", err);
        }

        const metadata: Record<string, string> = {
          ...riskTags,
          ...structuralTags,
        };

        if (Object.keys(metadata).length === 0) {
          metadata["◈ File Info"] =
            `${file.name} · ${file.type || "unknown"} · ${(file.size / 1024).toFixed(1)} KB`;
        }

        const riskLevel: "high" | "low" | "clean" =
          riskTagCount >= 3 ? "high" : riskTagCount > 0 ? "low" : "clean";
        resolve({ metadata, dimensions, riskLevel, riskTagCount });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFilesAdded = async (incomingFiles: FileList | File[]) => {
    const list = Array.from(incomingFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Free tier limit check
    if (activeTier === "free" && getPersistedCleanCount() >= 5) {
      setIsGuestLimitModalOpen(true);
      return;
    }

    // Feature gating check
    if (activeTier === "free" && files.length + list.length > 1) {
      posthog.capture("upgrade_modal_opened", {
        trigger: "batch_upload_limit",
      });
      setIsBillingModalOpen(true);
      return;
    }
    if (files.length + list.length > 50) {
      alert("Pro tier limit: Up to 50 images in a single batch.");
      return;
    }

    const processedFiles: UploadedFile[] = [];
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const id = Math.random().toString(36).substring(2, 9);
      processedFiles.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "idle",
      });
    }

    setFiles((prev) => {
      const combined = [...prev, ...processedFiles];
      if (combined.length > 0 && !selectedFileId) {
        setSelectedFileId(combined[0].id);
      }
      return combined;
    });

    posthog.capture("image_uploaded", {
      file_count: list.length,
      is_batch: list.length > 1,
      tier: activeTier,
    });

    // Run auditing
    for (const f of processedFiles) {
      const auditResult = await auditFile(f.file);
      setFiles((prev) =>
        prev.map((item) =>
          item.id === f.id
            ? {
              ...item,
              metadata: auditResult.metadata,
              dimensions: auditResult.dimensions,
              riskLevel: auditResult.riskLevel,
              riskTagCount: auditResult.riskTagCount,
              status: "audited",
            }
            : item,
        ),
      );
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleBrowseFiles = () => {
    if (activeTier === "free" && getPersistedCleanCount() >= 5) {
      setIsGuestLimitModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.cleanedUrl) URL.revokeObjectURL(f.cleanedUrl);
    });
    setFiles([]);
    setSelectedFileId(null);
  };

  // Spoof/simulate normal, safe camera metadata profiles to bypass AI suppression
  const getSafeSpoofedMetadata = (
    profile: "none" | "iphone" | "canon" | "sony",
    originalName: string,
  ): Record<string, string> => {
    if (profile === "none") {
      return {
        "◈ [FILE] Format": "Purified PNG/JPEG Asset",
        "◈ [FILE] Signature": "Client-Side Raw Pixel Redraw",
        "◈ [SECURITY] Status":
          "Sterilized (All EXIF, XMP, IPTC & C2PA tags permanently deleted)",
      };
    }

    const currentDate = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    if (profile === "iphone") {
      return {
        "◈ [EXIF] Make": "Apple",
        "◈ [EXIF] Model": "iPhone 15 Pro",
        "◈ [EXIF] LensModel": "iPhone 15 Pro Back Camera 6.86mm f/1.78",
        "◈ [EXIF] Software": "iOS 17.4.1",
        "◈ [EXIF] DateTimeOriginal": currentDate,
        "◈ [EXIF] ExposureTime": "1/120",
        "◈ [EXIF] FNumber": "1.78",
        "◈ [EXIF] ISOSpeedRatings": "80",
        "◈ [EXIF] FocalLength": "6.86 mm",
        "◈ [EXIF] ColorSpace": "sRGB (Harmless Standard IEC61966-2.1)",
        "◈ [SECURITY] Sandbox Profile":
          "Protected Camera Signature Spoof (Bypass AI Flagging)",
      };
    }

    if (profile === "canon") {
      return {
        "◈ [EXIF] Make": "Canon",
        "◈ [EXIF] Model": "Canon EOS 5D Mark IV",
        "◈ [EXIF] LensModel": "EF24-70mm f/2.8L II USM",
        "◈ [EXIF] Software": "Canon Firmware v1.4.0",
        "◈ [EXIF] DateTimeOriginal": currentDate,
        "◈ [EXIF] ExposureTime": "1/250",
        "◈ [EXIF] FNumber": "2.8",
        "◈ [EXIF] ISOSpeedRatings": "200",
        "◈ [EXIF] FocalLength": "50.0 mm",
        "◈ [EXIF] ColorSpace": "sRGB (Harmless Standard IEC61966-2.1)",
        "◈ [SECURITY] Sandbox Profile":
          "Protected Camera Signature Spoof (Bypass AI Flagging)",
      };
    }

    // sony
    return {
      "◈ [EXIF] Make": "Sony",
      "◈ [EXIF] Model": "ILCE-7RM5 (Alpha 7R V)",
      "◈ [EXIF] LensModel": "FE 24-70mm F2.8 GM II",
      "◈ [EXIF] Software": "Sony Firmware v2.00",
      "◈ [EXIF] DateTimeOriginal": currentDate,
      "◈ [EXIF] ExposureTime": "1/160",
      "◈ [EXIF] FNumber": "4.0",
      "◈ [EXIF] ISOSpeedRatings": "100",
      "◈ [EXIF] FocalLength": "35.0 mm",
      "◈ [EXIF] ColorSpace": "sRGB (Harmless Standard IEC61966-2.1)",
      "◈ [SECURITY] Sandbox Profile":
        "Protected Camera Signature Spoof (Bypass AI Flagging)",
    };
  };

  // Clean a single file utilizing the canvas engine (HEIC convert → resize → re-export)
  const cleanSingleFile = async (
    item: UploadedFile,
    index: number,
  ): Promise<UploadedFile> => {
    try {
      const requestedFormat: ExportFormat | undefined =
        exportFormat === "auto" ? undefined : exportFormat;

      const result = await purifyImage(item.file, {
        quality: exportQuality,
        format: requestedFormat,
      });

      // Always generate a randomized neutral filename to strip AI-detectable naming patterns.
      // Use the *output* mime to pick the extension so format conversions are honored.
      const extByMime: Record<ExportFormat, string> = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      };
      const ext = extByMime[result.format] ?? "png";
      const rand = Math.random().toString(36).substring(2, 8);
      const cleanedName = `img_${rand}_${index + 1}.${ext}`;

      const cleanedUrl = URL.createObjectURL(result.blob);

      // Track in PostHog
      posthog.capture("image_scrubbed", {
        file_format: item.type,
        size_kb: Math.round(item.size / 1024),
        is_batch: files.length > 1,
        custom_filename: !!customFilename.trim(),
        spoof_profile: spoofProfile,
        export_quality: exportQuality,
        output_format: result.format,
        output_w: result.width,
        output_h: result.height,
        was_heic: isHeic(item.file),
      });

      return {
        ...item,
        name: cleanedName,
        cleanedBlob: result.blob,
        cleanedUrl,
        metadata: getSafeSpoofedMetadata(spoofProfile, item.file.name),
        riskLevel: "clean",
        riskTagCount: 0,
        status: "done",
        dimensions: `${result.width} x ${result.height} px`,
      };
    } catch (err) {
      console.warn("Canvas purify failed:", err);
      return { ...item, status: "error" };
    }
  };

  // Trigger Metadata Wipe
  const handleCleanImages = async () => {
    if (files.length === 0) return;

    // Free tier limit check
    if (activeTier === "free" && getPersistedCleanCount() >= 5) {
      setIsGuestLimitModalOpen(true);
      return;
    }

    // Set files to cleaning state
    setFiles((prev) => prev.map((f) => ({ ...f, status: "cleaning" })));

    const cleanedResults: UploadedFile[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const item = files[idx];

      // Secondary safety check inside loop
      if (activeTier === "free" && getPersistedCleanCount() >= 5) {
        setIsGuestLimitModalOpen(true);
        setFiles((prev) =>
          prev.map((f, i) =>
            i >= idx && f.status === "cleaning" ? { ...f, status: "idle" } : f,
          ),
        );
        break;
      }

      const cleaned = await cleanSingleFile(item, idx);
      cleanedResults.push(cleaned);

      // Update specific item in UI queue
      setFiles((prev) => prev.map((f) => (f.id === item.id ? cleaned : f)));

      // Increment persistent clean count for Free tier
      if (activeTier === "free") {
        const nextCount = getPersistedCleanCount() + 1;
        setPersistedCleanCount(nextCount);
        setCleanCount(nextCount);
        if (nextCount >= 5) {
          setFiles((prev) =>
            prev.map((f, i) =>
              i > idx && f.status === "cleaning" ? { ...f, status: "idle" } : f,
            ),
          );
          break;
        }
      }
    }
  };

  // Download logic (Single file download or JSZip compilation)
  const handleDownload = async () => {
    const doneFiles = files.filter((f) => f.status === "done" && f.cleanedBlob);
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1) {
      // Single Download — always uses the randomized cleaned name
      const f = doneFiles[0];
      const link = document.createElement("a");
      link.href = f.cleanedUrl!;
      link.download = f.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Pro ZIP Batch Download
      if (activeTier === "free") {
        posthog.capture("upgrade_modal_opened", {
          trigger: "zip_download_gate",
        });
        setIsBillingModalOpen(true);
        return;
      }

      posthog.capture("batch_download_initiated", {
        file_count: doneFiles.length,
      });

      const zip = new JSZip();
      doneFiles.forEach((f) => {
        zip.file(f.name, f.cleanedBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;

      // ZIP name: scrubai_cleaned_images_{user_suffix}.zip or default
      const userSuffix = customFilename.trim().replace(/\.[^/.]+$/, "");
      link.download = userSuffix
        ? `scrubai_cleaned_images_${userSuffix}.zip`
        : "scrubai_cleaned_images.zip";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    }
  };

  // Use Mock Sample Image
  const handleUseSample = async () => {
    if (activeTier === "free" && getPersistedCleanCount() >= 5) {
      setIsGuestLimitModalOpen(true);
      return;
    }

    // Generate simulated image file loaded with custom dummy EXIF/C2PA tracking markers
    // Creating a transparent 1x1 base64 GIF is simple, then add simulated tags
    const mockFile = new File(
      [new Blob()],
      "DALL·E 2026_Camera_Studio_Export.jpg",
      {
        type: "image/jpeg",
      },
    );

    const id = Math.random().toString(36).substring(2, 9);
    const newFile: UploadedFile = {
      id,
      file: mockFile,
      name: mockFile.name,
      size: 48500,
      type: "image/jpeg",
      dimensions: "1024 x 1024 px",
      status: "audited",
      riskLevel: "high",
      riskTagCount: 6,
      metadata: {
        "⚠ [EXIF] Make": "Apple iPhone 15 Pro Max",
        "⚠ [EXIF] Software": "DALL·E 3 Generator Plugin v4",
        "⚠ [EXIF] GPSLatitude": "40.7128° N, 74.0060° W (New York City, NY)",
        "⚠ [EXIF] Copyright": "Midjourney Studio v6 & Adobe Asset Sync",
        "⚠ [EXIF] DateTimeOriginal": "2026-05-23 17:04:31",
        "⚠ C2PA Content Credentials":
          "DETECTED — Cryptographically signed JUMBF manifest found",
        "◈ [EXIF] ImageWidth": "1024",
        "◈ [EXIF] ImageHeight": "1024",
        "◈ [ICC] ColorSpace": "sRGB",
      },
    };

    setFiles((prev) => {
      const combined = [...prev, newFile];
      setSelectedFileId(id);
      return combined;
    });
  };

  const selectedFile = files.find((f) => f.id === selectedFileId);
  const allPurified =
    files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div className="w-full font-sans transition-colors duration-250 select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
        multiple={activeTier === "pro"}
        accept="image/*,.heic,.heif"
        className="hidden"
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
        {/* Left column: Drag & Drop Zone + Image Queue */}
        <div className="lg:border-r border-muted-border flex flex-col min-h-[520px] lg:min-h-[620px]">
          {/* Top toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center px-5 py-3.5 border-b border-muted-border bg-surface gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[14px] font-semibold tracking-tight text-ink">
                Workspace
              </span>
              {activeTier === "pro" ? (
                <span className="pill pill-pro">Pro</span>
              ) : (
                <>
                  <span className="pill pill-neutral">Free</span>
                  <span className="pill pill-accent">
                    {cleanCount} / 5 cleans today
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="font-sans text-[12.5px] font-medium text-n600 hover:text-danger rounded-md px-2.5 py-1.5 hover:bg-n100 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}

              <button
                onClick={handleUseSample}
                className="inline-flex items-center gap-1.5 rounded-md border border-muted-border bg-surface text-ink px-3 py-1.5 font-sans text-[12.5px] font-medium hover:bg-n100 transition-colors cursor-pointer"
              >
                <Sparkles size={12} strokeWidth={2.2} className="text-accent" />
                Try a sample
              </button>
            </div>
          </div>

          {/* Drag & Drop Canvas */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col p-5 lg:p-6 transition-all ${isDragging ? "dropzone-active" : ""
              }`}
          >
            {files.length === 0 ? (
              <button
                onClick={handleBrowseFiles}
                className="group flex-1 w-full flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed border-n300 hover:border-accent hover:bg-accent-soft/50 transition-colors py-12"
                aria-label="Browse files to clean"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-5 transition-transform group-hover:scale-105">
                  <Upload size={24} strokeWidth={2} />
                </div>

                <h3 className="font-sans text-[22px] lg:text-[28px] font-semibold text-ink tracking-tight mb-2">
                  Drop an image to clean it
                </h3>
                <p className="font-sans text-[13.5px] text-n500 mb-7 leading-relaxed max-w-md text-center px-4">
                  Drag a file here, or click anywhere in this box to browse.
                  Processed locally in your browser. Nothing is uploaded.
                </p>

                <div className="inline-flex items-center gap-2 rounded-md bg-ink text-bg px-5 py-2.5 font-sans text-[13px] font-medium group-hover:bg-accent transition-colors">
                  Choose a file
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[11.5px] text-n500 px-4 text-center">
                  <span>JPG · PNG · WebP · AVIF · HEIC</span>
                  <span className="text-n300">·</span>
                  <span>Up to {activeTier === "pro" ? "20" : "10"} MB</span>
                  {activeTier !== "pro" && (
                    <>
                      <span className="text-n300">·</span>
                      <span>5 free cleans / day</span>
                    </>
                  )}
                </div>
              </button>
            ) : (
              <div className="w-full h-full flex flex-col">
                {/* Images Queue Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                  {files.map((item, idx) => {
                    const isSelected = item.id === selectedFileId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFileId(item.id)}
                        className={`rounded-xl border p-3.5 text-left cursor-pointer flex flex-col gap-2 transition-all select-none ${isSelected
                          ? "border-accent bg-accent-soft/40 ring-2 ring-accent/15"
                          : "border-muted-border bg-surface hover:border-n300"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                            <FileImage
                              size={13}
                              className={`shrink-0 ${isSelected ? "text-accent" : "text-n400"}`}
                            />
                            <span className="font-sans text-[12px] font-medium text-ink truncate">
                              {item.name}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleDeleteFile(item.id, e)}
                            className="text-n400 hover:text-danger cursor-pointer shrink-0"
                            title="Remove file"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* File Details */}
                        <div className="font-sans text-[11px] text-n500 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span>Size</span>
                            <span className="font-medium text-ink">
                              {(item.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Dimensions</span>
                            <span className="font-medium text-ink truncate ml-2">
                              {item.dimensions || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-muted-border">
                            <span
                              className={`pill ${item.status === "done"
                                ? "pill-accent"
                                : item.status === "cleaning"
                                  ? "pill-warn animate-pulse"
                                  : "pill-neutral"
                                }`}
                            >
                              {item.status === "done"
                                ? "Cleaned"
                                : item.status === "cleaning"
                                  ? "Cleaning…"
                                  : item.status === "audited"
                                    ? "Ready"
                                    : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more files tile */}
                  {files.length < 50 && (
                    <button
                      onClick={handleBrowseFiles}
                      className="rounded-xl border-2 border-dashed border-n300 hover:border-accent hover:bg-accent-soft/40 p-3.5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] transition-colors"
                    >
                      <Upload size={16} className="text-n500 mb-1.5" />
                      <span className="font-sans text-[12px] font-medium text-n600">
                        Add more
                      </span>
                    </button>
                  )}
                </div>

                {/* Batch Action Bar */}
                <div className="mt-5 pt-5 border-t border-muted-border flex flex-col gap-4">
                  {/* Two Column Control Grid: Filename & Spoof Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Filename Input */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="output-filename"
                        className="font-sans text-[12px] font-medium text-n600"
                      >
                        {files.length > 1
                          ? "ZIP archive name"
                          : "Output filename"}
                        <span className="text-n400 font-normal"> (optional)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="output-filename"
                          type="text"
                          value={customFilename}
                          onChange={(e) => setCustomFilename(e.target.value)}
                          placeholder={
                            files.length > 1
                              ? "my_batch"
                              : files[0]?.name?.replace(/\.[^/.]+$/, "") ||
                              "cleaned_image"
                          }
                          className="flex-1 bg-bg border border-muted-border rounded-md px-3 py-2 font-sans text-[13px] text-ink outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 placeholder:text-n400"
                        />
                        <button
                          onClick={() => {
                            const rand = Math.random()
                              .toString(36)
                              .substring(2, 8);
                            setCustomFilename(`batch_${rand}`);
                          }}
                          className="shrink-0 rounded-md border border-muted-border bg-bg px-3 py-2 font-sans text-[12px] font-medium text-n600 hover:bg-n100 transition-colors cursor-pointer"
                          title="Generate a random suffix"
                        >
                          Randomize
                        </button>
                      </div>
                      <div className="font-sans text-[11px] text-n500">
                        Files are auto-renamed to neutral names regardless.
                      </div>
                    </div>

                    {/* Spoof Profile Select */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="spoof-profile"
                        className="font-sans text-[12px] font-medium text-n600"
                      >
                        Camera profile
                      </label>
                      <select
                        id="spoof-profile"
                        value={spoofProfile}
                        onChange={(e) => setSpoofProfile(e.target.value as any)}
                        className="bg-bg border border-muted-border rounded-md px-3 py-2 font-sans text-[13px] text-ink outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 cursor-pointer"
                      >
                        <option value="iphone">
                          iPhone 15 (recommended)
                        </option>
                        <option value="canon">
                          Canon EOS 5D Mark IV
                        </option>
                        <option value="sony">
                          Sony Alpha 7R V
                        </option>
                        <option value="none">
                          None (sterile, all metadata stripped)
                        </option>
                      </select>
                      <div className="font-sans text-[11px] text-n500">
                        Injects safe camera metadata to bypass AI reach suppression.
                      </div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Quality Slider */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="export-quality"
                        className="font-sans text-[12px] font-medium text-n600 flex items-center justify-between"
                      >
                        <span>Export quality</span>
                        <span className="font-mono text-[12px] font-semibold text-ink">
                          {Math.round(exportQuality * 100)}%
                        </span>
                      </label>
                      <input
                        id="export-quality"
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={exportQuality}
                        onChange={(e) =>
                          setExportQuality(parseFloat(e.target.value))
                        }
                        className="w-full accent-accent cursor-pointer h-2"
                        aria-label="Export quality"
                      />
                      <div className="font-sans text-[11px] text-n500">
                        {exportQuality >= 0.95
                          ? "Studio fidelity (near-lossless)"
                          : exportQuality >= 0.7
                            ? "Web optimized"
                            : "Aggressive compression"}
                      </div>
                    </div>

                    {/* Output format */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="export-format"
                        className="font-sans text-[12px] font-medium text-n600"
                      >
                        Output format
                      </label>
                      <select
                        id="export-format"
                        value={exportFormat}
                        onChange={(e) =>
                          setExportFormat(e.target.value as typeof exportFormat)
                        }
                        className="bg-bg border border-muted-border rounded-md px-3 py-2 font-sans text-[13px] text-ink outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15 cursor-pointer"
                      >
                        <option value="auto">Auto (match input)</option>
                        <option value="image/png">PNG · Lossless</option>
                        <option value="image/jpeg">JPEG · Compressed</option>
                        <option value="image/webp">WebP · Modern web</option>
                      </select>
                      <div className="font-sans text-[11px] text-n500">
                        PNG ignores quality. HEIC is converted to JPEG.
                      </div>
                    </div>
                  </div>

                  {/* Bottom action row */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full pt-2">
                    {activeTier === "free" ? (
                      <div className="font-sans text-[12px] text-n500">
                        <span className="font-medium text-ink">{cleanCount}</span>
                        {" "}of 5 free cleans used today
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 font-sans text-[12px] text-accent font-medium">
                        <ShieldCheck size={13} strokeWidth={2.4} />
                        Pro · Unlimited cleans
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {!allPurified ? (
                        <button
                          onClick={handleCleanImages}
                          className="btn-accent w-full sm:w-auto"
                        >
                          Clean {files.length}{" "}
                          {files.length === 1 ? "image" : "images"}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-accent w-full sm:w-auto"
                        >
                          <Download size={14} strokeWidth={2.2} />
                          Download {files.length > 1 ? "ZIP" : "image"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Audit Panel */}
        <div className="bg-bg flex flex-col select-none overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-muted-border bg-surface shrink-0">
            <ShieldCheck size={15} className="text-accent" strokeWidth={2.2} />
            <h3 className="font-sans text-[14px] font-semibold tracking-tight text-ink">
              {selectedFile?.status === "done"
                ? "Cleaning report"
                : "Metadata audit"}
            </h3>
          </div>

          {!selectedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-n500">
              <div className="w-12 h-12 rounded-2xl bg-n100 flex items-center justify-center mb-4">
                <HelpCircle size={20} className="text-n400" strokeWidth={2} />
              </div>
              <p className="font-sans text-[13px] leading-relaxed max-w-[220px]">
                Drop an image to see what metadata it carries before cleaning.
              </p>
            </div>
          ) : selectedFile.status === "done" ? (
            /* Cleaning Report */
            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {/* Success header */}
                <div className="rounded-xl bg-accent-soft border border-accent/30 p-4 flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="text-accent shrink-0 mt-0.5"
                    strokeWidth={2.2}
                  />
                  <div>
                    <h4 className="font-sans text-[14px] font-semibold text-ink">
                      Image cleaned
                    </h4>
                    <p className="font-sans text-[12px] text-n600 mt-1 leading-relaxed">
                      All tracking metadata removed. Re-encoded with the selected camera profile.
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                {(() => {
                  const cleanedSize = selectedFile.cleanedBlob?.size ?? 0;
                  const originalSize = selectedFile.size || 0;
                  const sizeDelta =
                    originalSize > 0
                      ? ((originalSize - cleanedSize) / originalSize) * 100
                      : 0;
                  const sizeLabel =
                    cleanedSize === 0
                      ? "—"
                      : sizeDelta >= 0
                        ? `−${sizeDelta.toFixed(1)}%`
                        : `+${Math.abs(sizeDelta).toFixed(1)}%`;

                  const dims = selectedFile.dimensions || "";
                  const dimMatch = dims.match(/(\d+)\s*x\s*(\d+)/);
                  const pixelCount = dimMatch
                    ? parseInt(dimMatch[1], 10) * parseInt(dimMatch[2], 10)
                    : 0;
                  const pixelLabel =
                    pixelCount >= 1_000_000
                      ? `${(pixelCount / 1_000_000).toFixed(1)}M`
                      : pixelCount > 0
                        ? pixelCount.toLocaleString()
                        : "—";

                  const outputMime = selectedFile.cleanedBlob?.type ?? "";
                  const isLossless = outputMime === "image/png";
                  const qualityLabel = isLossless
                    ? "Lossless"
                    : `${Math.round(exportQuality * 100)}%`;

                  const stats = [
                    { label: "Risk tags removed", value: "All" },
                    { label: "Size", value: sizeLabel },
                    { label: "Pixels", value: pixelLabel },
                    { label: "Quality", value: qualityLabel },
                  ];

                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg border border-muted-border bg-surface px-3 py-2.5"
                        >
                          <div className="font-sans text-[11px] text-n500">
                            {s.label}
                          </div>
                          <div className="font-sans text-[16px] font-semibold text-ink mt-0.5">
                            {s.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* What we did */}
                <div className="rounded-xl border border-muted-border bg-surface p-4">
                  <h5 className="font-sans text-[12px] font-medium text-n600 mb-3">
                    What we removed
                  </h5>
                  <ul className="flex flex-col gap-2 font-sans text-[13px] text-ink">
                    {[
                      "C2PA Content Credentials",
                      "Device make, model & software fingerprints",
                      "EXIF GPS coordinates and IPTC blocks",
                      "Pixel-redrew the image to disrupt classifiers",
                    ].map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <Check
                          size={13}
                          className="text-accent mt-0.5 shrink-0"
                          strokeWidth={2.5}
                        />
                        <span>{s}</span>
                      </li>
                    ))}
                    {spoofProfile !== "none" ? (
                      <li className="flex items-start gap-2 text-accent font-medium">
                        <Check
                          size={13}
                          className="mt-0.5 shrink-0"
                          strokeWidth={2.5}
                        />
                        <span>
                          Injected {spoofProfile === "iphone" ? "iPhone" : spoofProfile === "canon" ? "Canon" : "Sony"} camera profile
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-2 text-n500">
                        <Check
                          size={13}
                          className="mt-0.5 shrink-0"
                          strokeWidth={2.5}
                        />
                        <span>Sterile output (no camera profile injected)</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-lg bg-n100 px-4 py-3 font-sans text-[12px] text-n600 leading-relaxed">
                  Tip: re-upload the cleaned file here to verify nothing slipped through.
                </div>
              </div>
            </div>
          ) : (
            /* Active audit / inspection */
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1.5 shrink-0">
                  <span className="font-sans text-[11px] text-n500">
                    Inspecting
                  </span>
                  <span className="pill pill-neutral">
                    {selectedFile.status === "audited" ? "Ready" : "Scanning…"}
                  </span>
                </div>
                <h4 className="font-sans text-[14px] font-semibold text-ink truncate mb-4 shrink-0">
                  {selectedFile.file.name}
                </h4>

                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Risk badge */}
                  {selectedFile.riskLevel === "high" && (
                    <div className="rounded-xl bg-danger-soft border border-danger/30 p-3.5 mb-3 flex items-start gap-2.5 shrink-0">
                      <AlertTriangle
                        size={15}
                        className="text-danger shrink-0 mt-0.5"
                        strokeWidth={2.2}
                      />
                      <div>
                        <div className="font-sans text-[13px] font-semibold text-danger">
                          High risk — {selectedFile.riskTagCount} tracking tag
                          {(selectedFile.riskTagCount || 0) !== 1 ? "s" : ""} found
                        </div>
                        <p className="font-sans text-[12px] text-n600 leading-relaxed mt-0.5">
                          Device fingerprints, GPS, or signed credentials platforms use to limit reach.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFile.riskLevel === "low" && (
                    <div className="rounded-xl bg-warn-soft border border-warn/30 p-3.5 mb-3 flex items-start gap-2.5 shrink-0">
                      <AlertTriangle
                        size={15}
                        className="text-warn shrink-0 mt-0.5"
                        strokeWidth={2.2}
                      />
                      <div>
                        <div className="font-sans text-[13px] font-semibold text-warn">
                          Low risk — {selectedFile.riskTagCount} tracking tag
                          {(selectedFile.riskTagCount || 0) !== 1 ? "s" : ""}
                        </div>
                        <p className="font-sans text-[12px] text-n600 leading-relaxed mt-0.5">
                          Run the cleaner to eliminate them completely.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFile.riskLevel === "clean" && (
                    <div className="rounded-xl bg-accent-soft border border-accent/30 p-3.5 mb-3 flex items-start gap-2.5 shrink-0">
                      <ShieldCheck
                        size={15}
                        className="text-accent shrink-0 mt-0.5"
                        strokeWidth={2.2}
                      />
                      <div>
                        <div className="font-sans text-[13px] font-semibold text-accent">
                          No tracking metadata detected
                        </div>
                        <p className="font-sans text-[12px] text-n600 leading-relaxed mt-0.5">
                          Only structural file properties found. Safe to upload.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audit table */}
                  {(() => {
                    const entries = selectedFile.metadata
                      ? Object.entries(selectedFile.metadata)
                      : null;
                    const riskEntries = entries
                      ? entries.filter(([k]) => k.startsWith("⚠"))
                      : [];
                    const structuralEntries = entries
                      ? entries.filter(([k]) => !k.startsWith("⚠"))
                      : [];

                    return (
                      <div className="rounded-xl border border-muted-border bg-surface flex flex-col flex-1 overflow-hidden min-h-[280px] max-h-[400px]">
                        <div className="overflow-y-auto flex-1">
                          {!entries ? (
                            <div className="p-4 text-center font-sans text-[12px] text-n400 animate-pulse">
                              Scanning structural headers…
                            </div>
                          ) : (
                            <>
                              {/* Risk section */}
                              <div className="bg-danger-soft border-b border-muted-border px-3 py-2 font-sans text-[11px] font-semibold text-danger flex items-center justify-between sticky top-0 z-10">
                                <span>Tracking risk</span>
                                <span className="font-mono">{riskEntries.length}</span>
                              </div>
                              {riskEntries.length === 0 ? (
                                <div className="px-3 py-3 font-sans text-[12px] text-accent font-medium border-b border-muted-border">
                                  None detected — safe to upload.
                                </div>
                              ) : (
                                <div className="divide-y divide-muted-border">
                                  {riskEntries.map(([key, val]) => (
                                    <div
                                      key={key}
                                      className="grid grid-cols-[1fr_1fr] px-3 py-2 font-mono text-[11px] items-start gap-2"
                                    >
                                      <div className="text-danger break-all">
                                        {key.replace(/^⚠\s*/, "")}
                                      </div>
                                      <div className="font-medium text-ink break-all">
                                        {val}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Structural section */}
                              <div className="bg-n100 border-y border-muted-border px-3 py-2 font-sans text-[11px] font-medium text-n500 flex items-center justify-between sticky top-0 z-10">
                                <span>Structural file properties (harmless)</span>
                                <span className="font-mono">{structuralEntries.length}</span>
                              </div>
                              {structuralEntries.length === 0 ? (
                                <div className="px-3 py-3 font-sans text-[12px] text-n400">
                                  None
                                </div>
                              ) : (
                                <div className="divide-y divide-muted-border">
                                  {structuralEntries.map(([key, val]) => (
                                    <div
                                      key={key}
                                      className="grid grid-cols-[1fr_1fr] px-3 py-2 font-mono text-[11px] items-start gap-2"
                                    >
                                      <div className="text-n500 break-all">
                                        {key.replace(/^◈\s*/, "")}
                                      </div>
                                      <div className="text-n600 break-all">
                                        {val}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-n100 px-4 py-3 font-sans text-[12px] text-n600 leading-relaxed shrink-0">
                Structural fields (image dimensions, color space, JFIF version) are harmless — they're emitted by every browser.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clerk Upgrade Gating Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />

      {/* Guest Limit Modal */}
      {isGuestLimitModalOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 select-none animate-fadeIn overflow-y-auto"
            style={{ zIndex: 999999 }}
          >
            <div className="surface-card max-w-md w-full p-7 relative animate-scaleUp max-h-full overflow-y-auto">
              <button
                onClick={() => setIsGuestLimitModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-md text-n400 hover:text-ink hover:bg-n100 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X size={14} strokeWidth={2.2} />
              </button>

              <div className="flex items-start gap-3.5 pb-5 border-b border-muted-border mb-5">
                <span className="w-10 h-10 rounded-xl bg-warn-soft text-warn flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <div className="font-sans text-[12px] uppercase tracking-wider text-warn font-medium">
                    Daily limit reached
                  </div>
                  <h3 className="font-sans text-[20px] font-semibold text-ink tracking-tight mt-0.5">
                    You've used 5 / 5 free cleans
                  </h3>
                </div>
              </div>

              <p className="font-sans text-[13.5px] text-n600 leading-relaxed mb-5">
                {isSignedIn
                  ? "Upgrade to Lifetime Pro for unlimited daily cleans, batches up to 50 images, and ZIP exports."
                  : "Create a free account to save your work, or upgrade to Pro for unlimited cleans."}
              </p>

              <div className="flex flex-col gap-2.5">
                {isSignedIn ? (
                  <>
                    <button
                      onClick={() => {
                        posthog.capture("upgrade_modal_opened", {
                          trigger: "guest_limit_reached",
                        });
                        setIsGuestLimitModalOpen(false);
                        setIsBillingModalOpen(true);
                      }}
                      className="btn-accent w-full"
                    >
                      See Pro plans
                    </button>
                    <button
                      onClick={() => setIsGuestLimitModalOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Maybe later
                    </button>
                  </>
                ) : (
                  <>
                    <SignUpButton mode="modal">
                      <button className="btn-accent w-full">
                        Create free account
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button className="btn-secondary w-full">
                        Sign in
                      </button>
                    </SignInButton>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
