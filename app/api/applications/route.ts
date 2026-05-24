import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeApplication } from "@/lib/types";
import {
  createApplicationSchema,
  parseAppliedAt,
  statusQuerySchema,
} from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = statusQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
    });

    if (!query.success) {
      return NextResponse.json(
        { error: query.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const applications = await prisma.application.findMany({
      where: query.data.status ? { status: query.data.status } : undefined,
      orderBy: [{ appliedAt: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({
      applications: applications.map(serializeApplication),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { appliedAt, ...data } = parsed.data;
    const application = await prisma.application.create({
      data: {
        ...data,
        appliedAt: parseAppliedAt(appliedAt) ?? null,
      },
    });

    return NextResponse.json(
      { application: serializeApplication(application) },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
