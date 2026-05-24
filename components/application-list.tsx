/**
 * ApplicationList — renders the list of job application cards.
 *
 * This component does not fetch data or own filter state. The parent (Dashboard)
 * passes `applications` and callback props (onEdit, onDelete, onViewDescription).
 * When the user clicks a button, we call the parent's function with that app.
 */
"use client";

import type { ApplicationJson } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

// Props type documents what the parent must pass in.
type ApplicationListProps = {
  applications: ApplicationJson[];
  emptyMessage?: string; // optional custom text when date filter hides everything
  onEdit: (app: ApplicationJson) => void;
  onDelete: (app: ApplicationJson) => void;
  onViewDescription: (app: ApplicationJson) => void;
};

export function ApplicationList({
  applications,
  emptyMessage,
  onEdit,
  onDelete,
  onViewDescription,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          {emptyMessage ? "No matches" : "No applications yet"}
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage ??
            "Add your first job application to start tracking your search."}
        </p>
      </div>
    );
  }

  // .map() turns the array into one <li> per application (common React pattern).
  return (
    <ul className="space-y-3">
      {applications.map((app) => (
        <li
          key={app.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {app.company}
                </h3>
                <StatusBadge status={app.status} />
                {app.hasJobDescription && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300">
                    Description file
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{app.role}</p>
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {app.appliedAt && (
                  <div>
                    <dt className="sr-only">Applied</dt>
                    <dd>Applied {formatDate(app.appliedAt)}</dd>
                  </div>
                )}
                {app.location && (
                  <div>
                    <dt className="sr-only">Location</dt>
                    <dd>{app.location}</dd>
                  </div>
                )}
                {app.jobUrl && (
                  <div>
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                    >
                      View posting
                    </a>
                  </div>
                )}
              </dl>
              {app.notes && (
                <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {app.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
              <button
                type="button"
                onClick={() => onViewDescription(app)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
              >
                {app.hasJobDescription ? "Description" : "Add description"}
              </button>
              <button
                type="button"
                onClick={() => onEdit(app)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(app)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
