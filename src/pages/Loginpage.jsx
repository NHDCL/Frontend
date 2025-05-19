import React, { useState } from "react";
import "./css/Loginpage.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../slices/userApiSlice"; // Import login mutation
import { setCredentials } from "../slices/authSlice";
import Swal from "sweetalert2";

const Loginpage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation(); // Login mutation
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Show loading indicator with SweetAlert
      Swal.fire({
        title: "Logging in...",
        text: "Please wait while we authenticate you.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      try {
        const response = await login({ email, password }).unwrap();

        // Extract role from response
        const authorities = response.user.authorities;
        const userRole =
          authorities.find((auth) =>
            [
              "Admin",
              "Manager",
              "Super Admin",
              "Supervisor",
              "Technician",
            ].includes(auth.authority)
          )?.authority || "Unknown";

        // Dispatch once: user, userRole, and token all together
        dispatch(
          setCredentials({
            user: response.user,
            userRole,
            token: response.token,
          })
        );

        // Save token to sessionStorage
        // sessionStorage.setItem("token", response.token);

        Swal.fire({
          icon: "success",
          title: "Login Successfully!",
          text: "You have logged in successfully.",
          position: "center",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          if (userRole === "Admin") {
            navigate("/admin/");
          } else if (userRole === "Manager") {
            navigate("/manager/");
          } else if (userRole === "Super Admin") {
            navigate("/superadmin/");
          } else if (userRole === "Supervisor") {
            navigate("/supervisor/");
          } else if (userRole === "Technician") {
            navigate("/technician/");
          } else {
            navigate("/");
          }
        });
      } catch (err) {
        console.error("Login Failed:", err);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            err?.data?.message ||
            "Invalid email or password. Please try again.",
        });
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <form className="login-custom-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Login to Your Account</h2>

          <div className="login-idiv">
            <div className="login-inpt">
              {/* Email Input */}
              <div className="login-input-group">
                <FaEnvelope className="login-input-icon" />
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="Email Address"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="error-message">{errors.email}</p>}

              {/* Password Input */}
              <div className="login-input-group">
                <FaLock className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="off"
                  placeholder="Password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="login-password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>
            <Link to="/forgotpassword" className="login-forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            style={{ width: "40%" }}
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Loginpage;
