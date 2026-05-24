/**
 * Dashboard — the main screen of the app.
 *
 * React basics used here:
 * - "use client" = this file runs in the browser (can use useState, fetch, clicks).
 * - useState = variables that, when updated, cause React to re-render the UI.
 * - useEffect = run side effects (like fetch) when something changes (e.g. filter).
 * - useMemo = derive a list from state without recomputing unless inputs change.
 * - Props = data/callbacks passed down to child components (ApplicationList, modals).
 *
 * Pattern: Dashboard holds "global" UI state; children are mostly presentational
 * and call back with onEdit, onDelete, etc. This is called "lifting state up."
 */
"use client";
// React components 
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ApplicationJson, ApplicationStatus } from "@/lib/types";
import { ApplicationList } from "@/components/application-list";
import { ApplicationModal } from "@/components/application-modal";
import type { ApplicationFormValues } from "@/components/application-form";
import { StatusFilter } from "@/components/status-filter";
import { persistJobDescription } from "@/components/job-description-editor";
import { JobDescriptionModal } from "@/components/job-description-modal";
import { DateControls } from "@/components/date-controls";
import {
  applyDateFilterAndSort,
  defaultDateFilter,
  type DateFilterState,
  type DateSortField,
  type SortDirection,
} from "@/lib/application-filters";

//Payload of job descriptions
function buildPayload(values: ApplicationFormValues) {
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    status: values.status,
    appliedAt: values.appliedAt || undefined,
    jobUrl: values.jobUrl || undefined,
    location: values.location || undefined,
    notes: values.notes || undefined,
  };
}

async function parseError(res: Response): Promise<string> {
  const data: unknown = await res.json().catch(() => null);
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  }
  return `Request failed (${res.status})`;
}

export function Dashboard() {
  // --- State: each useState pair is [current value, setter function] ---
  const [applications, setApplications] = useState<ApplicationJson[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationJson | null>(null); // null = create, object = edit
  const [descriptionApp, setDescriptionApp] = useState<ApplicationJson | null>(
    null,
  ); // which app's job description modal is open (null = closed)
  const [dateFilter, setDateFilter] = useState<DateFilterState>(defaultDateFilter);
  const [sortField, setSortField] = useState<DateSortField>("appliedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Client-side filter/sort on the already-fetched list (no extra API call).
  const displayedApplications = useMemo(
    () =>
      applyDateFilterAndSort(
        applications,
        dateFilter,
        sortField,
        sortDirection,
      ),
    [applications, dateFilter, sortField, sortDirection],
  );

  const hasActiveDateFilter = Boolean(dateFilter.from || dateFilter.to);

  /** Refetch the list from the server (after create, edit, delete, or description save). */
  async function loadApplications(filter: ApplicationStatus | "ALL" = statusFilter) {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await fetch(`/api/applications${params}`);
      if (!res.ok) throw new Error(await parseError(res));
      const data = (await res.json()) as { applications: ApplicationJson[] };
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  // When statusFilter changes, fetch applications again.
  // useEffect runs after render; the cleanup (return) avoids setting state if unmounted.
  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const params =
          statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
        const res = await fetch(`/api/applications${params}`);
        if (!res.ok) throw new Error(await parseError(res));
        const data = (await res.json()) as { applications: ApplicationJson[] };
        if (active) setApplications(data.applications);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(app: ApplicationJson) {
    setEditing(app);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  /** Passed to ApplicationModal → ApplicationForm. Creates or updates, then saves job description file. */
  async function handleSubmit(values: ApplicationFormValues) {
    const payload = buildPayload(values);
    let applicationId: string;
    let hadDescription = false;

    if (editing) {
      const res = await fetch(`/api/applications/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res));
      applicationId = editing.id;
      hadDescription = editing.hasJobDescription;
    } else {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res));
      const data = (await res.json()) as { application: ApplicationJson };
      applicationId = data.application.id;
      hadDescription = false;
    }

    await persistJobDescription(
      applicationId,
      values.jobDescription,
      hadDescription,
    );

    closeModal();
    await loadApplications();
  }

  async function handleDelete(app: ApplicationJson) {
    const confirmed = window.confirm(
      `Delete application for ${app.role} at ${app.company}?`,
    );
    if (!confirmed) return;

    const res = await fetch(`/api/applications/${app.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(await parseError(res));
      return;
    }
    await loadApplications();
  }

  // JSX below describes what appears on screen. <>...</> is a Fragment (no extra DOM node).
  return (
    <>
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Job Application Tracker
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Track companies, roles, and status through your job search.
              </p>
            </div>
            <Link
              href="/backups"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Backups
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Controlled component: parent owns value; child reports changes via onChange */}
            <StatusFilter
              value={statusFilter}
              onChange={(next) => {
                setStatusFilter(next);
              }}
            />
            <button
              type="button"
              onClick={openCreate}
              className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Add application
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl flex-1 space-y-4 px-4 py-8 sm:px-6">
        {error && (
          <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        {!loading && applications.length > 0 && (
          <DateControls
            filter={dateFilter}
            onFilterChange={setDateFilter}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
          />
        )}
        {loading ? (
          <p className="text-center text-sm text-zinc-500">Loading applications…</p>
        ) : (
          <>
            {!loading && applications.length > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {displayedApplications.length} of {applications.length}{" "}
                application{applications.length === 1 ? "" : "s"}
              </p>
            )}
            <ApplicationList
              applications={displayedApplications}
              emptyMessage={
                hasActiveDateFilter && applications.length > 0
                  ? "No applications match this applied date range. Try widening the range or including entries without an applied date."
                  : undefined
              }
              onEdit={openEdit}
              onDelete={handleDelete}
              onViewDescription={setDescriptionApp}
            />
          </>
        )}
      </main>

      {/* Modals stay mounted in the tree but return null when open={false} */}
      <ApplicationModal
        open={modalOpen}
        title={editing ? "Edit application" : "Add application"}
        initial={editing}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* key resets modal internal state when switching to a different application */}
      <JobDescriptionModal
        key={descriptionApp?.id ?? "closed"}
        application={descriptionApp}
        open={descriptionApp !== null}
        onClose={() => setDescriptionApp(null)}
        onUpdated={() => loadApplications()}
      />
    </>
  );
}
