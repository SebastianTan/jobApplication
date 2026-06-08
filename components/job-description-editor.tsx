/**
 * JobDescriptionEditor — textarea for markdown job description stored on disk.
 *
 * When applicationId is set, useEffect fetches existing file content once.
 * persistJobDescription (exported) is called by Dashboard or JobDescriptionModal
 * to PUT or DELETE via /api/applications/[id]/job-description.
 */
"use client";

import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500";

type JobDescriptionEditorProps = {
  applicationId: string | null;
  value: string;
  onChange: (value: string) => void;
  hasDescription?: boolean;
};

export function JobDescriptionEditor({
  applicationId,
  value,
  onChange,
  hasDescription = false,
}: JobDescriptionEditorProps) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch file content when we know which application we're editing.
  useEffect(() => {
    if (!applicationId) return;

    let active = true; // ignore stale responses if user closes modal quickly

    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/applications/${applicationId}/job-description`,
        );
        if (!res.ok) {
          throw new Error(`Failed to load (${res.status})`);
        }
        const data = (await res.json()) as {
          content: string | null;
          hasDescription: boolean;
        };
        if (active && data.hasDescription && data.content) {
          onChange(data.content);
        }
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load description",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // Load once per application; onChange is stable enough from parent state setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid refetch on every keystroke
  }, [applicationId]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Job description
        </span>
        {hasDescription && applicationId && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            Saved on disk
          </span>
        )}
      </div>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading description…</p>
      ) : (
        <textarea
          className={`${inputClass} min-h-15 resize-y font-mono text-xs leading-relaxed`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the job posting, requirements, responsibilities…"
          disabled={loading}
        />
      )}
      {loadError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{loadError}</p>
      )}
    </div>
  );
}

/** Shared save/remove logic — not a React component, just an async helper used by parents. */
export async function persistJobDescription(
  applicationId: string,
  content: string,
  hadDescription: boolean,
): Promise<void> {
  const trimmed = content.trim();

  if (!trimmed) {
    if (!hadDescription) return;
    const res = await fetch(
      `/api/applications/${applicationId}/job-description`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const data: unknown = await res.json().catch(() => null);
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : `Failed to remove description (${res.status})`;
      throw new Error(message);
    }
    return;
  }

  const res = await fetch(
    `/api/applications/${applicationId}/job-description`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    },
  );

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null);
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Failed to save description (${res.status})`;
    throw new Error(message);
  }
}
