import type { Application, ApplicationStatus } from "@prisma/client";

export type { Application, ApplicationStatus };

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "FOUND",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  FOUND: "Found",
};

export type ApplicationJson = Omit<
  Application,
  "appliedAt" | "createdAt" | "updatedAt" | "jobDescriptionFile"
> & {
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasJobDescription: boolean;
};

export function serializeApplication(app: Application): ApplicationJson {
  const { jobDescriptionFile, ...rest } = app;
  return {
    ...rest,
    hasJobDescription: Boolean(jobDescriptionFile),
    appliedAt: app.appliedAt?.toISOString() ?? null,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}
