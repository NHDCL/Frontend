import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { sadminnavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";
import { logout } from "../../slices/authSlice";
import { useDispatch } from "react-redux";

const SuperAdminSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const splitIndex = sadminnavigationLinks.length - 2;
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      // Clear sessionStorage correctly
      sessionStorage.clear();

      // Dispatch Redux logout action
      dispatch(logout());

      // Show success toast
      Swal.fire({
        icon: "success",
        title: "Logged out successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });

      // Navigate to login page
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
          {sadminnavigationLinks.slice(0, splitIndex).map((link) => (
            <li className="nav-item" key={link.id}>
              <NavLink
                to={`/superadmin/${link.path}`}
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
            {sadminnavigationLinks.slice(splitIndex).map((link) => (
              <li className="nav-item" key={link.id}>
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
                    to={`/superadmin/${link.path}`}
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

export default SuperAdminSidebar;
