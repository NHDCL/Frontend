import React from "react";
import "./../../pages/css/LandingFooter.css";
import { FaFacebook, FaGlobe } from "react-icons/fa";
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
          <a
            href="https://www.nhdcl.bt/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NHDCL Bhutan
          </a>
          <a
            href="https://gyalsung.bt/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gyalsung Academy
          </a>
          <a
            href="https://erp.nhdcl.bt/#login"
            target="_blank"
            rel="noopener noreferrer"
          >
            ERP System
          </a>
        </div>

        <div style={{marginTop:"20px"}}>
          <h3 className="lfh3">Follow Us</h3>
          <div className="lflink">
            <a
              href="https://www.facebook.com/profile.php?id=100078034536894"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="lf-i facebook" />
            </a>
            <a
              href="https://www.tiktok.com/@nhdcl_furnitures?_t=ZS-8wJpSvU8s9B&_r=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiFillTikTok className="lf-i tiktok" />
            </a>
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
