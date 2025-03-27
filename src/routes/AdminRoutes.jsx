import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";
import AdminSidebar from "../layout/Sidebar/AdminSidebar"
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

const AdminRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <AdminSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
        </UserProvider>
        <div className="content-main">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="academies" element={<AdminAcademies />} />
            <Route path="Users" element={<AdminUser />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="approval" element={<AssetApproval />} />
            <Route path="repair-maintenance" element={<AdminRepair />} />
            <Route path="preventive-maintenance" element={<AdminMaintenance />} />
            <Route path="repair-report" element={<AdminRReport />} />
            <Route path="maintenance-report" element={<AdminMReport />} />
            <Route path="account" element={<AdminAccount />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;
