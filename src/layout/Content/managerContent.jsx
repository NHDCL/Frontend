import "./Content.css";
import ContentTop from "../../components/ContentTop/ContentTop";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { UserProvider } from "../../context/userContext";
import ManagerRoutes from "../../routes/managerRoutes";

const ManagerContent = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div className={`main-content ${!isSidebarOpen ? "shifted" : ""}`}>
      <UserProvider>
        <ContentTop />
      </UserProvider>

      <div className="content-main">
        <ManagerRoutes />
      </div>
    </div>
  );
};

export default ManagerContent;
