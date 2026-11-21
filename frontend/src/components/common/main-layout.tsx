import { Outlet, ScrollRestoration } from "react-router-dom";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

function MainLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <ScrollRestoration />
    </>
  );
}

export default MainLayout;