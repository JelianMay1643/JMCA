import { Router } from "express";
import { requireAdmin, requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "@/controller/support-controller";

const router = Router();

// Customer ra ("/mine" kinahanglan sa ibabaw sa "/:id/...")
router.post("/", requireCustomer, asyncHandler(controller.createTicket));
router.get("/mine", requireCustomer, asyncHandler(controller.myTickets));

// Admin ra
router.get("/", requireAdmin, asyncHandler(controller.listTickets));
router.patch("/:id/reply", requireAdmin, asyncHandler(controller.replyTicket));
router.patch("/:id/close", requireAdmin, asyncHandler(controller.closeTicket));

export default router;