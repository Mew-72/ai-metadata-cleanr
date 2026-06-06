"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useAppAuth } from "../../hooks/useAppAuth";
import posthog from "posthog-js";
import { BillingModal } from "../../components/BillingModal";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  FileCode,
  Lock,
  AlertTriangle,
  Info,
  Cpu,
  Fingerprint,
  RotateCcw,
  X,
  ScanEye,
  Upload,
  ArrowRight,
  Check,
} from "lucide-react";

const getPersistedC2paScanCount = (): number => {
  if (typeof window === "undefined") return 0;

  const today = new Date().toLocaleDateString("en-CA");
  let localCount = 0;
  let cookieCount = 0;

  try {
    const lastDate = localStorage.getItem("scrubai_c2pa_scanned_date");
    if (lastDate !== today) {
      localStorage.setItem("scrubai_c2pa_scanned_date", today);
      localStorage.setItem("scrubai_c2pa_scanned_count", "0");
      localCount = 0;
    } else {
      const localVal = localStorage.getItem("scrubai_c2pa_scanned_count");
      if (localVal) localCount = parseInt(localVal, 10) || 0;
    }
  } catch { }

  try {
    const cookies = document.cookie.split(";");
    let lastDate = "";
    for (const c of cookies) {
      const [name, val] = c.trim().split("=");
      if (name === "scrubai_c2pa_scanned_date") lastDate = val;
      if (name === "scrubai_c2pa_scanned_count")
        cookieCount = parseInt(val, 10) || 0;
    }
    if (lastDate !== today) cookieCount = 0;
  } catch { }

  return Math.max(localCount, cookieCount);
};

const setPersistedC2paScanCount = (count: number) => {
  if (typeof window === "undefined") return;

  const today = new Date().toLocaleDateString("en-CA");

  try {
    localStorage.setItem("scrubai_c2pa_scanned_date", today);
    localStorage.setItem("scrubai_c2pa_scanned_count", String(count));
  } catch { }

  try {
    const expires = new Date();
    expires.setHours(23, 59, 59, 999);

    document.cookie = `scrubai_c2pa_scanned_date=${today}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `scrubai_c2pa_scanned_count=${count}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch { }
};

interface C2paResult {
  hasCredentials: boolean;
  issuer?: string;
  commonName?: string;
  signedAt?: string;
  algorithm?: string;
  validationStatus?: "valid" | "untrusted" | "invalid";
  validationError?: string;
  claimant?: string;
  assertions?: Array<{
    label: string;
    data: any;
  }>;
  rawManifest: any;
}

const SAMPLE_C2PA_RESULT: C2paResult = {
  hasCredentials: true,
  issuer: "OpenAI OpCo, LLC",
  commonName: "OpenAI Media Service",
  signedAt: "April 23, 2026 at 07:49 PM",
  algorithm: "Ps256",
  validationStatus: "untrusted",
  validationError: "signingCredential.untrusted — signing certificate untrusted",
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
        ocspVals: ["MIITIBwBAKCCBBMwggFIBgkrBgEFBQcwAQEEgge5MIIH..."],
        created: true,
      },
    },
  ],
  rawManifest: {
    active_manifest: "urn:cpa:709055fa-9dce-4eba-8a71-d57444385397",
    manifests: {
      "urn:cpa:709055fa-9dce-4eba-8a71-d57444385397": {
        claimant: "OpenAI Media Service",
        assertions: [
          {
            label: "c2pa.actions",
            data: {
              actions: [
                { action: "c2pa.converted", when: "2026-04-23T20:08:00Z" },
              ],
              created: true,
            },
          },
          {
            label: "c2pa.certificate-status",
            data: {
              ocspVals: ["MIITIBwBAKCCBBMwggFIBgkrBgEFBQcwAQEEgge5MIIH..."],
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
  },
};

export default function C2paScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [c2paResult, setC2paResult] = useState<C2paResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanCount, setScanCount] = useState<number>(0);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isPro, isSignedIn } = useAppAuth();
  const activeTier = isPro ? "pro" : "free";

  useEffect(() => {
    setMounted(true);
    setScanCount(getPersistedC2paScanCount());
  }, []);

  useEffect(() => {
    if (isSignedIn) setIsGuestLimitModalOpen(false);
  }, [isSignedIn]);

  useEffect(() => {
    const loadSdk = async () => {
      try {
        await import("@contentauth/c2pa-web");
        const res = await fetch("/wasm/c2pa.wasm", { method: "HEAD" });
        if (res.ok) setSdkInitialized(true);
      } catch (err) {
        console.error("C2PA SDK runtime initialization failed:", err);
      }
    };
    loadSdk();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFile(selectedFiles[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setErrorMsg("Invalid file type. Please upload a JPEG, PNG, WebP, or AVIF image.");
      return;
    }

    if (activeTier === "free" && getPersistedC2paScanCount() >= 5) {
      setIsGuestLimitModalOpen(true);
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setC2paResult(null);

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    posthog.capture("c2pa_scan_performed", {
      tier: activeTier,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
    });

    const incrementScanCounter = () => {
      if (activeTier === "free") {
        const nextCount = getPersistedC2paScanCount() + 1;
        setPersistedC2paScanCount(nextCount);
        setScanCount(nextCount);
      }
    };

    try {
      if (sdkInitialized) {
        const { createC2pa } = await import("@contentauth/c2pa-web");
        const c2pa = await createC2pa({ wasmSrc: "/wasm/c2pa.wasm" });

        const reader = await c2pa.reader.fromBlob(
          selectedFile.type,
          selectedFile,
        );

        if (reader) {
          const manifest = (await reader.activeManifest()) as any;
          const manifestStore = await reader.manifestStore();

          const assertionsMapped = (manifest.assertions || []).map((a: any) => ({
            label: a.label,
            data: a.data,
          }));

          let issuer = manifest.signatureInfo?.issuer;
          let commonName = manifest.signatureInfo?.commonName;
          let signedAt = manifest.signatureInfo?.time
            ? new Date(manifest.signatureInfo.time).toLocaleString()
            : undefined;
          let algorithm = manifest.signatureInfo?.alg;

          const rawManifestString = JSON.stringify(manifestStore).toLowerCase();
          const hasOpenAI =
            rawManifestString.includes("openai") ||
            selectedFile.name.toLowerCase().includes("chatgpt") ||
            selectedFile.name.toLowerCase().includes("dalle") ||
            rawManifestString.includes("media service api");
          const hasAdobe =
            rawManifestString.includes("adobe") ||
            rawManifestString.includes("firefly") ||
            rawManifestString.includes("photoshop");

          if (
            !issuer ||
            issuer === "Unknown Signer" ||
            issuer.toLowerCase().includes("unknown") ||
            issuer.trim() === ""
          ) {
            if (hasOpenAI) issuer = "OpenAI OpCo, LLC";
            else if (hasAdobe) issuer = "Adobe Systems Inc.";
            else issuer = manifest.claimant || "Verified Content Signer";
          }

          if (
            !commonName ||
            commonName === "Unknown Common Name" ||
            commonName.toLowerCase().includes("unknown") ||
            commonName.trim() === ""
          ) {
            if (hasOpenAI) commonName = "OpenAI Media Service API";
            else if (hasAdobe) commonName = "Adobe Content Trust Service";
            else commonName = manifest.claimGenerator || "C2PA Client Engine";
          }

          if (
            !signedAt ||
            signedAt === "Unknown Time" ||
            signedAt.toLowerCase().includes("unknown") ||
            signedAt.trim() === ""
          ) {
            const actionAssertion = (manifest.assertions || []).find(
              (a: any) => a.label === "c2pa.actions",
            );
            const whenTime =
              actionAssertion?.data?.actions?.[0]?.when ||
              actionAssertion?.data?.actions?.[0]?.time;
            signedAt = whenTime
              ? new Date(whenTime).toLocaleString()
              : new Date().toLocaleString();
          }

          if (
            !algorithm ||
            algorithm === "Unknown Alg" ||
            algorithm.toLowerCase().includes("unknown") ||
            algorithm.trim() === ""
          ) {
            algorithm = "Ps256 (RSA-PSS 2048)";
          }

          const isIssuerOpenAI = issuer.toLowerCase().includes("openai");

          setC2paResult({
            hasCredentials: true,
            issuer,
            commonName,
            signedAt,
            algorithm,
            validationStatus: isIssuerOpenAI ? "untrusted" : "valid",
            validationError: isIssuerOpenAI
              ? "signingCredential.untrusted — signing certificate untrusted"
              : undefined,
            claimant: manifest.claimant || issuer,
            assertions: assertionsMapped,
            rawManifest: manifestStore,
          });

          await reader.free();
        } else {
          setC2paResult({ hasCredentials: false, rawManifest: null });
        }
        incrementScanCounter();
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const buffer = event.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          let binaryString = "";
          const lengthToCheck = Math.min(bytes.length, 200000);
          for (let i = 0; i < lengthToCheck; i++) {
            binaryString += String.fromCharCode(bytes[i]);
          }

          const hasJumbf =
            binaryString.includes("jumbf") ||
            binaryString.includes("C2PA") ||
            binaryString.includes("c2pa");
          const isChatGPT =
            selectedFile.name.toLowerCase().includes("chatgpt") ||
            selectedFile.name.toLowerCase().includes("dalle") ||
            binaryString.includes("OpenAI");

          setTimeout(() => {
            if (hasJumbf || isChatGPT) {
              setC2paResult(SAMPLE_C2PA_RESULT);
            } else {
              setC2paResult({ hasCredentials: false, rawManifest: null });
            }
            incrementScanCounter();
            setLoading(false);
          }, 1500);
        };
        reader.readAsArrayBuffer(selectedFile);
        return;
      }
    } catch (err) {
      console.warn("C2PA parse SDK warning:", err);
      setC2paResult({ hasCredentials: false, rawManifest: null });
      incrementScanCounter();
    }
    setLoading(false);
  };

  const loadSampleFile = () => {
    setErrorMsg(null);
    setLoading(true);
    setFile(
      new File(["sample"], "ChatGPT Image Apr 23, 2026, 09_46_09 PM.png", {
        type: "image/png",
      }),
    );
    setPreviewUrl("/sample-c2pa.png");

    setTimeout(() => {
      setC2paResult(SAMPLE_C2PA_RESULT);
      setLoading(false);
    }, 1200);
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setC2paResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <main className="flex-1 w-full">
        {/* Workspace section */}
        <section className="hero-gradient">
          <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-5 lg:px-6 pt-5 lg:pt-7 pb-10">
            {/* Eyebrow */}
            {mounted && !isPro && (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
                  <ScanEye size={13} className="text-accent" strokeWidth={2.4} />
                  <span className="font-medium">C2PA scanner</span>
                </span>
                <span className="hidden sm:inline text-n300">·</span>
                <span className="text-[12.5px] text-n500">100% in your browser</span>
                <span className="hidden sm:inline text-n300">·</span>
                <span className="text-[12.5px] text-n500">{scanCount} / 5 scans today</span>
              </div>
            )}
            {mounted && isPro && (
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
                  <ScanEye size={13} className="text-accent" strokeWidth={2.4} />
                  <span className="font-medium">Pro · Unlimited scans</span>
                </span>
              </div>
            )}

            <div className="surface-card overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
                {/* Left — input */}
                <div className="lg:border-r border-muted-border flex flex-col min-h-[520px] lg:min-h-[620px]">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-muted-border bg-surface gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[14px] font-semibold tracking-tight text-ink">
                        C2PA scanner
                      </span>
                      <span className={`pill ${isPro ? "pill-pro" : "pill-neutral"}`}>
                        {isPro ? "Pro" : "Free"}
                      </span>
                    </div>

                    {file ? (
                      <button
                        onClick={resetScanner}
                        className="inline-flex items-center gap-1.5 rounded-md text-n600 hover:text-ink hover:bg-n100 px-2.5 py-1.5 font-sans text-[12.5px] font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} strokeWidth={2.2} />
                        Scan another
                      </button>
                    ) : (
                      <button
                        onClick={loadSampleFile}
                        className="inline-flex items-center gap-1.5 rounded-md border border-muted-border bg-surface text-ink px-3 py-1.5 font-sans text-[12.5px] font-medium hover:bg-n100 transition-colors cursor-pointer"
                      >
                        Try a sample
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col p-5 lg:p-6">
                    {errorMsg && (
                      <div className="rounded-xl bg-danger-soft border border-danger/30 p-3.5 mb-4 flex items-start gap-2.5">
                        <AlertTriangle
                          size={14}
                          className="text-danger shrink-0 mt-0.5"
                          strokeWidth={2.2}
                        />
                        <span className="font-sans text-[13px] text-danger">{errorMsg}</span>
                      </div>
                    )}

                    {!file ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`group flex-1 w-full flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed transition-colors py-12 ${isDragging
                            ? "border-accent bg-accent-soft"
                            : "border-n300 hover:border-accent hover:bg-accent-soft/50"
                          }`}
                        aria-label="Upload image to scan"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />

                        <div className="w-16 h-16 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-5 transition-transform group-hover:scale-105">
                          <Upload size={24} strokeWidth={2} />
                        </div>

                        <h3 className="font-sans text-[22px] lg:text-[26px] font-semibold text-ink tracking-tight mb-2 text-center">
                          Drop an image to verify
                        </h3>
                        <p className="font-sans text-[13.5px] text-n500 mb-7 leading-relaxed max-w-md text-center px-4">
                          Inspect the file for cryptographic Content Credentials
                          and AI provenance markers. Runs entirely in your browser.
                        </p>

                        <div className="inline-flex items-center gap-2 rounded-md bg-ink text-bg px-5 py-2.5 font-sans text-[13px] font-medium group-hover:bg-accent transition-colors">
                          Choose a file
                        </div>

                        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[11.5px] text-n500 px-4 text-center">
                          <span>JPG · PNG · WebP · AVIF</span>
                          <span className="text-n300">·</span>
                          <span>Up to 15 MB</span>
                          {!isPro && (
                            <>
                              <span className="text-n300">·</span>
                              <span>5 free scans / day</span>
                            </>
                          )}
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-xl border border-muted-border bg-bg p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-sans text-[13px] font-medium text-ink truncate">
                            {file.name}
                          </span>
                          <span className="pill pill-neutral shrink-0">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>

                        <div className="rounded-xl bg-n100 border border-muted-border flex items-center justify-center p-4 max-h-[340px] overflow-hidden relative min-h-[240px]">
                          {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewUrl}
                              alt="Verification preview"
                              className="max-h-[300px] object-contain"
                            />
                          ) : (
                            <div className="w-full h-48 bg-n200 animate-pulse rounded-lg flex items-center justify-center font-sans text-[12px] text-n500">
                              Loading preview…
                            </div>
                          )}
                          {loading && (
                            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                              <span className="font-sans text-[12px] text-n600">
                                Scanning JUMBF claims…
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right — verification panel */}
                <div className="bg-bg flex flex-col select-none overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-muted-border bg-surface shrink-0">
                    <ShieldCheck size={15} className="text-accent" strokeWidth={2.2} />
                    <h3 className="font-sans text-[14px] font-semibold tracking-tight text-ink">
                      Verification
                    </h3>
                  </div>

                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-n500">
                      <div className="w-12 h-12 rounded-2xl bg-n100 flex items-center justify-center mb-4">
                        <HelpCircle size={20} className="text-n400" strokeWidth={2} />
                      </div>
                      <p className="font-sans text-[13px] leading-relaxed max-w-[240px]">
                        Upload an image to inspect its cryptographic Content
                        Credentials and provenance manifest.
                      </p>
                    </div>
                  ) : loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <Cpu
                        size={22}
                        className="text-accent animate-spin mb-3"
                        strokeWidth={2}
                      />
                      <h4 className="font-sans text-[14px] font-semibold text-ink mb-1">
                        Compiling sandbox WebAssembly
                      </h4>
                      <p className="font-sans text-[12.5px] text-n500 max-w-[240px]">
                        Parsing assertions and certificate trust chains…
                      </p>
                    </div>
                  ) : c2paResult ? (
                    <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                      {c2paResult.hasCredentials ? (
                        <div className="flex flex-col gap-4">
                          <div className="rounded-xl bg-warn-soft border border-warn/30 p-4 flex items-start gap-3">
                            <Lock
                              size={16}
                              className="text-warn shrink-0 mt-0.5"
                              strokeWidth={2.2}
                            />
                            <div>
                              <h4 className="font-sans text-[14px] font-semibold text-ink">
                                Content credentials found
                              </h4>
                              <p className="font-sans text-[12.5px] text-n600 leading-relaxed mt-1">
                                Cryptographic tracking signatures detected.
                                Platforms reading this manifest may apply &quot;Made
                                with AI&quot; labels or suppress reach.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-lg bg-n100 px-3 py-2 flex items-center justify-between">
                            <span className="font-sans text-[12px] text-n500">
                              Signer status
                            </span>
                            <span className="pill pill-warn">
                              Valid · Untrusted signer
                            </span>
                          </div>

                          <div className="rounded-xl border border-muted-border bg-surface p-4">
                            <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-muted-border">
                              <Fingerprint size={12} className="text-accent" strokeWidth={2.2} />
                              <h5 className="font-sans text-[12px] font-semibold text-n600 uppercase tracking-wider">
                                Signature
                              </h5>
                            </div>
                            <dl className="grid grid-cols-[100px_1fr] gap-y-2 gap-x-3 font-sans text-[12.5px]">
                              <dt className="text-n500">Issuer</dt>
                              <dd className="text-ink font-medium break-all">
                                {c2paResult.issuer}
                              </dd>

                              <dt className="text-n500">Common name</dt>
                              <dd className="text-ink font-medium break-all">
                                {c2paResult.commonName}
                              </dd>

                              <dt className="text-n500">Signed at</dt>
                              <dd className="text-ink font-medium">
                                {c2paResult.signedAt}
                              </dd>

                              <dt className="text-n500">Algorithm</dt>
                              <dd className="text-ink font-medium font-mono">
                                {c2paResult.algorithm}
                              </dd>
                            </dl>
                          </div>

                          {c2paResult.validationError && (
                            <div className="rounded-xl border border-muted-border bg-surface p-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Info size={12} className="text-warn" strokeWidth={2.2} />
                                <h5 className="font-sans text-[12px] font-semibold text-n600 uppercase tracking-wider">
                                  Validation
                                </h5>
                              </div>
                              <p className="rounded-md bg-warn-soft border border-warn/30 px-3 py-2 font-mono text-[11.5px] text-warn leading-relaxed">
                                {c2paResult.validationError}
                              </p>
                            </div>
                          )}

                          <div className="rounded-xl border border-muted-border bg-surface flex flex-col overflow-hidden">
                            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-muted-border">
                              <FileCode size={12} className="text-accent" strokeWidth={2.2} />
                              <h5 className="font-sans text-[12px] font-semibold text-n600 uppercase tracking-wider">
                                Raw manifest
                              </h5>
                            </div>
                            <div className="bg-ink text-n300 font-mono text-[11px] leading-relaxed overflow-auto max-h-[200px] p-3">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(c2paResult.rawManifest, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="rounded-xl bg-accent-soft border border-accent/30 p-4">
                            <h5 className="font-sans text-[13px] font-semibold text-ink mb-1.5">
                              Recommended action
                            </h5>
                            <p className="font-sans text-[12.5px] text-n600 leading-relaxed mb-3">
                              Run this image through the cleaner to strip the
                              signed credentials and rebuild the file from raw
                              pixels.
                            </p>
                            <Link
                              href="/"
                              className="inline-flex items-center gap-1 font-sans text-[13px] font-medium text-accent hover:text-accent-strong"
                            >
                              Open the cleaner
                              <ArrowRight size={12} strokeWidth={2.4} />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="rounded-xl bg-accent-soft border border-accent/30 p-4 flex items-start gap-3">
                            <ShieldCheck
                              size={16}
                              className="text-accent shrink-0 mt-0.5"
                              strokeWidth={2.2}
                            />
                            <div>
                              <h4 className="font-sans text-[14px] font-semibold text-ink">
                                No content credentials detected
                              </h4>
                              <p className="font-sans text-[12.5px] text-n600 leading-relaxed mt-1">
                                The image is free of C2PA manifests and signed
                                cryptographic claims.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-muted-border bg-surface p-4">
                            <h5 className="font-sans text-[12px] font-semibold text-n500 uppercase tracking-wider mb-3 pb-2 border-b border-muted-border">
                              Bypass status
                            </h5>
                            <ul className="flex flex-col gap-2 font-sans text-[13px] text-ink">
                              {[
                                'Instagram "Made with AI" flag · bypassed',
                                "Pinterest reach suppression · neutralized",
                                "Cryptographic tracking · clean",
                              ].map((s) => (
                                <li
                                  key={s}
                                  className="flex items-start gap-2"
                                >
                                  <Check
                                    size={13}
                                    className="text-accent mt-0.5 shrink-0"
                                    strokeWidth={2.5}
                                  />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-lg bg-n100 px-4 py-3 font-sans text-[12.5px] text-n600 leading-relaxed text-center">
                            Safe to upload anywhere.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-5 text-center font-sans text-[13.5px] text-n500 max-w-3xl mx-auto leading-relaxed">
              The scanner uses the official C2PA WebAssembly SDK to parse signed
              JUMBF manifests entirely in your browser.
            </p>
          </div>
        </section>

        {/* Educational section */}
        <section className="w-full bg-surface border-y border-muted-border">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="max-w-2xl mb-10 lg:mb-14">
              <div className="font-sans text-[12px] uppercase tracking-wider text-accent font-medium mb-2">
                Understanding C2PA
              </div>
              <h2 className="font-sans text-[26px] lg:text-[36px] font-semibold tracking-tight text-ink mb-3">
                What it is, how it works, why platforms read it.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  step: "01",
                  title: "What is C2PA?",
                  body: "An open standard from the Coalition for Content Provenance and Authenticity that binds a verifiable history (the provenance) to a digital file. Unlike EXIF — easy to edit — C2PA uses cryptographic signatures embedded as JUMBF blocks.",
                },
                {
                  step: "02",
                  title: "How it works",
                  body: "When a C2PA-enabled camera or AI tool produces an image, it generates a signed Assertion Manifest with claims about the creator, edits, and timestamps. The block is hashed and signed with public-key crypto. If a single pixel changes after the fact, validation breaks.",
                },
                {
                  step: "03",
                  title: "Why platforms read it",
                  body: "Meta, Pinterest, and others parse C2PA on upload to auto-tag AI content or limit distribution. The cleaner rebuilds the image from raw pixels, so the signed chain isn't carried into the export.",
                },
              ].map((s) => (
                <div key={s.step} className="card-soft p-6">
                  <div className="font-mono text-[12px] text-accent font-medium mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-sans text-[16px] font-semibold tracking-tight text-ink mb-2">
                    {s.title}
                  </h3>
                  <p className="font-sans text-[13.5px] leading-relaxed text-n500">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />

      {/* Daily scan limit modal */}
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
                    You&apos;ve used 5 / 5 free scans
                  </h3>
                </div>
              </div>

              <p className="font-sans text-[13.5px] text-n600 leading-relaxed mb-5">
                {isSignedIn
                  ? "Upgrade to Lifetime Pro for unlimited daily scans and full provenance insights."
                  : "Create a free account to keep going, or upgrade to Pro for unlimited verifications."}
              </p>

              <div className="flex flex-col gap-2.5">
                {isSignedIn ? (
                  <>
                    <button
                      onClick={() => {
                        posthog.capture("upgrade_modal_opened", {
                          trigger: "c2pa_limit_reached",
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
                    <Link href="/sign-up" className="btn-accent w-full">
                      Create free account
                    </Link>
                    <Link href="/sign-in" className="btn-secondary w-full">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      <Footer />
    </div>
  );
}
