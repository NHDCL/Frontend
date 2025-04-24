import React, { useEffect, useState } from "react";
import "./css/landingpage.css";
import Header from "../components/LandingComponents/Header";
import Academies from "../components/LandingComponents/Academies";
import MaintenanceRequest from "../components/LandingComponents/MaintancesRequest";
import LandingFooter from "../components/LandingComponents/LandingFooter";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useGetAcademyQuery } from "./../slices/userApiSlice";
import Swal from "sweetalert2";
// import { useEffect } from "react";

const Landingpage = () => {
  const navigate = useNavigate();
  const { data: academies, isLoading, error, refetch } = useGetAcademyQuery();
  const [academyList, setAcademyList] = useState([]);

  const handleGetStarted = () => {
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to fetch academies.",
      });
    }

    // Set academy list when data is available
    if (academies) {
      setAcademyList(academies); // use correct state and data
    }
  }, [error, academies]); // add academies as dependency

  return (
    <div>
      <Header />
      <div className="lcontainer">
        <div className="lwording">
          <div className="lh1outer">
            <h1 className="lh1">Efficient Facility</h1>
            <h1 className="lh1">Management</h1>
            <h1 className="lh1">for Gyalsung</h1>
            <h1 className="lh1">Academy</h1>
          </div>
          <h3 className="lh3">
            Streamline facility maintenance, requests, and tracking
            effortlessly.
          </h3>
          <button onClick={handleGetStarted} className="lgetstart">
            <p className="lp">Get Started</p>
          </button>
        </div>
      </div>
      <div className="llowercontainer">
        <div>
          <Academies />
        </div>
        <div>
          <MaintenanceRequest />
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};
export default Landingpage;
