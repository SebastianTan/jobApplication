import { NextRequest, NextResponse } from "next/server";
import { deleteBackup, getBackupPath } from "@/lib/backup";
import { readFile } from "fs/promises";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { filename } = await context.params;

    // Security check: ensure filename is a valid backup file
    if (!filename.endsWith(".db") || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const backupPath = await getBackupPath(filename);
    const fileBuffer = await readFile(backupPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to download backup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { filename } = await context.params;

    // Security check: ensure filename is a valid backup file
    if (!filename.endsWith(".db") || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    await deleteBackup(filename);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete backup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
