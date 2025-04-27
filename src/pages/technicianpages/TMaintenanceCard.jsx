import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import "./css/WorkOrders.css";

const TMaintenanceCard = ({ asset_Details, startDate,status, onView  }) => {

  const assetName = asset_Details?.title;
  const area = asset_Details?.assetArea;
//   const status = asset_Details?.status;
  return (
    <div className="work-order-card">
      <h3 className="work-order-card-title">{assetName}</h3>
      <p className="work-order-card-info"><FaCalendarAlt className="work-order-card-icon" /> start Date: {startDate}</p>
      <p className="work-order-card-info"><FaMapMarkerAlt className="work-order-card-icon" /> {area}</p>
      <span className={`work-order-card-status ${status ? status.toLowerCase() : ""}`}>
        <FaExclamationTriangle className="work-order-card-status-icon" /> { status }
      </span>
      <button className="work-order-card-view-button" onClick={onView}>View</button>
    </div>
  );
};

export default TMaintenanceCard;


