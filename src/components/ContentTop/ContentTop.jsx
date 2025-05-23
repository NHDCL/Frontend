import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { IoMenu } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultImage from "../../assets/images/defaultImage.png";
import { useUser } from "../../context/userContext";
import {
  managernavigationLinks,
  techniciannavigationLinks,
  adminnavigationLinks,
  sadminnavigationLinks,
  supervisornavigationLinks,
} from "../../data/data";
import { useGetUserByEmailQuery } from "../../slices/userApiSlice";
import { createSelector } from "reselect";

const selectUserInfo = (state) => state.auth.userInfo || {};
const getUserEmail = createSelector(
  selectUserInfo,
  (userInfo) => userInfo?.username || ""
);

const ContentTop = () => {
  const { toggleSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const { user } = useUser();

  const email = useSelector(getUserEmail);
  const { data: userData } = useGetUserByEmailQuery(email);

  // Get userRole from Redux store
  const userRole = useSelector((state) => state.auth.userRole);

  // Navigation links based on role
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
  const currentPage = navigationLinks.find((link) => link.path === currentPath);
  const title = currentPage ? currentPage.title : "Home";

  // Fetched profile image
  const profileImage = userData?.user?.image || defaultImage;

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        <button
          type="button"
          className="sidebar-toggler"
          onClick={toggleSidebar}
        >
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
