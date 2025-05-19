// SessionTimeoutManager.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const SessionTimeoutManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(true);

  // Define routes where session timeout should not be active
  const excludedRoutes = ["/"]; // Add your landing page route(s) here

  const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes total session timeout
  const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes warning before expiry

  useEffect(() => {
    // Check if current route should be excluded from session timeout
    const isExcludedRoute = excludedRoutes.includes(location.pathname);

    if (isExcludedRoute) {
      return; // Exit early if on excluded route
    }
    let inactivityTimer;
    let warningTimer;
    let warningDisplayed = false;

    // Reset the timer when user activity is detected
    const resetTimer = () => {
      // If there's already a warning displayed, don't reset timers
      if (warningDisplayed) return;

      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      // Set warning timer to show warning before timeout
      warningTimer = setTimeout(() => {
        showTimeoutWarning();
      }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

      // Set main timer for session expiration
      inactivityTimer = setTimeout(() => {
        handleSessionTimeout();
      }, SESSION_TIMEOUT_MS);
    };

    const showTimeoutWarning = () => {
      warningDisplayed = true;

      Swal.fire({
        title: "Session Timeout Warning",
        text: "Your session is about to expire due to inactivity.",
        icon: "warning",
        color: "#305845",
        showCancelButton: true,
        confirmButtonColor: "#305845",
        cancelButtonColor: "#897462",
        confirmButtonText: "Stay Logged In",
        cancelButtonText: "Logout",
        timer: WARNING_TIME_MS,
        timerProgressBar: true,
        allowOutsideClick: false,
      }).then((result) => {
        warningDisplayed = false;

        if (result.isConfirmed) {
          // User clicked "Stay Logged In"
          extendSession();
        } else {
          // User clicked "Logout" or timer expired
          handleSessionTimeout();
        }
      });
    };

    const extendSession = () => {
      // Reset timers after successful keep-alive
      warningDisplayed = false;
      resetTimer();

      // Optional: Make API call to keep session alive on backend
      /* 
      fetch('/api/auth/keep-alive', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      */
    };

    const handleSessionTimeout = () => {
      // Clear local storage/cookies
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userToken");
      sessionStorage.removeItem("token");
      document.cookie =
        "JWT-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Show session expired message
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired due to inactivity. You will be redirected to the login page.",
        icon: "info",
        color: "#305845",
        confirmButtonText: "Login Again",
        confirmButtonColor: "#305845",
        allowOutsideClick: false,
      }).then(() => {
        // Redirect to login page
        navigate("/login");
      });
    };

    // Events to track user activity - be more selective to avoid constant resets
    const events = ["mousedown", "keypress", "touchstart"];

    // Add event listeners
    const handleUserActivity = () => {
      setIsActive(true);
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Initialize timers
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
    };
  }, [navigate, location.pathname]); // Added location.pathname to dependencies

  return null;
};

export default SessionTimeoutManager;
