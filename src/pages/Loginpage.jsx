import React, { useState } from "react";
import "./css/Loginpage.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import {Link} from 'react-router-dom'


const Loginpage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <Header/>
      <div className="login-container">
        <form className="login-custom-form">
          <h2 className="login-title">Login to Your Account</h2>

          <div className="login-idiv">
            <div className="login-inpt">
              {/* Email Input */}
              <div className="login-input-group">
                <FaEnvelope className="login-input-icon" />
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="Email Address"
                  className="login-input"
                />
              </div>

              {/* Password Input with Eye Icon */}
              <div className="login-input-group">
                <FaLock className="login-input-icon" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="off"
                  placeholder="Password"
                  className="login-input"
                />
                <span className="login-password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
            </div>
            <Link to="/forgotpassword" className="login-forgot-password">
              Forgot Password?
            </Link>
          </div>

      
            {/* <Link to="/technician/" style={{ width:"40%"}} > */}
            <Link to="/admin/" style={{ width:"40%"}} >
            {/* <Link to="/manager/" style={{ width:"40%"}} > */}

              <button type="submit" className="login-submit-btn">
              Login
              </button>
            </Link>
        </form>
      </div>
      <LandingFooter/>
      
    </div>
  );
};

export default Loginpage;
