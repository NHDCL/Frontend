import React, { useState, useRef } from "react";
import "./css/Newpassword.css";
import { FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";

const Newpasswordpage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <Header />
      <div className="newp-container">
        <form className="newp-custom-form">
          <h2 className="newp-title">Reset Your Password</h2>

          <div className="newp-idiv">
            {/* Password Input with Eye Icon */}
            <div className="newp-input-group">
              <FaLock className="newp-input-icon" />
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="off"
                placeholder="Enter New Password"
                className="newp-input"
              />
              <span className="newp-password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>

            {/* Confirm Password Input with Eye Icon */}
            <div className="newp-input-group">
              <FaLock className="newp-input-icon" />
              <input
                required
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="off"
                placeholder="Confirm New Password"
                className="newp-input"
              />
              <span className="newp-password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="newp-submit-btn">
            Reset Password
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Newpasswordpage;
