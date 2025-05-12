import React, { useState, useEffect } from "react";
import { useResetPasswordMutation } from "../slices/userApiSlice";
import Swal from "sweetalert2";
import "./css/Newpassword.css";
import { FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import { useLocation, useNavigate } from "react-router-dom";

const Newpasswordpage = () => {
  const { state } = useLocation(); // This will receive email from the previous page
  const email = state?.email;

  // Retrieve OTP from localStorage
  const otp = localStorage.getItem("otp");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate(); // Hook to navigate programmatically

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match!",
        text: "Please enter matching passwords.",
      });
      return;
    } else {
      // Show loading spinner with SweetAlert
      const loadingSwal = Swal.fire({
        title: "Processing...",
        text: "Please wait while we reset your password.",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false, // Prevent closing the alert
        didClose: () => {
          Swal.showLoading();
        },
      });

      try {
        // API call to reset password using email, OTP, and newPassword
        const res = await resetPassword({
          email,
          otp, // Ensure OTP is sent along with the email and new password
          newPassword: password, // Only send the newPassword (backend doesn't need confirmPassword)
        }).unwrap(); // Unwrap the result from the API call

        // Close the loading alert and show success message
        loadingSwal.close();
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: res.message || "You can now log in with your new password!",
        });

        // Reset form fields
        setPassword("");
        setConfirmPassword("");

        // Redirect to login page
        navigate("/login"); // This will navigate to the login page
      } catch (error) {
        // Close the loading alert and show error message
        loadingSwal.close();
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error?.data?.message || "Failed to reset password. Try again!",
        });
      }
    }
  };

  useEffect(() => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Email not found!",
        text: "No email provided. Please check the email link or try again.",
      });
    }

    // If OTP is not found in localStorage, show an error
    if (!otp) {
      Swal.fire({
        icon: "error",
        title: "OTP not found!",
        text: "OTP not found. Please try again or request a new OTP.",
      }).then(() => {
        navigate("/otp"); // Navigate back to OTP page
      });
    }
  }, [email, otp, navigate]);

  return (
    <div>
      <Header />
      <div className="newp-container">
        <form className="newp-custom-form" onSubmit={handleSubmit}>
          <h2 className="newp-title">Reset Your Password</h2>

          {/* New Password Input */}
          <div style={{width:"80%"}} className="newp-input-group">
            <FaLock className="newp-input-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="off"
              placeholder="Enter New Password"
              className="newp-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="newp-password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          {/* Confirm Password Input */}
          <div style={{width:"80%"}} className="newp-input-group">
            <FaLock className="newp-input-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="off"
              placeholder="Confirm New Password"
              className="newp-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="newp-password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          <button
            type="submit"
            className="newp-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Newpasswordpage;
