import React, { useState } from "react";
import "./css/Loginpage.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import { Link } from "react-router-dom";

const Loginpage = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted with:", { email, password });
      // Handle successful login here
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
                <span className="login-password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <Link to="/forgotpassword" className="login-forgot-password">
              Forgot Password?
            </Link>
          </div>
            {/* <Link to="/technician/" style={{ width:"40%"}} > */}
            <Link to="/admin/" style={{ width:"40%"}} >
            {/* <Link to="/manager/" style={{ width:"40%"}} > */}

              <button type="submit" style={{ width:"40%"}} className="login-submit-btn">
              <Link to="/admin/" style={{ width:"40%", color:"white"}} >Login</Link>
              </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Loginpage;