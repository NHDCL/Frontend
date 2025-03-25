import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import Sidebar from "../layout/Sidebar/Sidebar";
import ContentTop from "../components/ContentTop/ContentTop";

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
        </UserProvider>
        <div className="content-main">
          <Routes>
            <Route path="/" element={<ManagerDashboard />} /> 
            <Route path="users" element={<Users />} />
            <Route path="assets" element={<MAsset />} />
            <Route path="category" element={<Category />} />
            <Route path="repair-maintenance" element={<Repair />} />
            <Route path="preventive-maintenance" element={<PMaintenance />} />
            <Route path="repair-report" element={<RepairReport />} />
            <Route path="maintenance-report" element={<MaintenanceReport />} />
            <Route path="account" element={<ManagerAccount />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ManagerRoutes;
