import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Flag,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  ScrollText,
  ShoppingCart,
  Store,
  Undo2,
  X,
} from "lucide-react";
import { useAuth } from "../../components/context/use-auth";
import { useCart } from "../../components/context/use-cart";
import NotificationBell from "../../components/common/notification-bell";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/admin/refunds", label: "Refunds", icon: Undo2, end: false },
  { to: "/admin/reports", label: "Reports", icon: Flag, end: false },
  { to: "/admin/support", label: "Support", icon: LifeBuoy, end: false },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, end: false },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 ${
    isActive ? "bg-white/20 font-bold" : "hover:bg-white/10"
  }`;

function AdminLayout() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f7e9f3] text-neutral-800">
      
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-magenta p-5 text-white transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">JMCA</p>
            <p className="text-xs text-blush">Admin Panel</p>
          </div>
          <button
            className="cursor-pointer md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={navClass}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-white/20 pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/10"
          >
            <Store size={18} />
            View Shop
          </Link>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-white/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <button
            className="cursor-pointer md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <p className="hidden text-sm text-neutral-500 sm:block">{today}</p>

          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <span className="hidden text-sm font-bold sm:inline">
              {user?.name}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;