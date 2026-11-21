import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../../components/context/use-auth";

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 ${
    isActive ? "bg-magenta font-bold text-white" : "text-magenta hover:bg-blush"
  }`;

function AccountLayout() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <main className="min-h-[70vh] bg-[#d47dbf]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="flex flex-row gap-2 rounded-lg bg-white p-3 md:w-52 md:flex-none md:flex-col">
          <NavLink to="/account" end className={link}>
            Overview
          </NavLink>
          <NavLink to="/account/orders" className={link}>
            My Orders
          </NavLink>
          <NavLink to="/wishlist" className={link}>
            Wishlist
          </NavLink>
          <NavLink to="/account/profile" className={link}>
            Profile
          </NavLink>
          <NavLink to="/account/support" className={link}>
            Support
          </NavLink>
        </aside>

        <section className="min-w-0 flex-1 text-white">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AccountLayout;