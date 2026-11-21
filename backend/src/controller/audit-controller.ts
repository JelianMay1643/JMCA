import type { Request, Response } from "express";
import * as auditRepo from "@/repositories/audit-repository";

const toText = (value: unknown) =>
  typeof value === "string" && value !== "" ? value : undefined;

const toNumber = (value: unknown) =>
  value !== undefined && value !== "" && !isNaN(Number(value))
    ? Number(value)
    : undefined;

export const listAuditLogs = async (req: Request, res: Response) => {
  res.json(
    await auditRepo.list({
      page: toNumber(req.query.page),
      limit: toNumber(req.query.limit),
      search: toText(req.query.search),
      entity: toText(req.query.entity),
    })
  );
};