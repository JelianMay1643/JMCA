import { Router } from "express";
import { requireAdmin } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import { listAuditLogs } from "@/controller/audit-controller";

const router = Router();

router.get("/", requireAdmin, asyncHandler(listAuditLogs));

export default router;