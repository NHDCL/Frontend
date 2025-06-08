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
  const { state } = useLocation();
  const email = state?.email;
  const otp = localStorage.getItem("otp");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    if (strength === 5) return "Strong";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(""); // Clear previous error

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must be 8+ characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    const loadingSwal = Swal.fire({
      title: "Processing...",
      text: "Please wait while we reset your password.",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    try {
      const res = await resetPassword({
        email,
        otp,
        newPassword: password,
      }).unwrap();

      loadingSwal.close();
      Swal.fire({
        icon: "success",
        title: "Password Reset Successful",
        text: res.message || "You can now log in with your new password!",
      });

      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error) {
      loadingSwal.close();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error?.data?.message || "Failed to reset password. Try again!",
      });
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

    if (!otp) {
      Swal.fire({
        icon: "error",
        title: "OTP not found!",
        text: "OTP not found. Please try again or request a new OTP.",
      }).then(() => {
        navigate("/otp");
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
          <div style={{ width: "80%" }} className="newp-input-group">
            <FaLock className="newp-input-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="off"
              placeholder="Enter New Password"
              className="newp-input"
              value={password}
              onChange={(e) => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                setPasswordStrength(getPasswordStrength(newPassword));
                setPasswordError(""); // Reset on change
              }}
            />
            <span
              className="newp-password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div
              style={{
                width: "80%",
                textAlign: "center",
                marginTop: "5px",
                fontWeight: "bold",
                color:
                  passwordStrength === "Weak"
                    ? "red"
                    : passwordStrength === "Medium"
                    ? "orange"
                    : "green",
              }}
            >
              Strength: {passwordStrength}
            </div>
          )}

          {/* Confirm Password Input */}
          <div style={{ width: "80%" }} className="newp-input-group">
            <FaLock className="newp-input-icon" />
            <input
              required
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="off"
              placeholder="Confirm New Password"
              className="newp-input"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(""); // Reset on change
              }}
            />
            <span
              className="newp-password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
{passwordError && (
  <div
    style={{
      width: "80%",
      marginTop: "8px",
      color: "red",
      fontWeight: "500",
      textAlign: "left",
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    {passwordError}
  </div>
)}


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
