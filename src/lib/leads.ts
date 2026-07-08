import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { leadSubmissionValidator } from "@/lib/validators";
import type { LeadSubmissionData, LeadSubmissionSummary } from "@/types/lead";

export const MAX_LEAD_BODY_BYTES = 16 * 1024;
export const MAX_LEAD_SUBMISSIONS_PER_MINUTE = 30;
const LEAD_FLOOD_WINDOW_MS = 60_000;

type LeadSubmissionInput = z.infer<typeof leadSubmissionValidator>;

export type ParseLeadBodyResult =
  | { ok: true; value: LeadSubmissionInput }
  | { ok: false; reason: "too_large" }
  | { ok: false; reason: "invalid"; issues: Array<{ path: string; message: string }> };

export function parseLeadBody(raw: string): ParseLeadBodyResult {
  if (new TextEncoder().encode(raw).byteLength > MAX_LEAD_BODY_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      reason: "invalid",
      issues: [{ path: "", message: "Body must be valid JSON" }],
    };
  }

  const parsed = leadSubmissionValidator.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return { ok: true, value: parsed.data };
}

export function toLeadSummary(row: {
  id: string;
  blockId: string;
  data: Prisma.JsonValue;
  createdAt: Date;
}): LeadSubmissionSummary {
  const source = typeof row.data === "object" && row.data !== null && !Array.isArray(row.data)
    ? (row.data as Record<string, unknown>)
    : {};

  const data: LeadSubmissionData = {};
  for (const key of ["name", "email", "message"] as const) {
    const value = source[key];
    if (typeof value === "string" && value) {
      data[key] = value;
    }
  }

  return {
    id: row.id,
    blockId: row.blockId,
    data,
    createdAt: row.createdAt.toISOString(),
  };
}

// Per-site sliding-window flood cap for the public submission endpoint. A DB
// count is the only option that stays correct across serverless instances
// without storing visitor IPs; the small count/insert race is acceptable.
// Backed by the existing [siteId, createdAt] index.
export async function isLeadSubmissionFlooded(siteId: string) {
  const recent = await prisma.leadSubmission.count({
    where: {
      siteId,
      createdAt: { gte: new Date(Date.now() - LEAD_FLOOD_WINDOW_MS) },
    },
  });

  return recent >= MAX_LEAD_SUBMISSIONS_PER_MINUTE;
}

export async function createLeadSubmission(
  siteId: string,
  blockId: string,
  data: LeadSubmissionData,
) {
  return prisma.leadSubmission.create({
    data: {
      siteId,
      blockId,
      data: data as Prisma.InputJsonValue,
    },
  });
}

export async function listLeadsForSite(siteId: string) {
  return prisma.leadSubmission.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
