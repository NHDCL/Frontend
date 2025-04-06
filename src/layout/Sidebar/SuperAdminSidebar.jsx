import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { sadminnavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const SuperAdminSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const splitIndex = sadminnavigationLinks.length - 2;

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-change" : ""}`}>
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={logo} alt="profile" />
        </div>
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          {sadminnavigationLinks.slice(0, splitIndex).map((link) => (
            <li className="nav-item" key={link.id}>
              <NavLink 
                to={`/superadmin/${link.path}`} 
                className="nav-link" 
                activeclassname="active"
                end
              >
                <link.icon className="nav-link-icon" />
                <span className="nav-link-text">{link.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="bottom-links">
          <hr className="nav-divider" />
          <ul className="nav-list">
            {sadminnavigationLinks.slice(splitIndex).map((link) => (
              <li className="nav-item" key={link.id}>
                <NavLink 
                  to={`/superadmin/${link.path}`} 
                  className="nav-link" 
                  activeclassname="active"
                  end
                >
                  <link.icon className="nav-link-icon" />
                  <span className="nav-link-text">{link.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default SuperAdminSidebar;
