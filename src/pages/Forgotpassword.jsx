import React, { useState } from "react";
import "./css/forgotpassword.css";
import { FaEnvelope } from "react-icons/fa";
import Header from "../components/LandingComponents/Header";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "../slices/userApiSlice"; // Import API Hook

const Forgotpassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation(); // Mutation Hook

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire("Error", "Please enter your email address", "error");
      return;
    }

    try {
      Swal.fire({
        title: "Sending OTP...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await forgotPassword(email).unwrap(); // API Call

      Swal.fire("Success", "OTP has been sent to your email", "success").then(
        () => {
          navigate("/otp", { state: { email } });
        }
      );
    } catch (error) {
      console.error("Error:", error);
      Swal.fire(
        "Error",
        error?.data?.message || "Failed to send OTP. Please try again later.",
        "error"
      );
    }
  };

  return (
    <div>
      <Header />
      <div className="fp-container">
        <form className="fp-custom-form" onSubmit={handleSubmit}>
          <h2 className="fp-title">Enter Your Email to Receive OTP</h2>

          <div className="fp-idiv">
            <div className="fp-input-group">
              <FaEnvelope className="fp-input-icon" />
              <input
                required
                type="email"
                name="email"
                autoComplete="off"
                placeholder="Enter Your Email Address"
                className="fp-input"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="fp-submit-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Forgotpassword;
