import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import ContentTop from "../components/ContentTop/ContentTop";
import SupervisorSidebar from "../layout/Sidebar/SupervisorSidebar";
import SupervisorHome from "../pages/SupervisorPage/SupervisorHome";
import SupervisorWO from "../pages/SupervisorPage/SupervisorWO";
import SupervisorAccount from "../pages/SupervisorPage/SupervisorAccount";
import AdminRReport from "../pages/adminPages/AdminRReport";
import AdminMReport from "../pages/adminPages/AdminMReport";

const SupervisorRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <SupervisorSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
        </UserProvider>
        <div className="content-main">
          <Routes>
            <Route path="/" element={<SupervisorHome />} />
            <Route path="work-order" element={<SupervisorWO />} />
            <Route path="repair-report" element={<AdminRReport />} />
            <Route path="maintenance-report" element={<AdminMReport />} />
            <Route path="account" element={<SupervisorAccount />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SupervisorRoutes;
