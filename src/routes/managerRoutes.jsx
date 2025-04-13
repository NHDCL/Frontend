import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import Sidebar from "../layout/Sidebar/Sidebar";
import ContentTop from "../components/ContentTop/ContentTop";
import ProtectedRoute from "./ProtectedRoute";

import Users from "../pages/managerPage/user";
import MAsset from "../pages/managerPage/MAsset";
import Category from "../pages/managerPage/AssetCategory";
import ManagerDashboard from "../pages/managerPage/ManagerHome";
import PMaintenance from "../pages/managerPage/PMaintenance";
import RepairReport from "../pages/managerPage/RepairReport";
import Repair from "../pages/managerPage/Repair";
import MaintenanceReport from "../pages/managerPage/maintenanceReport";
import ManagerAccount from "../pages/managerPage/ManagerAccount";

const ManagerRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <Sidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
          <div className="content-main">
            <Routes>
              <Route
                path=""
                element={
                  <ProtectedRoute
                    element={<ManagerDashboard />}
                    requiredRole="Manager"
                  />
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute element={<Users />} requiredRole="Manager" />
                }
              />
              <Route
                path="assets"
                element={
                  <ProtectedRoute element={<MAsset />} requiredRole="Manager" />
                }
              />
              <Route
                path="category"
                element={
                  <ProtectedRoute
                    element={<Category />}
                    requiredRole="Manager"
                  />
                }
              />
              <Route
                path="repair-maintenance"
                element={
                  <ProtectedRoute element={<Repair />} requiredRole="Manager" />
                }
              />
              <Route
                path="preventive-maintenance"
                element={
                  <ProtectedRoute
                    element={<PMaintenance />}
                    requiredRole="Manager"
                  />
                }
              />
              <Route
                path="repair-report"
                element={
                  <ProtectedRoute
                    element={<RepairReport />}
                    requiredRole="Manager"
                  />
                }
              />
              <Route
                path="maintenance-report"
                element={
                  <ProtectedRoute
                    element={<MaintenanceReport />}
                    requiredRole="Manager"
                  />
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute
                    element={<ManagerAccount />}
                    requiredRole="Manager"
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

export default ManagerRoutes;
