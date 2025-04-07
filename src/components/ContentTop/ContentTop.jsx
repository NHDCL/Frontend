import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { IoMenu } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUser } from "../../context/userContext";

import {
  managernavigationLinks,
  techniciannavigationLinks,
  adminnavigationLinks,
  sadminnavigationLinks,
  supervisornavigationLinks
} from "../../data/data";

const ContentTop = () => {
  const { toggleSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const { user } = useUser();

  // Get userRole from Redux store
  const userRole = useSelector((state) => state.auth.userRole);
  console.log("userRole",userRole)

  // Use correct nav links based on role
  let navigationLinks = [];

  switch (userRole) {
    case "Manager":
      navigationLinks = managernavigationLinks;
      break;
    case "Technician":
      navigationLinks = techniciannavigationLinks;
      break;
    case "Admin":
      navigationLinks = adminnavigationLinks;
      break;
    case "Super Admin":
      navigationLinks = sadminnavigationLinks;
      break;
    case "Supervisor":
      navigationLinks = supervisornavigationLinks;
      break;
    default:
      navigationLinks = [];
  }

  const pathArray = location.pathname.split("/");
  const currentPath = pathArray[pathArray.length - 1];

  // Find the corresponding navigation link
  const currentPage = navigationLinks.find(
    (link) => link.path === currentPath
  );

  // Display "Home" if no match is found, or use the matched title
  const title = currentPage ? currentPage.title : "Home";
  console.log(currentPage.title)

  const profileImage =
    user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg";

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        <button type="button" className="sidebar-toggler" onClick={toggleSidebar}>
          <IoMenu style={{ fontSize: "25px", color: "var(--clr-darkgreen)" }} />
        </button>
        <h3 className="content-top-title">{title}</h3>
      </div>
      <div className="content-top-btns">
        <button className="profile-btn">
          <img src={profileImage} className="profile-img" alt="Profile" />
        </button>
        <p style={{ fontSize: "14px", fontWeight: "500" }}>{userRole}</p>
      </div>
    </div>
  );
};

export default ContentTop;
