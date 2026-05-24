"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Backup {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBackups() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/backups");
      if (!res.ok) throw new Error("Failed to load backups");
      const data = await res.json();
      setBackups(data.backups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load backups");
    } finally {
      setLoading(false);
    }
  }

  async function createBackup() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create backup");
      await loadBackups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create backup");
    } finally {
      setCreating(false);
    }
  }

  async function deleteBackup(filename: string) {
    const confirmed = window.confirm(`Delete backup ${filename}?`);
    if (!confirmed) return;

    setError(null);
    try {
      const res = await fetch(`/api/backups/${filename}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete backup");
      await loadBackups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete backup");
    }
  }

  function downloadBackup(filename: string) {
    window.open(`/api/backups/${filename}`, "_blank");
  }

  useEffect(() => {
    loadBackups();
  }, []);

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Database Backups
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Automatic daily backups + manual backup management
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl flex-1 space-y-4 px-4 py-8 sm:px-6">
        {error && (
          <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Manual Backup
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Create an immediate backup of the database
              </p>
            </div>
            <button
              type="button"
              onClick={createBackup}
              disabled={creating}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Backup"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Backup History
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Automatic daily backups are stored in <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">data/backups/</code>
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading backups…</p>
          ) : backups.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No backups yet. Create your first backup above.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {backup.filename}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>{backup.sizeFormatted}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadBackup(backup.filename)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBackup(backup.filename)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
