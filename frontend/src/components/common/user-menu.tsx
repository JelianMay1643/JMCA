import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LifeBuoy, LogOut, User } from "lucide-react";
import { useAuth } from "../context/use-auth";
import { useCart } from "../context/use-cart";

function UserMenu() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link to="/login" aria-label="Login" title="Login" className="flex">
        <User size={22} />
      </Link>
    );
  }

  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    setOpen(false);
    logout();
    clearCart();
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        title={user.name}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-magenta text-white hover:opacity-90"
      >
        <User size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-lg bg-white text-neutral-800 shadow-lg">
          <div className="border-b border-neutral-200 px-4 py-3">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-sm text-neutral-500">{user.email}</p>
          </div>

          <Link
            to={isAdmin ? "/admin" : "/account"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-blush"
          >
            <LayoutDashboard size={18} />
            {isAdmin ? "Admin Dashboard" : "My Account"}
          </Link>

          {!isAdmin && (
            <Link
              to="/account/support"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-blush"
            >
              <LifeBuoy size={18} />
              Support
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left hover:bg-blush"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;