/**
 * ApplicationModal — overlay dialog for add/edit.
 *
 * If open is false, we return null (nothing rendered). Otherwise we show a backdrop
 * and embed ApplicationForm. The form's key forces a fresh form when switching
 * between "new" and a specific application id.
 */
"use client";

import type { ApplicationJson } from "@/lib/types";
import {
  ApplicationForm,
  type ApplicationFormValues,
} from "@/components/application-form";

type ApplicationModalProps = {
  open: boolean;
  title: string;
  initial?: ApplicationJson | null;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
};

export function ApplicationModal({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: ApplicationModalProps) {
  if (!open) return null; // common React pattern: conditional render instead of CSS hide

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Click-outside-to-close: full-screen transparent button behind the dialog */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-dialog-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2
          id="application-dialog-title"
          className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {title}
        </h2>
        <ApplicationForm
          key={initial?.id ?? "new"} // remount form when editing a different row
          initial={initial}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
