import { Router } from "express";
import * as controller from "@/controller/order-controller";
import { cancelMyOrder } from "@/controller/order-cancel-controller";
import {
  requireAdmin,
  requireAuth,
  requireCustomer,
} from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// Customer ra ang maka-order
router.post("/", requireCustomer, asyncHandler(controller.createOrder));

// Naka-login
router.get("/mine", requireAuth, asyncHandler(controller.getMyOrders));

// Customer ra, sulod sa 10 minutes
router.patch("/:id/cancel", requireCustomer, asyncHandler(cancelMyOrder));

// Admin ra
router.get("/", requireAdmin, asyncHandler(controller.getOrders));
router.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(controller.updateOrderStatus)
);

export default router;