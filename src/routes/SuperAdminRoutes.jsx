import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";
import AdminHome from "../pages/adminPages/AdminHome";
import AdminAssets from "../pages/adminPages/AdminAssets";
import AdminRepair from "../pages/adminPages/AdminRepair";
import AdminMaintenance from "../pages/adminPages/AdminMaintenance";
import AdminRReport from "../pages/adminPages/AdminRReport";
import AdminMReport from "../pages/adminPages/AdminMReport";
import SAdminAccount from "../pages/superAdminPages/SAdminAccount";
import ContentTop from "../components/ContentTop/ContentTop";
import SuperAdminSidebar from "../layout/Sidebar/SuperAdminSidebar";
import SAdminAcademies from "../pages/superAdminPages/SAdminAcademies";
import SAdminUser from "../pages/superAdminPages/SAdminUser";

const SuperAdminRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <SuperAdminSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
        </UserProvider>
        <div className="content-main">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="academies" element={<SAdminAcademies />} />
            <Route path="Users" element={<SAdminUser />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="repair-maintenance" element={<AdminRepair />} />
            <Route
              path="preventive-maintenance"
              element={<AdminMaintenance />}
            />
            <Route path="repair-report" element={<AdminRReport />} />
            <Route path="maintenance-report" element={<AdminMReport />} />
            <Route path="account" element={<SAdminAccount />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRoutes;
