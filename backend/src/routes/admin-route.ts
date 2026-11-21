import { Router } from "express";
import * as controller from "@/controller/stats-controller";
import { requireAdmin } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.get("/stats", requireAdmin, asyncHandler(controller.getStats));

export default router;