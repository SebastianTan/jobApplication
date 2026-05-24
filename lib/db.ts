import { PrismaClient } from "@prisma/client";
import { startBackupScheduler } from "@/lib/backup-scheduler";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  backupSchedulerStarted: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Start the backup scheduler on first import (server startup)
if (!globalForPrisma.backupSchedulerStarted) {
  startBackupScheduler();
  globalForPrisma.backupSchedulerStarted = true;
}
