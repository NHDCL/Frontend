import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { techniciannavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const TechnicianSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data (adjust according to your authentication method)
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-change" : ""}`}>
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={logo} alt="profile" />
        </div>
      </div>
      <nav className="navigation">
        <ul className="nav-list">
          {techniciannavigationLinks.map((link) => (
            link.path === "logout" ? ( // Check if it's the logout button
              <li className="nav-item" key={link.id} onClick={handleLogout}>
                <button className="nav-link logout-btn">
                  <link.icon className="nav-link-icon" />
                  <span className="nav-link-text">{link.title}</span>
                </button>
              </li>
            ) : (
              <li className="nav-item" key={link.id}>
                <NavLink 
                  to={`/technician/${link.path}`}  
                  className="nav-link"
                  activeclassname="active"
                  end
                >
                  <link.icon className="nav-link-icon" />
                  <span className="nav-link-text">{link.title}</span>
                </NavLink>
              </li>
            )
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TechnicianSidebar;
