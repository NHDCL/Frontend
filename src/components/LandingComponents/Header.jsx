import React from "react";
import "./../../pages/css/header.css";
import nlogo from "./../../assets/images/nhdcl-o-logo.png";
import glogo from "./../../assets/images/glogo.png";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="hcontainner">
      <div>
        <Link to="/">
          <img
            className="hlogo"
            src={nlogo}
            alt="Logo"
            width="200"
            height="100"
          />
          <img className="hlogo" src={glogo} alt="Logo" width="200" />
        </Link>
      </div>
      <div>
        <Link className="hlogin" to="/login">
          <h1 className="hlword">LOGIN</h1>
        </Link>
      </div>
    </div>
  );
};

export default Header;
