import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="main-layout">

      <Sidebar
        isOpen={isOpen}
        closeSidebar={closeSidebar}
      />

      <div className="main-content">

        <Header toggleSidebar={toggleSidebar} />

        <main className="page-content">
          <Breadcrumb />

          <div className="page-container">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default MainLayout;