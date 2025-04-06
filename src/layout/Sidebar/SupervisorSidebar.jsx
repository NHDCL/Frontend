import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supervisornavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const SupervisorSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate("/login");
      }
    });
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
          {supervisornavigationLinks.map((link) => (
            <li className="nav-item" key={link.id}>
              {link.title === "Logout" ? (
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <link.icon className="nav-link-icon" />
                  <span className="nav-link-text">{link.title}</span>
                </button>
              ) : (
                <NavLink
                  to={`/supervisor/${link.path}`} // Ensure proper navigation
                  className="nav-link"
                  activeclassname="active"
                  end // Prevents nested links from staying active
                >
                  <link.icon className="nav-link-icon" />
                  <span className="nav-link-text">{link.title}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SupervisorSidebar;
