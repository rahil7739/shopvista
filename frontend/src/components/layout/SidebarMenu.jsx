import { NavLink } from "react-router-dom";

const SidebarMenu = ({ item, onNavigate }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`
      }
    >
      <Icon className="sidebar-icon" />
      <span>{item.name}</span>
    </NavLink>
  );
};

export default SidebarMenu;