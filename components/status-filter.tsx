/**
 * StatusFilter — chip buttons to filter the list by application status.
 *
 * No "use client" needed here because Dashboard (a client component) imports this.
 * Fully controlled: parent passes value + onChange (no internal filter state).
 */
import type { ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/types";

type StatusFilterProps = {
  value: ApplicationStatus | "ALL";
  onChange: (value: ApplicationStatus | "ALL") => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        label="All"
        active={value === "ALL"}
        onClick={() => onChange("ALL")}
      />
      {APPLICATION_STATUSES.map((status) => (
        <FilterChip
          key={status}
          label={STATUS_LABELS[status]}
          active={value === status}
          onClick={() => onChange(status)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}
