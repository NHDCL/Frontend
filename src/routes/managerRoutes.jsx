import { Routes, Route } from "react-router-dom";
import Users from "../pages/managerPage/user";
import MAsset from "../pages/managerPage/MAsset";
import Category from "../pages/managerPage/AssetCategory";
import ManagerDashboard from "../pages/managerPage/ManagerHome";
import PMaintenance from "../pages/managerPage/PMaintenance";
import RepairReport from "../pages/managerPage/RepairReport";
import Repair from "../pages/managerPage/Repair";
import MaintenanceReport from "../pages/managerPage/maintenanceReport";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />} />
      <Route path="/MUsers" element={<Users />} />
      <Route path="/Massets" element={<MAsset />} />
      <Route path="/Mcategory" element={<Category />} />
      <Route path="/MRepairMaintenance" element={<Repair />} />
      <Route path="/MPMaintenance" element={<PMaintenance />} />
      <Route path="/MRepairReport" element={<RepairReport />} />
      <Route path="/MMaintenanceReport" element={<MaintenanceReport />} />
    </Routes>
  );
};

export default ManagerRoutes;
