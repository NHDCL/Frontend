// import { Routes, Route } from "react-router-dom";
// import Users from "../pages/managerPage/user";
// import MAsset from "../pages/managerPage/MAsset";
// import Category from "../pages/managerPage/AssetCategory";
// import ManagerDashboard from "../pages/managerPage/ManagerHome";
// import PMaintenance from "../pages/managerPage/PMaintenance";
// import RepairReport from "../pages/managerPage/RepairReport";
// import Repair from "../pages/managerPage/Repair";
// import MaintenanceReport from "../pages/managerPage/maintenanceReport";
// import Sidebar from "../layout/Sidebar/Sidebar";
// import ContentTop from "../components/ContentTop/ContentTop";

// const ManagerRoutes = () => {
//   return (
//     <div>
//       <Sidebar/>
//       <div>
//       <Routes>
//       <Route path="/M" element={<ManagerDashboard />} />
//       <Route path="/MUsers" element={<Users />} />
//       <Route path="/Massets" element={<MAsset />} />
//       <Route path="/Mcategory" element={<Category />} />
//       <Route path="/MRepairMaintenance" element={<Repair />} />
//       <Route path="/MPMaintenance" element={<PMaintenance />} />
//       <Route path="/MRepairReport" element={<RepairReport />} />
//       <Route path="/MMaintenanceReport" element={<MaintenanceReport />} />
//     </Routes>
//       </div>
//     </div>
//   );
// };

// export default ManagerRoutes;


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
            <Route path="/M" element={<ManagerDashboard />} />
            <Route path="/MUsers" element={<Users />} />
            <Route path="/Massets" element={<MAsset />} />
            <Route path="/Mcategory" element={<Category />} />
            <Route path="/MRepairMaintenance" element={<Repair />} />
            <Route path="/MPMaintenance" element={<PMaintenance />} />
            <Route path="/MRepairReport" element={<RepairReport />} />
            <Route path="/MMaintenanceReport" element={<MaintenanceReport />} />
            <Route path="/MAccount" element={<ManagerAccount />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ManagerRoutes;
