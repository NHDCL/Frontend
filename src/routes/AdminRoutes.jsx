import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import AdminSidebar from "../layout/Sidebar/AdminSidebar";
import AdminHome from "../pages/adminPages/AdminHome";
import AdminAcademies from "../pages/adminPages/AdminAcademies";
import AdminUser from "../pages/adminPages/AdminUser";
import AdminAssets from "../pages/adminPages/AdminAssets";
import AssetApproval from "../pages/adminPages/AssetApproval";
import AdminRepair from "../pages/adminPages/AdminRepair";
import AdminMaintenance from "../pages/adminPages/AdminMaintenance";
import AdminRReport from "../pages/adminPages/AdminRReport";
import AdminMReport from "../pages/adminPages/AdminMReport";
import AdminAccount from "../pages/adminPages/AdminAccount";
import ContentTop from "../components/ContentTop/ContentTop";

import ProtectedRoute from "./ProtectedRoute";
const AdminRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <AdminSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
          <div className="content-main">
            <Routes>
              {/* Admin Routes - Relative paths under /admin/* */}
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<AdminHome />}
                    requiredRole="admin"
                  />
                }
              />
              <Route
                path="academies"
                element={
                  <ProtectedRoute
                    element={<AdminAcademies />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute
                    element={<AdminUser />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="assets"
                element={
                  <ProtectedRoute
                    element={<AdminAssets />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="approval"
                element={
                  <ProtectedRoute
                    element={<AssetApproval />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="repair-maintenance"
                element={
                  <ProtectedRoute
                    element={<AdminRepair />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="preventive-maintenance"
                element={
                  <ProtectedRoute
                    element={<AdminMaintenance />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="repair-report"
                element={
                  <ProtectedRoute
                    element={<AdminRReport />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="maintenance-report"
                element={
                  <ProtectedRoute
                    element={<AdminMReport />}
                    requiredRole="Admin"
                  />
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute
                    element={<AdminAccount />}
                    requiredRole="Admin"
                  />
                }
              />

              {/* 404 Page */}
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
          </div>
        </UserProvider>
      </div>
    </div>
  );
};

export default AdminRoutes;
