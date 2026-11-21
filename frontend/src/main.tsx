import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./components/context/auth-context";
import { CartProvider } from "./components/context/cart-context";
import { WishlistProvider } from "./components/context/wishlist-context";
import CustomerOnly from "./components/context/customer-only";
import ProtectedRoute from "./components/context/protected-route";
import MainLayout from "./components/common/main-layout";
import HomePage from "./pages/user/home/home-page";
import ShopPage from "./pages/user/shop/shop-page";
import ContactPage from "./pages/user/contact/contact-page";
import CartPage from "./pages/user/cart/cart-page";
import CheckoutPage from "./pages/user/checkout/checkout-page";
import OrderSuccessPage from "./pages/user/order-success/order-success-page";
import AccountLayout from "./pages/user/account/account-layout";
import AccountOverviewPage from "./pages/user/account/account-overview-page";
import AccountOrdersPage from "./pages/user/account/account-orders-page";
import AccountProfilePage from "./pages/user/account/account-profile-page";
import AccountSupportPage from "./pages/user/account/account-support-page";
import LoginPage from "./pages/auth/login/login-page";
import SignupPage from "./pages/auth/signup/signup-page";
import AdminLayout from "./pages/admin/admin-layout";
import WishlistPage from "./pages/user/wishlist/wishlist-page";
import AdminDashboardPage from "./pages/admin/dashboard/admin-dashboard-page";
import AdminProductsPage from "./pages/admin/products/admin-products-page";
import AdminRefundsPage from "./pages/admin/refunds/admin-refunds-page";
import AdminReportsPage from "./pages/admin/reports/admin-reports-page";
import AdminOrdersPage from "./pages/admin/orders/admin-orders-page";
import AdminAuditPage from "./pages/admin/audit/admin-audit-page";
import AdminSupportPage from "./pages/admin/support/admin-support-page";
import {
  TermsPage,
  RefundPolicyPage,
  RulesPage,
} from "./pages/user/legal/legal-pages";
import "./styles/global.css";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/refund-policy", element: <RefundPolicyPage /> },
      { path: "/rules", element: <RulesPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <CustomerOnly />,
            children: [
              { path: "/cart", element: <CartPage /> },
              { path: "/checkout", element: <CheckoutPage /> },
              { path: "/order-success", element: <OrderSuccessPage /> },
            ],
          },

          {
            path: "/account",
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountOverviewPage /> },
              { path: "orders", element: <AccountOrdersPage /> },
              { path: "profile", element: <AccountProfilePage /> },
              { path: "support", element: <AccountSupportPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/admin/login", element: <Navigate to="/login" replace /> },

  {
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "refunds", element: <AdminRefundsPage /> },
          { path: "reports", element: <AdminReportsPage /> },
          { path: "support", element: <AdminSupportPage /> },
          { path: "audit-logs", element: <AdminAuditPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);