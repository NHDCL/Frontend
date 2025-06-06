import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import "./css/WorkOrders.css";

const TWorkOrderCard = ({ repairInfo, reportingDate, onView }) => {
  // Check if the status is "Pending"
  if (repairInfo?.status?.toLowerCase() !== "pending") {
    return null; 
  }

  const assetName = repairInfo?.assetName;
  const area = repairInfo?.area;
  const priority = repairInfo?.priority;

  return (
    <div className="work-order-card">
      <h3 className="work-order-card-title">{assetName}</h3>
      <p className="work-order-card-info"><FaCalendarAlt className="work-order-card-icon" /> reporting Date: {reportingDate}</p>
      <p className="work-order-card-info"><FaMapMarkerAlt className="work-order-card-icon" /> {area}</p>
      <span className={`work-order-card-status ${priority ? priority.toLowerCase() : ""}`}>
        <FaExclamationTriangle className="work-order-card-status-icon" /> {priority}
      </span>
      <button className="work-order-card-view-button" onClick={onView}>View</button>
    </div>
  );
};

export default TWorkOrderCard;
