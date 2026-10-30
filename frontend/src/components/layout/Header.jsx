import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>

        <div className="header-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-icon"
          onClick={() => navigate("/admin/notifications")}
        >
          <FaBell />
          <span className="notification-dot"></span>
        </button>

        <button
          className="profile-button"
          onClick={() => navigate("/admin/profile")}
        >
          <FaUserCircle />
          <span>My Profile</span>
        </button>
      </div>
    </header>
  );
};

export default Header;