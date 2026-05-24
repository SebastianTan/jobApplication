import type { ApplicationStatus } from "@/lib/types";

export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED:
    "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  SCREENING:
    "bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300",
  INTERVIEW:
    "bg-amber-500/15 text-amber-800 ring-amber-500/30 dark:text-amber-300",
  OFFER:
    "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  REJECTED:
    "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
  WITHDRAWN:
    "bg-zinc-500/15 text-zinc-700 ring-zinc-500/30 dark:text-zinc-300",
};
