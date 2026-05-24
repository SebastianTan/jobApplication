import type { ApplicationJson } from "@/lib/types";

export type DateSortField = "appliedAt" | "updatedAt" | "createdAt";
export type SortDirection = "desc" | "asc";

export type DateFilterState = {
  from: string;
  to: string;
  includeNoAppliedDate: boolean;
};

export const defaultDateFilter: DateFilterState = {
  from: "",
  to: "",
  includeNoAppliedDate: true,
};

function startOfDay(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function endOfDay(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function appliedTimestamp(app: ApplicationJson): number | null {
  if (!app.appliedAt) return null;
  return new Date(app.appliedAt).getTime();
}

function fieldTimestamp(
  app: ApplicationJson,
  field: DateSortField,
): number | null {
  if (field === "appliedAt") return appliedTimestamp(app);
  return new Date(app[field]).getTime();
}

export function filterByAppliedDate(
  applications: ApplicationJson[],
  filter: DateFilterState,
): ApplicationJson[] {
  const hasRange = Boolean(filter.from || filter.to);
  if (!hasRange) return applications;

  const fromMs = filter.from ? startOfDay(filter.from) : null;
  const toMs = filter.to ? endOfDay(filter.to) : null;

  return applications.filter((app) => {
    const applied = appliedTimestamp(app);
    if (applied === null) {
      return filter.includeNoAppliedDate;
    }
    if (fromMs !== null && applied < fromMs) return false;
    if (toMs !== null && applied > toMs) return false;
    return true;
  });
}

export function sortApplications(
  applications: ApplicationJson[],
  field: DateSortField,
  direction: SortDirection,
): ApplicationJson[] {
  const sorted = [...applications].sort((a, b) => {
    const aTime = fieldTimestamp(a, field);
    const bTime = fieldTimestamp(b, field);

    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;

    return direction === "desc" ? bTime - aTime : aTime - bTime;
  });

  return sorted;
}

export function applyDateFilterAndSort(
  applications: ApplicationJson[],
  filter: DateFilterState,
  sortField: DateSortField,
  sortDirection: SortDirection,
): ApplicationJson[] {
  return sortApplications(
    filterByAppliedDate(applications, filter),
    sortField,
    sortDirection,
  );
}
