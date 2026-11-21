import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "@/controller/notification-controller";

const router = Router();

router.get("/", requireAuth, asyncHandler(controller.listNotifications));
router.patch("/read-all", requireAuth, asyncHandler(controller.readAllNotifications));
router.patch("/:id/read", requireAuth, asyncHandler(controller.readNotification));

export default router;