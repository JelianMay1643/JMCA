import { Router } from "express";
import { requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import { get, save } from "@/controller/payment-controller";

const router = Router();

router.use(requireCustomer);
router.get("/", asyncHandler(get));
router.put("/", asyncHandler(save));

export default router;