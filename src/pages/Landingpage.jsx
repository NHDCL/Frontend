import React from "react";
import "./css/landingpage.css";
import Header from "../components/LandingComponents/Header";
import Academies from "../components/LandingComponents/Academies";
import MaintenanceRequest from "../components/LandingComponents/MaintancesRequest";
import LandingFooter from "../components/LandingComponents/LandingFooter";

const Landingpage = () => {
  return (
    <div>
      <Header/>
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
          <div className="lgetstart">
            <p className="lp">Get Started</p>
          </div>
        </div>
      </div>
      <div className="llowercontainer">
        <div>
          <Academies/>
        </div>
        <div>
          <MaintenanceRequest/>
        </div>
      </div>
      <LandingFooter/>
    </div>
  );
};
export default Landingpage;
