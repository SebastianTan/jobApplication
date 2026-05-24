import { createBackup, listBackups } from "@/lib/backup";

let schedulerInterval: NodeJS.Timeout | null = null;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

function hasBackupToday(): boolean {
  const today = new Date().toDateString();
  // This is a simple check - in production, you'd want to check actual backup timestamps
  // For now, we'll rely on the listBackups to check if there's a backup from today
  return false;
}

async function checkAndCreateBackup(): Promise<void> {
  try {
    const backups = await listBackups();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if there's already a backup from today
    const hasTodayBackup = backups.some(
      (backup) => backup.createdAt >= todayStart
    );

    if (!hasTodayBackup) {
      console.log("[Backup Scheduler] Creating daily backup...");
      const backup = await createBackup();
      console.log(`[Backup Scheduler] Backup created: ${backup.filename}`);
    } else {
      console.log("[Backup Scheduler] Daily backup already exists, skipping.");
    }
  } catch (error) {
    console.error("[Backup Scheduler] Error checking/creating backup:", error);
  }
}

export function startBackupScheduler(): void {
  if (schedulerInterval) {
    console.log("[Backup Scheduler] Already running, skipping.");
    return;
  }

  console.log("[Backup Scheduler] Starting daily backup scheduler...");

  // Check immediately on startup
  void checkAndCreateBackup();

  // Set up interval to check every hour
  schedulerInterval = setInterval(() => {
    void checkAndCreateBackup();
  }, CHECK_INTERVAL_MS);
}

export function stopBackupScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Backup Scheduler] Stopped.");
  }
}

// For manual trigger
export async function triggerBackup(): Promise<void> {
  console.log("[Backup Scheduler] Manual backup triggered...");
  await checkAndCreateBackup();
}
