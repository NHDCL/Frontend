import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/Otp.css";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "../slices/userApiSlice";
import Swal from "sweetalert2";

const Otppages = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email from location state or localStorage
  const storedEmail = localStorage.getItem("email");
  const email = location.state?.email || storedEmail;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();

  // Store email in localStorage when the page loads
  useEffect(() => {
    if (email) {
      localStorage.setItem("email", email);
    } else {
      Swal.fire({
        icon: "error",
        title: "Email Not Found!",
        text: "No email provided. Please check the email link or try again.",
      }).then(() => {
        navigate("/forgotpassword");
      });
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single-digit numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Store the updated OTP in localStorage
    localStorage.setItem("otp", newOtp.join(""));

    // Move to the next input field only if the current one is filled
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter the full OTP.",
      });
      return;
    }

    try {
      const response = await verifyOtp({ email, otp: otpString }).unwrap();

      // Store email and OTP again before navigating to ensure they are not lost
      localStorage.setItem("email", email);
      localStorage.setItem("otp", otpString);

      Swal.fire({
        icon: "success",
        title: "OTP Verified",
        text: "Your OTP is valid.",
      }).then(() => {
        navigate("/newpassword", { state: { email } });
      });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Swal.fire({
        icon: "error",
        title: "OTP Verification Failed",
        text: error?.data?.message || "Invalid OTP. Please try again.",
      });
    }
  };

  const handleResendOtp = async () => {
    Swal.fire({
      title: "Resending OTP...",
      text: "Please wait while we resend your OTP.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await resendOtp(email).unwrap();

      Swal.fire({
        icon: "success",
        title: "OTP Resent",
        text: response?.message || "A new OTP has been sent to your email.",
      });

      // Clear OTP from localStorage after resending
      localStorage.removeItem("otp");
      setOtp(["", "", "", "", "", ""]);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Resend OTP",
        text: error?.data?.message || "Could not resend OTP. Try again later.",
      });
    }
  };

  return (
    <div>
      <Header />
      <div className="otpp-container">
        <form className="otp-custom-form" onSubmit={handleSubmit}>
          <h2 className="otp-title">Reset Your Password</h2>

          <div className="otp-idiv">
            <p>Enter the OTP sent to your email</p>
            <p className="otp-email-display">{email}</p>

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

          <button type="submit" className="otp-submit-btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResendOtp}
          >
            Resend OTP
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Otppages;
