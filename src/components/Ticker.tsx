"use client";

import React from "react";

export function Ticker() {
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
    <div className="bg-ink text-bg overflow-hidden whitespace-nowrap py-2.5 border-b border-ink select-none" role="marquee" aria-label="ScrubAI metrics ticker">
      <div className="ticker-track inline-flex">
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
              <span className="text-bg/30 mx-2 text-[10px] self-center">///</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
