import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { managernavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const Sidebar = () => {
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
          {managernavigationLinks.map((link) => (
            <li className="nav-item" key={link.id}>
              <NavLink to={link.path} className="nav-link" activeclassname="active">
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

export default Sidebar;
