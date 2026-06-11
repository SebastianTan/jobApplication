/**
 * DateControls — filter by applied date range and choose sort field/order.
 *
 * All state lives in Dashboard; this component only renders inputs and calls
 * onFilterChange / onSortFieldChange / onSortDirectionChange. Filtering logic
 * is in lib/application-filters.ts (applyDateFilterAndSort).
 */
import type { DateFilterState, DateSortField, SortDirection } from "@/lib/application-filters";

const selectClass =
  "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 min-w-[140px]";

const inputClass =
  "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500";

type DateControlsProps = {
  filter: DateFilterState;
  onFilterChange: (filter: DateFilterState) => void;
  sortField: DateSortField;
  onSortFieldChange: (field: DateSortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
};

export function DateControls({
  filter,
  onFilterChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
}: DateControlsProps) {
  const hasRange = Boolean(filter.from || filter.to);

  function clearDates() {
    onFilterChange(defaultDateFilterFromProps(filter));
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Date filter & sort
        </p>
        {hasRange && (
          <button
            type="button"
            onClick={clearDates}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Applied from
          </span>
          <input
            type="date"
            className={inputClass}
            value={filter.from}
            onChange={(e) =>
              onFilterChange({ ...filter, from: e.target.value })
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Applied to
          </span>
          <input
            type="date"
            className={inputClass}
            value={filter.to}
            min={filter.from || undefined}
            onChange={(e) => onFilterChange({ ...filter, to: e.target.value })}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 min-w-[80px] inline-block">
            Sort by
          </span> 
          <select
            className={selectClass}
            value={sortField}
            onChange={(e) =>
              onSortFieldChange(e.target.value as DateSortField)
            }
          >
            <option value="appliedAt">Applied date</option>
            <option value="updatedAt">Last updated</option>
            <option value="createdAt">Date added</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 min-w-[80px] inline-block">
            Order
          </span>
    
          <select
            className={selectClass}
            value={sortDirection}
            onChange={(e) =>
              onSortDirectionChange(e.target.value as SortDirection)
            }
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
      </div>

      {hasRange && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={filter.includeNoAppliedDate}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                includeNoAppliedDate: e.target.checked,
              })
            }
            className="rounded border-zinc-300 dark:border-zinc-600"
          />
          Include applications without an applied date
        </label>
      )}
    </div>
  );
}

function defaultDateFilterFromProps(filter: DateFilterState): DateFilterState {
  return {
    from: "",
    to: "",
    includeNoAppliedDate: filter.includeNoAppliedDate,
  };
}
