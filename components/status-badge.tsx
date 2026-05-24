/** StatusBadge — read-only colored label for one status (used inside list cards). */
import type { ApplicationStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/status-styles";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
