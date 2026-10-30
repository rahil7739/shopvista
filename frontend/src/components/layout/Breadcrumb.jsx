import { Link, useLocation } from "react-router-dom";
import { sidebarMenu } from "../../config/sidebarMenu";

const Breadcrumb = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const menuItems = sidebarMenu.flatMap((group) => group.items);
  const currentItem = menuItems.find((item) => item.path === pathname);
  const title =
    currentItem?.name ??
    segments.at(-1)?.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ??
    "Dashboard";

  return (
    <nav className="breadcrumb-wrapper" aria-label="Breadcrumb">
      <Link to="/admin/dashboard">Admin</Link>
      <span className="breadcrumb-separator" aria-hidden="true">/</span>
      <span className="breadcrumb-current" aria-current="page">{title}</span>
    </nav>
  );
};

export default Breadcrumb;