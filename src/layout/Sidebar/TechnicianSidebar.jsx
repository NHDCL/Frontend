import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { techniciannavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";

const TechnicianSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const navigate = useNavigate();
  const splitIndex = techniciannavigationLinks.length - 2;

  // Handle Logout Logic
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, Logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove authentication data
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("token");

        // Success toast
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        // Redirect to login page
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
          {techniciannavigationLinks.slice(0, splitIndex).map((link) => (
            <li className="nav-item" key={link.path}>
              <NavLink
                to={`/technician/${link.path}`}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
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
            {techniciannavigationLinks.slice(splitIndex).map((link) => (
              <li className="nav-item" key={link.path}>
                {link.title === "Logout" ? (
                  <button
                    className="nav-link logout-btn"
                    onClick={handleLogout}
                  >
                    <link.icon className="nav-link-icon" />
                    <span className="nav-link-text">{link.title}</span>
                  </button>
                ) : (
                  <NavLink
                    to={`/technician/${link.path}`}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    end
                  >
                    <link.icon className="nav-link-icon" />
                    <span className="nav-link-text">{link.title}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default TechnicianSidebar;
