import { Router } from "express";
import * as controller from "@/controller/product-controller";
import * as imageController from "@/controller/product-image-controller";
import { requireAdmin } from "@/middleware/auth";
import { uploadSingleImage } from "@/middleware/upload";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.get("/", asyncHandler(controller.getProducts));

// Admin list (paginated + search). Kinahanglan sa ibabaw sa "/:id"
router.get(
  "/admin/list",
  requireAdmin,
  asyncHandler(controller.getAdminProducts)
);

router.get("/:id", asyncHandler(controller.getProduct));
router.get("/:id/image", asyncHandler(imageController.getProductImage));

// Admin ra
router.post("/", requireAdmin, asyncHandler(controller.createProduct));
router.put("/:id", requireAdmin, asyncHandler(controller.updateProduct));
router.delete("/:id", requireAdmin, asyncHandler(controller.deleteProduct));
router.post(
  "/:id/image",
  requireAdmin,
  uploadSingleImage,
  asyncHandler(imageController.uploadProductImage)
);
router.delete(
  "/:id/image",
  requireAdmin,
  asyncHandler(imageController.deleteProductImage)
);

export default router;