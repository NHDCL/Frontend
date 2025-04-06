import "./ContentTop.css";
import { useContext } from "react";
import { SidebarContext } from "../../context/sidebarContext";
import { IoMenu } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { managernavigationLinks } from "../../data/data";
import { useUser } from "../../context/userContext";

const ContentTop = () => {
  const { toggleSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const { user } = useUser();

  // Set profile image to a constant variable
  const profileImage = user?.profileImage || "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250";
  const currentPage = managernavigationLinks.find(
    (link) => link.path === location.pathname
  );

  return (
    <div className="main-content-top">
      <div className="content-top-left">
        <button
          type="button"
          className="sidebar-toggler"
          onClick={() => toggleSidebar()}
        >
          <IoMenu style={{ fontSize: "25px", color: "var(--clr-darkgreen)" }} />
        </button>
        <h3 className="content-top-title">
          {currentPage ? currentPage.title : "Home"}
        </h3>
      </div>
      <div className="content-top-btns">
      <button className="profile-btn">
          <img
            src={profileImage} // Use the constant for the profile image
            className="profile-img" // You can style the profile image
            alt="Profile"
          />
        </button>
        <p style={{ fontSize: "14px", fontWeight: "500" }}>{user.role}</p>

      </div>
    </div>
  );
};

export default ContentTop;
