import { Routes, Route} from "react-router-dom";
import ManagerRoutes from "./managerRoutes";
import Landingpage from "../pages/Landingpage";
import Loginpage from "../pages/Loginpage";
import Forgotpassword from "../pages/Forgotpassword";
import Otppages from "../pages/Otppages";
import Newpasswordpage from "../pages/Newpasswordpage";

const AppRoutes = () => {
  return (
    // <Router>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/forgotpassword" element={<Forgotpassword/>} />
        <Route path="/otp" element={<Otppages/>} />
        <Route path="/newpassword" element={<Newpasswordpage/>} />



        <Route path="/*" element={<ManagerRoutes />} /> {/* Manager section */}

      </Routes>
    // </Router>
  );
};

export default AppRoutes;
