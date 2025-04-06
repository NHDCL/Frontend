import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { adminnavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const AdminSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const splitIndex = adminnavigationLinks.length - 2;

  return (
    <div className={`sidebar ${isSidebarOpen ? "sidebar-change" : ""}`}>
      <div className="user-info">
        <div className="info-img img-fit-cover">
          <img src={logo} alt="profile" />
        </div>
      </div>

      <nav className="navigation">
        <ul className="nav-list">
          {adminnavigationLinks.slice(0, splitIndex).map((link) => (
            <li className="nav-item" key={link.id}>
              <NavLink 
                to={`/admin/${link.path}`} 
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
            {adminnavigationLinks.slice(splitIndex).map((link) => (
              <li className="nav-item" key={link.id}>
                <NavLink 
                  to={`/admin/${link.path}`} 
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

export default AdminSidebar;
