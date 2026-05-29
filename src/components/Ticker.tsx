"use client";

import React, { useState } from "react";

type TickerSpeed = "slow" | "normal" | "hyper";

const SPEED_CLASS: Record<TickerSpeed, string> = {
  slow: "ticker-track--slow",
  normal: "",
  hyper: "ticker-track--hyper",
};

const SPEED_LABEL: Record<TickerSpeed, string> = {
  slow: "Slow",
  normal: "Normal",
  hyper: "Hyper",
};

interface TickerProps {
  /** Optional initial scroll speed. Defaults to "normal". */
  defaultSpeed?: TickerSpeed;
}

export function Ticker({ defaultSpeed = "normal" }: TickerProps) {
  const [speed, setSpeed] = useState<TickerSpeed>(defaultSpeed);

  const items = [
    { key: "Files Scrubbed", val: "12.4M+", badge: "▲ +18% this week" },
    { key: "AI Tag Suppression", val: "100%", badge: "▲ Completely Clean" },
    { key: "Local Processing Speed", val: "< 50ms", badge: "▲ Ultra-fast" },
    { key: "Privacy Integrity", val: "100%", badge: "▲ Zero Server Uploads" },
    { key: "Algorithmic Boost", val: "+35%", badge: "▲ Bypassed Suppression" },
    { key: "Active Creators", val: "85k+", badge: "▲ Growing Daily" },
  ];

  // Duplicate list to achieve a seamless scrolling wrap
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div
      className="relative bg-ink text-bg overflow-hidden whitespace-nowrap py-2.5 border-b border-ink select-none"
      role="marquee"
      aria-label="ScrubAI metrics ticker"
    >
      <div className={`ticker-track inline-flex ${SPEED_CLASS[speed]}`}>
        {repeatedItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="inline-flex items-center gap-3.5 px-7 font-mono text-[11px] tracking-wider uppercase border-r border-bg/10">
              <span className="text-n400">{item.key}:</span>
              <span className="font-bold text-bg">{item.val}</span>
              <span className="bg-accent text-white text-[9px] px-1.5 py-0.5 font-bold tracking-widest shrink-0">
                {item.badge}
              </span>
            </div>
            {idx < repeatedItems.length - 1 && (
              <span className="text-bg/30 mx-2 text-[10px] self-center">{"///"}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Speed control — sits at the right edge, fades into the ticker tape */}
      <div
        className="hidden md:flex absolute right-0 top-0 bottom-0 items-center gap-1 pr-4 pl-8 bg-linear-to-l from-ink via-ink/95 to-transparent"
        role="group"
        aria-label="Ticker scroll speed"
      >
        {(Object.keys(SPEED_CLASS) as TickerSpeed[]).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className={`font-mono text-[8px] uppercase tracking-widest px-2 py-1 border transition-colors cursor-pointer ${speed === s
              ? "border-accent bg-accent text-white font-bold"
              : "border-bg/20 text-bg/60 hover:border-bg/60 hover:text-bg"
              }`}
            title={`Set ticker speed to ${SPEED_LABEL[s]}`}
          >
            {SPEED_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
