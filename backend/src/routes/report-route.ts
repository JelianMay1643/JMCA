import { Router } from "express";
import { requireAdmin, requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import {
  listReports,
  reportProduct,
  updateReport,
} from "@/controller/report-controller";

const router = Router();

// Customer ra
router.post("/product/:productId", requireCustomer, asyncHandler(reportProduct));

// Admin ra
router.get("/", requireAdmin, asyncHandler(listReports));
router.patch("/:id", requireAdmin, asyncHandler(updateReport));

export default router;