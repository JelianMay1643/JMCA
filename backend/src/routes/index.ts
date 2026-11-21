import { Router } from "express";
import productRoutes from "@/routes/product-route";
import orderRoutes from "@/routes/order-route";
import authRoutes from "@/routes/auth-route";
import adminRoutes from "@/routes/admin-route";
import wishlistRoutes from "@/routes/wishlist-route";
import reviewRoutes from "@/routes/review-route";
import paymentRoutes from "@/routes/payment-route";
import refundRoutes from "@/routes/refund-route";
import reportRoutes from "@/routes/report-route";
import notificationRoutes from "@/routes/notification-route";
import auditRoutes from "@/routes/audit-route";
import supportRoutes from "@/routes/support-route";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payment", paymentRoutes);
router.use("/refunds", refundRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/support", supportRoutes);

export default router;