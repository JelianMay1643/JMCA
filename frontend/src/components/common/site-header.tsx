import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Search } from "lucide-react";
import { useCart } from "../context/use-cart";
import { useAuth } from "../context/use-auth";
import { useWishlist } from "../context/use-wishlist";
import NotificationBell from "./notification-bell";
import UserMenu from "./user-menu";

function SiteHeader() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { ids } = useWishlist();
  const isAdmin = user?.role === "admin";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(keyword)}`);
  };

  const handleWishlist = () => {
    navigate(user ? "/wishlist" : "/login", {
      state: user ? undefined : { from: { pathname: "/wishlist" } },
    });
  };

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 bg-white px-4 py-3 md:px-8">
      <Link to="/" className="text-3xl font-bold text-magenta">
        JMCA
      </Link>

      <nav className="order-last flex w-full gap-4 font-mono font-bold uppercase text-magenta md:order-none md:w-auto md:gap-6">
        <a href="/#categories">Categories</a>
        <Link to="/shop">Shop</Link>
        <a href="/#why">About</a>
      </nav>

      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-xs flex-1 items-center rounded-xl bg-[#c07bb0] px-3 py-1.5"
      >
        <input
          type="text"
          placeholder="Search product..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white"
        />
        <button type="submit" aria-label="Search" className="cursor-pointer">
          <Search size={18} />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-4">
        {!isAdmin && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label="Wishlist"
            className="relative flex cursor-pointer"
          >
            <Heart size={22} />
            {ids.length > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] text-white">
                {ids.length}
              </span>
            )}
          </button>
        )}

        {user && <NotificationBell />}

        <UserMenu />

        {!isAdmin && (
          <Link to="/cart" aria-label="Cart" className="relative flex">
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-magenta px-1 text-[11px] text-white">
                {totalItems}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;