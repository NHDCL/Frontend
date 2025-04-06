import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { IoMenu } from "react-icons/io5";
import { useLocation } from "react-router-dom";
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

  // Set profile image to a constant variable
  const profileImage = user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg";

  // Determine user role and select the correct navigation links
  const role = user?.role || "manager"; // Change this based on actual user roles
  let navigationLinks = managernavigationLinks; // Default to manager

  if (role === "technician") navigationLinks = techniciannavigationLinks;
  else if (role === "admin") navigationLinks = adminnavigationLinks;
  else if (role === "sadmin") navigationLinks = sadminnavigationLinks;
  else if (role === "supervisor") navigationLinks = supervisornavigationLinks;

  // Find the current page title based on the active URL path
  const currentPage = navigationLinks.find(link => `/${role}/${link.path}` === location.pathname);

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        <button type="button" className="sidebar-toggler" onClick={toggleSidebar}>
          <IoMenu style={{ fontSize: "25px", color: "var(--clr-darkgreen)" }} />
        </button>
        <h3 className="content-top-title">
          {currentPage ? currentPage.title : "Home"}
        </h3>
      </div>
      <div className="content-top-btns">
        <button className="profile-btn">
          <img src={profileImage} className="profile-img" alt="Profile" />
        </button>
      </div>
    </div>
  );
};

export default ContentTop;
