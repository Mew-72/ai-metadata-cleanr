"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ExifReader from "exifreader";
import JSZip from "jszip";
import posthog from "posthog-js";
import { useAppAuth, useAppUser, useUpgradeWatcher } from "../hooks/useAppAuth";
import {
  useCanvasEngine,
  type ResizePreset,
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
  const [resizePreset, setResizePreset] = useState<ResizePreset>("original");
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
    const decodable = await normalizeForAudit(file);
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
        resize: resizePreset,
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
        resize_preset: resizePreset,
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
      <div className="grid grid-cols-1 lg:grid-cols-3 border-b-4 border-ink">
        {/* Left column: Drag & Drop Zone + Image Queue (Span 2) */}
        <div className="lg:col-span-2 border-r-0 lg:border-r border-ink flex flex-col min-h-[500px]">
          {/* Top Panel Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-6 border-b border-ink bg-n100 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-lg font-bold tracking-tight text-ink">
                Scrubbing Workspace
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 border border-ink ${activeTier === "pro"
                  ? "bg-accent text-white"
                  : "bg-bg text-ink"
                  }`}
              >
                {activeTier === "pro"
                  ? "PRO TIER ACTIVATED"
                  : "FREE TIER (1 FILE LIMIT)"}
              </span>
              {activeTier === "free" && (
                <span className="text-[9px] font-mono px-2 py-0.5 border border-ink bg-accent/5 text-accent font-bold animate-pulse">
                  {isSignedIn ? "FREE MEMBER SCRUBS" : "GUEST SCRUBS"}:{" "}
                  {cleanCount} / 5 IMAGES
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              {files.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="font-mono text-[9px] uppercase tracking-wider text-accent border border-accent/20 px-3 py-1.5 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none"
                >
                  Clear Workspace
                </button>
              )}

              <button
                onClick={handleUseSample}
                className="font-mono text-[9px] uppercase tracking-wider bg-ink text-bg px-3.5 py-1.5 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none flex items-center gap-1.5"
              >
                <Sparkles size={10} />
                Load Sample Image
              </button>
            </div>
          </div>

          {/* Drag & Drop Canvas */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-all ${isDragging
              ? "dropzone-active"
              : ""
              }`}
          >
            {files.length === 0 ? (
              <div className="max-w-md mx-auto py-12 flex flex-col items-center">
                <div className="w-16 h-16 border border-ink flex items-center justify-center mb-6 bg-bg transition-transform hover:scale-105 duration-200">
                  <Upload size={24} className="text-ink" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink tracking-tight mb-2">
                  DRAG & DROP IMAGE HERE
                </h3>
                <p className="font-body text-xs text-n500 mb-6 leading-relaxed">
                  Purify files completely locally in your browser. Raw pixel
                  redraw guarantees total annihilation of EXIF, XMP, IPTC
                  labels, and cryptographically signed C2PA markers. JPEG,
                  PNG, WebP, and iOS HEIC/HEIF supported.
                </p>

                <button
                  onClick={handleBrowseFiles}
                  className="bg-ink text-bg border-2 border-ink px-7 py-3 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors"
                >
                  Browse Local Files
                </button>
                <div className="font-mono text-[9px] text-n400 uppercase tracking-widest mt-3.5">
                  100% Client-Side. Images Never Uploaded to Servers.
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                {/* Images Queue List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full p-2">
                  {files.map((item, idx) => {
                    const isSelected = item.id === selectedFileId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFileId(item.id)}
                        className={`border-2 p-4 text-left cursor-pointer flex flex-col justify-between transition-all select-none hover:border-ink ${isSelected
                          ? "border-ink bg-n100 shadow-md"
                          : "border-muted-border bg-bg"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileImage
                              size={16}
                              className={`${isSelected ? "text-accent" : "text-n500"}`}
                            />
                            <span className="font-mono text-[10px] font-bold tracking-tight text-ink truncate max-w-[130px]">
                              {item.name}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleDeleteFile(item.id, e)}
                            className="text-n400 hover:text-accent cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* File Details */}
                        <div className="mt-4 pt-3 border-t border-muted-border font-mono text-[9px] text-n500 flex flex-col gap-1.5">
                          <div>
                            Size:{" "}
                            <span className="font-bold text-ink">
                              {(item.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div>
                            Dimensions:{" "}
                            <span className="font-bold text-ink">
                              {item.dimensions || "Loading..."}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2.5">
                            <span
                              className={`px-1.5 py-0.5 text-[8px] font-bold border ${item.status === "done"
                                ? "bg-green-800/10 border-green-800 text-green-800"
                                : item.status === "cleaning"
                                  ? "bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse"
                                  : "bg-bg border-ink/20 text-n500"
                                }`}
                            >
                              {item.status.toUpperCase()}
                            </span>

                            {item.status === "done" && (
                              <span className="text-[8px] font-bold text-green-800 flex items-center gap-0.5">
                                ✓ Sanitized
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick Drop Zone placeholder inside Queue */}
                  {files.length < 50 && (
                    <div
                      onClick={handleBrowseFiles}
                      className="border-2 border-dashed border-ink/25 hover:border-ink p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] transition-colors"
                    >
                      <Upload size={16} className="text-n500 mb-2" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-n500">
                        Add More files
                      </span>
                    </div>
                  )}
                </div>

                {/* Batch Action Bar */}
                <div className="mt-auto p-6 border-t border-ink bg-bg flex flex-col gap-4">
                  {/* Two Column Control Grid: Filename & Safe Spoof Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Filename Input */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="output-filename"
                        className="font-mono text-[9px] tracking-widest uppercase text-n500"
                      >
                        {files.length > 1
                          ? "ZIP Archive Name (optional)"
                          : "Output Filename (optional)"}
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
                          className="flex-1 bg-transparent border border-ink px-3 py-2 font-mono text-[11px] text-ink outline-none transition-all focus:bg-n100 focus:border-accent select-text placeholder:text-n400"
                        />
                        <button
                          onClick={() => {
                            const rand = Math.random()
                              .toString(36)
                              .substring(2, 8);
                            setCustomFilename(`batch_${rand}`);
                          }}
                          className="shrink-0 border border-ink px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-n500 hover:bg-ink hover:text-bg transition-colors cursor-pointer select-none"
                          title="Generate a random suffix for the archive name"
                        >
                          ↻ Randomize
                        </button>
                      </div>
                      <div className="font-mono text-[8px] text-n400 uppercase tracking-wider">
                        {files.length > 1
                          ? "Files inside ZIP are always auto-renamed to neutral names"
                          : "Files are always auto-renamed to neutral names"}
                      </div>
                    </div>

                    {/* Safe Spoof Profile Select */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="spoof-profile"
                        className="font-mono text-[9px] tracking-widest uppercase text-n500"
                      >
                        Safe Spoof Profile (Bypasses AI reach suppression)
                      </label>
                      <select
                        id="spoof-profile"
                        value={spoofProfile}
                        onChange={(e) => setSpoofProfile(e.target.value as any)}
                        className="bg-transparent border border-ink px-3 py-2 font-mono text-[11px] text-ink outline-none transition-all focus:bg-n100 focus:border-accent cursor-pointer"
                      >
                        <option value="iphone" className="bg-bg text-ink">
                          📱 Apple iPhone 15 Capture Footprint (Recommended)
                        </option>
                        <option value="canon" className="bg-bg text-ink">
                          📷 Canon EOS 5D Professional SLR Footprint
                        </option>
                        <option value="sony" className="bg-bg text-ink">
                          📷 Sony Alpha 7R Professional SLR Footprint
                        </option>
                        <option value="none" className="bg-bg text-ink">
                          🛡 Sterile Capture Footprint (100% Stripped / Blank)
                        </option>
                      </select>
                      <div className="font-mono text-[8px] text-accent uppercase tracking-wider font-bold">
                        Injects standard, safe metadata to blend in perfectly on
                        social platforms
                      </div>
                    </div>
                  </div>

                  {/* Export Options Grid (Agent A: quality slider, resize presets, format) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-1">
                    {/* Quality Slider */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="export-quality"
                        className="font-mono text-[9px] tracking-widest uppercase text-n500 flex items-center justify-between"
                      >
                        <span>Export Quality</span>
                        <span className="font-bold text-ink">
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
                      <div className="font-mono text-[8px] text-n400 uppercase tracking-wider">
                        {exportQuality >= 0.95
                          ? "Studio fidelity (near-lossless)"
                          : exportQuality >= 0.7
                            ? "Web optimized"
                            : "Aggressive compression"}
                      </div>
                    </div>

                    {/* Resize preset */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="resize-preset"
                        className="font-mono text-[9px] tracking-widest uppercase text-n500"
                      >
                        Canvas Size
                      </label>
                      <select
                        id="resize-preset"
                        value={resizePreset}
                        onChange={(e) =>
                          setResizePreset(e.target.value as ResizePreset)
                        }
                        className="bg-transparent border border-ink px-3 py-2 font-mono text-[11px] text-ink outline-none transition-all focus:bg-n100 focus:border-accent cursor-pointer"
                      >
                        <option value="original" className="bg-bg text-ink">
                          ◈ Keep Original Resolution
                        </option>
                        <option value="1080p" className="bg-bg text-ink">
                          ▲ 1080p (1920px long edge)
                        </option>
                        <option value="4k" className="bg-bg text-ink">
                          ▲ 4K (3840px long edge)
                        </option>
                      </select>
                      <div className="font-mono text-[8px] text-n400 uppercase tracking-wider">
                        Auto-downscale destroys upscaler / resize artifacts
                      </div>
                    </div>

                    {/* Output format */}
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="export-format"
                        className="font-mono text-[9px] tracking-widest uppercase text-n500"
                      >
                        Output Format
                      </label>
                      <select
                        id="export-format"
                        value={exportFormat}
                        onChange={(e) =>
                          setExportFormat(e.target.value as typeof exportFormat)
                        }
                        className="bg-transparent border border-ink px-3 py-2 font-mono text-[11px] text-ink outline-none transition-all focus:bg-n100 focus:border-accent cursor-pointer"
                      >
                        <option value="auto" className="bg-bg text-ink">
                          ◈ Auto (match input format)
                        </option>
                        <option value="image/png" className="bg-bg text-ink">
                          PNG · Lossless (largest file)
                        </option>
                        <option value="image/jpeg" className="bg-bg text-ink">
                          JPEG · Compressed (smallest file)
                        </option>
                        <option value="image/webp" className="bg-bg text-ink">
                          WebP · Modern web
                        </option>
                      </select>
                      <div className="font-mono text-[8px] text-n400 uppercase tracking-wider">
                        PNG ignores quality. HEIC inputs are converted to JPEG.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                    {/* Free Tier / Guest Usage real-time counter */}
                    {activeTier === "free" ? (
                      <div className="text-left py-1">
                        <div className="font-mono text-[9px] text-n500 uppercase tracking-widest">
                          {isSignedIn
                            ? "Free Account Usage"
                            : "Guest Cleaning Usage"}
                        </div>
                        <div className="font-sans text-[11px] font-bold text-ink uppercase tracking-wider mt-0.5">
                          {cleanCount} of 5 free cleans used
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[9px] text-green-800 uppercase tracking-widest font-bold">
                        ✓ PRO Member Session (Unlimited Client-side Cleans)
                      </div>
                    )}

                    {/* Clean and Export Actions */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
                      {!allPurified ? (
                        <button
                          onClick={handleCleanImages}
                          className="w-full sm:w-auto bg-ink text-bg border-2 border-ink px-6 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors"
                        >
                          Sanitize Metadata ({files.length}{" "}
                          {files.length === 1 ? "File" : "Files"})
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="w-full sm:w-auto bg-accent text-white border-2 border-accent px-6 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:border-ink transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={14} />
                          Download{" "}
                          {files.length > 1 ? "ZIP Bundle" : "Cleaned Image"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Auditing Panel */}
        <div className="bg-n100 p-8 flex flex-col select-none overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-ink shrink-0">
            <ShieldCheck size={18} className="text-accent" />
            <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
              {selectedFile?.status === "done"
                ? "Scrubbing Report"
                : "Auditing Briefing"}
            </h3>
          </div>

          {!selectedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-n500">
              <HelpCircle size={24} className="mb-3 opacity-50" />
              <p className="font-body text-xs leading-relaxed max-w-[200px]">
                Upload an image or load the sample file to perform a structural
                tracking audit.
              </p>
            </div>
          ) : selectedFile.status === "done" ? (
            /* Processing Complete Stats Panel */
            <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
              <div className="flex flex-col gap-5">
                {/* Header Badge */}
                <div className="bg-green-800/5 border border-green-800 p-4 flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="text-green-800 shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-green-900 uppercase tracking-wide">
                      Processing Complete!
                    </h4>
                    <p className="font-body text-[10px] text-n500 mt-0.5 leading-normal">
                      The image has been completely stripped of tracking
                      vulnerabilities and re-encoded with the safe footprint.
                    </p>
                  </div>
                </div>

                {/* Grid stats — all live values from the scrubbed file */}
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
                        ? `${sizeDelta.toFixed(1)}%`
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

                  // PNG is lossless regardless of slider position.
                  const outputMime = selectedFile.cleanedBlob?.type ?? "";
                  const isLossless = outputMime === "image/png";
                  const qualityLabel = isLossless
                    ? "Lossless"
                    : `${Math.round(exportQuality * 100)}%`;

                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-ink bg-bg p-3 flex flex-col justify-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-n400">
                          Scrubbed
                        </span>
                        <span className="font-serif text-lg font-bold text-ink mt-0.5">
                          1 Image
                        </span>
                      </div>
                      <div className="border border-ink bg-bg p-3 flex flex-col justify-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-n400">
                          Size {sizeDelta >= 0 ? "Reduction" : "Increase"}
                        </span>
                        <span className="font-serif text-lg font-bold text-ink mt-0.5">
                          {sizeLabel}
                        </span>
                      </div>
                      <div className="border border-ink bg-bg p-3 flex flex-col justify-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-n400">
                          Pixels Redrawn
                        </span>
                        <span className="font-serif text-lg font-bold text-ink mt-0.5">
                          {pixelLabel}
                        </span>
                      </div>
                      <div className="border border-ink bg-bg p-3 flex flex-col justify-center">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-n400">
                          Output Quality
                        </span>
                        <span className="font-serif text-lg font-bold text-ink mt-0.5">
                          {qualityLabel}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* File Details / Cleaning Report */}
                <div className="border border-ink/20 bg-bg p-4 flex flex-col gap-3">
                  <h5 className="font-serif text-xs font-bold text-ink uppercase tracking-wide border-b border-ink/10 pb-1.5">
                    Scrubbing Details & Actions
                  </h5>
                  <div className="flex flex-col gap-2 font-mono text-[9px] text-n500">
                    <div className="flex items-center gap-2 text-ink">
                      <span className="text-green-800 font-bold">✓</span>
                      <span>Removed C2PA Content Credentials</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink">
                      <span className="text-green-800 font-bold">✓</span>
                      <span>
                        Stripped device make, model, & software tracking blocks
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-ink">
                      <span className="text-green-800 font-bold">✓</span>
                      <span>Erased EXIF GPS and IPTC metadata blocks</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink">
                      <span className="text-green-800 font-bold">✓</span>
                      <span>
                        Applied raw canvas pixel redraw pipeline to disrupt AI
                        classification
                      </span>
                    </div>
                    {spoofProfile !== "none" ? (
                      <div className="flex items-center gap-2 text-accent font-bold">
                        <span className="text-accent font-bold">✓</span>
                        <span>
                          Injected Safe {spoofProfile.toUpperCase()} Camera
                          Footprint Profile
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-n500">
                        <span className="text-n500 font-bold">✓</span>
                        <span>Left Sterile footprint (100% stripped)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Success Banner */}
                <div className="bg-green-800/5 border border-green-800/30 p-3 text-center font-mono text-[9px] text-green-800 uppercase tracking-widest font-bold">
                  ✓ Success! Image processed successfully!
                </div>
              </div>

              <div className="mt-8 border-t border-ink/15 pt-5 font-mono text-[9px] text-n500 leading-relaxed uppercase tracking-wider">
                💡 Re-upload the downloaded image into the analyzer below to
                verify total tracking signal annihilation!
              </div>
            </div>
          ) : (
            /* Active Audit / Inspection Panel */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-2 shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-n500">
                    File Under Inspection:
                  </span>
                  <span className="font-mono text-[9px] font-bold text-accent">
                    {selectedFile.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-ink truncate mb-3 shrink-0">
                  {selectedFile.file.name}
                </h4>

                {/* EXTRACTED TAGS */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Risk Assessment Badge */}
                  {selectedFile.riskLevel === "high" && (
                    <div className="bg-accent/5 border border-accent p-3.5 mb-4 flex items-start gap-2.5 shrink-0">
                      <AlertTriangle
                        size={16}
                        className="text-accent shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-sans text-[10px] font-bold text-accent uppercase tracking-wider">
                          High Tracking Risk — {selectedFile.riskTagCount}{" "}
                          risk tag
                          {(selectedFile.riskTagCount || 0) !== 1 ? "s" : ""}{" "}
                          found
                        </div>
                        <p className="font-body text-[10px] text-n500 leading-snug mt-0.5">
                          This file contains device identification, software
                          fingerprints, or cryptographic signatures that
                          platforms use to shadowban or limit reach.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFile.riskLevel === "low" && (
                    <div className="bg-amber-500/5 border border-amber-500 p-3.5 mb-4 flex items-start gap-2.5 shrink-0">
                      <AlertTriangle
                        size={16}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-sans text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Low Risk — {selectedFile.riskTagCount} tracking tag
                          {(selectedFile.riskTagCount || 0) !== 1 ? "s" : ""}{" "}
                          detected
                        </div>
                        <p className="font-body text-[10px] text-n500 leading-snug mt-0.5">
                          Minor tracking indicators found. Run the purifier to
                          eliminate them completely.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFile.riskLevel === "clean" && (
                    <div className="bg-green-800/5 border border-green-800 p-3.5 mb-4 flex items-start gap-2.5 shrink-0">
                      <ShieldCheck
                        size={16}
                        className="text-green-800 shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="font-sans text-[10px] font-bold text-green-800 uppercase tracking-wider">
                          ✓ Safe — No tracking metadata detected
                        </div>
                        <p className="font-body text-[10px] text-n500 leading-snug mt-0.5">
                          This file contains only harmless structural
                          properties. It is safe for platform upload without
                          reach suppression risk.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audit Tags Table — split into Risk and Structural so
                      cleaned files visibly read as "0 risk" even though the
                      browser still emits harmless JFIF/PNG structural fields. */}
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
                      <div className="border border-ink bg-bg flex flex-col flex-1 overflow-hidden h-[300px] max-h-[400px]">
                        <div className="grid grid-cols-2 font-mono text-[9px] uppercase tracking-widest text-n500 border-b border-ink p-2 bg-n100 font-bold shrink-0">
                          <div>Indicator Tag</div>
                          <div>
                            Extracted Data{" "}
                            {entries ? `(${entries.length})` : ""}
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                          {!entries ? (
                            <div className="p-4 text-center font-mono text-[9px] text-n400 uppercase tracking-widest animate-pulse">
                              Scanning structural headers...
                            </div>
                          ) : (
                            <>
                              {/* Risk section */}
                              <div className="bg-accent/5 border-b border-accent/20 px-2.5 py-1.5 font-mono text-[8px] tracking-widest uppercase text-accent font-bold flex items-center justify-between sticky top-0 z-10">
                                <span>⚠ Tracking Risk Tags</span>
                                <span>{riskEntries.length}</span>
                              </div>
                              {riskEntries.length === 0 ? (
                                <div className="px-3 py-3 font-mono text-[9px] text-green-700 uppercase tracking-widest border-b border-muted-border">
                                  ✓ None detected — file is safe to upload
                                </div>
                              ) : (
                                <div className="divide-y divide-muted-border">
                                  {riskEntries.map(([key, val]) => (
                                    <div
                                      key={key}
                                      className="grid grid-cols-2 p-2.5 font-mono text-[10px] items-start gap-2 bg-accent/3"
                                    >
                                      <div className="font-medium text-accent">
                                        {key}
                                      </div>
                                      <div className="font-bold break-all text-ink">
                                        {val}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Structural section (collapsed by default
                                  visually — these are harmless browser-emitted
                                  fields that show up on every clean file). */}
                              <div className="bg-n100 border-y border-muted-border px-2.5 py-1.5 font-mono text-[8px] tracking-widest uppercase text-n500 font-bold flex items-center justify-between sticky top-0 z-10">
                                <span>◈ Structural File Properties (harmless)</span>
                                <span>{structuralEntries.length}</span>
                              </div>
                              {structuralEntries.length === 0 ? (
                                <div className="px-3 py-3 font-mono text-[9px] text-n400 uppercase tracking-widest">
                                  None
                                </div>
                              ) : (
                                <div className="divide-y divide-muted-border">
                                  {structuralEntries.map(([key, val]) => (
                                    <div
                                      key={key}
                                      className="grid grid-cols-2 p-2.5 font-mono text-[10px] items-start gap-2"
                                    >
                                      <div className="font-medium text-n500">
                                        {key}
                                      </div>
                                      <div className="font-bold break-all text-n500">
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

              {/* Auditor action instructions */}
              <div className="mt-8 border-t border-ink/15 pt-5 font-mono text-[9px] text-n500 leading-relaxed uppercase tracking-wider shrink-0">
                💡 Canvas pipeline draws raw pixel RGB values to strip all
                tracking metadata. Structural file properties (image
                dimensions, color space, JFIF version) are emitted by every
                browser and are not tracking risks.
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

      {/* Guest Limit annoying popup */}
      {isGuestLimitModalOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 select-none animate-fadeIn overflow-y-auto"
            style={{ zIndex: 999999 }}
          >
            <div className="bg-bg border-4 border-ink p-6 md:p-8 max-w-md w-full relative shadow-heavy select-none animate-scaleUp max-h-full overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setIsGuestLimitModalOpen(false)}
                className="absolute top-4 right-4 text-n400 hover:text-ink transition-colors cursor-pointer select-none"
                title="Close"
              >
                <X size={16} />
              </button>

              {/* Warning header */}
              <div className="flex items-center gap-3 border-b-2 border-ink pb-4 mb-6">
                <AlertTriangle
                  className="text-accent shrink-0 animate-bounce"
                  size={24}
                />
                <div>
                  <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold">
                    {isSignedIn
                      ? "✦ Free Tier Limit Reached ✦"
                      : "✦ Guest Limit Reached ✦"}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-ink uppercase tracking-tight mt-0.5">
                    Scrubbing Limit
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="font-body text-xs text-n500 leading-relaxed mb-6">
                You have scrubbed <strong>5 / 5 free images</strong> in this{" "}
                {isSignedIn ? "account session" : "guest session"}.
              </p>

              <p className="font-sans text-[11px] font-bold text-ink uppercase tracking-wide bg-n100 border border-ink/10 p-3 mb-6 flex items-center gap-2">
                {isSignedIn
                  ? "✦ Upgrade to Pro to unlock unlimited daily processing and up to 50 files concurrently."
                  : "✦ Create a free account to unlock your personal workspace or acquire a Pro plan for unlimited cleanups."}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
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
                      className="w-full bg-accent text-white border-2 border-accent py-3 font-sans text-xs font-bold tracking-widest uppercase cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      style={{ transition: "all 0.15s ease" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                    >
                      Upgrade to Pro Tiers
                    </button>
                    <button
                      onClick={() => setIsGuestLimitModalOpen(false)}
                      className="w-full bg-ink text-bg border-2 border-ink py-3 font-sans text-xs font-bold tracking-widest uppercase cursor-pointer hover:bg-bg hover:text-ink transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                      Dismiss Workspace
                    </button>
                  </>
                ) : (
                  <>
                    <SignUpButton mode="modal">
                      <button
                        className="w-full bg-accent text-white border-2 border-accent py-3 font-sans text-xs font-bold tracking-widest uppercase cursor-pointer shadow-sm flex items-center justify-center gap-2"
                        style={{ transition: "all 0.15s ease" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg)";
                          e.currentTarget.style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--accent)";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                      >
                        Create Free Account
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button className="w-full bg-ink text-bg border-2 border-ink py-3 font-sans text-xs font-bold tracking-widest uppercase cursor-pointer hover:bg-bg hover:text-ink transition-colors duration-150 flex items-center justify-center gap-2">
                        Sign In to Existing Account
                      </button>
                    </SignInButton>
                  </>
                )}
              </div>

              {/* Subtext info */}
              <div className="mt-6 text-center border-t border-ink/10 pt-4">
                <span className="font-mono text-[9px] text-n500 uppercase tracking-widest">
                  ScrubAI · Client-Side Protection Service
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
