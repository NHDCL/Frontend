import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import ContentTop from "../components/ContentTop/ContentTop";
import TechnicianHome from "../pages/technicianpages/TechnicianHome";
import TechnicianWorkOrder from "../pages/technicianpages/TechnicianWorkOrder";
import TechnicianMSchedule from "../pages/technicianpages/TechnicianMSchedule";
import TechnicianSidebar from "../layout/Sidebar/TechnicianSidebar";
import TechnicianAccount from "../pages/technicianpages/TechnicianAccount";

const TechnicianRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <TechnicianSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
        </UserProvider>
        <div className="content-main">
          <Routes>
            <Route path="/" element={<TechnicianHome />} />
            <Route path="work-order" element={<TechnicianWorkOrder />} />
            <Route
              path="maintenance-schedule"
              element={<TechnicianMSchedule />}
            />
            <Route path="account" element={<TechnicianAccount />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default TechnicianRoutes;
