import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  deleteJobDescriptionFile,
  readJobDescription,
  writeJobDescription,
} from "@/lib/job-description-files";
import { serializeApplication } from "@/lib/types";
import { jobDescriptionBodySchema } from "@/lib/validations-job-description";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getApplicationOr404(id: string) {
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) {
    return null;
  }
  return application;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const application = await getApplicationOr404(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!application.jobDescriptionFile) {
      return NextResponse.json({ content: null, hasDescription: false });
    }

    const content = await readJobDescription(application.jobDescriptionFile);

    return NextResponse.json({
      content,
      hasDescription: true,
      updatedAt: application.updatedAt.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const application = await getApplicationOr404(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = jobDescriptionBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const relativePath = await writeJobDescription(id, parsed.data.content);

    const updated = await prisma.application.update({
      where: { id },
      data: { jobDescriptionFile: relativePath },
    });

    return NextResponse.json({
      application: serializeApplication(updated),
      hasDescription: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save job description";
    const status = message.includes("maximum size") ? 413 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const application = await getApplicationOr404(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.jobDescriptionFile) {
      await deleteJobDescriptionFile(application.jobDescriptionFile);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { jobDescriptionFile: null },
    });

    return NextResponse.json({
      application: serializeApplication(updated),
      hasDescription: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
