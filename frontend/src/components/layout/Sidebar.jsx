import { Link, useNavigate } from "react-router-dom";
import { sidebarMenu, logoutMenu } from "../../config/sidebarMenu";
import SidebarMenu from "./SidebarMenu";
import { FaTimes } from "react-icons/fa";
import api from "../../shared/api/client";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    let flash = {
      type: "success",
      message: "You have signed out successfully.",
    };
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Could not revoke the server session:", error);
      flash = {
        type: "warning",
        message: "You were signed out on this device, but the server could not revoke the token. Check your connection.",
      };
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("shopvista-token");
      closeSidebar?.();
      navigate("/login", { state: { flash } });
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${isOpen ? "show" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/admin/dashboard" className="brand-link">
            <img className="brand-logo" src="/logo.png" alt="Shopvista" />
          </Link>

          <button
            className="sidebar-close"
            onClick={closeSidebar}
          >
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-content">
          {sidebarMenu.map((group, index) => (
            <div className="sidebar-group" key={index}>
              <p className="sidebar-heading">
                {group.title}
              </p>

              {group.items.map((item) => (
                <SidebarMenu
                  key={item.path}
                  item={item}
                  onNavigate={closeSidebar}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-link logout-link"
            onClick={handleLogout}
          >
            <logoutMenu.icon className="sidebar-icon" />
            <span>{logoutMenu.name}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;