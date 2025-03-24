import React, { useState, useRef } from "react";
import "./css/Otp.css";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";


const Otppages = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);



  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single-digit numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <div>
      <Header />
      <div className="otpp-container">
        <form className="otp-custom-form">
          <h2 className="otp-title">Reset Your Password</h2>

          <div className="otp-idiv">
          <p>Enter OTP code that you got in your email</p>

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className="otp-box"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="otp-submit-btn">
            Enter
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Otppages;
