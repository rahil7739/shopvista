import {
  FaHome,
  FaUsers,
  FaTags,
  FaBox,
  FaShoppingCart,
  FaCreditCard,
  FaTruck,
  FaWarehouse,
  FaTicketAlt,
  FaImage,
  FaStar,
  FaBell,
  FaChartBar,
  FaHeadset,
  FaUserShield,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export const sidebarMenu = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: FaHome },
      { name: "Users", path: "/admin/users", icon: FaUsers },
      { name: "Categories", path: "/admin/categories", icon: FaTags },
      { name: "Products", path: "/admin/products", icon: FaBox },
      { name: "Orders", path: "/admin/orders", icon: FaShoppingCart },
      { name: "Payments", path: "/admin/payments", icon: FaCreditCard },
      { name: "Shipping", path: "/admin/shipping", icon: FaTruck },
      { name: "Inventory", path: "/admin/inventory", icon: FaWarehouse },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { name: "Coupons", path: "/admin/coupons", icon: FaTicketAlt },
      { name: "Banners", path: "/admin/banners", icon: FaImage },
      { name: "Reviews", path: "/admin/reviews", icon: FaStar },
      { name: "Notifications", path: "/admin/notifications", icon: FaBell },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Reports", path: "/admin/reports", icon: FaChartBar },
      { name: "Customer Support", path: "/admin/support", icon: FaHeadset },
      { name: "Roles & Permissions", path: "/admin/roles", icon: FaUserShield },
      { name: "Settings", path: "/admin/settings", icon: FaCog },
      { name: "My Profile", path: "/admin/profile", icon: FaUserCircle },
    ],
  },
];

export const logoutMenu = {
  name: "Logout",
  path: "/login",
  icon: FaSignOutAlt,
};