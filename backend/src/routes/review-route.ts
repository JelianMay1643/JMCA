import { Router } from "express";
import { requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import { list, mine, save } from "@/controller/review-controller";

const router = Router();

router.get("/product/:productId", asyncHandler(list)); // public
router.get("/product/:productId/mine", requireCustomer, asyncHandler(mine));
router.post("/product/:productId", requireCustomer, asyncHandler(save));

export default router;