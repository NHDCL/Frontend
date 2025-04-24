import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { adminnavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";
import { useLogoutMutation } from "../../slices/userApiSlice";
import { useDispatch } from "react-redux";
import { logout } from "../../slices/authSlice";

const AdminSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  console.log("isSidebarOpen:", isSidebarOpen);
  const splitIndex = adminnavigationLinks.length - 2; // Split before Account and Logout
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logoutUser] = useLogoutMutation();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      color: "#305845",
      showCancelButton: true,
      confirmButtonColor: "#305845",
      cancelButtonColor: "#897462",
      confirmButtonText: "Yes, Logout!",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
        dispatch(logout());
        sessionStorage.clear();
        localStorage.clear();

        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        navigate("/login", { replace: true });
      } catch (error) {
        Swal.fire("Error", "Logout failed. Try again.", "error");
        console.error("Logout error:", error);
      }
    }
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
          {adminnavigationLinks.slice(0, splitIndex).map((link) => {
            const IconComponent = link.icon;
            return (
              <li className="nav-item" key={link.id}>
                {link.path === "" ? (
                  // For home/dashboard, use exact /admin path
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    end
                  >
                    <IconComponent className="nav-link-icon" />
                    <span className="nav-link-text">{link.title}</span>
                  </NavLink>
                ) : (
                  // For all other links, append the path to /admin/
                  <NavLink
                    to={`/admin/${link.path}`}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    end
                  >
                    <IconComponent className="nav-link-icon" />
                    <span className="nav-link-text">{link.title}</span>
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>

        <div className="bottom-links">
          <hr className="nav-divider" />
          <ul className="nav-list">
            {adminnavigationLinks.slice(splitIndex).map((link) => {
              const IconComponent = link.icon;
              return (
                <li className="nav-item" key={link.id}>
                  {link.title === "Logout" ? (
                    <button
                      className="nav-link logout-btn"
                      onClick={handleLogout}
                    >
                      <IconComponent className="nav-link-icon" />
                      <span className="nav-link-text">{link.title}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={`/admin/${link.path}`}
                      className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                      }
                      end
                    >
                      <IconComponent className="nav-link-icon" />
                      <span className="nav-link-text">{link.title}</span>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
