/**
 * ApplicationForm — create/edit form for one job application.
 *
 * - Local state (`values`) holds what the user types (controlled inputs).
 * - onSubmit is provided by the parent; we don't call the API directly here.
 * - JobDescriptionEditor loads/saves description text via separate API routes.
 */
"use client";

import { useState } from "react";
import type { ApplicationJson, ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/types";
import { JobDescriptionEditor } from "@/components/job-description-editor";

export type ApplicationFormValues = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobUrl: string;
  location: string;
  notes: string;
  jobDescription: string;
};

const emptyValues: ApplicationFormValues = {
  company: "",
  role: "",
  status: "APPLIED",
  appliedAt: "",
  jobUrl: "",
  location: "",
  notes: "",
  jobDescription: "",
};

function toFormValues(app?: ApplicationJson | null): ApplicationFormValues {
  if (!app) return emptyValues;
  return {
    company: app.company,
    role: app.role,
    status: app.status,
    appliedAt: app.appliedAt ? app.appliedAt.slice(0, 10) : "",
    jobUrl: app.jobUrl ?? "",
    location: app.location ?? "",
    notes: app.notes ?? "",
    jobDescription: "",
  };
}

type ApplicationFormProps = {
  initial?: ApplicationJson | null;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  onCancel: () => void;
};

export function ApplicationForm({
  initial,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  // Lazy initializer () => ... runs once when the form mounts to fill fields from `initial`.
  const [values, setValues] = useState<ApplicationFormValues>(() =>
    toFormValues(initial),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // stop browser full-page reload on submit
    setError(null);

    if (!values.company.trim() || !values.role.trim()) {
      setError("Company and role are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Controlled input: value comes from state; onChange updates state → React re-renders */}
        <Field label="Company" required>
          <input
            className={inputClass}
            value={values.company}
            onChange={(e) => setValues({ ...values, company: e.target.value })}
            placeholder="Acme Corp"
            maxLength={200}
          />
        </Field>
        <Field label="Role" required>
          <input
            className={inputClass}
            value={values.role}
            onChange={(e) => setValues({ ...values, role: e.target.value })}
            placeholder="Software Engineer"
            maxLength={200}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            className={inputClass}
            value={values.status}
            onChange={(e) =>
              setValues({
                ...values,
                status: e.target.value as ApplicationStatus,
              })
            }
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Applied date">
          <input
            type="date"
            className={inputClass}
            value={values.appliedAt}
            onChange={(e) =>
              setValues({ ...values, appliedAt: e.target.value })
            }
          />
        </Field>
      </div>

      <Field label="Job posting URL">
        <input
          type="url"
          className={inputClass}
          value={values.jobUrl}
          onChange={(e) => setValues({ ...values, jobUrl: e.target.value })}
          placeholder="https://..."
        />
      </Field>

      <Field label="Location">
        <input
          className={inputClass}
          value={values.location}
          onChange={(e) => setValues({ ...values, location: e.target.value })}
          placeholder="Remote, San Francisco, ..."
          maxLength={200}
        />
      </Field>

      <Field label="Notes">
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
          placeholder="Interview dates, recruiter name, etc."
          maxLength={5000}
        />
      </Field>

      <JobDescriptionEditor
        applicationId={initial?.id ?? null}
        value={values.jobDescription}
        onChange={(jobDescription) => setValues({ ...values, jobDescription })}
        hasDescription={initial?.hasJobDescription}
      />

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : initial ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}

/** Small layout helper: label + whatever input/textarea you pass as children */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500";
