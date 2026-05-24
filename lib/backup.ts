import { copyFile, mkdir, readdir, stat, unlink } from "fs/promises";
import path from "path";

const BACKUPS_DIR = path.join(process.cwd(), "data", "backups");
const DATABASE_FILE = path.join(process.cwd(), "prisma", "data", "applications.db");

export interface BackupInfo {
  filename: string;
  size: number;
  createdAt: Date;
  path: string;
}

export function getBackupsDirectory(): string {
  return BACKUPS_DIR;
}

export function getDatabasePath(): string {
  return DATABASE_FILE;
}

async function ensureBackupsDirectory(): Promise<void> {
  await mkdir(BACKUPS_DIR, { recursive: true });
}

export function generateBackupFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  return `JOBSAPP-BACKUP-${timestamp}.db`;
}

export async function createBackup(): Promise<BackupInfo> {
  await ensureBackupsDirectory();

  const filename = generateBackupFilename();
  const backupPath = path.join(BACKUPS_DIR, filename);

  await copyFile(DATABASE_FILE, backupPath);

  const stats = await stat(backupPath);

  return {
    filename,
    size: stats.size,
    createdAt: stats.birthtime,
    path: backupPath,
  };
}

export async function listBackups(): Promise<BackupInfo[]> {
  try {
    await ensureBackupsDirectory();
    const files = await readdir(BACKUPS_DIR);

    const backupFiles = files.filter((file) => file.endsWith(".db"));

    const backups: BackupInfo[] = [];

    for (const file of backupFiles) {
      const filePath = path.join(BACKUPS_DIR, file);
      const stats = await stat(filePath);
      backups.push({
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime,
        path: filePath,
      });
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function deleteBackup(filename: string): Promise<void> {
  const backupPath = path.join(BACKUPS_DIR, filename);
  await unlink(backupPath);
}

export async function getBackupPath(filename: string): Promise<string> {
  const backupPath = path.join(BACKUPS_DIR, filename);
  return backupPath;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
