-- Create tables for the evaluation system

CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "logo" TEXT,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Supervisor" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "Supervisor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Supervisor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Evaluation" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "supervisorId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "anonymousId" TEXT NOT NULL,
  "lideranca" INTEGER NOT NULL,
  "comunicacao" INTEGER NOT NULL,
  "respeito" INTEGER NOT NULL,
  "organizacao" INTEGER NOT NULL,
  "apoioEquipe" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Evaluation_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Evaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AccessLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "anonymousId" TEXT NOT NULL,
  "maskedCPF" TEXT NOT NULL,
  "fullCPF" TEXT,
  "companyId" TEXT,
  "companyName" TEXT,
  "action" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id");

CREATE TABLE IF NOT EXISTS "FormTemplate" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FormQuestion" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "text" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "maxScore" INTEGER,
  "tag" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "formId" TEXT NOT NULL,
  CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed default companies
INSERT INTO "Company" ("id", "name", "logo") VALUES
  ('dikma', 'Dikma', NULL),
  ('arcelormittal', 'ArcelorMittal', NULL)
ON CONFLICT ("id") DO NOTHING;

-- Seed default supervisor
INSERT INTO "Supervisor" ("id", "name", "companyId") VALUES
  ('douglas-dikma', 'Douglas', 'dikma')
ON CONFLICT ("id") DO NOTHING;
