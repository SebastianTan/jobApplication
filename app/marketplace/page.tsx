/**
 * Marketplace page — shows a grid of placeholder images with blurred/locked content.
 *
 * First two rows are fully visible; subsequent rows are blurred with a lock overlay.
 * No authentication check required — always shows locked state.
 */
"use client";

import { useState } from "react";

export default function Marketplace() {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const totalImages = 30; // 6 columns x 5 rows
  const visibleRows = 2; // First 2 rows are visible
  const visibleImages = visibleRows * 6; // 12 images

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-[800px]">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Marketplace
          </h1>
          <button
            onClick={() => setBlurEnabled(!blurEnabled)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            {blurEnabled ? "Disable blur" : "Enable blur"}
          </button>
        </div>

        <div className="relative grid grid-cols-6 gap-4">
          {Array.from({ length: totalImages }).map((_, index) => {
            const isBlurred = blurEnabled && index >= visibleImages;
            return (
              <div
                key={index}
                className="relative aspect-square w-full"
              >
                {/* Placeholder image */}
                <img
                  src="https://placehold.co/200x200/333333/808080?text=T-Shirt"
                  alt="T-Shirt"
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
            );
          })}

          {/* Single lock overlay for blurred section */}
          {blurEnabled && (
            <div className="absolute left-1/2 -translate-x-1/2 w-screen top-[40%] flex flex-col items-center justify-start pt-8 backdrop-blur-sm blur-overlay">
              <div className="flex flex-col items-center">
                <svg
                  className="mb-2 h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-sm font-medium text-zinc-100">
                  Login to see more
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
