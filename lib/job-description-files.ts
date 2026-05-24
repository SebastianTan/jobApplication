import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const DEFAULT_DESCRIPTIONS_DIR = path.join(
  process.cwd(),
  "data",
  "job-descriptions",
);

const MAX_DESCRIPTION_BYTES = 512 * 1024;

const APPLICATION_ID_PATTERN = /^c[a-z0-9]{24}$/;

export function getDescriptionsDirectory(): string {
  const configured = process.env.JOB_DESCRIPTIONS_DIR?.trim();
  if (!configured) return DEFAULT_DESCRIPTIONS_DIR;
  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

export function isValidApplicationId(id: string): boolean {
  return APPLICATION_ID_PATTERN.test(id);
}

function descriptionFileName(applicationId: string): string {
  if (!isValidApplicationId(applicationId)) {
    throw new Error("Invalid application id");
  }
  return `${applicationId}.md`;
}

export function getDescriptionAbsolutePath(applicationId: string): string {
  return path.join(getDescriptionsDirectory(), descriptionFileName(applicationId));
}

export function getDescriptionRelativePath(applicationId: string): string {
  const absolute = getDescriptionAbsolutePath(applicationId);
  return path.relative(process.cwd(), absolute).split(path.sep).join("/");
}

async function ensureDescriptionsDirectory(): Promise<void> {
  await mkdir(getDescriptionsDirectory(), { recursive: true });
}

export async function writeJobDescription(
  applicationId: string,
  content: string,
): Promise<string> {
  const bytes = Buffer.byteLength(content, "utf8");
  if (bytes > MAX_DESCRIPTION_BYTES) {
    throw new Error(
      `Job description exceeds maximum size (${MAX_DESCRIPTION_BYTES} bytes)`,
    );
  }

  await ensureDescriptionsDirectory();
  const filePath = getDescriptionAbsolutePath(applicationId);
  await writeFile(filePath, content, "utf8");
  return getDescriptionRelativePath(applicationId);
}

export async function readJobDescription(
  storedPath: string,
): Promise<string> {
  const absolutePath = resolveStoredPath(storedPath);
  return readFile(absolutePath, "utf8");
}

export async function deleteJobDescriptionFile(
  storedPath: string,
): Promise<void> {
  const absolutePath = resolveStoredPath(storedPath);
  try {
    await unlink(absolutePath);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}

export async function deleteJobDescriptionByApplicationId(
  applicationId: string,
): Promise<void> {
  if (!isValidApplicationId(applicationId)) return;
  const absolutePath = getDescriptionAbsolutePath(applicationId);
  try {
    await unlink(absolutePath);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
}

function resolveStoredPath(storedPath: string): string {
  const normalized = storedPath.replace(/\\/g, "/");
  const descriptionsDir = getDescriptionsDirectory();
  const absoluteDescriptionsDir = path.resolve(descriptionsDir);

  if (normalized.includes("..")) {
    throw new Error("Invalid job description path");
  }

  const absolutePath = path.isAbsolute(storedPath)
    ? path.resolve(storedPath)
    : path.resolve(process.cwd(), storedPath);

  if (
    absolutePath !== absoluteDescriptionsDir &&
    !absolutePath.startsWith(absoluteDescriptionsDir + path.sep)
  ) {
    throw new Error("Invalid job description path");
  }

  const fileName = path.basename(absolutePath);
  const id = fileName.replace(/\.md$/, "");
  if (!isValidApplicationId(id)) {
    throw new Error("Invalid job description path");
  }

  return absolutePath;
}
