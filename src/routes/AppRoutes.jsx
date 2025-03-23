import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ManagerRoutes from "./managerRoutes";
import Login from "../pages/login";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Manager Routes */}
      <Route path="/manager/*" element={<ManagerRoutes />} />

    </Routes>
  );
};

export default AppRoutes;
