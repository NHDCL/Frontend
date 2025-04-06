import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { techniciannavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const TechnicianSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const splitIndex = techniciannavigationLinks.length - 2; // Get the index before last two items

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-change" : ""}`}>
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={logo} alt="profile" />
        </div>
      </div>
      <nav className="navigation">
        <ul className="nav-list">
          {techniciannavigationLinks.map((link, index) => (
            <li className="nav-item" key={link.path}> {/* Use unique key like `link.path` */}
              {index === splitIndex && <hr className="nav-divider" />} {/* Divider for the last two items */}
              <NavLink 
                to={`/technician/${link.path}`} 
                className="nav-link" 
                activeClassName="active"
                end
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

export default TechnicianSidebar;
