import { NextRequest, NextResponse } from "next/server";
import { createBackup, listBackups, formatFileSize } from "@/lib/backup";

export async function GET() {
  try {
    const backups = await listBackups();

    const backupsJson = backups.map((backup) => ({
      filename: backup.filename,
      size: backup.size,
      sizeFormatted: formatFileSize(backup.size),
      createdAt: backup.createdAt.toISOString(),
    }));

    return NextResponse.json({ backups: backupsJson });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list backups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const backup = await createBackup();

    return NextResponse.json({
      backup: {
        filename: backup.filename,
        size: backup.size,
        sizeFormatted: formatFileSize(backup.size),
        createdAt: backup.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create backup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
