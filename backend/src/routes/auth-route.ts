import { Router } from "express";
import * as controller from "@/controller/auth-controller";
import * as profile from "@/controller/profile-controller";
import { requireAuth } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.post("/signup", asyncHandler(controller.signup));
router.post("/login", asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));
router.patch("/profile", requireAuth, asyncHandler(profile.updateProfile));
router.patch("/password", requireAuth, asyncHandler(profile.changePassword));

export default router;