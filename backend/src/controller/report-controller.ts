import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as reportRepo from "@/repositories/report-repository";

export const reportProduct = async (req: Request, res: Response) => {
  const userId = (res.locals.auth as AuthUser).userId as number;
  const productId = Number(req.params.productId);
  const reason = String(req.body?.reason ?? "").trim();
  const details = String(req.body?.details ?? "").trim().slice(0, 500);

  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (!reportRepo.reasons.includes(reason)) {
    return res.status(400).json({ message: "Please choose a reason" });
  }

  try {
    res
      .status(201)
      .json(await reportRepo.create(userId, productId, reason, details));
  } catch (err) {
    if (err instanceof reportRepo.ReportError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

export const listReports = async (_req: Request, res: Response) => {
  res.json(await reportRepo.listAll());
};

export const updateReport = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const status = req.body?.status;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ message: "Report not found" });
  }
  if (status !== "reviewed" && status !== "dismissed") {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    res.json(await reportRepo.setStatus(id, status));
  } catch (err) {
    if (err instanceof reportRepo.ReportError) {
      return res.status(404).json({ message: err.message });
    }
    throw err;
  }
};