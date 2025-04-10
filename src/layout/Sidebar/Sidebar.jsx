import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { managernavigationLinks } from "../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../context/sidebarContext";
import logo from "../../assets/images/Nlogo.jpeg";
import { useLogoutMutation } from "../../slices/userApiSlice"; // import logout mutation
import { useDispatch } from "react-redux"; // Import useDispatch
import { logout } from "../../slices/authSlice"; // Import logout action

const ManagerSidebar = () => {
  const { isSidebarOpen } = useContext(SidebarContext);
  const splitIndex = managernavigationLinks.length - 2;
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch

  const [logoutUser] = useLogoutMutation(); // use logout mutation

  const handleLogout = async () => {
    // Confirming with the user if they really want to log out
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout!",
    });

    if (result.isConfirmed) {
      try {
        // Logging out the user by calling the API mutation
        await logoutUser();

        // Clearing session and authentication tokens
        sessionStorage.removeItem("token");

        // Dispatching the logout action
        dispatch(logout()); // Dispatch the logout action

        // Removing user info from localStorage
        localStorage.removeItem("userInfo");

        // Showing success message on successful logout
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });

        // Redirecting to the login page after logout
        navigate("/login");
      } catch (error) {
        // Handling any errors during logout
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
          {managernavigationLinks.slice(0, splitIndex).map((link) => (
            <li className="nav-item" key={link.path}>
              <NavLink
                to={`/manager/${link.path}`}
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
            {managernavigationLinks.slice(splitIndex).map((link) => (
              <li className="nav-item" key={link.path}>
                {link.title === "Logout" ? (
                  <button
                    className="nav-link logout-btn"
                    onClick={handleLogout} // Logout button triggers handleLogout function
                  >
                    <link.icon className="nav-link-icon" />
                    <span className="nav-link-text">{link.title}</span>
                  </button>
                ) : (
                  <NavLink
                    to={`/manager/${link.path}`}
                    className="nav-link"
                    activeclassname="active"
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

export default ManagerSidebar;
