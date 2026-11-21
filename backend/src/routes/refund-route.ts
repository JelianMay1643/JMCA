import { Router } from "express";
import { requireAdmin, requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import {
  decideRefund,
  listRefunds,
  requestRefund,
} from "@/controller/refund-controller";

const router = Router();

// Customer: mag-request og refund
router.post("/order/:orderId", requireCustomer, asyncHandler(requestRefund));

// Admin ra
router.get("/", requireAdmin, asyncHandler(listRefunds));
router.patch("/:id", requireAdmin, asyncHandler(decideRefund));

export default router;