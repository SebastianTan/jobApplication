/**
 * JobDescriptionModal — edit job posting text for one application (from list button).
 *
 * Separate from ApplicationForm so users can update descriptions without opening
 * the full edit form. Uses the same JobDescriptionEditor + persistJobDescription
 * as the create/edit flow.
 */
"use client";

import { useState } from "react";
import {
  JobDescriptionEditor,
  persistJobDescription,
} from "@/components/job-description-editor";
import type { ApplicationJson } from "@/lib/types";

type JobDescriptionModalProps = {
  application: ApplicationJson | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function JobDescriptionModal({
  application,
  open,
  onClose,
  onUpdated,
}: JobDescriptionModalProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !application) return null;

  const app = application; // narrow type for handlers below (application is non-null here)

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await persistJobDescription(app.id, content, app.hasJobDescription);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!app.hasJobDescription) {
      setContent("");
      return;
    }
    const confirmed = window.confirm("Remove the job description file?");
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      await persistJobDescription(app.id, "", true);
      setContent("");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Job description
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {app.role} at {app.company}
          </p>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          {error && (
            <p className="mb-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <JobDescriptionEditor
            applicationId={app.id}
            value={content}
            onChange={setContent}
            hasDescription={app.hasJobDescription}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          {app.hasJobDescription && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="mr-auto rounded-lg px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              Remove file
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save to file"}
          </button>
        </div>
      </div>
    </div>
  );
}
