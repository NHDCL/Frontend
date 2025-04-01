import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { supervisornavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const SupervisorSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-change" : ""}`}>
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={logo} alt="profile" />
        </div>
      </div>
      <nav className="navigation">
        <ul className="nav-list">
          {supervisornavigationLinks.map((link) => (
            <li className="nav-item" key={link.id}>
              <NavLink 
                to={`/supervisor/${link.path}`}  // Ensure proper navigation
                className="nav-link" 
                activeclassname="active"
                end  // Prevents nested links from staying active
              >
                <link.icon className="nav-link-icon" />
                <span className="nav-link-text">{link.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SupervisorSidebar;
