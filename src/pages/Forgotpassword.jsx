import React, { useState } from "react";
import "./css/forgotpassword.css";
import { FaEnvelope } from "react-icons/fa";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";

const Forgotpassword = () => {

  return (
    <div>
      <Header />
      <div className="fp-container">
        <form className="fp-custom-form">
          <h2 className="fp-title">Login to Your Account</h2>

          <div className="fp-idiv">
              {/* Email Input */}
              <div className="fp-input-group">
                <FaEnvelope className="fp-input-icon" />
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="Enter Your Email Address"
                  className="fp-input"
                />

            </div>
          </div>

          <button type="submit" className="fp-submit-btn">
            Send
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Forgotpassword;
