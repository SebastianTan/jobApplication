import { PrismaClient } from "@prisma/client";
import {
  writeJobDescription,
  deleteJobDescriptionByApplicationId,
} from "../lib/job-description-files";

const prisma = new PrismaClient();

const sampleDescriptions: Record<string, string> = {
  "Northwind Labs": `# Full Stack Engineer

## About the role
Build customer-facing features with React and Node.js.

## Requirements
- 3+ years TypeScript
- SQL and REST API design
- Experience with CI/CD`,
  "Summit Analytics": `# Backend Developer

## Responsibilities
- Design data pipelines
- Maintain PostgreSQL services
- Partner with data science team`,
};

async function main() {
  const existing = await prisma.application.findMany({
    select: { id: true, jobDescriptionFile: true },
  });
  for (const app of existing) {
    if (app.jobDescriptionFile) {
      await deleteJobDescriptionByApplicationId(app.id);
    }
  }

  await prisma.application.deleteMany();

  const samples = [
    {
      company: "Northwind Labs",
      role: "test role",
      status: "INTERVIEW" as const,
      appliedAt: new Date("2026-05-10"),
      jobUrl: "https://example.com/jobs/full-stack",
      location: "Remote",
      notes: "test role",
    },
    {
      company: "Summit Analytics",
      role: "test role",
      status: "SCREENING" as const,
      appliedAt: new Date("2026-05-15"),
      location: "San Francisco, CA",
      notes: "test role",
    },
    {
      company: "Blue Harbor Health",
      role: "test role",
      status: "APPLIED" as const,
      appliedAt: new Date("2026-05-20"),
      jobUrl: "https://example.com/jobs/se2",
      location: "Hybrid — Boston, MA",
      notes: "test role",
    },
    {
      company: "Orbit Commerce",
      role: "test role",
      status: "REJECTED" as const,
      appliedAt: new Date("2026-04-28"),
      notes: "test role",
    },
    {
      company: "Greenline Mobility",
      role: "test role",
      status: "OFFER" as const,
      appliedAt: new Date("2026-04-15"),
      location: "Remote",
      notes: "test role",
    },
  ];

  for (const sample of samples) {
    const application = await prisma.application.create({ data: sample });
    const description = sampleDescriptions[sample.company];
    if (description) {
      const relativePath = await writeJobDescription(application.id, description);
      await prisma.application.update({
        where: { id: application.id },
        data: { jobDescriptionFile: relativePath },
      });
    }
  }

  console.log(`Seeded ${samples.length} applications (2 with job description files).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
