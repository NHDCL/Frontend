import React from "react";
import "./../../pages/css/LandingFooter.css";
import { FaFacebook, FaYoutube, FaTelegram } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";

const LandingFooter = () => {
  return (
    <div className="lfcontainner">
      <div className="lfupper">
        <div className="lfQlinks">
          <h3 className="lfh3">Contact Us</h3>
          <p>Head Office No. : 323147 / 332735 / 332734</p>
          <p>
            Phuntsholing, Liaison Office No. : 05-252649 Mobile No. : 17655550
          </p>
          <p>
            Samdrupjongkhar, Liaison Officer No. : 07-251252 Mobile No. :
            77380066
          </p>
          <p>Changjiji Site Office No. : 345528 Mobile No. : 17631768</p>
        </div>
        <div className="lfQlinks">
          <h3 className="lfh3">Quick Links</h3>
          <p>NHDCL Bhutan</p>
          <p>Gyalsung Academy</p>
          <p>ERP</p>
          <p>Facility Management</p>
        </div>
        <div style={{marginTop:"23px"}}>
          <h3 className="lfh3">Follow Us</h3>
          <div className="lflink">
            <FaFacebook className="lf-i facebook" />
            <FaYoutube className="lf-i youtube" />
            <FaTelegram className="lf-i telegram" />
            <AiFillTikTok className="lf-i tiktok" />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <hr style={{ width: "98%" }} />
        <p className="lfcopyright">
          Copyright © NHDCL Facility Management System 2025. All Rights
          Reserved.
        </p>
      </div>
    </div>
  );
};

export default LandingFooter;
