import "./../layout/Content/Content.css";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarContext } from "../context/sidebarContext";
import { UserProvider } from "../context/userContext";

import ContentTop from "../components/ContentTop/ContentTop";
import SupervisorSidebar from "../layout/Sidebar/SupervisorSidebar";
import SupervisorHome from "../pages/SupervisorPage/SupervisorHome";
import SupervisorWO from "../pages/SupervisorPage/SupervisorWO";
import SupervisorAccount from "../pages/SupervisorPage/SupervisorAccount";

import ProtectedRoute from "./ProtectedRoute";
import SupervisorMReport from "../pages/SupervisorPage/SupervisorMReport";
import SupervisorRReport from "../pages/SupervisorPage/SupervisorRReport";

const SupervisorRoutes = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div>
      <SupervisorSidebar />
      <div className={`main-content ${isSidebarOpen ? "shifted" : ""}`}>
        <UserProvider>
          <ContentTop />
          <div className="content-main">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    element={<SupervisorHome />}
                    requiredRole="Supervisor"
                  />
                }
              />
              <Route
                path="work-order"
                element={
                  <ProtectedRoute
                    element={<SupervisorWO />}
                    requiredRole="Supervisor"
                  />
                }
              />
              <Route
                path="repair-report"
                element={
                  <ProtectedRoute
                    element={<SupervisorRReport />}
                    requiredRole="Supervisor"
                  />
                }
              />
              <Route
                path="maintenance-report"
                element={
                  <ProtectedRoute
                    element={<SupervisorMReport />}
                    requiredRole="Supervisor"
                  />
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute
                    element={<SupervisorAccount />}
                    requiredRole="Supervisor"
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

export default SupervisorRoutes;
