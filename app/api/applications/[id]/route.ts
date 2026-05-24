import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteJobDescriptionByApplicationId } from "@/lib/job-description-files";
import { serializeApplication } from "@/lib/types";
import {
  parseAppliedAt,
  updateApplicationSchema,
} from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application: serializeApplication(application) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { appliedAt, ...data } = parsed.data;
    const appliedAtValue = parseAppliedAt(appliedAt);

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...data,
        ...(appliedAt !== undefined
          ? { appliedAt: appliedAtValue ?? null }
          : {}),
      },
    });

    return NextResponse.json({ application: serializeApplication(application) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.application.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await deleteJobDescriptionByApplicationId(id);
    await prisma.application.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
