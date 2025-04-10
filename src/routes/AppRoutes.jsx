import { Routes, Route } from "react-router-dom";
import ManagerRoutes from "./managerRoutes";
import Landingpage from "../pages/Landingpage";
import Loginpage from "../pages/Loginpage";
import Forgotpassword from "../pages/Forgotpassword";
import Otppages from "../pages/Otppages";
import Newpasswordpage from "../pages/Newpasswordpage";
import TechnicianRoutes from "./TechnicianRoutes";
import AdminRoutes from "./AdminRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import SupervisorRoutes from "./SupervisorRoutes";
import QRDetail from "../pages/QRDetail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/otp" element={<Otppages />} />
      <Route path="/newpassword" element={<Newpasswordpage />} />
      <Route path="/qrdetail" element={<QRDetail />} />


      {/* Define separate base paths for manager and technician */}
      <Route path="/manager/*" element={<ManagerRoutes />} />
      <Route path="/technician/*" element={<TechnicianRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
      <Route path="/supervisor/*" element={<SupervisorRoutes />} />
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
