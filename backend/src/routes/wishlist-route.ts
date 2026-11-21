import { Router } from "express";
import { requireCustomer } from "@/middleware/auth";
import { asyncHandler } from "@/utils/async-handler";
import { add, list, remove } from "@/controller/wishlist-controller";

const router = Router();

router.use(requireCustomer);

router.get("/", asyncHandler(list));
router.post("/:productId", asyncHandler(add));
router.delete("/:productId", asyncHandler(remove));

export default router;