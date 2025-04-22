import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import AdminHome from "../pages/adminPages/AdminHome";
import AdminAssets from "../pages/adminPages/AdminAssets";
import AdminRepair from "../pages/adminPages/AdminRepair";
import AdminMaintenance from "../pages/adminPages/AdminMaintenance";
import SAdminRReport from "../pages/superAdminPages/SAdminRRport";
import SAdminMReport from "../pages/superAdminPages/SAdminMReport";
import SAdminAccount from "../pages/superAdminPages/SAdminAccount";
import ContentTop from "../components/ContentTop/ContentTop";
import SuperAdminSidebar from "../layout/Sidebar/SuperAdminSidebar";
import SAdminAcademies from "../pages/superAdminPages/SAdminAcademies";
import SAdminUser from "../pages/superAdminPages/SAdminUser";

import ProtectedRoute from "./ProtectedRoute";

const SuperAdminRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <SuperAdminSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
          <div className="content-main">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    element={<AdminHome />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="academies"
                element={
                  <ProtectedRoute
                    element={<SAdminAcademies />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute
                    element={<SAdminUser />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="assets"
                element={
                  <ProtectedRoute
                    element={<AdminAssets />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="repair-maintenance"
                element={
                  <ProtectedRoute
                    element={<AdminRepair />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="preventive-maintenance"
                element={
                  <ProtectedRoute
                    element={<AdminMaintenance />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="repair-report"
                element={
                  <ProtectedRoute
                    element={<SAdminRReport />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="maintenance-report"
                element={
                  <ProtectedRoute
                    element={<SAdminMReport />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute
                    element={<SAdminAccount />}
                    requiredRole="SuperAdmin"
                  />
                }
              />
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
          </div>
        </UserProvider>
      </div>
    </div>
  );
};

export default SuperAdminRoutes;
